"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

/**
 * Revolving, colourful globe for the hero.
 *
 * Palette: the brand navy → amber ramp (see globals.css). The globe stays light:
 * lighter blue shades flow into amber, bridged through near-white so the
 * gradient never turns muddy.
 *
 * - cobe renders the sphere body and its glow (land dots switched off) into a
 *   hidden WebGL canvas; we tint its shading lavender → cream.
 * - Land is drawn by us as loosely scattered dots, sampled from cobe's own land
 *   map (public/globe-land.png, extracted from the cobe package, MIT), filled
 *   with a periwinkle → lavender → honey → amber gradient plus a soft glow copy.
 * - Student routes from Delhi NCR are smooth glowing arcs with travelling pulses,
 *   navy pins with an amber pulse, and a small tag per destination
 *   (company + students placed) styled like the page's cards.
 * All positions use cobe's projection, so everything lines up with the sphere.
 */

// Routes: where TechCity students have been placed, from Delhi NCR.
const ORIGIN: [number, number] = [28.61, 77.21];

// PLACEHOLDER — company names and counts are illustrative only. Replace with
// TechCity's real hiring partners and placement numbers before launch
// (don't ship real company names with made-up figures).
const PLACEMENTS: { company: string; placed: number; location: [number, number] }[] = [
  { company: "Infosys", placed: 420, location: [12.97, 77.59] }, // Bengaluru
  { company: "TCS", placed: 310, location: [18.52, 73.86] }, // Pune
  { company: "Deloitte", placed: 64, location: [25.2, 55.27] }, // Dubai
  { company: "Grab", placed: 38, location: [1.35, 103.82] }, // Singapore
  { company: "Accenture", placed: 52, location: [51.51, -0.13] }, // London
  { company: "SAP", placed: 27, location: [52.52, 13.4] }, // Berlin
  { company: "Shopify", placed: 21, location: [43.65, -79.38] }, // Toronto
  { company: "Google", placed: 12, location: [37.77, -122.42] }, // San Francisco
  { company: "Atlassian", placed: 18, location: [-33.87, 151.21] }, // Sydney
];

// Brand ramp (mirrors --g-* tokens in globals.css).
const NAVY = "#1C257D";
const INDIGO = "#3B47C4";
const PERIWINKLE = "#6B7BE6";
const LAVENDER = "#A5B1F5";
const MIST = "#E4E8FD";
const CREAM = "#FFF1D6";
const HONEY = "#FCD38A";
const AMBER = "#F59E0B";
/**
 * Dot gradient, bottom-left → top-right: lighter blues → amber, bridged through
 * mist/cream so blue and amber never mix into grey or pink. Stops sit in the
 * visible left/centre of the globe; its right edge runs off-screen.
 */
const DOT_STOPS: [number, string][] = [
  [0.1, PERIWINKLE],
  [0.38, LAVENDER],
  [0.43, MIST],
  [0.45, CREAM],
  [0.5, HONEY],
  [0.66, AMBER],
];

const SPHERE = 0.8; // cobe draws the sphere at 0.8 of half the canvas
/** Pins and tags are kept soft so the globe, not the labels, leads. */
const PIN_OPACITY = 0.6;
const TAG_OPACITY = 0.7;
const THETA = 0.3;
const START_PHI = Math.PI - ((ORIGIN[1] * Math.PI) / 180 - Math.PI / 2) + 0.15;

type Vec3 = [number, number, number];

/** cobe's lat/lon → unit vector. */
function toVec(lat: number, lon: number): Vec3 {
  const r = (lat * Math.PI) / 180;
  const a = (lon * Math.PI) / 180 - Math.PI;
  const c = Math.cos(r);
  return [-c * Math.cos(a), Math.sin(r), c * Math.sin(a)];
}

/** Rotate by phi/theta exactly like cobe's shaders. */
function rotate([x, y, z]: Vec3, phi: number, theta: number): Vec3 {
  const e = Math.cos(phi);
  const f = Math.sin(phi);
  const c = Math.cos(theta);
  const d = Math.sin(theta);
  return [e * x + f * z, f * d * x + c * y - e * d * z, -f * c * x + d * y + e * c * z];
}

function slerp(a: Vec3, b: Vec3, t: number, angle: number): Vec3 {
  const s = Math.sin(angle);
  const wa = Math.sin((1 - t) * angle) / s;
  const wb = Math.sin(t * angle) / s;
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb];
}

type Dot = { v: Vec3; s: number; faint: boolean };

