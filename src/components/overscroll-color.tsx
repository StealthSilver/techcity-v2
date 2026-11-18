"use client";

import { useEffect } from "react";

/*
 * Rubber-band scrolling shows the page canvas (the <html> background) past the
 * ends of the page. Near the bottom the canvas takes the footer's navy, so
 * pulling past the footer reveals more footer; near the top it stays the page
 * colour, under the white navbar.
 */
export function OverscrollColor() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      const half = (root.scrollHeight - window.innerHeight) / 2;
      root.dataset.overscroll = window.scrollY > half ? "footer" : "";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      delete root.dataset.overscroll;
    };
  }, []);
  return null;
}
