"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};
const isScrolled = () => window.scrollY > 4;

/**
 * Fixed header that floats over the page. Transparent at the top so the hero
 * shows through; gets a white background and hairline once the page scrolls
 * (styles in globals.css under `.nav-shell`).
 */
export function NavShell({ children }: { children: React.ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);
  return (
    <header className="nav-shell fixed inset-x-0 top-0 z-40" data-scrolled={scrolled || undefined}>
      {children}
    </header>
  );
}
