"use client";

import { Bar, Button, Check, Facepile, Icon, Row, Stage, States, Text, Window, type Act } from '@/stageshow/kit'
import './look.css'
import './kaksha.css'

// Kaksha, cohort courses: a chapter ends and its lab opens, with the batch
// already in it. What the system does, so no cursor. Gold: payout-flow (slow
// overlapping arrivals, a payoff that holds) with reorder's Row list. Beats:
// the chapter's progress runs to its end; its check fills; the lab below
// swaps its lock for a Start lab button, and its subtitle turns into the
// classmates already in it. Plays once; the still is the payoff.
//
// Real strings: the course, the chapter, the lab, Start lab, the batch line.

type S = { played: boolean; done: boolean; lab: boolean }

const initial: S = { played: false, done: false, lab: false }
const poster: S = { played: true, done: true, lab: true }

async function script(a: Act<S>) {
  await a.wait(700)
  a.mark('play')
  a.put({ played: true })
  await a.wait(2600)
  a.mark('done')
  a.put({ done: true })
  await a.wait(700)
  a.mark('lab')
  a.put({ lab: true })
  await a.wait(3000)
}

export default function KakshaScene() {
  return (
    <Stage<S> width={600} height={520} compact={{ below: 560, width: 358, height: 340 }} initial={initial} poster={poster} script={script} play="once" className="tc tc-kaksha">
      {(s) => (
        <Window title="Full-stack cohort" className="kk-win">
          <div className="kk-body">
            <div className="kk-list">
              <Row pad={10} className="kk-row--early" lead={<Check on />} title={<Bar w={112} h={8} r={4} tone={3} />} subtitle={<Bar w={70} h={6} r={3} tone={2} />} />
              <Row pad={10} lead={<Check on />} title={<Bar w={96} h={8} r={4} tone={3} />} subtitle={<Bar w={82} h={6} r={3} tone={2} />} />
              <Row
                pad={10}
                selected={!s.lab}
                lead={<Check on={s.done} />}
                title={<Text className="kk-title">APIs with Express</Text>}
                subtitle={<Text className="kk-sub">Chapter 3 · 19 min</Text>}
              />
              <Row
                pad={10}
                selected={s.lab}
                lead={<Check on={false} />}
                title={<Text className="kk-title">Lab: Build a REST API</Text>}
                subtitle={
                  <States
                    value={s.lab ? 'open' : 'locked'}
                    align="start"
                    states={{
                      locked: <Text className="kk-sub">Hands-on · 45 min</Text>,
                      open: (
                        <span className="kk-batch">
                          <Facepile names={['Aarav Mehta', 'Diya Kapoor', 'Kabir Shah']} size={16} />
                          18 from your batch
                        </span>
                      ),
                    }}
                  />
                }
              >
                <States
                  value={s.lab ? 'open' : 'locked'}
                  align="end"
                  states={{
                    locked: (
                      <span className="kk-locked">
                        <Icon name="lock" size={14} filled />
                      </span>
                    ),
                    open: (
                      <Button variant="primary" size="small">
                        Start lab
                      </Button>
                    ),
                  }}
                />
              </Row>
              {[104, 88].map((w) => (
                <Row key={w} pad={10} className="kk-row--later" lead={<Check on={false} />} title={<Bar w={w} h={8} r={4} tone={3} />} subtitle={<Bar w={w - 24} h={6} r={3} tone={2} />}>
                  <span className="kk-locked">
                    <Icon name="lock" size={14} filled />
                  </span>
                </Row>
              ))}
            </div>
            <div className="kk-player" aria-hidden>
              <div className="kk-slide">
                <span className="kk-slide-tag">Chapter 3</span>
                <i className="kk-line kk-line--title" />
                <i className="kk-line" style={{ width: 240 }} />
                <i className="kk-line" style={{ width: 210 }} />
                <i className="kk-line" style={{ width: 168 }} />
              </div>
              <div className="kk-controls">
                <Icon name={s.done ? 'pause' : 'play'} size={14} filled />
                <span className="kk-track">
                  <span className="kk-fill" data-played={s.played || undefined} />
                </span>
              </div>
            </div>
          </div>
        </Window>
      )}
    </Stage>
  )
}
