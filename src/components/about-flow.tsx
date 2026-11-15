"use client";

import { useEffect, useRef } from "react";

/*
 * Our mission: Build → Deliver → Improve. A scroll-triggered particle story modelled
 * on the flow on giga.ai, glowing on the brand-navy stage (the footer's colour)
 * (mist, lavender, periwinkle, sky, honey and amber).
 *
 * How it moves (like giga): scroll only picks the *target* step. A story clock
 * `s` then eases towards it at its own pace (about 1.3 s per step), so every
 * transition plays smoothly however fast you scroll, and reverses on the way up.
 *
 * Steps (s goes 0 → 9):
 *   0→1  draw-in   strands from Knowledge, Training, Guidance into "Your college"
 *   1→2  pan       the flow slides left and leans in; the college moves to centre
 *   2→3  burst     the college bursts into a 3D field of particles (depth + bokeh)
 *   3→4  gather    particles gather into five glowing clusters
 *   4→5  flatten   the clusters flatten into a tilted plane
 *   5→6  lanes     the plane snaps into a dot-matrix grid, one lane per way we deliver
 *   6→7  collapse  the lanes collapse onto one line
 *   7→8  rise      a placement-readiness curve rises off its end
 *   8→9  loop      the strands return, feeding "Your college, but better"
 */

const STEPS = 9;

// Our palette on the brand-navy stage (#1C257D, same as the footer), as "r, g, b".
// Drawn additively, so pale tints glow; kept light enough to read on navy.
const INK = "228, 232, 253"; // mist: strands, node, chart rules
const LAVENDER = "165, 177, 245";
const PERI = "170, 184, 255";
const SKY = "150, 214, 255";
const HONEY = "252, 211, 138";
const AMBER = "245, 158, 11";
const PALETTE = [INK, LAVENDER, PERI, SKY, HONEY, AMBER];

// Improve: the dot chart warms from cool to amber as it rises left to right.
const CHART_TINTS = [PERI, PERI, LAVENDER, SKY, HONEY, AMBER];

// One short line per stage of the story, shown at the top of the stage.
const CAPTIONS = [
  "We bring industry knowledge, training and guidance to your campus.",
  "It all runs inside your college, on your timetable.",
  "Week after week, practice turns into consistency.",
  "Every batch leaves more job-ready than the last.",
  "What works stays on campus, for every batch that follows.",
];

const GROUPS = [
  { label: "Knowledge", rows: 12, y: 0.3, tint: LAVENDER },
  { label: "Training", rows: 8, y: 0.57, tint: PERI },
  { label: "Guidance", rows: 12, y: 0.82, tint: HONEY },
];
const COLS = 4;
const COL_ALPHA = [0.3, 0.19, 0.11, 0.06];

const LANES = [
  { label: "Trainers", color: LAVENDER },
  { label: "Faculty sessions", color: PERI },
  { label: "Labs", color: SKY },
  { label: "Placement prep", color: HONEY },
  { label: "Mentorship", color: AMBER },
];

