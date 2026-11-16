"use client";

import type { KeyboardEvent, ReactNode } from "react";
import type { ProductId } from "@/components/product-logo";
import { products, type Product } from "@/lib/products";

/*
 * The TechCity stack: five isometric plates, one per product, drawn as hairline
 * line art (filled plates, thin strokes, lit / edge / mid / low tones).
 *
 * Every plate is built the same way: a framed app screen for its product, and a
 * status bar along the front edge with the product name, category and status.
 * Plates only light up for the product in focus on the left (no hover state);
 * clicking or pressing Enter on a plate still scrolls to that product.
 *
 * Plate content is drawn in flat plate coordinates (0..W, 0..W) inside an
 * isometric matrix, so rectangles, lines and text land on the plate surface.
 * Anything that stands up off a plate (podium, flag) is projected by hand.
 */

const W = 260; // plate size, in plate units
const T = 12; // plate thickness, in px
const GAP = 112; // vertical distance between plates at rest
const SPREAD = 46; // how far the stack opens around the active plate
const TOP = 30 + SPREAD;
const ISO = "matrix(0.866 0.5 -0.866 0.5 0 0)";
/** Top of the status bar; every screen stays above it. */
const BAR_Y = W - 42;

/** Isometric projection of a plate point with height z (z up). */
const P = (x: number, y: number, z = 0): [number, number] => [(x - y) * 0.866, (x + y) * 0.5 - z];
const pts = (...p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** An upright box standing on a plate. */
function Box({ x, y, w, d, h, className = "" }: { x: number; y: number; w: number; d: number; h: number; className?: string }) {
  const top = pts(P(x, y, h), P(x + w, y, h), P(x + w, y + d, h), P(x, y + d, h));
  const right = pts(P(x + w, y, h), P(x + w, y + d, h), P(x + w, y + d, 0), P(x + w, y, 0));
  const front = pts(P(x, y + d, h), P(x + w, y + d, h), P(x + w, y + d, 0), P(x, y + d, 0));
  return (
    <g className={className}>
      <polygon points={right} className="hl-face hl-face--dark hl-edge" />
      <polygon points={front} className="hl-face hl-face--dark hl-edge" />
      <polygon points={top} className="hl-face hl-edge" />
    </g>
  );
}

/** Shared frame: the screen border and the status bar on the front edge. */
function Frame({ product }: { product: Product }) {
  const live = product.status === "Live";
  return (
    <>
      <rect x="14" y="14" width={W - 28} height={W - 28} className="hl-lo" />
      <line x1="14" y1={BAR_Y} x2={W - 14} y2={BAR_Y} className="hl-lo" />
      <text x="24" y={W - 22} className="hl-type">
        <tspan className="hl-type-name">{product.name.toUpperCase()}</tspan>
        <tspan dx="8">{product.category.toUpperCase()}</tspan>
      </text>
      <rect x={W - 70} y={W - 35} width="46" height="16" rx="8" className={live ? "hl-pit hl-acc" : "hl-pit hl-mid"} />
      <text x={W - 47} y={W - 24} textAnchor="middle" className="hl-type hl-type--tiny">
        {live ? "LIVE" : "SOON"}
      </text>
    </>
  );
}

/* ---------- Product screens (plate coordinates, above BAR_Y) ---------- */

/** Setu, the LMS: sidebar nav, search bar and four course cards with progress. */
function SetuFace() {
  const cards: [number, number, number][] = [
    [74, 52, 52],
    [158, 52, 30],
    [74, 132, 64],
    [158, 132, 14],
  ];
  return (
    <>
      <rect x="14" y="14" width="50" height={BAR_Y - 14} className="hl-mid" />
      <rect x="24" y="24" width="30" height="16" className="hl-pit hl-acc" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x="24" y={56 + i * 24} width="10" height="10" className={i === 1 ? "hl-pit hl-acc" : "hl-pit hl-mid"} />
          <line x1="40" y1={61 + i * 24} x2="54" y2={61 + i * 24} className="hl-mid hl-thick" />
        </g>
      ))}
      <rect x="74" y="22" width="162" height="20" className="hl-pit hl-mid" />
      <line x1="84" y1="32" x2="140" y2="32" className="hl-lo hl-thick" />
      <circle cx="224" cy="32" r="5" className="hl-face hl-acc" />
      {cards.map(([x, y, prog], k) => (
        <g key={k}>
          <rect x={x} y={y} width="78" height="72" className="hl-mid" />
          <rect x={x + 6} y={y + 6} width="66" height="28" className={k === 0 ? "hl-pit hl-acc" : "hl-pit hl-mid"} />
          <line x1={x + 8} y1={y + 46} x2={x + 52} y2={y + 46} className="hl-mid hl-thick" />
          <line x1={x + 8} y1={y + 60} x2={x + 70} y2={y + 60} className="hl-lo hl-thick" />
          <line x1={x + 8} y1={y + 60} x2={x + 8 + prog} y2={y + 60} className="hl-acc hl-thick" />
        </g>
      ))}
    </>
  );
}

