import Link from "next/link";
import type { CSSProperties } from "react";
import { HoverArrow } from "@/components/hover-arrow";
import { InView } from "@/components/in-view";
import { NumberTicker } from "@/components/number-ticker";
import { C, SceneArt, type Scene } from "@/components/program-bento";
import { container } from "@/lib/layout";

/**
 * About: the company's story in four chapters along one line (cool → warm, the
 * gap to a student ready for a team), then the numbers so far. Built from the
 * page's own parts: guide-line container, headline with a muted continuation,
 * a bento-style card with a gradient ribbon, and a ruled stats row.
 */

const chapters = [
  {
    title: "The gap",
    body: "Graduates knew the theory but had rarely built, shipped or been reviewed. Teams had to train them from scratch.",
    color: C.lavender,
  },
  {
    title: "Inside the college",
    body: "So we moved industry trainers onto campus, teaching inside the timetable alongside the college's own faculty.",
    color: C.periwinkle,
  },
  {
    title: "Lab-first, always current",
    body: "Live projects, timed practice and reviews the way a team works, with content built and refreshed with industry partners.",
    color: C.honey,
  },
  {
    title: "Ready for the team",
    body: "Placement preparation closes the loop, so campus hours map to a student's first week on the job.",
    color: C.amber,
  },
];

const stats = [
  { value: "30+", label: "Partner colleges" },
  { value: "50+", label: "Industry partners" },
  { value: "40+", label: "Faculty & trainers" },
  { value: "10K+", label: "Students mentored" },
];

/** Cool on the left where the story starts, warming to amber where it ends. */
const storyScene: Scene = {
  blobs: [
    { c: C.mist, x: 6, y: 96, s: 40 },
    { c: C.lavender, x: 26, y: 104, s: 34 },
    { c: C.cream, x: 66, y: 92, s: 40 },
    { c: C.honey, x: 94, y: 84, s: 30 },
  ],
  ribbons: [
    { y0: 262, y1: 236, bend: 34, t0: 34, t1: 46, colors: [C.mist, C.lavender, C.periwinkle], opacity: 0.75 },
    { y0: 312, y1: 176, bend: 16, t0: 22, t1: 74, colors: [C.lavender, C.honey, C.amber], lines: true },
  ],
};

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-line">
      <div className={`${container} border-x border-b border-line`}>
        <div className="flex flex-col gap-6 px-5 pt-14 pb-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pt-16 sm:pb-12 lg:pt-20">
          <h2 className="max-w-[820px] text-[clamp(24px,2.6vw,32px)] leading-[1.25] font-normal tracking-[-0.02em] text-text">
            Colleges were teaching the subject. Companies were hiring for the work.{" "}
            <span className="text-text-muted">
              TechCity Skills closes that gap from inside the college, with its faculty, so every student leaves able
              to join a team.
            </span>
          </h2>
          <Link
            href="/company/story"
            className="btn btn-secondary btn-lg shrink-0 self-start shadow-[var(--shadow-btn)] sm:self-auto"
          >
            Our story
            <HoverArrow />
          </Link>
        </div>

        <div className="px-5 sm:px-10">
          <InView className="about-story bento-card" threshold={0.3}>
            <SceneArt id="about" scene={storyScene} />
            <ol className="grid px-6 pt-8 pb-[170px] sm:px-8 sm:pt-10 lg:grid-cols-4 lg:pb-[190px]">
              {chapters.map((c, i) => (
                <li
                  key={c.title}
                  className="about-chapter"
                  style={{ "--i": i, "--c": c.color, "--next": chapters[i + 1]?.color } as CSSProperties}
                >
                  <span className="about-node" aria-hidden="true" />
                  <div className="about-chapter-copy">
                    <p className="text-[13px] font-medium text-[var(--g-indigo)] tabular-nums">0{i + 1}</p>
                    <h3 className="mt-1.5 text-[17px] leading-[1.35] font-medium tracking-[-0.01em] text-text">
                      {c.title}
                    </h3>
                    <p className="mt-2 max-w-[300px] text-[14px] sm:max-w-[480px] lg:max-w-[300px] leading-[1.6] text-text-muted">{c.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </InView>
        </div>

        <InView className="mt-12 border-t border-line sm:mt-16" threshold={0.5}>
          <dl className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col px-5 py-8 sm:px-10 sm:py-10 md:px-6 lg:px-10 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
              >
                <dt className="order-2 mt-3 text-[14px] leading-[1.5] text-text-muted">{s.label}</dt>
                <dd className="text-[clamp(36px,4vw,52px)] font-normal tracking-[-0.03em] text-text">
                  <NumberTicker value={s.value} delay={i * 0.15} />
                </dd>
              </div>
            ))}
          </dl>
        </InView>
      </div>
    </section>
  );
}