const PHASES = [
  { label: "Build", step: 0.5 },
  { label: "Deliver", step: 2.5 },
  { label: "Improve", step: 7.5 },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Pt = { x: number; y: number };
type V3 = { x: number; y: number; z: number };
type Strand = { pts: Pt[]; group: number; col: number; offset: number };
type Particle = {
  lane: number;
  sphere: V3;
  cluster: V3;
  slab: V3;
  grid: V3;
  line: V3;
  chart: V3;
  /** 0..1 across the lanes: dots further right sit tighter on the grid. */
  laneT: number;
  /** Chart colour, and 0..1 height within its column (top edge = 1). */
  chartTint: string;
  chartH: number;
  edge: boolean;
  seed: number;
  bright: number;
  /** 0..1: how late this particle starts each move, so the field flows instead of jumping as one. */
  delay: number;
};

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number, out: Pt[]) {
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Soft round glow sprite in one colour, drawn once and stamped per particle. */
function sprite(rgb: string, size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${rgb}, 1)`);
  g.addColorStop(0.18, `rgba(${rgb}, 0.85)`);
  g.addColorStop(0.45, `rgba(${rgb}, 0.22)`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return c;
}

export function AboutFlow() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const groupLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const laneLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nodeLabelRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!track || !stage || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const sprites = Object.fromEntries(PALETTE.map((c) => [c, sprite(c)])) as Record<string, HTMLCanvasElement>;

    let W = 0;
    let H = 0;
    let narrow = false;
    let strands: Strand[] = [];
    let sources: { x: number; y: number; group: number; col: number }[] = [];
    let node: Pt = { x: 0, y: 0 };
    let center: Pt = { x: 0, y: 0 };
    let particles: Particle[] = [];
    let laneY: number[] = [];
    let baseY = 0;

    const layout = () => {
      W = stage.clientWidth;
      H = stage.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      narrow = W < 760;

      // ---- Strands ----
      const x0 = W * (narrow ? 0.04 : 0.07);
      const dx = W * (narrow ? 0.04 : 0.05);
      const xm = W * (narrow ? 0.34 : 0.38);
      node = { x: W * (narrow ? 0.8 : 0.71), y: H * 0.62 };
      center = { x: W * 0.5, y: H * 0.56 };
      const rowGap = Math.max(5, Math.min(9, H * 0.0105));
      strands = [];
      sources = [];
      GROUPS.forEach((g, gi) => {
        const yc = H * g.y;
        const mid = (g.rows - 1) / 2;
        for (let c = 0; c < COLS; c++) {
          const spread = 1 - c * 0.16;
          for (let r = 0; r < g.rows; r++) {
            const start = { x: x0 + c * dx, y: yc + (r - mid) * rowGap * spread - c * 7 };
            const merge = { x: xm, y: yc + (r - mid) * 2.2 };
            const pts: Pt[] = [start];
            cubic(start, { x: start.x + W * 0.14, y: start.y }, { x: merge.x - W * 0.1, y: merge.y }, merge, 30, pts);
            cubic(
              merge,
              { x: merge.x + W * 0.16, y: merge.y },
              { x: node.x - W * 0.17, y: node.y + (r - mid) * 1.4 },
              { x: node.x, y: node.y + (r - mid) * 0.25 },
              50,
              pts,
            );
            strands.push({ pts, group: gi, col: c, offset: (r * 0.137 + c * 0.31 + gi * 0.17) % 1 });
            sources.push({ x: start.x, y: start.y, group: gi, col: c });
          }
        }
      });

      // ---- Particles, in world space centred on `center` (px, z towards the viewer) ----
      const rand = rng(11);
      const gauss = () => (rand() + rand() + rand() + rand() - 2) / 1.2;
      const R = Math.max(W, H) * 0.62;
      const clusters: V3[] = [
        { x: -W * 0.27, y: -H * 0.16, z: -120 },
        { x: W * 0.08, y: -H * 0.24, z: 90 },
        { x: W * 0.31, y: -H * 0.02, z: -160 },
        { x: -W * 0.07, y: H * 0.16, z: 160 },
        { x: -W * 0.33, y: H * 0.12, z: -40 },
      ];
      laneY = LANES.map((_, k) => -H * 0.19 + k * H * 0.085);
      baseY = H * 0.1;
      const grid = narrow ? 7 : 9;
      const gridLeft = -W * (narrow ? 0.18 : 0.3);
      const gridCols = Math.floor((W * (narrow ? 0.62 : 0.72)) / grid);
      // Improve: a dot-matrix area chart, rising left to right from the baseline.
      const chartLeft = -W * (narrow ? 0.34 : 0.32);
      const chartCols = Math.floor((W * (narrow ? 0.66 : 0.6)) / grid);
      const chartMax = H * (narrow ? 0.36 : 0.42);
      const count = narrow ? 480 : 1000;
      particles = Array.from({ length: count }, (_, i) => {
        const lane = i % LANES.length;
        // Burst: a sphere shell, denser towards the middle.
        const u = rand() * 2 - 1;
        const th = rand() * Math.PI * 2;
        const rr = R * (0.04 + 0.96 * Math.cbrt(rand()));
        const sq = Math.sqrt(1 - u * u);
        const c = clusters[lane];
        const sub = Math.floor(rand() * 3) - 1;
        // Lanes: loose and scattered on the left, settling onto the grid towards the right.
        const gc = Math.floor(Math.pow(rand(), 0.75) * gridCols);
        const laneT = gc / Math.max(1, gridCols - 1);
        const loose = Math.pow(1 - laneT, 1.6);
        // Chart: pick a column, then a row up to that column's height (denser near the top).
        const cc = Math.floor(rand() * chartCols);
        const ct = (cc + 0.5) / chartCols;
        const rise = 0.1 + 0.9 * (0.55 * ct + 0.45 * ct * ct * (3 - 2 * ct));
        const rows = Math.max(1, Math.floor((rise * chartMax) / grid));
        const edge = rand() < 0.3;
        const row = edge ? rows - 1 : Math.floor(Math.pow(rand(), 0.6) * rows);
        const colX = chartLeft + cc * grid;
        return {
          lane,
          sphere: { x: Math.cos(th) * sq * rr, y: u * rr * 0.62, z: Math.min(560, Math.sin(th) * sq * rr) },
          cluster: { x: c.x + gauss() * W * 0.07, y: c.y + gauss() * H * 0.06, z: c.z + gauss() * 110 },
          // Tilted plane: warm on the left, cool on the right; depth becomes height once tilted.
          slab: { x: lerp(-W * 0.4, W * 0.4, (4 - lane + rand() * 1.6) / 5.6), y: gauss() * H * 0.03, z: gauss() * 260 },
          grid: { x: gridLeft + gc * grid + gauss() * grid * 2 * loose, y: laneY[lane] + sub * 7 + gauss() * 16 * loose, z: 0 },
          line: { x: colX, y: baseY, z: 0 },
          chart: { x: colX, y: baseY - row * grid, z: 0 },
          laneT,
          chartTint: CHART_TINTS[Math.min(CHART_TINTS.length - 1, Math.floor(ct * CHART_TINTS.length))],
          chartH: rows > 1 ? row / (rows - 1) : 1,
          edge,
          seed: rand() * Math.PI * 2,
          bright: 0.45 + rand() * 0.55,
          delay: rand(),
        };
      });
      // Group by lane so the fill colour changes five times per frame, not per dot.
      particles.sort((a, b) => a.lane - b.lane);
    };

    // ---- Story clock ----
    let s = 0;
    let target = 0;
    let last = performance.now();
    const readTarget = () => {
      const rect = track.getBoundingClientRect();
      const total = track.offsetHeight - stage.offsetHeight;
      const P = total > 0 ? (64 - rect.top) / total : 0;
      if (P < -0.3) target = 0;
      else target = Math.min(STEPS, Math.floor(clamp01(P) * STEPS * 0.9999) + 1);
    };

    // Pointer parallax, smoothed.
    let mx = 0;
    let my = 0;
    let pmx = 0;
    let pmy = 0;
    const onPointer = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    };

    const draw = (time: number) => {
      const step = (k: number, f = inOut) => f(clamp01(s - k));
      const eDraw = step(0);
      const ePan = step(1);
      const eBurst = step(2);
      const eFlat = step(4);
      const eLanes = step(5);
      const eLine = step(6);
      const eLoop = step(8);
      const sec = time / 1000;
      pmx = lerp(pmx, mx, 0.04);
      pmy = lerp(pmy, my, 0.04);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      // ================= Strands (Build, and again in the loop) =================
      const strandAlpha = Math.max(eDraw * (1 - clamp01((s - 2) * 2.2)), eLoop);
      const pan = ePan * (1 - eLoop);
      if (strandAlpha > 0.005) {
        const zoom = 1 + 0.14 * pan;
        const ox = (center.x - node.x) * pan + pmx * -14;
        const oy = (center.y - node.y) * pan + pmy * -8;
        ctx.save();
        ctx.translate(node.x + ox, node.y + oy);
        ctx.scale(zoom, zoom);
        ctx.translate(-node.x, -node.y);

        const reveal = s >= 8 ? eLoop : eDraw;
        ctx.lineWidth = 1 / zoom;
        for (const f of strands) {
          const len = f.col === 0 ? f.pts.length : 31;
          const n = Math.max(2, Math.floor(len * reveal));
          const a = COL_ALPHA[f.col] * strandAlpha;
          const end = f.pts[n - 1];
          const g = ctx.createLinearGradient(f.pts[0].x, 0, end.x, 0);
          g.addColorStop(0, `rgba(${GROUPS[f.group].tint}, ${(a * 0.7).toFixed(3)})`);
          g.addColorStop(f.col === 0 ? 0.55 : 1, `rgba(${INK}, ${(f.col === 0 ? a : 0).toFixed(3)})`);
          if (f.col === 0) g.addColorStop(1, `rgba(${INK}, ${(a * 1.4).toFixed(3)})`);
          ctx.strokeStyle = g;
          ctx.beginPath();
          ctx.moveTo(f.pts[0].x, f.pts[0].y);
          for (let i = 1; i < n; i++) ctx.lineTo(f.pts[i].x, f.pts[i].y);
          ctx.stroke();
        }
        for (const p of sources) {
          const a = (p.col === 0 ? 0.95 : COL_ALPHA[p.col] * 2) * reveal * strandAlpha;
          ctx.fillStyle = `rgba(${GROUPS[p.group].tint}, ${a.toFixed(3)})`;
          ctx.fillRect(p.x - 1.1, p.y - 1.1, 2.2, 2.2);
        }
        // Pulses: soft lights running down the front strands.
        if (reveal > 0.9 && !reduceMotion) {
          const clock = sec * 0.09;
          for (const f of strands) {
            if (f.col > 0) continue;
            for (let k = 0; k < 2; k++) {
              const t = (clock + f.offset + k * 0.5) % 1;
              const q = f.pts[Math.floor(t * (f.pts.length - 1))];
              const a = Math.sin(Math.PI * t) * strandAlpha * 0.9;
              const r = 5;
              ctx.globalAlpha = a;
              ctx.drawImage(sprites[GROUPS[f.group].tint], q.x - r, q.y - r, r * 2, r * 2);
            }
          }
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }

      // ================= The college node =================
      const nodeAlpha = Math.max(eDraw * (1 - eBurst), eLoop);
      const nodeAt = {
        x: lerp(node.x, center.x, pan) + pmx * -14,
        y: lerp(node.y, center.y, pan) + pmy * -8,
      };
      if (nodeAlpha > 0.005) {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = `rgba(${INK}, ${nodeAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.roundRect(nodeAt.x - 7, nodeAt.y - 7, 14, 14, 3.5);
        ctx.fill();
        ctx.globalCompositeOperation = "lighter";
      }

      // ================= Particles (Deliver) =================
      const partAlpha = clamp01((s - 2) * 4) * (1 - eLoop);
      if (partAlpha > 0.005) {
        // Camera: a slow orbit while the field is loose, tilted for the plane, square-on for the grid.
        const loose = 1 - eLanes;
        const yaw = (reduceMotion ? 0 : Math.sin(sec * 0.11) * 0.32) * loose * (1 - eFlat * 0.6) + pmx * 0.25 * loose;
        const pitch = 1.08 * eFlat * (1 - eLanes) + pmy * 0.12 * loose;
        const cy = Math.cos(yaw);
        const sy = Math.sin(yaw);
        const cp = Math.cos(pitch);
        const sp = Math.sin(pitch);
        const F = 1000;
        let lastFill = "";
        for (let i = 0; i < particles.length; i++) {
          const q = particles[i];
          // Each particle starts every move a touch later than the last, so the field flows.
          const ps = (k: number, f = inOut) => f(clamp01((s - k) * 1.35 - q.delay * 0.35));
          const pBurst = outCubic(clamp01((s - 2) * 0.95 - q.delay * 0.45));
          const pGather = ps(3);
          const pFlat = ps(4);
          const pLanes = ps(5);
          const pLine = ps(6);
          const pRise = ps(7);
          // Burst out of the college, then gather, flatten, snap to the grid, collapse to a line.
          const drift = reduceMotion ? 0 : (1 - pGather) * 12;
          let x = q.sphere.x * pBurst + Math.sin(sec * 0.45 + q.seed) * drift;
          let y = q.sphere.y * pBurst + Math.cos(sec * 0.4 + q.seed) * drift;
          let z = q.sphere.z * pBurst;
          x = lerp(x, q.cluster.x, pGather);
          y = lerp(y, q.cluster.y, pGather);
          z = lerp(z, q.cluster.z, pGather);
          x = lerp(x, q.slab.x, pFlat);
          y = lerp(y, q.slab.y, pFlat);
          z = lerp(z, q.slab.z, pFlat);
          x = lerp(x, q.grid.x, pLanes);
          y = lerp(y, q.grid.y, pLanes);
          z = lerp(z, q.grid.z, pLanes);
          x = lerp(x, q.line.x, pLine);
          y = lerp(y, q.line.y, pLine);
          z = lerp(z, q.line.z, pLine);
          x = lerp(x, q.chart.x, pRise);
          y = lerp(y, q.chart.y, pRise);
          // Rotate (yaw, then pitch) and project.
          const x1 = x * cy + z * sy;
          const z1 = -x * sy + z * cy;
          const y2 = y * cp - z1 * sp;
          const z2 = y * sp + z1 * cp;
          const k = F / (F - Math.min(z2, 700));
          const px = center.x + x1 * k;
          const py = center.y + y2 * k;
          if (px < -60 || px > W + 60 || py < -60 || py > H + 60) continue;

          const color = pRise > 0.5 ? q.chartTint : LANES[q.lane].color;
          // Steadier (less twinkle, brighter) the further right a dot sits in the lanes.
          const inLanes = pLanes * (1 - pLine);
          const steady = lerp(1, q.laneT, inLanes);
          const twinkle = reduceMotion ? 1 : 1 - (0.1 + 0.15 * (1 - steady)) * (1 + Math.sin(sec * 1.3 + q.seed * 3));
          const shape = lerp(1, 0.4 + 0.6 * q.laneT, inLanes) * lerp(1, q.edge ? 1.15 : 0.22 + 0.6 * q.chartH, pRise);
          const a = partAlpha * lerp(q.bright, 1, pRise * 0.5) * twinkle * shape;
          // Depth of field: far and near particles grow soft and dim.
          const blur = clamp01(Math.abs(z2) / 520) * (1 - pLanes);
          const soft = 1 - pLanes; // glowing sprite while loose, crisp dots in the grid
          if (soft > 0.01) {
            const r = (2.4 + blur * 6) * k;
            ctx.globalAlpha = a * soft * (1 - blur * 0.55);
            ctx.drawImage(sprites[color], px - r, py - r, r * 2, r * 2);
          }
          if (pLanes > 0.01) {
            if (color !== lastFill) {
              ctx.fillStyle = `rgb(${color})`;
              lastFill = color;
            }
            ctx.globalAlpha = Math.min(1, a * pLanes);
            ctx.fillRect(px - 1.2, py - 1.2, 2.4, 2.4);
          }
          // The chart's top edge glows, tracing the rising curve.
          if (q.edge && pRise > 0.05) {
            ctx.globalAlpha = 0.45 * partAlpha * pRise;
            ctx.drawImage(sprites[q.chartTint], px - 6, py - 6, 12, 12);
          }
        }
        ctx.globalAlpha = 1;
      }

      ctx.globalCompositeOperation = "source-over";

      // ================= HTML overlays =================
      const reveal = s >= 8 ? eLoop : eDraw;
      GROUPS.forEach((g, gi) => {
        const el = groupLabelRefs.current[gi];
        if (!el) return;
        const zoom = 1 + 0.14 * pan;
        const ox = (center.x - node.x) * pan;
        const yc = H * g.y - ((g.rows - 1) / 2) * Math.max(5, Math.min(9, H * 0.0105)) - 30;
        const x = node.x + ox + (W * (narrow ? 0.04 : 0.07) - node.x) * zoom;
        const y = node.y + (center.y - node.y) * pan + (yc - node.y) * zoom;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        el.style.opacity = (reveal * strandAlpha).toFixed(3);
      });
      if (nodeLabelRef.current) {
        nodeLabelRef.current.style.transform = `translate(${(nodeAt.x + 22).toFixed(1)}px, ${(nodeAt.y - 12).toFixed(1)}px)`;
        nodeLabelRef.current.style.opacity = nodeAlpha.toFixed(3);
        nodeLabelRef.current.toggleAttribute("data-better", eLoop > 0.5);
      }
      const win = (a: number, b: number, c: number, d: number) => clamp01((s - a) / (b - a)) * (1 - clamp01((s - c) / (d - c)));
      const captions = [
        win(0.1, 0.6, 1.3, 1.7),
        win(1.7, 2.2, 3.8, 4.2),
        win(4.2, 4.6, 5.9, 6.3),
        win(6.3, 6.7, 8.1, 8.4),
        clamp01((s - 8.4) / 0.5),
      ];
      titleRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = captions[i].toFixed(3);
        el.style.transform = `translateY(${((1 - captions[i]) * 10).toFixed(1)}px)`;
      });
      laneLabelRefs.current.forEach((el, k) => {
        if (!el) return;
        el.style.transform = `translate(${(W * (narrow ? 0.05 : 0.08)).toFixed(1)}px, ${(center.y + laneY[k] - 9).toFixed(1)}px)`;
        el.style.opacity = (eLanes * (1 - eLine)).toFixed(3);
      });
      const phase = s < 1.6 || s > 8.6 ? 0 : s < 6.4 ? 1 : 2;
      tabRefs.current.forEach((el, i) => el?.toggleAttribute("data-active", i === phase));
    };

    let raf = 0;
    let visible = false;
    const frame = (time: number) => {
      const dt = Math.min(0.1, (time - last) / 1000);
      last = time;
      readTarget();
      const diff = target - s;
      if (reduceMotion) s = target;
      else if (diff !== 0) {
        // Critically damped approach: quick to start, soft to settle, never overshoots.
        // Capped so a big scroll jump still plays through each step.
        const v = diff * (1 - Math.exp(-dt * 2.4));
        const cap = dt * 2.2;
        s += Math.max(-cap, Math.min(cap, v));
        if (Math.abs(target - s) < 0.0005) s = target;
      }
      draw(time);
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(track);
    const ro = new ResizeObserver(() => {
      layout();
      draw(performance.now());
    });
    ro.observe(stage);
    stage.addEventListener("pointermove", onPointer);
    layout();
    readTarget();
    draw(performance.now());

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      stage.removeEventListener("pointermove", onPointer);
    };
  }, []);

  const goTo = (step: number) => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const top = track.getBoundingClientRect().top + window.scrollY - 64;
    const total = track.offsetHeight - stage.offsetHeight;
    window.scrollTo({ top: top + (step / STEPS) * total, behavior: "smooth" });
  };

  return (
    <section id="mission" aria-label="Our mission" className="mission-dark scroll-mt-16">
      <div ref={trackRef} className="about-flow relative">
        <div ref={stageRef} className="about-flow__stage sticky top-16 overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

          <div className="about-flow__titles">
            {CAPTIONS.map((line, i) => (
              <p
                key={line}
                ref={(el) => {
                  titleRefs.current[i] = el;
                }}
                className="about-flow__caption"
              >
                {line}
              </p>
            ))}
          </div>

          {GROUPS.map((g, i) => (
            <span
              key={g.label}
              ref={(el) => {
                groupLabelRefs.current[i] = el;
              }}
              className="about-flow__tag"
            >
              {g.label}
            </span>
          ))}
          <div ref={nodeLabelRef} className="about-flow__node">
            <span className="about-flow__node-a">Your college</span>
            <span className="about-flow__node-b">Your college, but better</span>
          </div>
          {LANES.map((l, k) => (
            <span
              key={l.label}
              ref={(el) => {
                laneLabelRefs.current[k] = el;
              }}
              className="about-flow__tag"
            >
              {l.label}
            </span>
          ))}
          <nav className="about-flow__pill" aria-label="About TechCity">
            <div className="about-flow__tabs">
              {PHASES.map((ph, i) => (
                <button
                  key={ph.label}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => goTo(ph.step)}
                >
                  {ph.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}
