import type { CSSProperties } from "react";

/** Full turns each digit makes before it lands. */
const SPINS = 2;
const ROLL = Array.from({ length: SPINS * 10 }, (_, i) => i % 10);

/**
 * Odometer-style number, as on techcityskills.com: every digit is a strip of
 * 0–9 (twice) ending on its own value, and rolls up to it when an `InView`
 * ancestor marks the block as seen. Non-digits ("+", "K") stay still.
 * `delay` (seconds) staggers several tickers; digits within one also stagger.
 */
export function NumberTicker({ value, delay = 0 }: { value: string; delay?: number }) {
  const chars = value.split("");
  const digitIndex = chars.map((_, i) => chars.slice(0, i).filter((c) => /\d/.test(c)).length);

  return (
    <span className="ticker">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="ticker-digits">
        {chars.map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="ticker-window">
              <span className="ticker-col" style={{ "--d": `${delay + digitIndex[i] * 0.12}s` } as CSSProperties}>
                {ROLL.map((n, k) => (
                  <span key={k}>{n}</span>
                ))}
                <span>{ch}</span>
              </span>
            </span>
          ) : (
            <span key={i} className="ticker-static">
              {ch}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
