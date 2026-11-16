"use client";

import type { CSSProperties, ReactNode } from "react";
import { Avatar, Check, Stage, depth, on, ramp } from "./stage";

/**
 * One platform: a compact college dashboard. The sidebar steps through
 * courses, tests, attendance and placements, and the main view changes with
 * it; a chip in front notes the single login.
 */

const SLOT = 3;
const tabs: { id: string; label: string; icon: ReactNode }[] = [
  {
    id: "courses",
    label: "Courses",
    icon: (
      <path d="M3 4.5h4.5a2 2 0 0 1 2 2V15a1.5 1.5 0 0 0-1.5-1.5H3zM16 4.5h-4.5a2 2 0 0 0-2 2V15a1.5 1.5 0 0 1 1.5-1.5H16z" />
    ),
  },
  {
    id: "tests",
    label: "Tests",
    icon: <path d="M5 3.5h10v13H5zM8 7.5h4M8 10.5h4M8 13.5h2" />,
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: <path d="M4 5.5h12v10H4zM4 8.5h12M7.5 3.5v3M12.5 3.5v3M7.5 12l1.6 1.5 3.4-3.5" />,
  },
  {
    id: "placements",
    label: "Placements",
    icon: <path d="M3.5 7h13v8.5h-13zM7.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M3.5 11h13" />,
  },
];
const histogram = [0.25, 0.42, 0.6, 0.88, 1, 0.7, 0.38];
const week = [
  { d: "M", v: 0.94 },
  { d: "T", v: 0.9 },
  { d: "W", v: 0.96 },
  { d: "T", v: 0.88 },
  { d: "F", v: 0.92 },
];

export function PlatformsItem() {
  return (
    <Stage length={SLOT * 4} still={SLOT * 2 + 2} rx={12} ry={15} rz={-1.5}>
      {(t) => {
        const tab = Math.floor(t / SLOT) % 4;
        const at = tab * SLOT;
        return (
          <>
            <div className="bx-layer bx-panel bx-dash" style={depth(0)}>
              <div className="bx-bar">
                <span className="bx-dash__logo" aria-hidden="true" />
                <span>Your college</span>
                <span className="bx-dash__search ml-auto">Search</span>
              </div>
              <div className="flex">
                <nav className="bx-dash__nav" style={{ "--i": tab } as CSSProperties}>
                  <i aria-hidden="true" />
                  {tabs.map((x, i) => (
                    <span key={x.id} data-on={tab === i || undefined} title={x.label}>
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        {x.icon}
                      </svg>
                    </span>
                  ))}
                </nav>
                <div className="bx-dash__main">
                  <span className="bx-label">{tabs[tab].label}</span>

                  <div className="bx-view" data-on={tab === 0 || undefined}>
                    {[
                      ["Python", 0.86],
                      ["Data structures", 0.64],
                      ["Web development", 0.42],
                    ].map(([name, v], i) => (
                      <span key={name} className="block">
                        <span className="flex justify-between text-[11px] text-text">
                          {name}
                          <span className="text-text-muted tabular-nums">{Math.round((v as number) * 100)}%</span>
                        </span>
                        <span className="bx-track mt-1">
                          <span
                            className="bx-fill"
                            data-on={on(t, at + 0.2 + i * 0.15, at + SLOT)}
                            style={{ "--v": v } as CSSProperties}
                          />
                        </span>
                      </span>
                    ))}
                  </div>

                  <div className="bx-view" data-on={tab === 1 || undefined}>
                    <span className="flex items-baseline gap-1.5">
                      <span className="bx-big">72</span>
                      <span className="bx-meta mt-0">avg · Mock test 3</span>
                    </span>
                    <span className="bx-hist">
                      {histogram.map((h, i) => (
                        <i key={i} data-on={on(t, at + 0.15 + i * 0.06, at + SLOT)} style={{ "--v": h } as CSSProperties} />
                      ))}
                    </span>
                  </div>

                  <div className="bx-view" data-on={tab === 2 || undefined}>
                    <span className="flex items-baseline gap-1.5">
                      <span className="bx-big tabular-nums">{Math.round(ramp(t, at + 0.1, 1) * 92)}%</span>
                      <span className="bx-meta mt-0">this week</span>
                    </span>
                    <span className="bx-week">
                      {week.map((w, i) => (
                        <span key={i}>
                          <i data-on={on(t, at + 0.2 + i * 0.08, at + SLOT)} style={{ "--v": w.v } as CSSProperties} />
                          {w.d}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div className="bx-view" data-on={tab === 3 || undefined}>
                    <span className="flex items-baseline gap-1.5">
                      <span className="bx-big tabular-nums">{Math.round(ramp(t, at + 0.1, 1) * 48)}</span>
                      <span className="bx-meta mt-0">offers this season</span>
                    </span>
                    <span className="mt-1.5 flex flex-col gap-1.5">
                      {["Software engineer", "Data analyst"].map((r, i) => (
                        <span key={r} className="bx-offer-row bx-in" data-on={on(t, at + 0.5 + i * 0.3, at + SLOT)}>
                          {r}
                          <Check size={13} />
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bx-layer bx-dash__chip bx-pop" data-on style={depth(60)}>
              <span className="flex">
                <Avatar initials="S" size={18} />
                <span className="-ml-1.5">
                  <Avatar initials="F" tone="lavender" size={18} />
                </span>
                <span className="-ml-1.5">
                  <Avatar initials="A" tone="navy" size={18} />
                </span>
              </span>
              One login for everyone
            </div>
          </>
        );
      }}
    </Stage>
  );
}
