"use client";

import type { CSSProperties } from "react";
import { Check, Stage, depth, on } from "./stage";

/**
 * First role: an application moves through the hiring steps; at "Offer" an
 * offer letter rises in front with a small burst. Earlier applications wait
 * behind it. Role and company are kept generic.
 */

const steps = ["Applied", "Shortlisted", "Interview", "Offer"];
const stepAt = [0.2, 1.6, 3.0, 4.4];
const burst = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 + 0.3;
  return {
    x: Math.cos(a) * 34,
    y: Math.sin(a) * 26,
    c: i % 3 === 0 ? "var(--g-navy)" : i % 3 === 1 ? "var(--g-amber)" : "var(--g-periwinkle)",
  };
});
const OUT = 9.3;

export function PlacingItem() {
  return (
    <Stage length={10} still={8} rx={12} ry={-16} rz={2}>
      {(t) => {
        const step = t < OUT ? stepAt.filter((a) => t >= a).length - 1 : -1;
        return (
          <>
            <div className="bx-layer bx-panel bx-job bx-job--back" style={depth(-60, { top: 0, right: "-2%" })}>
              <span className="bx-title">Data analyst</span>
              <span className="bx-chip">Shortlisted</span>
            </div>
            <div className="bx-layer bx-panel bx-job bx-job--back" style={depth(-30, { top: 28, right: "6%" })}>
              <span className="bx-title">Frontend developer</span>
              <span className="bx-chip">Applied</span>
            </div>

            <div className="bx-layer bx-panel bx-job bx-job--main" style={depth(0)}>
              <div className="flex items-center gap-2.5">
                <span className="bx-job__mark" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 16V7l6-3 6 3v9M8 16v-4h4v4M3 16h14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <span className="bx-title">Software engineer</span>
                  <span className="bx-meta">Product company · Bengaluru</span>
                </div>
              </div>
              <ol className="bx-steps" style={{ "--p": Math.max(0, step) / 3 } as CSSProperties}>
                {steps.map((s, i) => (
                  <li key={s} data-done={step >= i || undefined} data-current={step === i || undefined}>
                    <i />
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bx-layer bx-panel bx-offer bx-in" data-on={on(t, 5, OUT)} style={depth(64)}>
              <div className="flex items-center gap-2.5">
                <Check size={20} />
                <div className="min-w-0">
                  <span className="bx-title">Offer received</span>
                  <span className="bx-meta">Software engineer · joins 1 July</span>
                </div>
              </div>
              <span className="bx-burst" data-on={on(t, 5.3, 7.5)} aria-hidden="true">
                {burst.map((b, i) => (
                  <i
                    key={i}
                    style={
                      {
                        "--x": `${b.x}px`,
                        "--y": `${b.y}px`,
                        background: b.c,
                      } as CSSProperties
                    }
                  />
                ))}
              </span>
            </div>
          </>
        );
      }}
    </Stage>
  );
}
