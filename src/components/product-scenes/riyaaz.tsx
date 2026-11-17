"use client";

import { Button, Check, Code, Collapse, Count, Icon, Spinner, Stage, States, Window, type Act } from '@/stageshow/kit'
import './look.css'
import './riyaaz.css'

// Riyaaz, daily practice: a student runs today's problem. Gold: hero-demo
// (one gesture, the result appearing under it) with form-error's button that
// changes on itself. Beats: the pointer presses Run; the button turns to
// Running with a spinner while the three tests turn pending; they pass one by
// one; "All tests passed" opens under them; a beat later the streak chip on
// the window's corner rolls 6 → 7 days. Plays once.
//
// Real strings: the problem, the code (the output is the subject), Run, the
// three tests, the result and the streak.

type S = { run: 'idle' | 'running' | 'done'; passed: number; streak: number }

const CODE = [
  'def two_sum(nums, target):',
  '    seen = {}',
  '    for i, n in enumerate(nums):',
  '        need = target - n',
  '        if need in seen:',
  '            return [seen[need], i]',
  '        seen[n] = i',
]
const TESTS = ['[2, 7, 11, 15], 9', '[3, 2, 4], 6', '[3, 3], 6']

const initial: S = { run: 'idle', passed: 0, streak: 6 }
const poster: S = { run: 'done', passed: 3, streak: 7 }

async function script(a: Act<S>) {
  await a.wait(900)
  a.mark('open')
  await a.move({ at: 'run', x: 0.16, y: 0.6 })
  await a.wait(200)
  await a.click({ at: 'run', x: 0.16, y: 0.6 })
  a.mark('run')
  a.put({ run: 'running' })
  await a.move({ at: 'run', x: 5, y: 0.5 }, { duration: 600 })
  await a.wait(500)
  for (let i = 1; i <= TESTS.length; i++) {
    a.put({ passed: i })
    await a.wait(380)
  }
  a.mark('done')
  a.put({ run: 'done' })
  await a.wait(700)
  a.mark('streak')
  a.put({ streak: 7 })
  await a.wait(2600)
}

export default function RiyaazScene() {
  return (
    <Stage<S>
      width={600}
      height={520}
      compact={{ below: 560, width: 358, height: 340 }}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      cursor={{ at: { wide: { x: 560, y: 490 }, compact: { x: 330, y: 320 } } }}
      className="tc tc-riyaaz"
    >
      {(s) => (
        <>
          <Window title="Two Sum · Day 7" className="ry-win">
            <div className="ry-body">
              <div className="ry-bar">
                <span className="ry-file">solution.py</span>
                <Button
                  variant="primary"
                  size="small"
                  data-target="run"
                  icon={
                    <States
                      value={s.run === 'running' ? 'spin' : 'play'}
                      states={{ play: <Icon name="play" size={12} filled />, spin: <Spinner size={12} /> }}
                    />
                  }
                >
                  {s.run === 'running' ? 'Running' : 'Run'}
                </Button>
              </div>
              <Code lines={CODE} numbers={false} className="ry-code" />
              <div className="ry-tests">
                {TESTS.map((t, i) => (
                  <div key={t} className="ry-test">
                    <Check on={s.passed > i} pending={s.run !== 'idle' && s.passed <= i} size={16} />
                    <span className="ry-test-name">Test {i + 1}</span>
                    <code className="ry-test-in">{t}</code>
                  </div>
                ))}
                <Collapse open={s.run === 'done'} reveal="drop">
                  <div className="ry-result">All 3 tests passed · 4 ms</div>
                </Collapse>
              </div>
            </div>
          </Window>
          <span className="ry-streak">
            <Icon name="bolt" size={14} filled />
            <span className="ry-streak-text">
              <Count value={s.streak} duration={600} /> day streak
            </span>
          </span>
        </>
      )}
    </Stage>
  )
}
