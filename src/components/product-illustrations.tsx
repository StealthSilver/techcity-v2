import type { CSSProperties, ReactNode } from "react";
import { ProductLogo, type ProductId } from "@/components/product-logo";

/**
 * Product illustrations for the products scroll section.
 *
 * Each one is a small product window whose steps are driven by a CSS variable
 * `--t` (0..1) set on an ancestor by the scroll code. Every animated element
 * carries a start `--s` and duration `--d`; `.ill` turns those into its own
 * local progress `--p` (see globals.css), so the illustration scrubs forwards
 * and backwards with the scroll and never re-renders.
 */

/** Style for an element that animates from t = s over a span of d. */
const at = (s: number, d = 0.08): CSSProperties => ({ ["--s" as string]: s, ["--d" as string]: d });

function Window({ id, title, meta, children }: { id: ProductId; title: string; meta?: string; children: ReactNode }) {
  return (
    <div className={`ill-window ill-window--${id}`}>
      <div className="ill-window__bar">
        <ProductLogo id={id} size={24} />
        <span className="ill-window__title">{title}</span>
        {meta && <span className="ill-chip ml-auto">{meta}</span>}
      </div>
      <div className="ill-window__body">{children}</div>
    </div>
  );
}

/** Setu: a batch's courses fill up, then attendance, grading and a graded assignment. */
function SetuIllustration() {
  const modules = [
    { name: "Python foundations", done: 1 },
    { name: "Data structures", done: 0.86 },
    { name: "Web development", done: 0.62 },
    { name: "Cloud basics", done: 0.34 },
  ];
  return (
    <Window id="setu" title="CSE · Batch A" meta="Semester 5">
      <p className="ill-label">Courses this term</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {modules.map((m, i) => (
          <li key={m.name} className="ill ill-rise ill-row" style={at(i * 0.07, 0.08)}>
            <span className="ill-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] text-text">{m.name}</span>
              <span className="ill-track mt-2 block">
                <span className="ill ill-fill block" style={{ ...at(0.14 + i * 0.1, 0.24), width: `${m.done * 100}%` }} />
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="ill ill-rise ill-tile" style={at(0.58)}>
          <span className="ill-label">Attendance</span>
          <span className="ill-big">92%</span>
        </div>
        <div className="ill ill-rise ill-tile" style={at(0.66)}>
          <span className="ill-label">Assignments</span>
          <span className="ill-big">18/20</span>
        </div>
      </div>
      <div className="ill ill-rise ill-toast" style={at(0.82)}>
        <span className="ill-check">✓</span> Assignment 18 graded · 46 students
      </div>
    </Window>
  );
}

/** Marg: a roadmap draws itself node by node to “Interview ready”. */
function MargIllustration() {
  const nodes = [
    { label: "Arrays", x: 12, y: 78 },
    { label: "Linked lists", x: 34, y: 52 },
    { label: "Trees", x: 58, y: 68 },
    { label: "Graphs", x: 76, y: 38 },
    { label: "Dynamic programming", x: 52, y: 16 },
  ];
  return (
    <Window id="marg" title="DSA roadmap" meta="Week 6 of 12">
      <div className="relative h-[268px]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            d="M12 78 C 20 64, 26 54, 34 52 S 50 70, 58 68 S 72 44, 76 38 S 60 18, 52 16"
            pathLength={1}
            className="ill-route-bg"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M12 78 C 20 64, 26 54, 34 52 S 50 70, 58 68 S 72 44, 76 38 S 60 18, 52 16"
            pathLength={1}
            className="ill ill-route"
            style={at(0.02, 0.78)}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {nodes.map((n, i) => (
          <div
            key={n.label}
            className="ill ill-pop ill-node"
            style={{ ...at(0.02 + i * 0.19, 0.06), left: `${n.x}%`, top: `${n.y}%` }}
          >
            <span className="ill-node__dot">{i < 4 ? "✓" : "★"}</span>
            <span className="ill-node__label">{n.label}</span>
          </div>
        ))}
      </div>
      <div className="ill ill-rise ill-toast" style={at(0.88)}>
        <span className="ill-check">✓</span> Milestone reached · Interview ready
      </div>
    </Window>
  );
}

/** Spardha: a contest question is answered, the score climbs and the leaderboard fills. */
function SpardhaIllustration() {
  const options = ["O(n)", "O(log n)", "O(n log n)", "O(1)"];
  const board = [
    { name: "Ananya · ECE", score: 980 },
    { name: "Rohit · CSE", score: 955 },
    { name: "You", score: 940, you: true },
    { name: "Meera · IT", score: 910 },
  ];
  return (
    <Window id="spardha" title="Campus coding contest" meta="01:24:10 left">
      <div className="ill-panel">
        <p className="ill-label">Question 7 of 20</p>
        <p className="mt-2 text-[13px] text-text">Time complexity of binary search on a sorted array?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {options.map((o, i) => (
            <span key={o} className={`ill-option ${i === 1 ? "ill ill-pick" : ""}`} style={i === 1 ? at(0.22, 0.06) : undefined}>
              {o}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="ill-label shrink-0">Score</span>
        <span className="ill-track flex-1">
          <span className="ill ill-fill block w-[78%]" style={at(0.3, 0.2)} />
        </span>
        <span className="ill ill-fade text-[12px] text-text-muted tabular-nums" style={at(0.46)}>
          940
        </span>
      </div>
      <p className="ill-label mt-4">Leaderboard</p>
      <ol className="mt-2 flex flex-col gap-1.5">
        {board.map((r, i) => (
          <li key={r.name} className={`ill ill-slide ill-rank ${r.you ? "ill-rank--you" : ""}`} style={at(0.5 + i * 0.09)}>
            <span className="ill-index">{i + 1}</span>
            <span className="flex-1 text-[12.5px]">{r.name}</span>
            <span className="text-[12px] tabular-nums">{r.score}</span>
          </li>
        ))}
      </ol>
    </Window>
  );
}

/** Riyaaz: today’s problem is typed out, tests pass and the streak grid fills in. */
function RiyaazIllustration() {
  const code = [
    { indent: 0, text: "def two_sum(nums, target):" },
    { indent: 1, text: "seen = {}" },
    { indent: 1, text: "for i, n in enumerate(nums):" },
    { indent: 2, text: "if target - n in seen:" },
    { indent: 3, text: "return [seen[target - n], i]" },
    { indent: 2, text: "seen[n] = i" },
  ];
  return (
    <Window id="riyaaz" title="Day 23 · Two Sum" meta="🔥 23-day streak">
      <div className="ill-code">
        {code.map((l, i) => (
          <div key={i} className="ill-code__line">
            <span className="ill-code__no">{i + 1}</span>
            <span className="ill ill-type" style={{ ...at(i * 0.07, 0.07), paddingLeft: `${l.indent * 16}px` }}>
              {l.text}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="ill ill-pop ill-run" style={at(0.46, 0.05)}>
          ▶ Run
        </span>
        {["Test 1", "Test 2", "Test 3"].map((t, i) => (
          <span key={t} className="ill ill-pop ill-pass" style={at(0.54 + i * 0.06, 0.05)}>
            ✓ {t}
          </span>
        ))}
      </div>
      <p className="ill-label mt-4">This month</p>
      <div className="ill-streak mt-2">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} className="ill ill-cell" style={at(0.62 + i * 0.012, 0.03)} />
        ))}
      </div>
    </Window>
  );
}

/** Kaksha: a cohort watches a lesson, chapters complete and the lab unlocks. */
function KakshaIllustration() {
  const chapters = ["Intro to APIs", "Routes and requests", "Databases", "Deploy your app"];
  return (
    <Window id="kaksha" title="Full-stack cohort" meta="24 learning live">
      <div className="ill-video">
        <span className="ill-video__play">▶</span>
        <div className="ill-video__bar">
          <span className="ill ill-fill block" style={at(0, 0.72)} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="ill ill-pop ill-avatar" style={at(0.06 + i * 0.05, 0.05)} />
        ))}
        <span className="ill ill-fade ml-1 text-[12px] text-text-muted" style={at(0.36)}>
          + 18 classmates
        </span>
      </div>
      <ul className="mt-4 flex flex-col gap-1.5">
        {chapters.map((c, i) => (
          <li key={c} className="ill ill-chapter" style={at(0.12 + i * 0.16, 0.06)}>
            <span className="ill-chapter__dot" />
            <span className="flex-1 text-[12.5px]">{c}</span>
            <span className="ill-chapter__done">Done</span>
          </li>
        ))}
      </ul>
      <div className="ill ill-rise ill-toast" style={at(0.84)}>
        <span className="ill-check">✓</span> Lab unlocked · Build and deploy your API
      </div>
    </Window>
  );
}

export const productIllustrations: Record<ProductId, () => React.JSX.Element> = {
  setu: SetuIllustration,
  marg: MargIllustration,
  spardha: SpardhaIllustration,
  riyaaz: RiyaazIllustration,
  kaksha: KakshaIllustration,
};
