"use client";

import { useEffect, useState } from "react";

const format = (n: number) => n.toLocaleString("en-IN");

/** Wait between updates: anywhere from 0.6s to 3.2s, so the rhythm never repeats. */
const nextDelay = () => 600 + Math.random() * 2600;
/** Size of each jump: 1 to 4, picked evenly. */
const nextStep = () => 1 + Math.floor(Math.random() * 4);

/**
 * Live-ticking counter: starts at `value` and rises by small random amounts at
 * irregular intervals. Each digit that changes rolls in, so the number reads as alive.
 */
export function HeroStat({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const [count, setCount] = useState(value);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      timer = setTimeout(() => {
        setCount((c) => c + nextStep());
        tick();
      }, nextDelay());
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  const digits = format(count).split("");

  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5 text-[14px]">
      <span className="font-medium text-text">{label}:</span>
      <span className="text-text-muted tabular-nums" aria-label={`${format(value)}${suffix}`}>
        {digits.map((ch, i) => (
          // Keyed by position + character, so only changed digits remount and animate.
          <span key={`${digits.length - i}-${ch}`} className="digit-in" aria-hidden="true">
            {ch}
          </span>
        ))}
        <span aria-hidden="true">{suffix}</span>
      </span>
    </p>
  );
}