/** Marg, roadmaps: track tabs, a dotted route with milestones, and a progress card. */
function MargFace() {
  const route = "M36 196 C 70 192, 96 176, 88 150 S 58 112, 96 100 S 148 108, 168 92 S 200 70, 226 66";
  const nodes: [number, number, "done" | "now" | "next"][] = [
    [36, 196, "done"],
    [88, 150, "done"],
    [96, 100, "now"],
    [168, 92, "next"],
  ];
  return (
    <>
      {["DSA", "AI/ML", "CLOUD"].map((t, i) => (
        <g key={t}>
          <rect x={24 + i * 62} y="24" width="54" height="18" rx="3" className={i === 0 ? "hl-pit hl-acc" : "hl-pit hl-mid"} />
          <text x={51 + i * 62} y="36" textAnchor="middle" className="hl-type hl-type--tiny">
            {t}
          </text>
        </g>
      ))}
      <path d={route} className="hl-route-bg" />
      <path d={route} className="hl-acc hl-dash" />
      {nodes.map(([x, y, s]) => (
        <g key={`${x}-${y}`}>
          {s === "now" && <circle cx={x} cy={y} r="11" className="hl-acc" />}
          <rect x={x - 6} y={y - 6} width="12" height="12" className={s === "next" ? "hl-pit hl-mid" : s === "done" ? "hl-face hl-acc" : "hl-pit hl-acc"} />
        </g>
      ))}
      <rect x="140" y="150" width="96" height="56" className="hl-mid" />
      <text x="150" y="168" className="hl-type hl-type--tiny">
        STEP 3 OF 8
      </text>
      <line x1="150" y1="182" x2="226" y2="182" className="hl-lo hl-thick" />
      <line x1="150" y1="182" x2="178" y2="182" className="hl-acc hl-thick" />
      <line x1="150" y1="196" x2="206" y2="196" className="hl-mid hl-thick" />
    </>
  );
}
function MargStanding() {
  const base = P(226, 66);
  const top = P(226, 66, 40);
  return (
    <g>
      <line x1={base[0]} y1={base[1]} x2={top[0]} y2={top[1]} className="hl-edge" />
      <polygon points={pts(top, P(226, 66, 28), [top[0] + 22, top[1] + 4])} className="hl-face hl-acc" />
    </g>
  );
}

/** Spardha, contests: a countdown, the live leaderboard, questions and a podium. */
function SpardhaFace() {
  const lens = [84, 70, 58, 46, 34];
  return (
    <>
      <rect x="24" y="24" width="70" height="40" className="hl-pit hl-acc" />
      <text x="59" y="49" textAnchor="middle" className="hl-type hl-type--big">
        00:42
      </text>
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x="24" y={78 + i * 20} width="12" height="12" className={i === 0 ? "hl-face hl-acc" : "hl-pit hl-mid"} />
          <line x1="44" y1={84 + i * 20} x2={92 - i * 14} y2={84 + i * 20} className="hl-mid hl-thick" />
        </g>
      ))}
      {lens.map((len, i) => (
        <g key={i}>
          <text x="106" y={34 + i * 20} className="hl-type hl-type--tiny">
            {i + 1}
          </text>
          <circle cx="124" cy={31 + i * 20} r="5" className={i === 0 ? "hl-face hl-acc" : "hl-pit hl-mid"} />
          <line x1="136" y1={31 + i * 20} x2={136 + len} y2={31 + i * 20} className={i === 0 ? "hl-acc hl-thick" : "hl-mid hl-thick"} />
        </g>
      ))}
    </>
  );
}
function SpardhaStanding() {
  return (
    <>
      <Box x={70} y={150} w={44} d={48} h={22} />
      <Box x={120} y={150} w={44} d={48} h={38} className="hl-box-acc" />
      <Box x={170} y={150} w={44} d={48} h={12} />
    </>
  );
}

/** Riyaaz, daily practice: a code editor with Run, passing tests and a streak grid. */
function RiyaazFace() {
  const code: [number, number][] = [
    [0, 110],
    [12, 84],
    [12, 128],
    [24, 96],
    [12, 60],
    [0, 40],
  ];
  const lit = [0, 1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16];
  return (
    <>
      <rect x="14" y="14" width={W - 28} height="112" className="hl-pit hl-mid" />
      <line x1="36" y1="14" x2="36" y2="126" className="hl-lo" />
      {code.map(([indent, len], i) => (
        <g key={i}>
          <text x="22" y={33 + i * 16} className="hl-type hl-type--tiny">
            {i + 1}
          </text>
          <line x1={46 + indent} y1={30 + i * 16} x2={46 + indent + len} y2={30 + i * 16} className={i === 3 ? "hl-acc hl-bar" : "hl-mid hl-bar"} />
        </g>
      ))}
      <rect x="196" y="22" width="40" height="16" rx="3" className="hl-face hl-acc" />
      <text x="216" y="33" textAnchor="middle" className="hl-type hl-type--tiny hl-type--on">
        RUN
      </text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="24" y={140 + i * 22} width="12" height="12" className={i < 2 ? "hl-face hl-acc" : "hl-pit hl-mid"} />
          <line x1="44" y1={146 + i * 22} x2={104 - i * 12} y2={146 + i * 22} className="hl-mid hl-thick" />
        </g>
      ))}
      {Array.from({ length: 21 }, (_, i) => (
        <rect
          key={i}
          x={126 + (i % 7) * 16}
          y={138 + Math.floor(i / 7) * 20}
          width="12"
          height="14"
          className={lit.includes(i) ? "hl-pit hl-acc" : "hl-mid"}
        />
      ))}
      <text x="126" y="210" className="hl-type hl-type--tiny">
        12-DAY STREAK
      </text>
    </>
  );
}

