import Link from "next/link";
import type { CSSProperties } from "react";
import { HoverArrow } from "@/components/hover-arrow";
import { container } from "@/lib/layout";

/**
 * Testimonials wall. From md, every quote sits in columns that drift slowly in
 * opposite directions (pausing on hover or focus), faded at the top and bottom;
 * three columns on desktop, two on tablet. Below md it is a swipeable row, so
 * nothing moves under a phone reader's thumb. Each card: who they are (a
 * college, a student or industry), the quote, then the person.
 *
 * Quotes are placeholders until approved partner quotes come in.
 */

type Group = "college" | "student" | "industry";
type Quote = { name: string; group: Group; role: string; org: string; mark: string; tint: string; quote: string };

const GROUP: Record<Group, { label: string; dot: string }> = {
  college: { label: "College", dot: "var(--g-navy)" },
  student: { label: "Student", dot: "var(--g-periwinkle)" },
  industry: { label: "Industry", dot: "var(--g-amber)" },
};

const QUOTES: Quote[] = [
  {
    name: "Dr. Anjali Mehta",
    group: "college",
    role: "Head of CSE",
    org: "Partner engineering college, Punjab",
    mark: "AM",
    tint: "var(--g-indigo)",
    quote:
      "TechCity trainers teach inside our timetable, so nothing extra lands on students. Our final-years now walk into interviews having built and shipped real projects.",
  },
  {
    name: "Rohit Sharma",
    group: "college",
    role: "Training & Placement Officer",
    org: "Partner university, Haryana",
    mark: "RS",
    tint: "var(--g-amber)",
    quote: "Placement prep finally runs on a plan. Mock interviews, aptitude drills and feedback every week.",
  },
  {
    name: "Prof. Kavita Rao",
    group: "college",
    role: "Faculty, Information Technology",
    org: "Partner institute, Delhi NCR",
    mark: "KR",
    tint: "var(--g-periwinkle)",
    quote:
      "The faculty development sessions were hands-on, not slides. I now run cloud labs for my own batch with confidence.",
  },
  {
    name: "Arjun Verma",
    group: "student",
    role: "Software Engineer",
    org: "Alumnus, batch of 2024",
    mark: "AV",
    tint: "var(--p-riyaaz-2)",
    quote: "Daily practice on Riyaaz is the reason I cleared my first coding round. The streaks kept me honest.",
  },
  {
    name: "Neha Gupta",
    group: "industry",
    role: "Engineering Manager",
    org: "Industry partner",
    mark: "NG",
    tint: "var(--p-kaksha-2)",
    quote:
      "Interns from TechCity colleges need less hand-holding. They know Git, code reviews and how a sprint actually works.",
  },
  {
    name: "Dr. Sanjay Kumar",
    group: "college",
    role: "Dean of Academics",
    org: "Partner university, Uttar Pradesh",
    mark: "SK",
    tint: "var(--g-navy)",
    quote:
      "One account for LMS, tests and roadmaps means our faculty spend time teaching, not juggling tools. Attendance and progress are finally in one place.",
  },
  {
    name: "Priya Singh",
    group: "student",
    role: "Final-year student, CSE",
    org: "Partner college, Rajasthan",
    mark: "PS",
    tint: "var(--p-marg-2)",
    quote: "Marg showed me exactly what to learn next. I stopped jumping between random playlists.",
  },
  {
    name: "Vikram Joshi",
    group: "industry",
    role: "Talent Acquisition Lead",
    org: "Industry partner",
    mark: "VJ",
    tint: "var(--p-spardha-2)",
    quote: "Campus contests on Spardha give us a shortlist we trust. Scores reflect real problem solving.",
  },
  {
    name: "Prof. Meera Iyer",
    group: "college",
    role: "Head of Training",
    org: "Partner institute, Chandigarh",
    mark: "MI",
    tint: "var(--g-indigo)",
    quote:
      "The content stays current. When the industry moved to new AI tooling, the course moved with it the same semester.",
  },
  {
    name: "Aman Khan",
    group: "student",
    role: "Data Analyst",
    org: "Alumnus, batch of 2023",
    mark: "AK",
    tint: "var(--g-amber)",
    quote: "Lab-first classes felt like work, in a good way. My portfolio came straight out of the course.",
  },
];

