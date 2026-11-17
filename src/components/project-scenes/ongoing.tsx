"use client";

import { Badge, Bar, Check, Meter, Roll, Row, Stage, Text, Window, type Act } from '@/stageshow/kit'
import './look.css'
import './ongoing.css'

// Ongoing projects: a week at the Faridabad campus. What the program does, so
// no cursor. Gold: payout-flow (overlapping arrivals, a payoff that holds)
// with Spardha's pinned window. Beats: Thursday's MERN lab is live; it
// finishes (its check fills, Live rolls to Done); Friday's AI/ML session goes
// live and finishes the same way; a beat later the week rolls 9 → 10 of 18
// with its meter. Plays once; the still is the payoff.
//
// Real strings: the campus and its four tracks (from the project), the
// sessions, Live/Done, the week count.

type S = { mern: 'live' | 'done'; ai: 'next' | 'live' | 'done'; week: number }

const initial: S = { mern: 'live', ai: 'next', week: 9 }
const poster: S = { mern: 'done', ai: 'done', week: 10 }

async function script(a: Act<S>) {
  await a.wait(1200)
  a.mark('mern')
  a.put({ mern: 'done' })
  await a.wait(900)
  a.mark('ai')
  a.put({ ai: 'live' })
  await a.wait(1500)
  a.put({ ai: 'done' })
  await a.wait(800)
  a.mark('week')
  a.put({ week: 10 })
  await a.wait(3000)
}

const label = { live: 'Live', done: 'Done', next: 'Friday' } as const
const tone = { live: 'warning', done: 'success', next: 'neutral' } as const

export default function OngoingScene() {
  return (
    <Stage<S> width={600} height={540} compact={{ below: 560, width: 358, height: 320 }} initial={initial} poster={poster} script={script} play="once" className="tc tc-ongoing">
      {(s) => (
        <Window title="Faridabad campus" className="og-win">
          <div className="og-body">
            <div className="og-summary">
              <span className="og-count">
                Week <Roll>{String(s.week)}</Roll> of 18
              </span>
              <Meter value={s.week / 18} className="og-meter" />
            </div>
            <div className="og-list">
              <Row pad={10} lead={<Check on />} title={<Text className="og-title">Aptitude</Text>} subtitle={<Text className="og-sub">Monday · Quant drills</Text>}>
                <Badge tone="success" dot>
                  Done
                </Badge>
              </Row>
              <Row pad={10} lead={<Check on />} title={<Text className="og-title">Java DSA</Text>} subtitle={<Text className="og-sub">Tuesday · Trees and graphs</Text>}>
                <Badge tone="success" dot>
                  Done
                </Badge>
              </Row>
              <Row pad={10} selected={s.mern === 'live'} lead={<Check on={s.mern === 'done'} />} title={<Text className="og-title">MERN</Text>} subtitle={<Text className="og-sub">Thursday · Lab 9, a REST API</Text>}>
                <Badge tone={tone[s.mern]} dot>
                  <Roll variant="fade">{label[s.mern]}</Roll>
                </Badge>
              </Row>
              <Row pad={10} selected={s.ai === 'live'} lead={<Check on={s.ai === 'done'} />} title={<Text className="og-title">AI/ML</Text>} subtitle={<Text className="og-sub">Friday · Model evaluation</Text>}>
                <Badge tone={tone[s.ai]} dot>
                  <Roll variant="fade">{label[s.ai]}</Roll>
                </Badge>
              </Row>
              <span className="og-next">Next week</span>
              {[112, 96, 124].map((w) => (
                <Row key={w} pad={10} className="og-later" lead={<Check on={false} />} title={<Bar w={w} h={8} r={4} tone={3} />} subtitle={<Bar w={w + 30} h={6} r={3} tone={2} />} />
              ))}
            </div>
          </div>
        </Window>
      )}
    </Stage>
  )
}
