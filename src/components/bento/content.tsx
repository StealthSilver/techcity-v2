"use client";

import type { CSSProperties } from "react";
import { Check, Stage, ramp } from "./stage";

/**
 * Ready-made content: a fanned stack of a video, notes and a test. Every three
 * seconds the next card comes to the front and plays its own small moment.
 */

const SLOT = 3;
const cards = ["video", "notes", "test"] as const;

/** Resting place in the fan by rank (0 = front). */
const fan = [
  { x: "0%", y: "0px", z: 40, r: -2 },
  { x: "24%", y: "-14px", z: 0, r: 7 },
  { x: "-22%", y: "-22px", z: -40, r: -9 },
];

function Video({ p }: { p: number }) {
  return (
    <>
      <span className="bx-doc__type" data-tone="navy">
        Video
      </span>
      <span className="bx-thumb">
        <span className="bx-thumb__play" aria-hidden="true">
          <svg viewBox="0 0 12 12">
            <path d="M4 2.5v7l5.5-3.5z" fill="currentColor" />
          </svg>
        </span>
        <span className="bx-thumb__bar">
          <span style={{ width: `${8 + p * 70}%` }} />
        </span>
      </span>
      <span className="bx-title mt-2.5">Recursion, explained</span>
      <span className="bx-meta">12:40 · Module 4</span>
    </>
  );
}

function Notes({ p }: { p: number }) {
  return (
    <>
      <span className="bx-doc__type" data-tone="amber">
        Notes
      </span>
      <span className="bx-title mt-2">Binary trees</span>
      <span className="bx-lines">
        <i style={{ width: "92%" }} />
        <i className="bx-hl" style={{ width: "78%", "--p": ramp(p, 0.2, 0.4) } as CSSProperties} />
        <i style={{ width: "86%" }} />
        <i style={{ width: "54%" }} />
      </span>
      <svg className="bx-tree" viewBox="0 0 120 48" aria-hidden="true">
        <path d="M60 8 34 26M60 8l26 18M34 26 22 42M34 26l12 16M86 26l12 16" />
        <circle cx="60" cy="8" r="5" />
        <circle cx="34" cy="26" r="4.5" />
        <circle cx="86" cy="26" r="4.5" />
        <circle cx="22" cy="42" r="4" />
        <circle cx="46" cy="42" r="4" />
        <circle cx="98" cy="42" r="4" />
      </svg>
    </>
  );
}

function Test({ p }: { p: number }) {
  const picked = p > 0.35;
  const marked = p > 0.6;
  return (
    <>
      <span className="bx-doc__type" data-tone="periwinkle">
        Test
      </span>
      <span className="bx-meta mt-2">Question 4 of 10</span>
      <span className="bx-title mt-1">Which traversal visits the root first?</span>
      <span className="mt-2.5 flex flex-col gap-1.5">
        {["Inorder", "Preorder", "Postorder"].map((o) => {
          const right = o === "Preorder";
          return (
            <span key={o} className="bx-opt" data-picked={(right && picked) || undefined}>
              <i />
              {o}
              {right && marked && (
                <span className="ml-auto">
                  <Check size={13} />
                </span>
              )}
            </span>
          );
        })}
      </span>
    </>
  );
}

export function ContentItem() {
  return (
    <Stage length={SLOT * 3} still={SLOT * 2 + 2} rx={14} ry={-12} rz={1}>
      {(t) => {
        const front = Math.floor(t / SLOT) % 3;
        const local = (t % SLOT) / SLOT;
        return (
          <div className="bx-fan">
            {cards.map((c, i) => {
              const rank = (i - front + 3) % 3;
              const f = fan[rank];
              const p = rank === 0 ? local : rank === 2 ? 1 : 0;
              return (
                <div
                  key={c}
                  className="bx-panel bx-doc"
                  data-front={rank === 0 || undefined}
                  style={
                    {
                      "--x": f.x,
                      "--y": f.y,
                      "--z": `${f.z}px`,
                      "--r": `${f.r}deg`,
                      zIndex: 3 - rank,
                    } as CSSProperties
                  }
                >
                  {c === "video" ? <Video p={p} /> : c === "notes" ? <Notes p={p} /> : <Test p={p} />}
                </div>
              );
            })}
          </div>
        );
      }}
    </Stage>
  );
}
