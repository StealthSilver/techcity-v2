"use client";

import { Check, Count, Meter, Stage, States, Window, type Act } from '@/stageshow/kit'
import './look.css'
import './board.css'

// All projects: a board of every campus project by status. What the program
// does, so no cursor. Gold: reorder (cards placed by transform, the moved one
// gliding while the ones it passes make room). Beats: the Faridabad project's
// progress runs to its end; its card glides from Ongoing to the top of
// Completed while Ambala moves up and the completed cards step down; the two
// counts roll (2 → 1, 5 → 6) and its meter becomes a Delivered tick. Plays once.
//
// Real strings: the column names and counts, the campuses and their tracks.

type S = { progress: number; moved: boolean }
type Card = { id: string; city: string; what: string; col: 0 | 1 | 2 }

const CARDS: Card[] = [
  { id: 'gur-up', city: 'Gurugram', what: 'Python Full Stack, SCADA', col: 0 },
  { id: 'far', city: 'Faridabad', what: 'Java DSA, MERN, AI/ML', col: 1 },
  { id: 'amb', city: 'Ambala', what: 'AI and machine learning', col: 1 },
  { id: 'gur', city: 'Gurugram', what: 'Data Analytics, Power BI', col: 2 },
  { id: 'ban', city: 'Banda', what: 'AI/ML, Java DSA', col: 2 },
  { id: 'gha', city: 'Ghaziabad', what: 'Full Stack, MERN', col: 2 },
  { id: 'luc', city: 'Lucknow', what: 'AI/ML, Excel', col: 2 },
  { id: 'far2', city: 'Faridabad', what: 'AI workshop, Python DSA', col: 2 },
]
const COLS = ['Upcoming', 'Ongoing', 'Completed'] as const
const DOT = ['#6b7be6', '#f59e0b', '#1c257d']
const CH = 74
const GAP = 8

const initial: S = { progress: 0.86, moved: false }
const poster: S = { progress: 1, moved: true }

async function script(a: Act<S>) {
  await a.wait(1000)
  a.mark('finish')
  a.put({ progress: 1 })
  await a.wait(1100)
  a.mark('move')
  a.put({ moved: true })
  await a.wait(3400)
}

/** Where each card sits: its column, and its row within it. */
function place(s: S) {
  const rows: Record<number, string[]> = { 0: [], 1: [], 2: [] }
  for (const c of CARDS) {
    const col = c.id === 'far' && s.moved ? 2 : c.col
    if (c.id === 'far' && s.moved) rows[2].unshift(c.id)
    else rows[col].push(c.id)
  }
  const at: Record<string, { col: number; row: number }> = {}
  for (const col of [0, 1, 2]) rows[col].forEach((id, row) => (at[id] = { col, row }))
  return { at, counts: [rows[0].length, rows[1].length, rows[2].length] }
}

export default function BoardScene() {
  return (
    <Stage<S> width={600} height={540} compact={{ below: 560, width: 358, height: 320 }} initial={initial} poster={poster} script={script} play="once" className="tc tc-board">
      {(s, _rect, layout) => {
        const { at, counts } = place(s)
        const compact = layout === 'compact'
        // Compact drops the Upcoming column: the story is Ongoing → Completed.
        const shown = compact ? [1, 2] : [0, 1, 2]
        const colW = compact ? 139 : 148
        const x = (col: number) => shown.indexOf(col) * (colW + 12)
        return (
          <Window title="Campus projects" className="bd-win">
            <div className="bd-body">
              <div className="bd-heads" style={{ gridTemplateColumns: `repeat(${shown.length}, ${colW}px)` }}>
                {shown.map((col) => (
                  <span key={col} className="bd-head">
                    <i style={{ background: DOT[col] }} />
                    {COLS[col]}
                    <span className="bd-n">
                      <Count value={counts[col]} duration={500} />
                    </span>
                  </span>
                ))}
              </div>
              <div className="bd-lanes">
                {CARDS.map((c) => {
                  const p = at[c.id]
                  if (!shown.includes(p.col)) return null
                  const moving = c.id === 'far'
                  return (
                    <div
                      key={c.id}
                      className="bd-card"
                      data-moving={moving || undefined}
                      style={{ width: colW, transform: `translate(${x(p.col)}px, ${p.row * (CH + GAP)}px)` }}
                    >
                      <span className="bd-city">{c.city}</span>
                      <span className="bd-what">{c.what}</span>
                      {moving ? (
                        <States
                          value={s.moved ? 'done' : 'running'}
                          align="start"
                          className="bd-foot"
                          states={{
                            running: <Meter value={s.progress} className="bd-meter" />,
                            done: (
                              <span className="bd-done">
                                <Check on size={13} /> Delivered
                              </span>
                            ),
                          }}
                        />
                      ) : (
                        <>
                          {p.col === 1 && <Meter value={0.42} className="bd-meter" />}
                          {p.col === 2 && (
                            <span className="bd-done">
                              <Check on size={13} /> Delivered
                            </span>
                          )}
                        </>
                      )}
                      {p.col === 0 && <span className="bd-when">Starts Jan 2027</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </Window>
        )
      }}
    </Stage>
  )
}
