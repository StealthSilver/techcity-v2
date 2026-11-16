"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HoverArrow } from "@/components/hover-arrow";
import { container } from "@/lib/layout";

/**
 * Testimonials grid (after mintlify.com's "Trusted by…"): a heading, then six quote cards. Every few seconds one
 * card swaps to a quote not on screen (old one blurs out, new one rises in).
 * It stops offscreen and for reduced motion.
 *
 * Quotes are placeholders until approved partner quotes come in.
 */

type Quote = { name: string; role: string; org: string; mark: string; tint: string; quote: string };

const QUOTES: Quote[] = [
  {
    name: "Dr. Anjali Mehta",
    role: "Head of CSE",
    org: "Partner engineering college, Punjab",
    mark: "AM",
    tint: "var(--g-indigo)",
    quote:
      "TechCity trainers teach inside our timetable, so nothing extra lands on students. Our final-years now walk into interviews having built and shipped real projects.",
  },
  {
    name: "Rohit Sharma",
    role: "Training & Placement Officer",
    org: "Partner university, Haryana",
    mark: "RS",
    tint: "var(--g-amber)",
    quote: "Placement prep finally runs on a plan. Mock interviews, aptitude drills and feedback every week.",
  },
  {
    name: "Prof. Kavita Rao",
    role: "Faculty, Information Technology",
    org: "Partner institute, Delhi NCR",
    mark: "KR",
    tint: "var(--g-periwinkle)",
    quote:
      "The faculty development sessions were hands-on, not slides. I now run cloud labs for my own batch with confidence.",
  },
  {
    name: "Arjun Verma",
    role: "Software Engineer",
    org: "Alumnus, batch of 2024",
    mark: "AV",
    tint: "var(--p-riyaaz-2)",
    quote: "Daily practice on Riyaaz is the reason I cleared my first coding round. The streaks kept me honest.",
  },
  {
    name: "Neha Gupta",
    role: "Engineering Manager",
    org: "Industry partner",
    mark: "NG",
    tint: "var(--p-kaksha-2)",
    quote:
      "Interns from TechCity colleges need less hand-holding. They know Git, code reviews and how a sprint actually works.",
  },
  {
    name: "Dr. Sanjay Kumar",
    role: "Dean of Academics",
    org: "Partner university, Uttar Pradesh",
    mark: "SK",
    tint: "var(--g-navy)",
    quote:
      "One account for LMS, tests and roadmaps means our faculty spend time teaching, not juggling tools. Attendance and progress are finally in one place.",
  },
  {
    name: "Priya Singh",
    role: "Final-year student, CSE",
    org: "Partner college, Rajasthan",
    mark: "PS",
    tint: "var(--p-marg-2)",
    quote: "Marg showed me exactly what to learn next. I stopped jumping between random playlists.",
  },
  {
    name: "Vikram Joshi",
    role: "Talent Acquisition Lead",
    org: "Industry partner",
    mark: "VJ",
    tint: "var(--p-spardha-2)",
    quote: "Campus contests on Spardha give us a shortlist we trust. Scores reflect real problem solving.",
  },
  {
    name: "Prof. Meera Iyer",
    role: "Head of Training",
    org: "Partner institute, Chandigarh",
    mark: "MI",
    tint: "var(--g-indigo)",
    quote:
      "The content stays current. When the industry moved to new AI tooling, the course moved with it the same semester.",
  },
  {
    name: "Aman Khan",
    role: "Data Analyst",
    org: "Alumnus, batch of 2023",
    mark: "AK",
    tint: "var(--g-amber)",
    quote: "Lab-first classes felt like work, in a good way. My portfolio came straight out of the course.",
  },
];

const SLOTS = 6;
const EVERY = 3200; // ms between swaps

export function TestimonialsGrid() {
  const ref = useRef<HTMLDivElement>(null);
  /** Quote index shown in each slot, and the one it is leaving (for the exit fade). */
  const [slots, setSlots] = useState(() => Array.from({ length: SLOTS }, (_, i) => ({ cur: i, prev: -1, n: 0 })));
  const [visible, setVisible] = useState(false);
  const lastSlot = useRef(-1);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const running = visible;

  useEffect(() => {
    if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setSlots((s) => {
        const shown = new Set(s.map((x) => x.cur));
        const free = QUOTES.map((_, i) => i).filter((i) => !shown.has(i));
        // Never the same slot twice in a row, so the change is easy to notice.
        let slot = Math.floor(Math.random() * SLOTS);
        if (slot === lastSlot.current) slot = (slot + 1 + Math.floor(Math.random() * (SLOTS - 1))) % SLOTS;
        lastSlot.current = slot;
        const next = free[Math.floor(Math.random() * free.length)];
        return s.map((x, i) => (i === slot ? { cur: next, prev: x.cur, n: x.n + 1 } : x));
      });
    }, EVERY);
    return () => clearInterval(id);
  }, [running]);

  return (
    <section id="testimonials" className="scroll-mt-20">
      <div ref={ref} className={`${container} border-x border-b border-line`}>
        <div className="relative flex flex-col gap-6 px-5 pt-12 pb-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pt-14 sm:pb-10">
          <h2 className="max-w-[760px] text-[clamp(24px,2.6vw,32px)] leading-[1.25] font-normal tracking-[-0.02em] text-text">
            Trusted by colleges, faculty and the teams that hire.
          </h2>
          <Link href="/company/testimonials" className="btn btn-primary btn-lg shrink-0 self-start sm:self-auto">
            Read more
            <HoverArrow />
          </Link>
        </div>

        <div className="border-t border-line p-4 sm:p-5">
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-live="off">
            {slots.map((s, i) => (
              <figure key={i} className={`tm-card relative h-[248px] overflow-hidden rounded-[6px] sm:h-[264px] ${i >= 3 ? "hidden md:block" : ""}`}>
                {s.prev >= 0 && <QuoteBody key={`out-${s.n}`} q={QUOTES[s.prev]} className="tm-out" />}
                <QuoteBody key={`in-${s.n}`} q={QUOTES[s.cur]} className={s.n ? "tm-in" : ""} />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteBody({ q, className = "" }: { q: Quote; className?: string }) {
  return (
    <div className={`absolute inset-0 flex flex-col gap-7 p-4 sm:p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-[4px] bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] text-[15px] font-semibold tracking-[-0.02em]"
          style={{ color: q.tint }}
        >
          {q.mark}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <figcaption className="truncate text-[14px] leading-5 font-medium text-text">{q.name}</figcaption>
          <span className="line-clamp-2 text-[13px] leading-[18px] text-text-muted sm:truncate sm:text-[14px] sm:leading-5">
            {q.role}, {q.org}
          </span>
        </div>
      </div>
      <blockquote className="line-clamp-6 text-[15px] leading-[1.65] text-text-soft">{q.quote}</blockquote>
    </div>
  );
}
