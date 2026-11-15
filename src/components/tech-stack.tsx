"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import type { ProductId } from "@/components/product-logo";
import { products } from "@/lib/products";

/*
 * The TechCity stack: five isometric plates, one per product, drawn as hairline
 * line art in the style of @lucasmarkes/hairline (filled plates, thin strokes,
 * lit / edge / mid / low tones), but original figures.
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

/* ---------- Layer personalities (plate coordinates) ---------- */

/** Setu: the LMS, a dashboard with a hatched sidebar and course panes. */
function SetuFace() {
  return (
    <>
      <rect x="14" y="14" width={W - 28} height={W - 28} className="hl-mid" />
      <rect x="14" y="14" width="46" height={W - 28} className="hl-mid" />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={20 + i * 3.4} y1="20" x2={20 + i * 3.4} y2={W - 20} className="hl-lo" />
      ))}
      <rect x="72" y="22" width="174" height="22" className="hl-pit hl-mid" />
      <rect x="72" y="54" width="82" height="86" className="hl-pit hl-acc" />
      <rect x="164" y="54" width="82" height="86" className="hl-mid" />
      <rect x="72" y="150" width="82" height="88" className="hl-mid" />
      <rect x="164" y="150" width="82" height="88" className="hl-pit hl-mid" />
      <line x1="82" y1="120" x2="140" y2="120" className="hl-acc hl-thick" />
      <line x1="174" y1="120" x2="214" y2="120" className="hl-mid hl-thick" />
      <text x="20" y={W - 6} className="hl-type">SETU / LMS</text>
    </>
  );
}

/** Marg: a dotted roadmap with milestones. The flag is drawn upright separately. */
function MargFace() {
  const nodes: [number, number][] = [
    [34, 222],
    [92, 176],
    [70, 112],
    [144, 92],
    [196, 46],
  ];
  const d = "M34 222 C 70 210, 98 196, 92 176 S 52 128, 70 112 S 120 104, 144 92 S 178 58, 196 46 L 228 34";
  return (
    <>
      <rect x="14" y="14" width={W - 28} height={W - 28} className="hl-lo" />
      <path d={d} className="hl-route-bg" />
      <path d={d} className="hl-acc hl-dash" />
      {nodes.map(([x, y], i) => (
        <rect key={i} x={x - 7} y={y - 7} width="14" height="14" className={i < 3 ? "hl-pit hl-acc" : "hl-pit hl-mid"} />
      ))}
      <text x="22" y="30" className="hl-type">MARG / ROADMAP</text>
    </>
  );
}
function MargStanding() {
  const base = P(228, 34);
  const top = P(228, 34, 38);
  return (
    <g>
      <line x1={base[0]} y1={base[1]} x2={top[0]} y2={top[1]} className="hl-edge" />
      <polygon points={pts(top, P(228, 34, 26), [top[0] + 22, top[1] + 4])} className="hl-face hl-acc" />
    </g>
  );
}

/** Spardha: a contest, rows of answers and a podium standing on the plate. */
function SpardhaFace() {
  return (
    <>
      <rect x="14" y="14" width={W - 28} height={W - 28} className="hl-lo" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="26" y={30 + i * 22} width="12" height="12" className={i === 1 ? "hl-pit hl-acc" : "hl-pit hl-mid"} />
          <line x1="48" y1={36 + i * 22} x2={150 - i * 14} y2={36 + i * 22} className="hl-mid hl-thick" />
        </g>
      ))}
      <text x="26" y={W - 22} className="hl-type">SPARDHA / CONTEST</text>
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

/** Riyaaz: code lines and a streak grid. */
function RiyaazFace() {
  const lines = [
    [0, 130],
    [14, 92],
    [14, 150],
    [28, 110],
    [42, 128],
    [28, 70],
  ];
  return (
    <>
      <rect x="14" y="14" width={W - 28} height="132" className="hl-pit hl-mid" />
      {lines.map(([indent, len], i) => (
        <line key={i} x1={30 + indent} y1={34 + i * 18} x2={30 + indent + len} y2={34 + i * 18} className={i === 3 ? "hl-acc hl-bar" : "hl-mid hl-bar"} />
      ))}
      {Array.from({ length: 21 }, (_, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const lit = [0, 1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16].includes(i);
        return (
          <rect key={i} x={24 + col * 31} y={164 + row * 26} width="22" height="18" className={lit ? "hl-pit hl-acc" : "hl-mid"} />
        );
      })}
      <text x="24" y={W - 6} className="hl-type">RIYAAZ / DAILY</text>
    </>
  );
}

/** Kaksha: a video screen with a play button, scrubber and chapters. */
function KakshaFace() {
  return (
    <>
      <rect x="20" y="20" width={W - 40} height="128" className="hl-pit hl-edge" />
      <polygon points="114,64 114,104 148,84" className="hl-face hl-acc" />
      <line x1="34" y1="134" x2={W - 34} y2="134" className="hl-lo hl-thick" />
      <line x1="34" y1="134" x2="150" y2="134" className="hl-acc hl-thick" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="24" y={170 + i * 24} width="12" height="12" className={i === 0 ? "hl-pit hl-acc" : "hl-pit hl-mid"} />
          <line x1="46" y1={176 + i * 24} x2={200 - i * 30} y2={176 + i * 24} className="hl-mid hl-thick" />
        </g>
      ))}
      <text x="160" y="250" className="hl-type">KAKSHA</text>
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
  /** Index of the product in focus (its plate lifts out and gets a callout), or null. */
  active?: number | null;
  /** Called with a product index when a plate is clicked or activated by keyboard. */
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const focus = hover ?? active;

  const offset = (k: number) => {
    let y = TOP + k * GAP;
    if (active !== null) {
      if (k < active) y -= SPREAD;
      if (k > active) y += SPREAD;
      if (k === active) y -= 10;
    }
    if (hover === k && hover !== active) y -= 10;
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
        const lit = focus === i;
        const dim = focus !== null && !lit;
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
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((h) => (h === i ? null : h))}
            onFocus={() => setHover(i)}
            onBlur={() => setHover((h) => (h === i ? null : h))}
          >
            {/* Plate sides */}
            <polygon points={pts([-225, 130], [0, 260], [0, 260 + T], [-225, 130 + T])} className="hl-face hl-face--dark hl-edge" />
            <polygon points={pts([0, 260], [225, 130], [225, 130 + T], [0, 260 + T])} className="hl-face hl-face--dark hl-edge" />
            {/* Plate top and its personality */}
            <g transform={ISO}>
              <rect x="0" y="0" width={W} height={W} className="hl-face hl-edge" />
              <Face />
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
