"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Shared pieces for the program bento items.
 *
 * Each item is a small scene of white panels tilted in gentle 3D over the
 * card's gradient. A loop clock `t` (seconds into the item's cycle) drives it:
 * elements switch on with `data-on` and CSS transitions do the motion, so the
 * React tree only re-renders a few times a second and only while on screen.
 */

const TICK = 100;

/** Seconds into a `length`-second loop, ticking only while the item is on screen. Reduced motion holds `still`. */
function useCycle(length: number, still: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer: number | undefined;
    let last = 0;
    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      if (timer !== undefined) return;
      last = performance.now();
      timer = window.setInterval(() => {
        const now = performance.now();
        const dt = Math.min(0.25, (now - last) / 1000);
        last = now;
        setT((v) => (v + dt) % length);
      }, TICK);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduce) setT(still);
        else if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [length, still]);

  return { ref, t };
}

type StageProps = {
  /** Loop length and the moment shown when motion is reduced, in seconds. */
  length: number;
  still: number;
  /** Resting tilt, in degrees. */
  rx: number;
  ry: number;
  rz?: number;
  className?: string;
  children: (t: number) => ReactNode;
};

/**
 * The 3D stage: perspective, a resting tilt that eases flatter on hover, and a
 * small pointer parallax. Children get the loop clock.
 */
export function Stage({ length, still, rx, ry, rz = 0, className = "", children }: StageProps) {
  const { ref, t } = useCycle(length, still);

  useEffect(() => {
    const el = ref.current;
    const card = el?.closest<HTMLElement>(".bento-card");
    if (!el || !card || window.matchMedia("(hover: none)").matches) return;
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      el.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    };
    const leave = () => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    };
  }, [ref]);

  return (
    <div
      ref={ref}
      className="bx-stage"
      aria-hidden="true"
      style={
        {
          "--rx": `${rx}deg`,
          "--ry": `${ry}deg`,
          "--rz": `${rz}deg`,
        } as CSSProperties
      }
    >
      <div className={`bx-tilt ${className}`}>{children(t)}</div>
    </div>
  );
}

/** `true` while a ≤ t < b, else undefined (for data attributes). */
export const on = (t: number, a: number, b = Infinity) => (t >= a && t < b) || undefined;

/** 0 → 1 as t runs from a over d seconds. */
export const ramp = (t: number, a: number, d: number) => Math.min(1, Math.max(0, (t - a) / d));

/** Depth of a layer above the base panel, in px. */
export const depth = (z: number, extra?: CSSProperties): CSSProperties => ({ "--z": `${z}px`, ...extra }) as CSSProperties;

/** Initials in a soft circle. */
export function Avatar({
  initials,
  tone = "mist",
  size = 26,
}: {
  initials: string;
  tone?: "mist" | "navy" | "cream" | "lavender";
  size?: number;
}) {
  return (
    <span className="bx-avatar" data-tone={tone} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

/** A filled check in a circle. */
export function Check({ size = 16 }: { size?: number }) {
  return (
    <span className="bx-check" style={{ width: size, height: size }}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="m4.5 8.3 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
