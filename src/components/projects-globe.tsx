"use client";

import { useEffect, useRef, useState } from "react";
import { projects, projectStatuses, type Project, type ProjectStatus } from "@/lib/projects";

/**
 * Projects globe: a slowly revolving globe rising from the bottom-right of the
 * section (partly cropped, like a horizon), with a marker on each campus.
 * Three status tabs switch which projects are listed on the left and
 * marked on the globe. Hovering (or focusing) a project stops the spin, turns
 * the globe to that campus and labels its marker; leaving lets it revolve again.
 *
 * Land dots are sampled from public/globe-land.png (equirectangular land mask,
 * from the cobe package, MIT). The sphere's shading is drawn once per size;
 * dots and markers are drawn each frame as the globe turns.
 */

type Vec3 = [number, number, number];

const START_PHI = (-78.5 * Math.PI) / 180; // start with India facing the viewer
const THETA = 0.12; // slight tilt towards the north
const SPIN = 0.09; // radians per second (about 70 s per turn)

const rgbOf = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};
const STATUS_RGB = Object.fromEntries(projectStatuses.map((s) => [s.id, rgbOf(s.color)])) as Record<ProjectStatus, string>;

function toVec(lat: number, lon: number): Vec3 {
  const r = (lat * Math.PI) / 180;
  const a = (lon * Math.PI) / 180;
  const c = Math.cos(r);
  return [c * Math.sin(a), Math.sin(r), c * Math.cos(a)];
}

/** Spin around the y axis by phi, then tilt around the x axis. */
function rotate([x, y, z]: Vec3, phi: number): Vec3 {
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  const x1 = x * cp + z * sp;
  const z1 = -x * sp + z * cp;
  const ct = Math.cos(THETA);
  const st = Math.sin(THETA);
  return [x1, y * ct + z1 * st, -y * st + z1 * ct];
}

/** Evenly spaced lat/lon dots, split into land and (sparser) ocean. Flat xyz arrays. */
async function makeDots(step: number) {
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
  const land: number[] = [];
  const ocean: number[] = [];
  let row = 0;
  for (let lat = -90 + step / 2; lat < 90; lat += step, row++) {
    const n = Math.max(1, Math.round((360 / step) * Math.cos((lat * Math.PI) / 180)));
    for (let i = 0; i < n; i++) {
      const lon = -180 + (i + 0.5) * (360 / n);
      if (isLand(lat, lon)) land.push(...toVec(lat, lon));
      else if (row % 2 === 0 && i % 2 === 0) ocean.push(...toVec(lat, lon));
    }
  }
  return { land: new Float32Array(land), ocean: new Float32Array(ocean) };
}

const byStatus = (s: ProjectStatus) => projects.filter((p) => p.status === s);

const ALL_STATUSES = projectStatuses.map((s) => s.id);

/**
 * `statuses` picks which tabs show (all three by default, as on the home page).
 * With one, the tab band is left out and only that status's projects are listed
 * and marked, as on the /projects/<status> pages.
 */
