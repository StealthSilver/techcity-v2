"use client";

import { Avatar, Check, Stage, depth, on } from "./stage";

/**
 * Industry mentors: a one-to-one session. Messages arrive in turn (each one
 * starts as a typing indicator), a mentor tag floats above, and the next session gets
 * booked on a small calendar card in front.
 */

type Msg = {
  from: "student" | "mentor";
  text: string;
  typing: number;
  at: number;
};
const msgs: Msg[] = [
  {
    from: "student",
    text: "How should I prepare for system design rounds?",
    typing: 0.3,
    at: 1,
  },
  {
    from: "mentor",
    text: "Pick one project and design it end to end. I’ll share a checklist.",
    typing: 1.8,
    at: 3,
  },
  { from: "student", text: "Thanks! Same time next week?", typing: 4, at: 4.8 },
];
const OUT = 10.2;

export function MentorshipItem() {
  return (
    <Stage length={11} still={9.5} rx={12} ry={14} rz={-1.5}>
      {(t) => {
        return (
          <>
            <div className="bx-layer bx-panel bx-chat" style={depth(0)}>
              <div className="bx-bar">
                <span className="flex">
                  <Avatar initials="AS" tone="navy" size={20} />
                  <span className="-ml-1.5">
                    <Avatar initials="PR" size={20} />
                  </span>
                </span>
                <span>Mentor session</span>
                <span className="bx-chip bx-chip--live ml-auto">
                  <i className="bx-dot bx-dot--pulse" />
                  Live
                </span>
              </div>
              <div className="bx-chat__body">
                {msgs.map((m) => (
                  <p key={m.at} className="bx-msg bx-in" data-from={m.from} data-on={on(t, m.typing, OUT)}>
                    {t < m.at ? (
                      <span className="bx-typing" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : (
                      m.text
                    )}
                  </p>
                ))}
              </div>
            </div>

            <div className="bx-layer bx-chat__tag bx-pop" data-on={on(t, 0.2, OUT)} style={depth(44)}>
              <i className="bx-dot" style={{ background: "var(--g-navy)" }} />
              Mentor · SDE II, fintech
            </div>

            <div className="bx-layer bx-panel bx-cal bx-in" data-on={on(t, 6, OUT)} style={depth(66)}>
              <span className="bx-cal__date">
                <span>Thu</span>
                <strong>14</strong>
              </span>
              <span className="min-w-0">
                <span className="bx-title">Next session</span>
                <span className="bx-meta">6:00 PM · 30 min</span>
              </span>
              <Check size={18} />
            </div>
          </>
        );
      }}
    </Stage>
  );
}
