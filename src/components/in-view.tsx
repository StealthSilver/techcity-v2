"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Marks its box with `data-in` the first time it scrolls into view, then stops
 * watching. CSS keys entrance animations off that attribute (number tickers,
 * the About story line), so the content itself can stay server-rendered.
 */
export function InView({
  className,
  threshold = 0.35,
  children,
}: {
  className?: string;
  threshold?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={className} data-in={inView || undefined}>
      {children}
    </div>
  );
}
