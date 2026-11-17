"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AboutFlow } from "@/components/about-flow";

/*
 * The Our mission section is off by default. A small button in the footer
 * switches it on (and off again); the choice is kept in this browser.
 * While it is off, the section isn't mounted at all, so none of its pinned
 * scroll or canvas work runs.
 */

const KEY = "tc-mission";
const EVENT = "tc-mission-change";

function read() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function useMissionShown() {
  return useSyncExternalStore(subscribe, read, () => false);
}

/** Renders the mission section only while it is switched on. */
export function MissionGate() {
  return useMissionShown() ? <ShownMission /> : null;
}

/** Arriving at /#mission (switched on from another page): go to it once it has mounted. */
function ShownMission() {
  useEffect(() => {
    if (window.location.hash !== "#mission") return;
    const id = requestAnimationFrame(() => document.getElementById("mission")?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(id);
  }, []);
  return <AboutFlow />;
}

/** The footer's switch. Turning it on brings you to the section. */
export function MissionToggle() {
  const shown = useMissionShown();
  const pathname = usePathname();
  const router = useRouter();

  const toggle = () => {
    const next = !shown;
    try {
      window.localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      // Storage blocked: the switch still works for this page view.
    }
    window.dispatchEvent(new Event(EVENT));
    if (!next) return;
    if (pathname !== "/") {
      router.push("/#mission");
      return;
    }
    // Wait for the section to mount, then go to it.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.getElementById("mission")?.scrollIntoView({ behavior: "smooth", block: "start" })),
    );
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={shown}
      title={shown ? "Hide the Our mission section" : "Show the Our mission section"}
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] leading-[1.5] text-white/45 ring-1 ring-white/15 transition-colors hover:text-white hover:ring-white/40 focus-visible:text-white focus-visible:outline-none focus-visible:ring-white/60"
    >
      <i className={`h-1.5 w-1.5 rounded-full transition-colors ${shown ? "bg-[#FCD38A]" : "bg-white/30"}`} aria-hidden="true" />
      Mission
    </button>
  );
}