export function ProjectsGlobe({ statuses = ALL_STATUSES }: { statuses?: ProjectStatus[] }) {
  const [status, setStatus] = useState<ProjectStatus>(statuses[0]);
  const statusRef = useRef(status);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const hoveredRef = useRef(hovered);

  const visible = byStatus(status);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    let cancelled = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let R = 0;
    let cx = 0;
    let cy = 0;
    let phi = START_PHI;
    let last = performance.now();
    let dots: { land: Float32Array; ocean: Float32Array } | null = null;
    let readyAt = 0;
    const font = getComputedStyle(document.body).fontFamily;
    const shell = document.createElement("canvas");
    const sctx = shell.getContext("2d")!;

    const toScreen = (v: Vec3, rad = 1) => ({ x: cx + v[0] * R * rad, y: cy - v[1] * R * rad });

    /** The sphere's shading and rim; it doesn't change as the globe turns. */
    const paintShell = () => {
      shell.width = Math.round(W * dpr);
      shell.height = Math.round(H * dpr);
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.clearRect(0, 0, W, H);
      const body = sctx.createRadialGradient(cx - R * 0.35, cy - R * 0.75, 0, cx, cy - R * 0.2, R * 1.25);
      body.addColorStop(0, "#FFFFFF");
      body.addColorStop(0.45, "#EEF1FE");
      body.addColorStop(0.72, "#E4E8FD");
      body.addColorStop(0.88, "#FCE2B0");
      body.addColorStop(1, "#F8B54A");
      sctx.save();
      sctx.shadowColor = "rgba(107, 123, 230, 0.28)";
      sctx.shadowBlur = 80;
      sctx.fillStyle = body;
      sctx.beginPath();
      sctx.arc(cx, cy, R, 0, Math.PI * 2);
      sctx.fill();
      sctx.restore();
      sctx.strokeStyle = "rgba(107, 123, 230, 0.35)";
      sctx.lineWidth = 1;
      sctx.beginPath();
      sctx.arc(cx, cy, R, 0, Math.PI * 2);
      sctx.stroke();
    };

    const measure = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      if (W < 768) {
        R = W * 0.62;
        cx = W / 2;
        cy = H - R * 0.6;
      } else {
        // Bottom-right, partly cropped by the section's right and bottom edges.
        R = Math.min(H * 0.82, W * 0.34);
        cx = W * 0.74;
        cy = H * 0.1 + R;
      }
      paintShell();
    };

    const BUCKETS = 5;
    const drawDots = () => {
      if (!dots) return;
      const layers: [Float32Array, number, string, number][] = [
        [dots.ocean, 1, "107, 123, 230", 0.18],
        [dots.land, 1.6, "59, 71, 196", 0.85],
      ];
      for (const [arr, s, rgb, maxAlpha] of layers) {
        const paths = Array.from({ length: BUCKETS }, () => new Path2D());
        for (let i = 0; i < arr.length; i += 3) {
          const v = rotate([arr[i], arr[i + 1], arr[i + 2]], phi);
          if (v[2] <= 0.04) continue;
          const q = toScreen(v);
          if (q.y > H + 4 || q.x > W + 4) continue;
          paths[Math.min(BUCKETS - 1, Math.floor(v[2] * BUCKETS))].rect(q.x - s / 2, q.y - s / 2, s, s);
        }
        for (let b = 0; b < BUCKETS; b++) {
          ctx.fillStyle = `rgba(${rgb}, ${maxAlpha * (0.25 + 0.75 * ((b + 1) / BUCKETS))})`;
          ctx.fill(paths[b]);
        }
      }
    };

    let shown = statusRef.current;
    let list = byStatus(shown);

    const render = (time: number) => {
      if (shown !== statusRef.current) {
        shown = statusRef.current;
        list = byStatus(shown);
      }
      const rgb = STATUS_RGB[shown];

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // A collapsed layout (hidden tab, zero-size wrap) leaves the shell empty; drawing it would throw.
      if (shell.width === 0 || shell.height === 0) return;
      ctx.drawImage(shell, 0, 0, W, H);
      drawDots();

      // Markers: a soft pulsing ring and a solid dot ringed in white.
      const pulse = reduceMotion ? 0.5 : (time % 2000) / 2000;
      const focus = hoveredRef.current;
      list.forEach((p, i) => {
        const v = rotate(toVec(...p.at), phi);
        if (v[2] <= 0) return;
        const m = toScreen(v);
        const dim = focus !== null && focus !== i;
        ctx.globalAlpha = dim ? 0.35 : 1;
        ctx.fillStyle = `rgba(${rgb}, ${0.28 * (1 - pulse)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 5 + pulse * 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgb(${rgb})`;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(m.x, m.y, focus === i ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Label the focused campus on its marker.
      if (focus !== null && list[focus]) {
        const v = rotate(toVec(...list[focus].at), phi);
        if (v[2] > 0.05) {
          const m = toScreen(v);
          const text = list[focus].city;
          ctx.font = `500 13px ${font}`;
          const tw = ctx.measureText(text).width;
          const w = tw + 24;
          const h = 28;
          const x = m.x - w / 2;
          const y = m.y - h - 14;
          ctx.globalAlpha = Math.min(1, v[2] * 4);
          ctx.save();
          ctx.shadowColor = "rgba(28, 37, 125, 0.18)";
          ctx.shadowBlur = 16;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 6);
          ctx.fill();
          ctx.restore();
          ctx.strokeStyle = "#E5EDF5";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.moveTo(m.x - 5, y + h - 0.5);
          ctx.lineTo(m.x + 5, y + h - 0.5);
          ctx.lineTo(m.x, y + h + 5);
          ctx.fill();
          ctx.fillStyle = "#061B31";
          ctx.textBaseline = "middle";
          ctx.fillText(text, x + 12, y + h / 2 + 0.5);
          ctx.globalAlpha = 1;
        }
      }

      // Fade the globe in once its dots are ready (inline, so no stylesheet is needed).
      canvas.style.opacity = readyAt ? String(Math.min(1, (time - readyAt) / 900)) : "0";
    };

    let raf = 0;
    let inView = false;
    const frame = (time: number) => {
      const dt = Math.min(0.1, (time - last) / 1000);
      const focus = hoveredRef.current;
      const target = focus !== null ? list[focus] : undefined;
      if (target) {
        // Turn the shortest way round until the campus faces the viewer.
        const goal = (-target.at[1] * Math.PI) / 180;
        const delta = Math.atan2(Math.sin(goal - phi), Math.cos(goal - phi));
        phi += reduceMotion ? delta : delta * (1 - Math.exp(-dt * 5));
      } else if (!reduceMotion) {
        phi += dt * SPIN;
      }
      last = time;
      render(time);
      raf = inView && !reduceMotion ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) kick();
    });
    io.observe(wrap);
    const ro = new ResizeObserver(() => {
      measure();
      kick();
    });
    ro.observe(wrap);
    measure();

    makeDots(0.75).then((d) => {
      if (cancelled) return;
      dots = d;
      readyAt = performance.now();
      kick();
    });

    // Redraw on a tab change when the loop is idle (reduced motion).
    const onSwitch = () => kick();
    wrap.addEventListener("projects:switch", onSwitch);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener("projects:switch", onSwitch);
    };
  }, []);

  useEffect(() => {
    hoveredRef.current = hovered;
    wrapRef.current?.dispatchEvent(new Event("projects:switch"));
  }, [hovered]);

  // Tell the canvas loop which status to draw.
  useEffect(() => {
    statusRef.current = status;
    wrapRef.current?.dispatchEvent(new Event("projects:switch"));
  }, [status]);

  const counts = Object.fromEntries(projectStatuses.map((s) => [s.id, byStatus(s.id).length])) as Record<ProjectStatus, number>;

  return (
    <div className="flex flex-1 flex-col">
      {statuses.length > 1 && (
        <div
          role="tablist"
          aria-label="Project status"
          className="grid border-y border-line"
          style={{ gridTemplateColumns: `repeat(${statuses.length}, minmax(0, 1fr))` }}
        >
          {projectStatuses
            .filter((s) => statuses.includes(s.id))
            .map((s) => {
              const active = s.id === status;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`projects-tab-${s.id}`}
                  aria-selected={active}
                  aria-controls="projects-panel"
                  onClick={() => {
                    setHovered(null);
                    setStatus(s.id);
                  }}
                  className="projects-tab group relative px-3 py-5 text-center sm:py-6"
                  data-active={active || undefined}
                >
                  <span
                    className={`block text-[clamp(28px,2.8vw,40px)] leading-none font-normal tracking-[-0.03em] tabular-nums transition-colors duration-300 ${
                      active ? "text-text" : "text-text-muted/70 group-hover:text-text-muted"
                    }`}
                  >
                    {counts[s.id]}
                  </span>
                  <span
                    className={`mt-2.5 inline-flex items-center gap-2 text-[14px] leading-[1.5] font-medium transition-colors duration-300 ${
                      active ? "text-text" : "text-text-muted"
                    }`}
                  >
                    <i className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                    {s.label}
                  </span>
                </button>
              );
            })}
        </div>
      )}

      <div
        ref={wrapRef}
        id="projects-panel"
        role={statuses.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={statuses.length > 1 ? `projects-tab-${status}` : undefined}
        className={`relative flex min-h-[460px] flex-1 flex-col overflow-hidden md:min-h-[520px] ${statuses.length > 1 ? "" : "border-t border-line"}`}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ opacity: 0 }} aria-hidden="true" />
        {/* Projects list: above the globe below md, a column on the left from md (it sets the panel's height). */}
        <ul
          key={status}
          className="projects-list relative z-[1] flex flex-col gap-3 px-5 pt-6 sm:px-10 md:my-auto md:w-[min(44%,440px)] md:py-10"
        >
          {visible.map((p, i) => (
            <li
              key={p.title}
              tabIndex={0}
              className="projects-card"
              data-active={hovered === i || undefined}
              style={{ animationDelay: `${i * 60}ms` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
            >
              <ProjectCardBody project={p} />
            </li>
          ))}
        </ul>
        <div aria-hidden="true" className="h-[340px] md:hidden" />
      </div>
    </div>
  );
}

function ProjectCardBody({ project }: { project: Project }) {
  const color = projectStatuses.find((s) => s.id === project.status)!.color;
  return (
    <>
      <p className="flex items-start gap-2 text-[15px] leading-[1.4] font-medium text-text">
        <i className="mt-[6px] h-2 w-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
        {project.title}
      </p>
      <p className="mt-1 pl-4 text-[13px] leading-[1.5] text-text-muted">
        {project.city} · {project.dates}
      </p>
      <ul className="mt-2.5 flex flex-wrap gap-1.5 pl-4" aria-label="Tracks">
        {project.tracks.map((t) => (
          <li key={t} className="projects-track">
            {t}
          </li>
        ))}
      </ul>
    </>
  );
}
