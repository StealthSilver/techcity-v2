import Link from "next/link";
import type { CSSProperties } from "react";
import { programBento, type BentoSize } from "@/lib/programs";

/**
 * Programs bento grid, modelled on stripe.com's product bento: white cards with
 * a title top-left, an expand button top-right, and a living gradient scene in
 * the lower part of the card.
 *
 * Every scene is built the same way, so the grid reads as one system:
 *   1. a soft mesh of drifting colour glows (CSS radial gradients), and
 *   2. one or two folded ribbons (SVG) that sway slowly, most with hairlines.
 * Only the brand ramp is used (navy → periwinkle → mist → cream → amber).
 * The `.bento-ill` slot in each card is where the program illustration goes.
 */

const C = {
  navy: "#1C257D",
  indigo: "#3B47C4",
  periwinkle: "#6B7BE6",
  lavender: "#A5B1F5",
  mist: "#E4E8FD",
  cream: "#FFF1D6",
  honey: "#FCD38A",
  amber: "#F59E0B",
};

/** A colour glow: centre (x, y) and diameter, all in % of the card. */
type Blob = { c: string; x: number; y: number; s: number };
/**
 * A ribbon across the card (viewBox 400×300, stretched to fit): its top edge runs
 * from y0 (left) to y1 (right) with `bend`; it is t0 thick on the left and t1 on
 * the right, which gives the folded, Stripe-like twist.
 */
type Ribbon = {
  y0: number;
  y1: number;
  bend: number;
  t0: number;
  t1: number;
  colors: [string, string, string];
  lines?: boolean;
  opacity?: number;
};
type Scene = { blobs: Blob[]; ribbons: Ribbon[] };

const scenes: Record<string, Scene> = {
  // Warm amber sweep from the top-right over a lavender base (like Stripe's lead card).
  trainers: {
    blobs: [
      { c: C.lavender, x: 8, y: 92, s: 70 },
      { c: C.periwinkle, x: 0, y: 110, s: 45 },
      { c: C.cream, x: 80, y: 40, s: 60 },
      { c: C.honey, x: 96, y: 55, s: 38 },
    ],
    ribbons: [
      { y0: 330, y1: 70, bend: 10, t0: 40, t1: 110, colors: [C.cream, C.honey, C.amber], lines: true },
      { y0: 230, y1: 360, bend: 50, t0: 70, t1: 30, colors: [C.periwinkle, C.lavender, C.mist], opacity: 0.85 },
    ],
  },
  // Tall, cool: deepens to periwinkle at the bottom with a honey ribbon.
  placement: {
    blobs: [
      { c: C.mist, x: 50, y: 45, s: 90 },
      { c: C.lavender, x: 15, y: 78, s: 75 },
      { c: C.periwinkle, x: 75, y: 100, s: 80 },
      { c: C.indigo, x: 25, y: 115, s: 55 },
      { c: C.honey, x: 95, y: 62, s: 35 },
    ],
    ribbons: [{ y0: 200, y1: 140, bend: 30, t0: 30, t1: 70, colors: [C.honey, C.lavender, C.periwinkle], lines: true, opacity: 0.8 }],
  },
  // Warm: a ribbon climbing to the top-right.
  placing: {
    blobs: [
      { c: C.cream, x: 30, y: 70, s: 80 },
      { c: C.honey, x: 85, y: 95, s: 65 },
      { c: C.lavender, x: 5, y: 105, s: 45 },
    ],
    ribbons: [{ y0: 320, y1: 130, bend: 20, t0: 30, t1: 90, colors: [C.lavender, C.honey, C.amber], lines: true }],
  },
  // Cool: a ribbon dipping to the right.
  mentorship: {
    blobs: [
      { c: C.mist, x: 25, y: 60, s: 70 },
      { c: C.lavender, x: 70, y: 85, s: 75 },
      { c: C.periwinkle, x: 92, y: 105, s: 50 },
      { c: C.honey, x: 5, y: 100, s: 32 },
    ],
    ribbons: [{ y0: 150, y1: 280, bend: -40, t0: 70, t1: 40, colors: [C.mist, C.lavender, C.indigo], lines: true }],
  },
  // Tall, mixed: two crossing ribbons, warm over cool.
  faculty: {
    blobs: [
      { c: C.cream, x: 30, y: 50, s: 80 },
      { c: C.honey, x: 85, y: 62, s: 55 },
      { c: C.lavender, x: 10, y: 92, s: 70 },
      { c: C.periwinkle, x: 65, y: 112, s: 65 },
    ],
    ribbons: [
      { y0: 250, y1: 170, bend: -30, t0: 60, t1: 45, colors: [C.lavender, C.periwinkle, C.indigo], lines: true },
      { y0: 120, y1: 230, bend: 50, t0: 45, t1: 70, colors: [C.cream, C.honey, C.amber], opacity: 0.9 },
    ],
  },
  // Wide, mixed: a long periwinkle-to-honey wave with an amber undertow.
  online: {
    blobs: [
      { c: C.mist, x: 20, y: 60, s: 60 },
      { c: C.periwinkle, x: 30, y: 115, s: 45 },
      { c: C.honey, x: 85, y: 85, s: 45 },
      { c: C.amber, x: 100, y: 110, s: 28 },
    ],
    ribbons: [
      { y0: 170, y1: 250, bend: 70, t0: 80, t1: 40, colors: [C.periwinkle, C.lavender, C.honey], lines: true },
      { y0: 290, y1: 210, bend: -20, t0: 40, t1: 70, colors: [C.honey, C.amber, C.amber], opacity: 0.75 },
    ],
  },
  // Cool, deep: lavender into navy.
  content: {
    blobs: [
      { c: C.mist, x: 20, y: 55, s: 65 },
      { c: C.lavender, x: 50, y: 90, s: 80 },
      { c: C.indigo, x: 85, y: 112, s: 50 },
    ],
    ribbons: [{ y0: 250, y1: 170, bend: 40, t0: 60, t1: 60, colors: [C.lavender, C.periwinkle, C.navy], lines: true }],
  },
  // Warm: honey and amber with a touch of lavender.
  platforms: {
    blobs: [
      { c: C.honey, x: 15, y: 92, s: 60 },
      { c: C.amber, x: 0, y: 112, s: 35 },
      { c: C.cream, x: 65, y: 60, s: 70 },
      { c: C.lavender, x: 95, y: 98, s: 55 },
    ],
    ribbons: [{ y0: 200, y1: 300, bend: -50, t0: 50, t1: 50, colors: [C.cream, C.honey, C.amber], lines: true }],
  },
};

