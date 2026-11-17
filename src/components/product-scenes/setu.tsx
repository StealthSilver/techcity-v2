"use client";

import { Avatar, Badge, Bar, Count, Meter, Roll, Stage, Window, type Act } from '@/stageshow/kit'
import './look.css'
import './setu.css'

// Setu, the campus LMS: a faculty member grades one submission in place.
// Gold: table-edit. Beats: the pointer double-clicks Ananya's empty score,
// the cell becomes a field, "18" is typed, Enter commits; the cell washes
// once, her status rolls Submitted → Graded, and a beat later the class's
// graded count rolls 11 → 12 with its meter. Plays once; the still is the
// payoff.
//
// Real strings: the assignment, the six students (a table is where dense real
// data reads right), the score typed and the graded count.

type S = { edit: boolean; val: string; score: number | null; wash: boolean }

const ROWS = [
  { who: 'Aarav Mehta', score: 17, status: 'Graded' },
  { who: 'Ananya Rao', score: null, status: 'Submitted' },
  { who: 'Diya Kapoor', score: 19, status: 'Graded' },
  { who: 'Kabir Shah', score: null, status: 'Submitted' },
  { who: 'Ishaan Verma', score: null, status: 'Late' },
  { who: 'Meera Iyer', score: 15, status: 'Graded' },
  { who: 'Rohan Das', score: 16, status: 'Graded' },
]
/** The trailing "submitted" column is filler: it is the column the crop cuts. */
const WHEN = [52, 44, 60, 40, 56, 48, 46]
const EDIT = 1
const TONES = { Graded: 'success', Submitted: 'neutral', Late: 'warning' } as const

const initial: S = { edit: false, val: '', score: null, wash: false }
const poster: S = { ...initial, score: 18 }

async function script(a: Act<S>) {
  await a.wait(900)
  a.mark('open')
  await a.move({ at: 'score', x: 0.3, y: 0.5 })
  await a.wait(200)
  await a.click({ at: 'score', x: 0.3, y: 0.5 }, { double: true })
  a.put({ edit: true })
  // Off the cell while typing, as a hand does once it goes to the keys
  await a.move({ at: 'score', x: -0.6, y: 1.05 }, { duration: 450 })
  await a.wait(150)
  a.mark('type')
  await a.type('val', '18', { interval: 110 })
  await a.wait(450)
  a.mark('commit')
  a.put({ edit: false, score: 18, wash: true })
  await a.wait(900)
  a.put({ wash: false })
  await a.wait(2400)
}

export default function SetuScene() {
  return (
    <Stage<S>
      width={600}
      height={520}
      compact={{ below: 560, width: 358, height: 320 }}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      cursor={{ at: { wide: { x: 560, y: 490 }, compact: { x: 330, y: 300 } } }}
      className="tc tc-setu"
    >
      {(s) => {
        const graded = ROWS.filter((r, i) => (i === EDIT ? s.score !== null : r.status === 'Graded')).length + 7
        return (
          <Window title="Arrays · Assignment 3" className="st-win">
            <div className="st-body">
              <div className="st-summary">
                <span className="st-count">
                  <Count value={graded} duration={600} /> of 40 graded
                </span>
                <Meter value={graded / 40} className="st-meter" />
              </div>
              <div className="st-row st-row--head">
                <span>Student</span>
                <span className="st-num">Score</span>
                <span>Status</span>
                <span>
                  <Bar w={64} h={7} r={4} tone={4} />
                </span>
              </div>
              {ROWS.map((r, i) => {
                const editing = i === EDIT
                const score = editing ? s.score : r.score
                const status = editing ? (s.score !== null ? 'Graded' : 'Submitted') : r.status
                return (
                  <div key={r.who} className="st-row">
                    <span className="st-who">
                      <Avatar name={r.who} size={24} />
                      <span>{r.who}</span>
                    </span>
                    <span
                      className="st-num st-cell"
                      data-target={editing ? 'score' : undefined}
                      data-cursor={editing ? 'ibeam' : undefined}
                      data-edit={(editing && s.edit) || undefined}
                      data-wash={(editing && s.wash) || undefined}
                    >
                      {editing && <span className="st-ring" />}
                      <span className="st-text">
                        <span className="st-val" data-typing={editing || undefined} data-empty={(score === null && !(editing && s.edit)) || undefined}>
                          {editing && s.edit ? s.val : score === null ? '–' : score}
                        </span>
                        {editing && s.edit && <span className="st-caret" data-typing key={s.val} />}
                        <span className="st-of" data-show={score !== null || (editing && s.edit) || undefined}>
                          / 20
                        </span>
                      </span>
                    </span>
                    <span>
                      <Badge tone={TONES[status as keyof typeof TONES]}>
                        <Roll variant="fade" delay={editing ? 150 : 0}>
                          {status}
                        </Roll>
                      </Badge>
                    </span>
                    <span>
                      <Bar w={WHEN[i]} h={7} r={4} tone={4} />
                    </span>
                  </div>
                )
              })}
            </div>
          </Window>
        )
      }}
    </Stage>
  )
}