/** Scatter dots over land (dense) and a few over the ocean (faint), using the land map. */
async function makeDots(landCount: number, oceanCount: number): Promise<Dot[]> {
  const img = new Image();
  img.src = "/globe-land.png";
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.drawImage(img, 0, 0);
  const { data, width, height } = x.getImageData(0, 0, c.width, c.height);
  const isLand = (lat: number, lon: number) => {
    const u = Math.floor(((lon + 180) / 360) * width) % width;
    const v = Math.min(height - 1, Math.floor(((90 - lat) / 180) * height));
    return data[(v * width + u) * 4] > 127;
  };

  const dots: Dot[] = [];
  let land = 0;
  let ocean = 0;
  for (let guard = 0; guard < 200000 && (land < landCount || ocean < oceanCount); guard++) {
    const lat = (Math.asin(Math.random() * 2 - 1) * 180) / Math.PI;
    const lon = Math.random() * 360 - 180;
    if (isLand(lat, lon)) {
      if (land >= landCount) continue;
      land++;
      dots.push({ v: toVec(lat, lon), s: Math.random() < 0.3 ? 2.2 : 1.5, faint: false });
    } else if (ocean < oceanCount) {
      ocean++;
      dots.push({ v: toVec(lat, lon), s: 0.9, faint: true });
    }
  }
  return dots;
}

type Particle = { v: Vec3; r: number };

function makeHalo(n: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const rad = 1.03 + Math.pow(Math.random(), 2) * 0.2;
    out.push({ v: [s * Math.cos(t) * rad, u * rad, s * Math.sin(t) * rad], r: 0.5 + Math.random() * 0.8 });
  }
  return out;
}

