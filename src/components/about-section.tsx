import Link from "next/link";
import type { CSSProperties } from "react";
import { HoverArrow } from "@/components/hover-arrow";
import { Icon, type IconName } from "@/components/icons";
import { InView } from "@/components/in-view";
import { NumberTicker } from "@/components/number-ticker";
import { C } from "@/components/program-bento";
import { container } from "@/lib/layout";

/**
 * About: a ruled grid that tells the story and shows the numbers together.
 * Four chapter tiles (icon, number, title, one sentence) alternate with four
 * stat tiles (one big number, a label, one line of context) in a checkerboard,
 * so no tile sits next to its own kind:
 *
 *   desktop  01 · 30+ · 02 · 50+        tablet  01 · 30+     phone  01
 *            40+ · 03 · 10K+ · 04               50+ · 02            02
 *                                               03 · 40+            30+ · 50+
 *                                               10K+ · 04           03 …
 *
 * When the grid scrolls in, each chapter's bar fills (cool → warm, in story
 * order) and each number rolls, staggered in reading order.
 */

type Chapter = { title: string; body: string; icon: IconName; from: string; to: string };
type Stat = { value: string; label: string; context: string };

const chapters: Chapter[] = [
  {
    title: "The gap",
    body: "Graduates knew the theory but had rarely built, shipped or been reviewed.",
    icon: "book",
    from: C.mist,
    to: C.lavender,
  },
  {
    title: "Inside the college",
    body: "Industry trainers teach inside the timetable, alongside the college's own faculty.",
    icon: "trainer",
    from: C.lavender,
    to: C.periwinkle,
  },
  {
    title: "Lab-first, always current",
    body: "Live projects and reviews, with content refreshed alongside industry partners.",
    icon: "code",
    from: C.periwinkle,
    to: C.honey,
  },
  {
    title: "Ready for the team",
    body: "Placement prep closes the loop, so campus hours map to a first week on the job.",
    icon: "team",
    from: C.honey,
    to: C.amber,
  },
];

const stats: Stat[] = [
  { value: "30+", label: "Partner colleges", context: "Universities and institutes across north India." },
  { value: "50+", label: "Industry partners", context: "Companies that help shape what we teach." },
  { value: "40+", label: "Faculty & trainers", context: "Practitioners who teach on campus and online." },
  { value: "10K+", label: "Students mentored", context: "Across every partner campus, and counting." },
];

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-line">
      <div className={`${container} border-x border-b border-line`}>
        <div className="flex flex-col gap-6 px-5 pt-14 pb-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pt-16 sm:pb-12 lg:pt-20">
          <h2 className="max-w-[820px] text-[clamp(24px,2.6vw,32px)] leading-[1.25] font-normal tracking-[-0.02em] text-text">
            Colleges teach the subject. Companies hire for the work.{" "}
            <span className="text-text-muted">
              TechCity Skills closes that gap from inside the college, with its faculty, so every student leaves ready
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

        <InView className="about-grid" threshold={0.2}>
          {chapters.map((c, i) => (
            <article
              key={c.title}
              className="about-cell about-cell--chapter"
              style={{ gridArea: `c${i + 1}`, "--i": i, "--from": c.from, "--to": c.to } as CSSProperties}
            >
              <span className="about-cell__bar" aria-hidden="true" />
              <div className="flex items-center justify-between">
                <span className="bento-icon" aria-hidden="true">
                  <Icon name={c.icon} size={18} />
                </span>
                <span className="text-[13px] font-medium text-[var(--g-indigo)] tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="mt-auto pt-8 text-[18px] leading-[1.3] font-medium tracking-[-0.01em] text-text">{c.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-text-muted">{c.body}</p>
            </article>
          ))}
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="about-cell about-cell--stat"
              style={{ gridArea: `s${i + 1}` } as CSSProperties}
            >
              <p className="text-[13px] font-medium text-text-muted">{s.label}</p>
              <p className="about-cell__num">
                <NumberTicker value={s.value} delay={0.15 + i * 0.12} />
              </p>
              <p className="mt-auto pt-4 text-[14px] leading-[1.5] text-text-muted">{s.context}</p>
            </div>
          ))}
        </InView>
      </div>
    </section>
  );
}
