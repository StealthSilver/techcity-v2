"use client";

import { Badge, Chart, Count, Stage, Window, type Act } from '@/stageshow/kit'
import './look.css'
import './completed.css'

// Completed projects: the Gurugram program's report. What the program did, so
// no cursor. Gold: chart-scrub (a line with its headline value) and
// subscriptions (one number rolls, one big figure). Beats: the report opens
// on its tracks; the weekly assessment line draws in left to right while the
// average rolls from week 1's 52% to 84%. Plays once.
//
// Real strings: the campus, the program, Completed and its date, the four
// tracks (from the project). The scores are illustrative.

type S = { show: boolean; score: number }

const WEEKS = [52, 55, 54, 60, 63, 62, 68, 71, 74, 73, 79, 84]
const TRACKS = ['Data Analytics', 'Aptitude', 'Power BI', 'Excel']

const initial: S = { show: false, score: 52 }
const poster: S = { show: true, score: 84 }

async function script(a: Act<S>) {
  await a.wait(900)
  a.mark('draw')
  a.put({ show: true, score: 84 })
  await a.wait(4200)
}

export default function CompletedScene() {
  return (
    <Stage<S> width={600} height={540} compact={{ below: 560, width: 358, height: 320 }} initial={initial} poster={poster} script={script} play="once" className="tc tc-completed">
      {(s, _rect, layout) => {
        const w = layout === 'compact' ? 278 : 456
        return (
          <Window title="Gurugram campus" className="cp-win">
            <div className="cp-body">
              <div className="cp-summary">
                <span className="cp-name">Data Analytics, Power BI and Excel</span>
                <Badge tone="success" dot>
                  Completed · Dec 2025
                </Badge>
              </div>
              <div className="cp-figure">
                <span className="cp-label">Average weekly assessment</span>
                <span className="cp-big">
                  <Count value={s.score} format={(n) => `${Math.round(n)}%`} duration={1600} stagger={90} />
                </span>
                <span className="cp-from">from 52% in week 1</span>
              </div>
              <Chart data={WEEKS} width={w} height={layout === 'compact' ? 96 : 190} max={100} show={s.show} className="cp-chart" />
              <div className="cp-tracks">
                {TRACKS.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </div>
          </Window>
        )
      }}
    </Stage>
  )
}
