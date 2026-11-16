"use client";

import type { CSSProperties } from "react";
import { Avatar, Stage, depth, on, ramp } from "./stage";

/**
 * Trainers on campus: a week's timetable fills with subjects, each taught by
 * an industry trainer; a "now teaching" marker moves through the day, a
 * counter climbs to 30+ subjects and a trainer card floats in front.
 */

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const times = ["09:30", "11:30", "14:00"];

type Slot = {
  row: number;
  col: number;
  subject: string;
  who: string;
  tone: string;
  at: number;
};
const slots: Slot[] = [
  {
    row: 0,
    col: 0,
    subject: "Java DSA",
    who: "RK",
    tone: "var(--g-navy)",
    at: 0.4,
  },
  {
    row: 0,
    col: 2,
    subject: "AI / ML",
    who: "SM",
    tone: "var(--g-periwinkle)",
    at: 0.8,
  },
  {
    row: 1,
    col: 1,
    subject: "MERN stack",
    who: "VJ",
    tone: "var(--g-amber)",
    at: 1.2,
  },
  {
    row: 0,
    col: 4,
    subject: "Power BI",
    who: "AN",
    tone: "var(--g-indigo)",
    at: 1.6,
  },
  {
    row: 2,
    col: 0,
    subject: "Aptitude",
    who: "NS",
    tone: "var(--g-honey)",
    at: 2.0,
  },
  {
    row: 1,
    col: 3,
    subject: "Cloud",
    who: "PK",
    tone: "var(--g-lavender)",
    at: 2.4,
  },
  {
    row: 2,
    col: 2,
    subject: "Python",
    who: "RK",
    tone: "var(--g-navy)",
    at: 2.8,
  },
  {
    row: 2,
    col: 3,
    subject: "Cybersecurity",
    who: "AD",
    tone: "var(--g-periwinkle)",
    at: 3.2,
  },
  {
    row: 1,
    col: 4,
    subject: "SCADA",
    who: "MT",
    tone: "var(--g-amber)",
    at: 3.6,
  },
];
/** Order the "now teaching" marker walks through (slot indexes). */
const walk = [0, 2, 6, 5];
const OUT = 11.2;

export function TrainersItem() {
  return (
    <Stage length={12} still={9} rx={14} ry={-10} rz={1.5}>
      {(t) => {
        const now = t >= 4.4 && t < OUT ? walk[Math.floor((t - 4.4) / 1.7) % walk.length] : -1;
        const count = Math.round(ramp(t, 0.4, 3.4) * 30);
        return (
          <>
            <div className="bx-layer bx-panel bx-tt" style={depth(0)}>
              <div className="bx-bar">
                <span>Timetable</span>
                <span className="font-normal text-text-muted">CSE · 3rd year</span>
                <span className="bx-chip ml-auto">Week 6</span>
              </div>
              <div className="bx-tt__grid">
                <span />
                {days.map((d, c) => (
                  <span key={d} className="bx-tt__day" data-col={c}>
                    {d}
                  </span>
                ))}
                {times.map((time, r) => (
                  <div key={time} className="contents">
                    <span className="bx-tt__time">{time}</span>
                    {days.map((d, c) => {
                      const i = slots.findIndex((s) => s.row === r && s.col === c);
                      const s = slots[i];
                      return (
                        <span key={d} className="bx-tt__cell" data-col={c}>
                          {s && (
                            <span
                              className="bx-tt__class bx-drop"
                              data-on={on(t, s.at, OUT)}
                              data-now={now === i || undefined}
                              style={{ "--tone": s.tone } as CSSProperties}
                            >
                              <span className="bx-tt__subject">{s.subject}</span>
                              <Avatar initials={s.who} size={16} />
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="bx-layer bx-tt__count bx-pop" data-on={on(t, 0.3, OUT)} style={depth(46)}>
              <span className="bx-label">Subjects this term</span>
              <span className="bx-tt__num">
                {count}
                {count === 30 ? "+" : ""}
              </span>
            </div>

            <div className="bx-layer bx-panel bx-tt__trainer bx-in" data-on={on(t, 4.2, OUT)} style={depth(64)}>
              <div className="flex items-center gap-2.5">
                <Avatar initials="RK" tone="navy" size={30} />
                <div className="min-w-0">
                  <span className="bx-title">Industry trainer</span>
                  <span className="bx-meta">Java DSA · 9 yrs in product teams</span>
                </div>
              </div>
              <div className="mt-2.5 flex gap-1.5">
                <span className="bx-chip">On campus</span>
                <span className="bx-chip">Mon · Wed</span>
              </div>
            </div>
          </>
        );
      }}
    </Stage>
  );
}