/** Kaksha, cohort courses: a video lesson, chapter list, the cohort and a lab. */
function KakshaFace() {
  return (
    <>
      <rect x="20" y="20" width="150" height="100" className="hl-pit hl-edge" />
      <polygon points="86,54 86,84 112,69" className="hl-face hl-acc" />
      <line x1="30" y1="108" x2="160" y2="108" className="hl-lo hl-thick" />
      <line x1="30" y1="108" x2="92" y2="108" className="hl-acc hl-thick" />
      <circle cx="92" cy="108" r="4" className="hl-face hl-acc" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x="180" y={22 + i * 20} width="10" height="10" className={i === 0 ? "hl-face hl-acc" : i === 1 ? "hl-pit hl-acc" : "hl-pit hl-mid"} />
          <line x1="196" y1={27 + i * 20} x2={236 - (i % 2) * 12} y2={27 + i * 20} className="hl-mid hl-thick" />
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={30 + i * 18} cy="144" r="7" className={i < 2 ? "hl-face hl-acc" : "hl-pit hl-mid"} />
      ))}
      <text x="140" y="147" className="hl-type hl-type--tiny">
        +24 IN COHORT
      </text>
      <rect x="20" y="164" width="216" height="44" className="hl-pit hl-mid" />
      <text x="28" y="182" className="hl-type hl-type--tiny">
        &gt;
      </text>
      <line x1="38" y1="179" x2="140" y2="179" className="hl-mid hl-thick" />
      <line x1="38" y1="195" x2="100" y2="195" className="hl-acc hl-thick" />
    </>
  );
}

const faces: Record<ProductId, () => ReactNode> = {
  setu: SetuFace,
  marg: MargFace,
  spardha: SpardhaFace,
  riyaaz: RiyaazFace,
  kaksha: KakshaFace,
};
const standing: Partial<Record<ProductId, () => ReactNode>> = {
  marg: MargStanding,
  spardha: SpardhaStanding,
};

/* ---------- The stack ---------- */

export function TechStack({
  active = null,
  onSelect,
  className = "",
}: {
  /** Index of the product in focus on the left (its plate lifts out and gets a callout), or null. */
  active?: number | null;
  /** Called with a product index when a plate is clicked or activated by keyboard. */
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const offset = (k: number) => {
    let y = TOP + k * GAP;
    if (active !== null) {
      if (k < active) y -= SPREAD;
      if (k > active) y += SPREAD;
      if (k === active) y -= 10;
    }
    return y;
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(i);
    }
  };

  // Paint from the bottom plate up, so upper plates cover the ones below.
  const order = products.map((_, i) => i).reverse();

  return (
    <svg viewBox="0 0 600 860" className={`tech-stack ${className}`} role="group" aria-label="The TechCity stack: five products">
      {order.map((i) => {
        const p = products[i];
        const Face = faces[p.id];
        const Stand = standing[p.id];
        const lit = active === i;
        const dim = active !== null && !lit;
        return (
          <g
            key={p.id}
            className={`hl-layer hl-layer--${p.id}`}
            data-lit={lit || undefined}
            data-dim={dim || undefined}
            style={{ transform: `translate(300px, ${offset(i)}px)` }}
            role="link"
            tabIndex={0}
            aria-label={`${p.name}: ${p.category}`}
            onClick={() => onSelect?.(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {/* Plate sides */}
            <polygon points={pts([-225, 130], [0, 260], [0, 260 + T], [-225, 130 + T])} className="hl-face hl-face--dark hl-edge" />
            <polygon points={pts([0, 260], [225, 130], [225, 130 + T], [0, 260 + T])} className="hl-face hl-face--dark hl-edge" />
            {/* Plate top: the product's screen, then the shared status bar */}
            <g transform={ISO}>
              <rect x="0" y="0" width={W} height={W} className="hl-face hl-edge" />
              <Face />
              <Frame product={p} />
            </g>
            {Stand && <Stand />}

            {/* Callout */}
            <g className="hl-callout">
              <polyline points={pts([140, 84], [176, 36], [204, 36])} className="hl-leader" />
              <circle cx="214" cy="36" r="3.5" className="hl-dot" />
              <text x="226" y="40" className="hl-label">
                {p.name.toUpperCase()}
              </text>
              <text x="226" y="58" className="hl-label hl-label--sub">
                {p.category.toUpperCase()}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
