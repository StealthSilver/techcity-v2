"use client";

import type { CSSProperties } from "react";
import { Avatar, Check, Stage, depth, on, ramp } from "./stage";

/**
 * Live online classes: a live class window. The trainer types code on a shared
 * editor, students watch (one raises a hand), batches switch between morning,
 * evening and weekend, and a quick poll fills in front of the window.
 */

type Tok = [kind: "k" | "f" | "n" | "p" | "c", text: string];
const code: Tok[][] = [
  [
    ["k", "def "],
    ["f", "search"],
    ["p", "(nums, target):"],
  ],
  [
    ["p", "    lo, hi = "],
    ["n", "0"],
    ["p", ", "],
    ["f", "len"],
    ["p", "(nums) - "],
    ["n", "1"],
  ],
  [
    ["k", "    while "],
    ["p", "lo <= hi:"],
  ],
  [
    ["p", "        mid = (lo + hi) // "],
    ["n", "2"],
  ],
  [
    ["k", "        if "],
    ["p", "nums[mid] == target:"],
  ],
  [
    ["k", "            return "],
    ["p", "mid"],
  ],
  [["c", "        # discard half each step"]],
];
const lineLen = code.map((line) => line.reduce((n, [, s]) => n + s.length, 0));
const lineStart = lineLen.map((_, i) => lineLen.slice(0, i).reduce((a, b) => a + b, 0));
const total = lineLen.reduce((a, b) => a + b, 0);

const batches = ["Morning", "Evening", "Weekend"];
const students = ["PR", "AK", "SN", "MV", "DG", "TS"];
const poll = [
  { label: "O(n)", v: 0.14 },
  { label: "O(log n)", v: 0.78, win: true },
  { label: "O(1)", v: 0.08 },
];
const OUT = 13.3;

/** The editor, showing the first `chars` characters, with the caret where typing is. */
function Code({ chars }: { chars: number }) {
  return (
    <>
      {code.map((line, i) => {
        const here = chars - lineStart[i];
        const caret = here >= 0 && (here < lineLen[i] || i === code.length - 1);
        let offset = 0;
        return (
          <span key={i} className="bx-code__line">
            <span className="bx-code__no">{i + 1}</span>
            {line.map(([kind, text], j) => {
              const shown = text.slice(0, Math.max(0, here - offset));
              offset += text.length;
              return shown ? (
                <span key={j} data-k={kind}>
                  {shown}
                </span>
              ) : null;
            })}
            {caret && <span className="bx-caret" />}
          </span>
        );
      })}
    </>
  );
}

export function OnlineItem() {
  return (
    <Stage length={14} still={11.5} rx={13} ry={-9} rz={1}>
      {(t) => {
        const chars = t < OUT ? Math.round(ramp(t, 0.6, 6) * total) : 0;
        const batch = Math.floor(t / (14 / 3)) % 3;
        const secs = 2530 + Math.floor(t);
        return (
          <>
            <div className="bx-layer bx-panel bx-live" style={depth(0)}>
              <div className="bx-bar">
                <span className="bx-chip bx-chip--live">
                  <i className="bx-dot bx-dot--pulse" />
                  Live
                </span>
                <span>Data structures</span>
                <span className="font-normal text-text-muted tabular-nums">
                  {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
                </span>
                <span className="bx-seg ml-auto" style={{ "--i": batch } as CSSProperties}>
                  <i aria-hidden="true" />
                  {batches.map((b, i) => (
                    <span key={b} data-on={batch === i || undefined}>
                      {b}
                    </span>
                  ))}
                </span>
              </div>
              <div className="bx-live__body">
                <div className="bx-code">
                  <span className="bx-code__file">binary_search.py</span>
                  <Code chars={chars} />
                </div>
                <div className="bx-live__side">
                  <div className="bx-live__presenter">
                    <span className="bx-iv__speaker" data-on>
                      <Avatar initials="RK" tone="navy" size={30} />
                    </span>
                    <span className="bx-iv__name">Trainer</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {students.map((s, i) => (
                      <span key={s} className="bx-live__seat">
                        <Avatar initials={s} tone={i % 3 === 1 ? "cream" : "mist"} size={20} />
                        {i === 4 && (
                          <span className="bx-hand bx-pop" data-on={on(t, 6.6, 9.4)}>
                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path
                                d="M6 8.5V3.8a1 1 0 0 1 2 0V8m0-5.2a1 1 0 0 1 2 0V8m0-4a1 1 0 0 1 2 0v5.2M6 8.5V6.6a1 1 0 0 0-2 0v3.2c0 2.6 1.7 4.2 4.1 4.2h.6c2 0 3.3-1.4 3.3-3.6V9"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="bx-meta mt-0 text-center">42 students</span>
                </div>
              </div>
            </div>

            <div className="bx-layer bx-panel bx-poll bx-in" data-on={on(t, 7, OUT)} style={depth(70)}>
              <span className="bx-label">Quick poll</span>
              <span className="bx-title mt-1">Binary search runs in?</span>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {poll.map((p) => (
                  <li key={p.label} className="bx-poll__row" data-win={(p.win && t >= 8.8) || undefined}>
                    <span className="bx-poll__bar" data-on={on(t, 7.6, OUT)} style={{ "--v": p.v } as CSSProperties} />
                    <span className="relative font-mono">{p.label}</span>
                    <span className="relative ml-auto flex items-center gap-1.5 tabular-nums">
                      {Math.round(ramp(t, 7.6, 1.2) * p.v * 100)}%{p.win && t >= 8.8 && <Check size={13} />}
                    </span>
                  </li>
                ))}
              </ul>
              <span className="bx-meta mt-2">{Math.round(ramp(t, 7.4, 1.6) * 38)} answered</span>
            </div>
          </>
        );
      }}
    </Stage>
  );
}
