"use client";

import type { CSSProperties } from "react";
import { Avatar, Check, Stage, depth, on, ramp } from "./stage";

/**
 * Faculty development: a module checklist ticks through the latest tech while
 * a progress ring fills, then a certificate slides in front of it.
 */

const modules = [
  { name: "Generative AI", meta: "6 hrs · hands-on lab" },
  { name: "Cloud computing", meta: "6 hrs · AWS sandbox" },
  { name: "DevOps pipelines", meta: "6 hrs · CI/CD project" },
  { name: "Cybersecurity", meta: "6 hrs · threat lab" },
  { name: "Data engineering", meta: "6 hrs · live dataset" },
];
const STEP = 1.4;
const START = 0.4;
const OUT = 12.3;
const R = 17;
const C = 2 * Math.PI * R;

export function FacultyItem() {
  return (
    <Stage length={13} still={11.4} rx={12} ry={14} rz={-1}>
      {(t) => {
        const live = t < OUT;
        const progress = live ? ramp(t, START, STEP * modules.length) : 0;
        return (
          <div className="bx-fdp">
            <div className="bx-layer bx-panel bx-fdp__list" style={depth(0)}>
              <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-3">
                <Avatar initials="AM" tone="lavender" size={30} />
                <div className="min-w-0 flex-1">
                  <span className="bx-title">Faculty development</span>
                  <span className="bx-meta">CSE department · 12 faculty</span>
                </div>
                <span className="bx-ring">
                  <svg viewBox="0 0 40 40" aria-hidden="true">
                    <circle cx="20" cy="20" r={R} />
                    <circle
                      cx="20"
                      cy="20"
                      r={R}
                      style={{
                        strokeDasharray: C,
                        strokeDashoffset: C * (1 - progress),
                      }}
                    />
                  </svg>
                  <span>{Math.round(progress * 100)}%</span>
                </span>
              </div>
              <ul className="flex flex-col gap-1.5 p-2.5">
                {modules.map((m, i) => {
                  const from = START + i * STEP;
                  const done = live && t >= from + STEP;
                  const current = live && t >= from && !done;
                  return (
                    <li key={m.name} className="bx-mod" data-current={current || undefined} data-done={done || undefined}>
                      <span className="bx-mod__no">{String(i + 1).padStart(2, "0")}</span>
                      <span className="min-w-0 flex-1">
                        <span className="bx-title text-[12px]">{m.name}</span>
                        <span className="bx-meta">{m.meta}</span>
                        <span className="bx-track bx-mod__track mt-1.5">
                          <span
                            className="bx-fill"
                            data-on={current || done || undefined}
                            style={{ "--v": 1 } as CSSProperties}
                          />
                        </span>
                      </span>
                      <span className="bx-mod__state">{done ? <Check size={16} /> : <i />}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div
              className="bx-layer bx-panel bx-cert bx-in"
              data-on={on(t, START + STEP * modules.length + 0.5, OUT)}
              style={depth(56)}
            >
              <div className="bx-cert__inner">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="bx-label uppercase">Certificate of completion</span>
                    <span className="bx-cert__title">Faculty Development Program</span>
                    <span className="bx-meta">Cloud &amp; DevOps track · 30 hours</span>
                  </div>
                  <svg className="bx-seal" viewBox="0 0 40 40" aria-hidden="true">
                    <path d="M20 2l3.4 3.6 4.9-1 1.5 4.7 4.7 1.5-1 4.9L38 20l-3.6 3.4 1 4.9-4.7 1.5-1.5 4.7-4.9-1L20 38l-3.4-3.6-4.9 1-1.5-4.7-4.7-1.5 1-4.9L2 20l3.6-3.4-1-4.9 4.7-1.5 1.5-4.7 4.9 1z" />
                    <circle cx="20" cy="20" r="10" />
                    <path d="m15.5 20.2 3 3 6-6.4" />
                  </svg>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <svg className="bx-sign" viewBox="0 0 90 24" aria-hidden="true">
                    <path d="M3 17c6-10 9-12 10-8s-3 11 1 9 7-12 10-11-2 10 2 10 6-7 9-7 1 6 4 6 6-5 9-5 4 4 8 3 9-3 12-3" />
                  </svg>
                  <span className="bx-meta mt-0">TechCity Skills</span>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Stage>
  );
}
