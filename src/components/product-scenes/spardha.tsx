"use client";

import { Avatar, Badge, Bar, Check, Count, Roll, Stage, Toast, Window, type Act } from '@/stageshow/kit'
import './look.css'
import './spardha.css'

// Spardha, campus contests: a live leaderboard. What the system does, so no
// cursor. Gold: reorder (rows placed by transform, the moved row gliding and
// the rows it passes making room). Beats: a toast lands, "Problem C accepted";
// a beat later your score rolls 280 → 400; then your row glides from fifth to
// second while Meera, Kabir and Diya step down a place, their ranks rolling.
// Plays once; the still is the payoff.
//
// Real strings: the contest, Live, the people above you, You, the toast.

type S = { toast: boolean; score: number; climbed: boolean }

const H = 46
type Entry = { id: string; name: string | null; score: number; solved: string }
const ROWS: Entry[] = [
  { id: 'ishaan', name: 'Ishaan Verma', score: 410, solved: '4/4' },
  { id: 'meera', name: 'Meera Iyer', score: 380, solved: '3/4' },
  { id: 'kabir', name: 'Kabir Shah', score: 350, solved: '3/4' },
  { id: 'diya', name: 'Diya Kapoor', score: 330, solved: '3/4' },
  { id: 'you', name: 'You', score: 280, solved: '2/4' },
  { id: 'f1', name: null, score: 250, solved: '' },
  { id: 'f2', name: null, score: 230, solved: '' },
  { id: 'f3', name: null, score: 210, solved: '' },
]
const BEFORE = ROWS.map((r) => r.id)
const AFTER = ['ishaan', 'you', 'meera', 'kabir', 'diya', 'f1', 'f2', 'f3']

const initial: S = { toast: false, score: 280, climbed: false }
const poster: S = { toast: true, score: 400, climbed: true }

async function script(a: Act<S>) {
  await a.wait(1000)
  a.mark('accept')
  a.put({ toast: true })
  await a.wait(900)
  a.mark('score')
  a.put({ score: 400 })
  await a.wait(900)
  a.mark('climb')
  a.put({ climbed: true })
  await a.wait(3000)
}

export default function SpardhaScene() {
  return (
    <Stage<S> width={600} height={520} compact={{ below: 560, width: 358, height: 340 }} initial={initial} poster={poster} script={script} play="once" className="tc tc-spardha">
      {(s) => {
        const order = s.climbed ? AFTER : BEFORE
        return (
          <Window title="Weekly contest" className="sp-win">
            <div className="sp-body">
              <div className="sp-summary">
                <Badge tone="danger" dot>
                  Live
                </Badge>
                <span className="sp-meta">38 min left</span>
              </div>
              <div className="sp-list" style={{ height: ROWS.length * H }}>
                {ROWS.map((r) => {
                  const slot = order.indexOf(r.id)
                  const you = r.id === 'you'
                  return (
                    <div key={r.id} className="sp-slot" data-you={you || undefined} style={{ transform: `translateY(${slot * H}px)` }}>
                      <span className="sp-rank">{r.name ? <Roll>{String(slot + 1)}</Roll> : <Bar w={10} h={7} r={3} tone={3} />}</span>
                      <span className="sp-who">
                        {r.name ? <Avatar name={r.name} size={24} tone={you ? 'accent' : 'person'} /> : <Avatar size={24} plain />}
                        {r.name ? <span className="sp-name">{r.name}</span> : <Bar w={96} h={8} r={4} tone={3} />}
                      </span>
                      <span className="sp-solved">{r.name ? r.solved : <Bar w={24} h={7} r={3} tone={2} />}</span>
                      <span className="sp-score">{you ? <Count value={s.score} duration={700} /> : r.name ? r.score : <Bar w={28} h={8} r={4} tone={3} />}</span>
                    </div>
                  )
                })}
              </div>
              <Toast show={s.toast} icon={<Check on size={16} />} className="sp-toast">
                Problem C accepted
                <span className="sp-plus">+120</span>
              </Toast>
            </div>
          </Window>
        )
      }}
    </Stage>
  )
}