/**
 * Column layouts, by initials, so each column mixes colleges, students and
 * industry rather than stacking one kind (dealing round-robin clumps them).
 */
const LAYOUT: Record<2 | 3, string[][]> = {
  3: [
    ["AM", "PS", "VJ", "MI"],
    ["AV", "NG", "SK"],
    ["RS", "AK", "KR"],
  ],
  2: [
    ["AM", "NG", "PS", "VJ", "KR"],
    ["AV", "RS", "SK", "AK", "MI"],
  ],
};
const columns = (n: 2 | 3) => LAYOUT[n].map((col) => col.map((m) => QUOTES.find((q) => q.mark === m)!));

/** One drifting column: the quotes twice over, so the loop has no seam. */
function Column({ items, duration, reverse }: { items: Quote[]; duration: number; reverse?: boolean }) {
  return (
    <div className="tm-col" data-reverse={reverse || undefined} style={{ "--dur": `${duration}s` } as CSSProperties}>
      <div className="tm-track">
        {[0, 1].map((copy) => (
          <ul key={copy} className="tm-copy" aria-hidden={copy === 1 || undefined}>
            {items.map((q) => (
              <li key={q.name}>
                <QuoteCard q={q} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function TestimonialsGrid() {
  return (
    <section id="testimonials" className="scroll-mt-20">
      <div className={`${container} border-x border-b border-line`}>
        <div className="flex flex-col gap-6 px-5 pt-12 pb-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pt-14 sm:pb-10">
          <h2 className="max-w-[760px] text-[clamp(24px,2.6vw,32px)] leading-[1.25] font-normal tracking-[-0.02em] text-text">
            In their words.{" "}
            <span className="text-text-muted">
              Heads of department, placement officers, students and the teams that hire them.
            </span>
          </h2>
          <Link
            href="/company/testimonials"
            className="btn btn-secondary btn-lg shrink-0 self-start shadow-[var(--shadow-btn)] sm:self-auto"
          >
            All stories
            <HoverArrow />
          </Link>
        </div>

        <div className="border-t border-line bg-[var(--surface-subdued)] py-5 md:px-5">
          {/* Desktop: three drifting columns. */}
          <div className="tm-wall" data-at="lg">
            {columns(3).map((items, i) => (
              <Column key={i} items={items} duration={[64, 56, 70][i]} reverse={i === 1} />
            ))}
          </div>
          {/* Tablet: two. */}
          <div className="tm-wall" data-at="md">
            {columns(2).map((items, i) => (
              <Column key={i} items={items} duration={[80, 72][i]} reverse={i === 1} />
            ))}
          </div>
          {/* Phones: swipe through them. */}
          <ul className="tm-row" aria-label="Testimonials">
            {QUOTES.map((q) => (
              <li key={q.name}>
                <QuoteCard q={q} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function QuoteCard({ q }: { q: Quote }) {
  const g = GROUP[q.group];
  return (
    <figure className="tm-quote">
      <span className="tm-tag" style={{ "--dot": g.dot } as CSSProperties}>
        <i aria-hidden="true" />
        {g.label}
      </span>
      <blockquote className="text-[15px] leading-[1.65] text-text-soft">{q.quote}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <span className="tm-avatar" style={{ "--tint": q.tint } as CSSProperties} aria-hidden="true">
          {q.mark}
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] leading-5 font-medium text-text">{q.name}</span>
          <span className="block text-[13px] leading-[18px] text-text-muted">
            {q.role}, {q.org}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
