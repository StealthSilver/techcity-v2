"use client";

import { Badge, Bar, Check, Count, Icon, Meter, Roll, Row, Stage, States, Text, Window, type Act } from '@/stageshow/kit'
import './look.css'
import './marg.css'

// Marg, guided roadmaps: a student finishes a step and the next one opens.
// Gold: reorder (a list of Rows with one acted-on item) with table-edit's
// cause-then-effect timing. Beats: the pointer ticks "Binary search", its
// check fills and its badge rolls In progress → Done; a beat later the
// track's count rolls 4 → 5 of 10 with its meter, and "Two pointers" swaps
// its lock for an "Up next" badge and takes the highlight. Plays once.
//
// Real strings: the track, the step finished, the step it opens, the count.
// Done and locked steps around them are placeholder rows.

type S = { done: boolean; next: boolean }

const initial: S = { done: false, next: false }
const poster: S = { done: true, next: true }

async function script(a: Act<S>) {
  await a.wait(900)
  a.mark('open')
  await a.move({ at: 'tick', x: 0.5, y: 0.5 })
  await a.wait(200)
  await a.click({ at: 'tick', x: 0.5, y: 0.5 })
  a.mark('tick')
  a.put({ done: true })
  await a.move({ at: 'tick', x: 9, y: -1.25 }, { duration: 600 })
  await a.wait(500)
  a.mark('next')
  a.put({ next: true })
  await a.wait(2600)
}

export default function MargScene() {
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
      className="tc tc-marg"
    >
      {(s) => (
        <Window title="DSA roadmap" className="mg-win">
          <div className="mg-body">
            <div className="mg-summary">
              <span className="mg-count">
                <Count value={s.done ? 5 : 4} duration={600} /> of 10 steps
              </span>
              <Meter value={s.done ? 0.5 : 0.4} className="mg-meter" />
            </div>
            <div className="mg-cols">
            <div className="mg-list">
              <Row pad={10} className="mg-row" lead={<Check on />} title={<Bar w={128} h={8} r={4} tone={3} />} subtitle={<Bar w={84} h={6} r={3} tone={2} />} />
              <Row pad={10} className="mg-row" lead={<Check on />} title={<Bar w={104} h={8} r={4} tone={3} />} subtitle={<Bar w={96} h={6} r={3} tone={2} />} />
              <Row
                pad={10}
                className="mg-row"
                lead={
                  <span data-target="tick" data-cursor="pointer" className="mg-tick">
                    <Check on={s.done} />
                  </span>
                }
                title={<Text className="mg-title">Binary search</Text>}
                subtitle={<Text className="mg-sub">6 problems · 2 videos</Text>}
              >
                <Badge tone={s.done ? 'success' : 'accent'}>
                  <Roll variant="fade">{s.done ? 'Done' : 'In progress'}</Roll>
                </Badge>
              </Row>
              <Row
                pad={10}
                className="mg-row"
                selected={s.next}
                lead={<Check on={false} />}
                title={<Text className="mg-title">Two pointers</Text>}
                subtitle={<Text className="mg-sub">5 problems · 1 video</Text>}
              >
                <States
                  value={s.next ? 'open' : 'locked'}
                  align="end"
                  states={{
                    locked: (
                      <span className="mg-lock">
                        <Icon name="lock" size={14} filled />
                      </span>
                    ),
                    open: <Badge tone="accent">Up next</Badge>,
                  }}
                />
              </Row>
              <Row pad={10} className="mg-row mg-row--locked" lead={<Check on={false} />} title={<Bar w={116} h={8} r={4} tone={3} />} subtitle={<Bar w={72} h={6} r={3} tone={2} />}>
                <span className="mg-lock">
                  <Icon name="lock" size={14} filled />
                </span>
              </Row>
              <Row pad={10} className="mg-row mg-row--locked" lead={<Check on={false} />} title={<Bar w={92} h={8} r={4} tone={3} />} subtitle={<Bar w={88} h={6} r={3} tone={2} />}>
                <span className="mg-lock">
                  <Icon name="lock" size={14} filled />
                </span>
              </Row>
            </div>
            {/* Filler: the step's resources, the column the crop cuts. */}
            <div className="mg-aside" aria-hidden>
              {[96, 120, 84].map((w, i) => (
                <div key={i} className="mg-card">
                  <Bar w={w} h={7} r={4} tone={3} />
                  <Bar w={w + 40} h={6} r={3} tone={2} />
                  <Bar w={w - 20} h={6} r={3} tone={2} />
                </div>
              ))}
            </div>
            </div>
          </div>
        </Window>
      )}
    </Stage>
  )
}
