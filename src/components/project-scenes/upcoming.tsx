"use client";

import { Badge, Bar, Check, Roll, Row, Stage, Text, Window, type Act } from '@/stageshow/kit'
import './look.css'
import './upcoming.css'

// Upcoming projects: getting the Gurugram campus ready for January. What the
// team does, so no cursor. Gold: payout-flow (steps arriving in order, a
// payoff that holds). Beats: two steps are done; the lab set-up turns
// pending and completes; the timetable does the same; a beat later the
// status pill rolls Preparing → Ready to start. Plays once.
//
// Real strings: the campus, its two tracks, the start, the four steps.

type S = { lab: 'todo' | 'pending' | 'done'; time: 'todo' | 'pending' | 'done'; ready: boolean }

const initial: S = { lab: 'todo', time: 'todo', ready: false }
const poster: S = { lab: 'done', time: 'done', ready: true }

async function script(a: Act<S>) {
  await a.wait(1000)
  a.mark('lab')
  a.put({ lab: 'pending' })
  await a.wait(900)
  a.put({ lab: 'done' })
  await a.wait(500)
  a.mark('timetable')
  a.put({ time: 'pending' })
  await a.wait(900)
  a.put({ time: 'done' })
  await a.wait(700)
  a.mark('ready')
  a.put({ ready: true })
  await a.wait(3000)
}

export default function UpcomingScene() {
  return (
    <Stage<S> width={600} height={540} compact={{ below: 560, width: 358, height: 320 }} initial={initial} poster={poster} script={script} play="once" className="tc tc-upcoming">
      {(s) => (
        <Window title="Gurugram campus" className="uc-win">
          <div className="uc-body">
            <div className="uc-summary">
              <span className="uc-what">
                <span className="uc-name">Python Full Stack and SCADA</span>
                <span className="uc-meta">Starts January 2027</span>
              </span>
              <Badge tone={s.ready ? 'success' : 'accent'}>
                <Roll variant="fade">{s.ready ? 'Ready to start' : 'Preparing'}</Roll>
              </Badge>
            </div>
            <div className="uc-list">
              <Row pad={10} lead={<Check on />} title={<Text className="uc-title">Curriculum signed off</Text>} subtitle={<Text className="uc-sub">With the department</Text>} />
              <Row pad={10} lead={<Check on />} title={<Text className="uc-title">Trainers assigned</Text>} subtitle={<Text className="uc-sub">One per track, from industry</Text>} />
              <Row pad={10} selected={s.lab === 'pending'} lead={<Check on={s.lab === 'done'} pending={s.lab === 'pending'} />} title={<Text className="uc-title">Lab set up</Text>} subtitle={<Text className="uc-sub">SCADA simulators installed</Text>} />
              <Row pad={10} selected={s.time === 'pending'} lead={<Check on={s.time === 'done'} pending={s.time === 'pending'} />} title={<Text className="uc-title">Timetable shared</Text>} subtitle={<Text className="uc-sub">Monday, Wednesday and Friday</Text>} />
              <span className="uc-next">First weeks</span>
              {[104, 128, 92].map((w) => (
                <Row key={w} pad={10} className="uc-later" lead={<Check on={false} />} title={<Bar w={w} h={8} r={4} tone={3} />} subtitle={<Bar w={w + 24} h={6} r={3} tone={2} />} />
              ))}
            </div>
          </div>
        </Window>
      )}
    </Stage>
  )
}
