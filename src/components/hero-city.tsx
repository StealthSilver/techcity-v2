"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Three.js only runs in the browser; keep it out of the server render and the main bundle.
const CityScene = dynamic(() => import("./city/city-scene"), { ssr: false });

/**
 * Hero background: the 3D TechCity scene. Pauses while scrolled out of view
 * and fades in once the first frame is ready (a soft sky gradient shows until then).
 */
export function HeroCity({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`hero-city ${className}`} aria-hidden="true">
      <div className={`hero-city-canvas ${ready ? "is-ready" : ""}`}>
        <CityScene active={active} onReady={() => requestAnimationFrame(() => setReady(true))} />
      </div>
    </div>
  );
}
