"use client";

import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import { HoverArrow } from "@/components/hover-arrow";

/**
 * Testimonials as an expanding rail (after stripe.com's "What's happening"):
 * the story in focus opens wide, the ones after it step down into thin
 * strips, and the quote sits underneath with a "Read more" button.
 * Panels use the brand gradient ramp in place of photography.
 *
 * Quotes are placeholders until approved partner quotes come in.
 */

const stories = [
  {
    name: "Partner voice 01",
    role: "Academic leader",
    quote: "The program helped our students connect classroom concepts with the skills and confidence they need for their next step.",
    category: "Student outcomes",
    tone: "grid",
  },
  {
    name: "Partner voice 02",
    role: "Faculty member",
    quote: "Our faculty found a practical way to bring current industry perspectives into the learning experience.",
    category: "Faculty development",
    tone: "amber",
  },
  {
    name: "Partner voice 03",
    role: "Placement lead",
    quote: "Students had more opportunities to practise, get feedback and approach placement conversations with confidence.",
    category: "Career readiness",
    tone: "violet",
  },
  {
    name: "Partner voice 04",
    role: "Program coordinator",
    quote: "The learning journey gave students a clear structure, from exploring a subject to applying what they learned.",
    category: "Learning journeys",
    tone: "cream",
  },
  {
    name: "Partner voice 05",
    role: "Department head",
    quote: "A thoughtful partnership made it easier to create experiences that feel relevant to both students and educators.",
    category: "Campus partnership",
    tone: "rings",
  },
  {
    name: "Partner voice 06",
    role: "Student mentor",
    quote: "Regular practice and approachable mentorship helped learners keep making progress, one milestone at a time.",
    category: "Mentorship",
    tone: "lavender",
  },
  {
    name: "Partner voice 07",
    role: "Dean",
    quote: "The collaboration brought a fresh perspective to how we prepare students for a changing world of work.",
    category: "Industry alignment",
    tone: "honey",
  },
  {
    name: "Partner voice 08",
    role: "Training partner",
    quote: "It has been rewarding to see students learn together, share ideas and turn new skills into real projects.",
    category: "Project learning",
    tone: "navy",
  },
];

/** Share of the rail by distance from the open story: wide, then stepping down to thin strips. */
const GROW = [100, 25, 12, 6];
const growFor = (d: number) => (d < 0 ? 0 : d < GROW.length ? GROW[d] : 1);

function Arrow({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="stories-arrow"
      aria-label={dir === "prev" ? "Previous story" : "Next story"}
      disabled={disabled}
      onClick={onClick}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {dir === "prev" ? <path d="M9 4.5 3.5 10 9 15.5M4 10h12.5" /> : <path d="M11 4.5 16.5 10 11 15.5M16 10H3.5" />}
      </svg>
    </button>
  );
}

export function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const last = stories.length - 1;
  const story = stories[active];
  const go = (i: number) => setActive(Math.max(0, Math.min(last, i)));

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(active + 1);
    else if (e.key === "ArrowLeft") go(active - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <h2 className="text-[clamp(24px,2.6vw,32px)] leading-[1.25] font-normal tracking-[-0.02em] text-text">
          Stories from our partners
          <span className="block text-text-muted">See what changes on campus.</span>
        </h2>
        <div className="flex shrink-0 gap-3">
          <Arrow dir="prev" disabled={active === 0} onClick={() => go(active - 1)} />
          <Arrow dir="next" disabled={active === last} onClick={() => go(active + 1)} />
        </div>
      </div>

      <div className="stories-rail mt-8 sm:mt-10" role="group" aria-label="Partner stories" onKeyDown={onKey}>
        {stories.map((s, i) => {
          const d = i - active;
          return (
            <button
              key={s.name}
              type="button"
              className="stories-panel"
              data-tone={s.tone}
              data-active={d === 0 || undefined}
              data-before={d < 0 || undefined}
              style={{ flexGrow: growFor(d) }}
              tabIndex={d < 0 ? -1 : 0}
              aria-current={d === 0 ? "true" : undefined}
              aria-label={`${s.category}, story ${i + 1} of ${stories.length}`}
              onClick={() => go(i)}
            >
              <span className="stories-panel__title">{s.category}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex flex-col items-start gap-6 sm:mt-8 sm:flex-row sm:justify-between sm:gap-12">
        <div aria-live="polite" className="max-w-[780px]">
          <p key={active} className="stories-caption text-[17px] leading-[1.55] text-text-muted sm:text-[18px]">
            <span className="text-text">“{story.quote}”</span> {story.name}, {story.role}.
          </p>
        </div>
        <Link href="/company/testimonials" className="btn btn-secondary btn-lg shrink-0 shadow-[var(--shadow-btn)]">
          Read more
          <HoverArrow />
        </Link>
      </div>
    </div>
  );
}