export function HeroGlobe({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const outRef = useRef<HTMLCanvasElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const originTagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const glCanvas = glRef.current;
    const out = outRef.current;
    const ctx = out?.getContext("2d");
    if (!wrap || !glCanvas || !out || !ctx) return;

    let cancelled = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = wrap.offsetWidth;
    let phi = START_PHI;
    let raf = 0;
    let visible = true;
    let dots: Dot[] = [];
    const halo = makeHalo(size > 600 ? 420 : 220);
    const t0 = performance.now();

    // Offscreen layer for the dots, so we can draw a blurred glow copy under them.
    const dotLayer = document.createElement("canvas");
    const dctx = dotLayer.getContext("2d")!;
    let light: CanvasGradient; // body shading, lit from the bottom-left
    let rimMask: CanvasGradient; // trims cobe's bright outer glow to a thin edge
    let backLight: CanvasGradient; // soft light spilling out at the bottom-left
    let dotFill: CanvasGradient;

    const origin = toVec(ORIGIN[0], ORIGIN[1]);
    const routes = PLACEMENTS.map(({ location: [lat, lon] }, i) => {
      const to = toVec(lat, lon);
      const cos = origin[0] * to[0] + origin[1] * to[1] + origin[2] * to[2];
      const angle = Math.acos(Math.min(1, Math.max(-1, cos)));
      return { to, angle, lift: Math.min(0.12, 0.03 + angle * 0.07), offset: i / PLACEMENTS.length };
    });

    const resize = () => {
      const px = Math.round(size * dpr);
      out.width = out.height = px;
      dotLayer.width = dotLayer.height = px;
      // Soft brand tint for the sphere's shading (lighten keeps the white body white).
      const R = (px / 2) * SPHERE;
      // Key light sits low-left: brightest there, cooling to soft lavender at the top-right rim.
      light = ctx.createRadialGradient(px * 0.3, px * 0.72, 0, px * 0.3, px * 0.72, R * 1.9);
      light.addColorStop(0, "#FFFFFF");
      light.addColorStop(0.45, "#F8F9FE");
      light.addColorStop(0.78, "#EBEEFC");
      light.addColorStop(1, "#DCE1F9");
      rimMask = ctx.createRadialGradient(px / 2, px / 2, R * 0.99, px / 2, px / 2, R * 1.05);
      rimMask.addColorStop(0, "rgba(0,0,0,1)");
      rimMask.addColorStop(1, "rgba(0,0,0,0)");
      backLight = ctx.createRadialGradient(px * 0.3, px * 0.7, R * 0.5, px * 0.3, px * 0.7, R * 1.25);
      backLight.addColorStop(0, "rgba(228, 232, 253, 0.55)");
      backLight.addColorStop(1, "rgba(228, 232, 253, 0)");
      dotFill = dctx.createLinearGradient(0, px, px, 0);
      for (const [stop, color] of DOT_STOPS) dotFill.addColorStop(stop, color);
    };
    resize();

    const globe = createGlobe(glCanvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi,
      theta: THETA,
      dark: 0,
      diffuse: 1.6,
      mapSamples: 1000,
      mapBrightness: 0.0001, // cobe's own land dots off; we draw our own
      mapBaseBrightness: 0,
      baseColor: [1, 1, 1],
      markerColor: [1, 1, 1],
      glowColor: [0.89, 0.91, 0.99], // mist
      markers: [],
      context: { preserveDrawingBuffer: true },
    });

    makeDots(size > 600 ? 20000 : 11000, size > 600 ? 1800 : 1000).then((d) => {
      if (!cancelled) dots = d;
    });

    const project = (v: Vec3, radius: number) => {
      const half = out.width / 2;
      return { x: half + v[0] * radius * half, y: half - v[1] * radius * half };
    };

    const drawDots = () => {
      const w = dotLayer.width;
      const half = w / 2;
      const R = SPHERE * half;
      dctx.clearRect(0, 0, w, w);
      dctx.fillStyle = dotFill;
      // Bucket by depth (front / middle / rim) and land vs ocean, so dots fade
      // towards the rim with only a handful of fill calls.
      const paths = Array.from({ length: 6 }, () => new Path2D());
      for (const d of dots) {
        const v = rotate(d.v, phi, THETA);
        if (v[2] <= 0.02) continue;
        const depth = v[2] > 0.45 ? 0 : v[2] > 0.2 ? 1 : 2;
        const s = d.s * dpr;
        paths[depth * 2 + (d.faint ? 1 : 0)].rect(half + v[0] * R - s / 2, half - v[1] * R - s / 2, s, s);
      }
      const depthAlpha = [1, 0.75, 0.4];
      for (let i = 0; i < 6; i++) {
        dctx.globalAlpha = depthAlpha[i >> 1] * (i & 1 ? 0.25 : 1);
        dctx.fill(paths[i]);
      }
      dctx.globalAlpha = 1;
    };

    /** Pin: navy core, white edge, amber pulse ring (matches the page's navy CTAs). */
    const pin = (x: number, y: number, time: number, phase: number, origin = false) => {
      const core = (origin ? 5 : 3.4) * dpr;
      if (!reduceMotion) {
        const t = (time * 0.0006 + phase) % 1;
        ctx.strokeStyle = AMBER;
        ctx.globalAlpha = 0.55 * (1 - t) * PIN_OPACITY;
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.arc(x, y, core + t * 9 * dpr, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = PIN_OPACITY;
      if (origin) {
        ctx.fillStyle = HONEY;
        ctx.beginPath();
        ctx.arc(x, y, core + 3.5 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = NAVY;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.8 * dpr;
      ctx.beginPath();
      ctx.arc(x, y, core, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawRoutes = (time: number) => {
      const o = rotate(origin, phi, THETA);
      const op = project(o, SPHERE);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const r of routes) {
        const end = rotate(r.to, phi, THETA);
        const ep = project(end, SPHERE);

        // Dense samples; segments that pass behind the sphere are skipped.
        const steps = 120;
        const pts: ({ x: number; y: number } | null)[] = [];
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const v = rotate(slerp(origin, r.to, t, r.angle), phi, THETA);
          const rad = SPHERE * (1 + r.lift * Math.sin(Math.PI * t));
          const hidden = v[2] < 0 && Math.hypot(v[0] * rad, v[1] * rad) < SPHERE;
          pts.push(hidden ? null : project(v, rad));
        }

        // Smooth path: quadratic curves through segment midpoints.
        ctx.beginPath();
        let run: { x: number; y: number }[] = [];
        const flush = () => {
          if (run.length > 1) {
            ctx.moveTo(run[0].x, run[0].y);
            for (let i = 1; i < run.length - 1; i++) {
              const mx = (run[i].x + run[i + 1].x) / 2;
              const my = (run[i].y + run[i + 1].y) / 2;
              ctx.quadraticCurveTo(run[i].x, run[i].y, mx, my);
            }
            const last = run[run.length - 1];
            ctx.lineTo(last.x, last.y);
          }
          run = [];
        };
        for (const p of pts) {
          if (p) run.push(p);
          else flush();
        }
        flush();

        const stroke = ctx.createLinearGradient(op.x, op.y, ep.x, ep.y);
        stroke.addColorStop(0, INDIGO);
        stroke.addColorStop(0.6, LAVENDER);
        stroke.addColorStop(0.82, HONEY);
        stroke.addColorStop(1, AMBER);
        ctx.strokeStyle = stroke;
        ctx.shadowColor = "rgba(165, 177, 245, 0.6)";
        ctx.shadowBlur = 4 * dpr;
        ctx.lineWidth = 1.6 * dpr;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Travelling pulse.
        if (!reduceMotion) {
          const t = (time * 0.00016 + r.offset) % 1;
          const p = pts[Math.round(t * steps)];
          if (p) {
            ctx.fillStyle = AMBER;
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 1.4 * dpr;
            ctx.shadowColor = "rgba(245, 158, 11, 0.6)";
            ctx.shadowBlur = 8 * dpr;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.6 * dpr, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }

        if (end[2] > 0) pin(ep.x, ep.y, time, r.offset);
      }
      if (o[2] > 0) pin(op.x, op.y, time, 0, true);
    };

    const drawHalo = () => {
      ctx.fillStyle = dotFill;
      for (const p of halo) {
        const v = rotate(p.v, phi, THETA);
        if (v[2] < 0 && Math.hypot(v[0], v[1]) < 1) continue;
        const { x, y } = project(v, SPHERE);
        ctx.globalAlpha = v[2] >= 0 ? 0.5 : 0.22;
        const s = p.r * dpr * 1.6;
        ctx.fillRect(x, y, s, s);
      }
      ctx.globalAlpha = 1;
    };

    /** Pin each company tag above its marker; fade it out as it turns away. */
    const placeTags = () => {
      routes.forEach((r, i) => {
        const el = tagRefs.current[i];
        if (!el) return;
        const v = rotate(r.to, phi, THETA);
        const x = (size / 2) * (1 + v[0] * SPHERE);
        const y = (size / 2) * (1 - v[1] * SPHERE);
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, calc(-100% - 9px))`;
        el.style.opacity = String(Math.max(0, Math.min(1, (v[2] - 0.08) * 5)) * TAG_OPACITY);
      });
      const el = originTagRef.current;
      if (el) {
        const v = rotate(origin, phi, THETA);
        const x = (size / 2) * (1 + v[0] * SPHERE);
        const y = (size / 2) * (1 - v[1] * SPHERE);
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, calc(-100% - 14px))`;
        el.style.opacity = String(Math.max(0, Math.min(1, (v[2] - 0.08) * 5)) * TAG_OPACITY);
      }
    };

    const render = (time: number) => {
      globe.update({ phi, width: size, height: size });
      const w = out.width;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, w);

      // Sphere from cobe, re-lit so the light comes from the bottom-left.
      ctx.drawImage(glCanvas, 0, 0, w, w);
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, w, w);
      // Keep only a thin, soft edge of cobe's outer glow.
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = rimMask;
      ctx.fillRect(0, 0, w, w);
      // Gentle light spilling out behind the bottom-left of the sphere.
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = backLight;
      ctx.fillRect(0, 0, w, w);
      ctx.globalCompositeOperation = "source-over";

      // Land dots: blurred glow copy first, then crisp dots.
      if (dots.length) {
        drawDots();
        // Soft glow copy, then crisp dots.
        ctx.filter = `blur(${2.5 * dpr}px)`;
        ctx.globalAlpha = 0.5;
        ctx.drawImage(dotLayer, 0, 0);
        ctx.filter = "none";
        ctx.globalAlpha = 1;
        ctx.drawImage(dotLayer, 0, 0);
      }

      drawRoutes(time - t0);
      drawHalo();
      placeTags();
    };

    const frame = (time: number) => {
      phi += reduceMotion ? 0.0005 : 0.0016;
      render(time);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(() => {
      if (wrap.offsetWidth === size) return;
      size = wrap.offsetWidth;
      resize();
      render(performance.now());
    });
    ro.observe(wrap);

    // Only spin while the globe is on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(wrap);

    render(performance.now());
    start();
    requestAnimationFrame(() => out.classList.add("is-ready"));

    return () => {
      cancelled = true;
      stop();
      ro.disconnect();
      io.disconnect();
      globe.destroy();
    };
  }, []);

  return (
    <div className={`hero-globe pointer-events-none aspect-square ${className}`} aria-hidden="true">
      <div ref={wrapRef} className="relative h-full w-full">
        {/* Brand-coloured aura behind the sphere. */}
        <div className="hero-globe-aura absolute inset-[14%] rounded-full" />
        <canvas ref={glRef} className="absolute inset-0 h-full w-full opacity-0" />
        <canvas ref={outRef} className="hero-globe-canvas absolute inset-0 h-full w-full" />

        {PLACEMENTS.map((p, i) => (
          <div
            key={p.company}
            ref={(el) => {
              tagRefs.current[i] = el;
            }}
            className="globe-tag"
            style={{ opacity: 0 }}
          >
            <span className="globe-tag-name">{p.company}</span>
            <span className="globe-tag-count">{p.placed} placed</span>
          </div>
        ))}
        <div ref={originTagRef} className="globe-tag globe-tag--origin" style={{ opacity: 0 }}>
          <span className="globe-tag-name">TechCity · Delhi NCR</span>
        </div>
      </div>

    </div>
  );
}