function ribbonEdge({ y0, y1, bend }: Ribbon, offset = 0) {
  return `M-20 ${y0 + offset} C130 ${y0 + bend + offset} 270 ${y1 - bend + offset} 420 ${y1 + offset}`;
}

function ribbonShape(r: Ribbon) {
  const mid = (r.t0 + r.t1) / 2;
  return `${ribbonEdge(r)} L420 ${r.y1 + r.t1} C270 ${r.y1 - r.bend + mid * 1.2} 130 ${r.y0 + r.bend + mid * 0.8} -20 ${r.y0 + r.t0} Z`;
}

function SceneArt({ id, scene }: { id: string; scene: Scene }) {
  return (
    <div className="bento-bg" aria-hidden="true">
      {scene.blobs.map((b, i) => (
        <span
          key={i}
          className="bento-blob"
          style={{ "--c": b.c, left: `${b.x}%`, top: `${b.y}%`, width: `${b.s * 1.4}%` } as CSSProperties}
        />
      ))}
      <svg className="bento-ribbons" viewBox="0 0 400 300" preserveAspectRatio="none" focusable="false">
        <defs>
          {scene.ribbons.map((r, i) => (
            <linearGradient key={i} id={`bb-${id}-${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={r.colors[0]} stopOpacity="0.15" />
              <stop offset="0.45" stopColor={r.colors[1]} />
              <stop offset="1" stopColor={r.colors[2]} />
            </linearGradient>
          ))}
        </defs>
        {scene.ribbons.map((r, i) => (
          <g key={i} className="bento-ribbon" opacity={r.opacity ?? 1}>
            <path d={ribbonShape(r)} fill={`url(#bb-${id}-${i})`} />
            {r.lines && (
              <g fill="none" stroke="#FFFFFF" strokeOpacity="0.5">
                {[0.2, 0.4, 0.6, 0.8].map((k) => (
                  <path key={k} d={ribbonEdge(r, ((r.t0 + r.t1) / 2) * k)} vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8.5 1.75h3.75V5.5M5.5 12.25H1.75V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const sizeClass: Record<BentoSize, string> = {
  wide: "md:col-span-2",
  tall: "md:row-span-2",
  small: "",
};

export function ProgramBento() {
  return (
    <div className="bento-grid grid grid-flow-dense grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {programBento.map((p) => (
        <Link key={p.anchor} href={`/programs#${p.anchor}`} className={`bento-card group ${sizeClass[p.size]}`}>
          <SceneArt id={p.anchor} scene={scenes[p.anchor]} />
          <div className="relative z-[1] flex items-start justify-between gap-6 p-6 lg:p-7">
            <h3 className="max-w-[24ch] text-[18px] leading-[1.3] font-normal tracking-[-0.02em] text-text lg:text-[20px]">
              {p.title}
            </h3>
            <span className="bento-expand" aria-hidden="true">
              <ExpandIcon />
            </span>
          </div>
          {/* Illustration slot (to be built per program). */}
          <div className="bento-ill" data-program={p.anchor} />
        </Link>
      ))}
    </div>
  );
}
