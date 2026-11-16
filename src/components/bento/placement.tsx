"use client";

import type { CSSProperties } from "react";
import { Avatar, Check, Stage, depth, on, ramp } from "./stage";

/**
 * Interview preparation: a mock interview call. The interviewer asks, the
 * question types out, the student answers (a live waveform), then a feedback
 * card scores the round and an "Interview ready" badge lands.
 */

const QUESTION = "How would you find the first repeated number in an array?";
const scores = [
  { name: "Problem solving", v: 0.84, at: 7.4 },
  { name: "Coding", v: 0.78, at: 7.8 },
  { name: "Communication", v: 0.9, at: 8.2 },
];
/** Waveform bar heights and timings, fixed so every render matches. */
const bars = Array.from({ length: 28 }, (_, i) => ({
  h: 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)),
  d: 0.7 + ((i * 37) % 9) / 18,
}));
const OUT = 13.2;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function PlacementItem() {
  return (
    <Stage length={14} still={12.4} rx={12} ry={-14} rz={1}>
      {(t) => {
        const typed = Math.round(ramp(t, 0.9, 2.6) * QUESTION.length);
        const asking = t >= 0.6 && t < 3.6;
        const answering = t >= 4 && t < 7;
        return (
          <div className="bx-iv">
            <div className="bx-layer bx-panel bx-iv__call" style={depth(0)}>
              <div className="bx-bar">
                <span>Mock interview</span>
                <span className="bx-chip">Round 2</span>
                <span className="bx-chip bx-chip--live ml-auto">
                  <i className="bx-dot bx-dot--pulse" />
                  {clock(252 + t)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                <div className="bx-iv__tile" data-tone="cool">
                  <span className="bx-iv__speaker" data-on={asking || undefined}>
                    <Avatar initials="HR" tone="navy" size={34} />
                  </span>
                  <span className="bx-iv__name">Interviewer</span>
                </div>
                <div className="bx-iv__tile" data-tone="warm">
                  <span className="bx-iv__speaker" data-on={answering || undefined}>
                    <Avatar initials="You" tone="cream" size={34} />
                  </span>
                  <span className="bx-iv__name">You</span>
                </div>
              </div>
              <div className="mx-3 rounded-[10px] bg-surface-subdued px-3 py-2.5">
                <span className="bx-label">Question 3 of 5</span>
                <p className="bx-iv__q">
                  {QUESTION.slice(0, typed)}
                  {t >= 0.6 && t < 4 && <span className="bx-caret" />}
                </p>
              </div>
              <div className="flex items-center gap-3 px-3 pt-3 pb-3.5">
                <span className="bx-label w-[64px] shrink-0">Your answer</span>
                <span className="bx-wave" data-on={answering || undefined}>
                  {bars.map((b, i) => (
                    <i
                      key={i}
                      style={
                        {
                          "--h": b.h,
                          animationDuration: `${b.d}s`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </span>
                <span className="bx-meta mt-0 w-[30px] text-right tabular-nums">{clock(ramp(t, 4, 3) * 84)}</span>
              </div>
            </div>

            <div className="bx-layer bx-panel bx-iv__score bx-in" data-on={on(t, 7.1, OUT)} style={depth(40)}>
              <div className="flex items-baseline justify-between">
                <span className="bx-title">Feedback</span>
                <span className="bx-meta mt-0">Reviewed by your trainer</span>
              </div>
              <ul className="mt-3 flex flex-col gap-2.5">
                {scores.map((s) => (
                  <li key={s.name}>
                    <span className="flex justify-between text-[11px] text-text">
                      {s.name}
                      <span className="text-text-muted tabular-nums">{Math.round(ramp(t, s.at, 1.1) * s.v * 100)}</span>
                    </span>
                    <span className="bx-track mt-1.5">
                      <span className="bx-fill" data-on={on(t, s.at, OUT)} style={{ "--v": s.v } as CSSProperties} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bx-layer bx-iv__badge bx-pop" data-on={on(t, 9.4, OUT)} style={depth(72)}>
              <Check size={16} />
              Interview ready
            </div>
          </div>
        );
      }}
    </Stage>
  );
}
