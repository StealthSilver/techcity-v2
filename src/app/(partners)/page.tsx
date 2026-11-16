import Link from "next/link";
import { AboutFlow } from "@/components/about-flow";
import { HeroCity } from "@/components/hero-city";
import { HeroStat } from "@/components/hero-stat";
import { HoverArrow } from "@/components/hover-arrow";
import { Icon, type IconName } from "@/components/icons";
import { ProgramBento } from "@/components/program-bento";
import { ProductScroll } from "@/components/product-scroll";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { PartnersCloud } from "@/components/partners-cloud";
import { ProjectsGlobe } from "@/components/projects-globe";
import { container } from "@/lib/layout";

/* Figures as stated elsewhere on the site (hero stat, site.longDescription, programs). */
const aboutStats = [
  { value: "23,899", label: "Students mentored" },
  { value: "30+", label: "Partner colleges" },
  { value: "50+", label: "Industry partners" },
  { value: "30+", label: "Subjects taught on campus" },
];

const aboutPillars: { icon: IconName; title: string; body: string }[] = [
  { icon: "trainer", title: "On-campus trainers", body: "Industry trainers teach inside your timetable, across 30+ subjects." },
  { icon: "faculty", title: "Faculty development", body: "Your faculty stay current with hands-on sessions in the latest tech." },
  { icon: "target", title: "Placement preparation", body: "Aptitude, interviews and drills that get every batch ready to hire." },
  { icon: "platform", title: "Platforms for colleges", body: "LMS, tests and practice tools that run on one TechCity account." },
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <section className="relative mt-16 border-t border-line">
        {/* Full-bleed: the city spans the whole page width; the copy lines up with the navbar logo (container + 26px). */}
        <div className="relative h-[640px] overflow-hidden sm:h-[clamp(640px,calc(100svh-64px),900px)]">
          {/* The city: campus (left) → TechCity hub → industry (right), trams carrying students across. */}
          <HeroCity className="absolute inset-0" />
          <div className="hero-veil pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className={`${container} relative h-full`}>
            <div className="hero-copy absolute inset-x-0 top-0 z-10 pt-12 pr-5 pl-[26px] sm:pt-16 lg:pt-[72px]">
              <h1 className="max-w-[760px] text-[clamp(34px,4.4vw,58px)] leading-[1.06] font-normal tracking-[-0.035em] text-text">
                Industry-aligned skilling that makes students stand out, get hired and grow.
              </h1>
              <div className="mt-8">
                <a href="#contact" className="btn btn-primary btn-lg">
                  Partner with us
                  <HoverArrow />
                </a>
              </div>
            </div>

            <div className="hero-chip absolute right-[18px] bottom-6 z-10 sm:bottom-10 lg:bottom-12">
              <HeroStat label="Students mentored" value={23899} />
            </div>
          </div>
        </div>
        {/* Partner logo ticker is hidden for now; <LogoTicker /> in components/logo-ticker.tsx is unchanged. */}
      </section>

      {/* About: who we are, in numbers and in what we run on campus. */}
      <section id="about" className="scroll-mt-20">
        <div className={`${container} border-b border-line`}>
          <div className="grid gap-6 px-5 pt-14 pb-10 sm:px-10 sm:pt-16 sm:pb-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-[13px] font-medium tracking-[0.08em] text-text-muted uppercase">About TechCity</p>
              <h2 className="mt-3 max-w-[560px] text-[clamp(24px,2.4vw,32px)] leading-[1.2] font-normal tracking-[-0.02em] text-text">
                Skilling that runs inside your college, with your faculty.
              </h2>
            </div>
            <div className="flex flex-col items-start gap-6 lg:pt-8">
              <p className="text-[17px] leading-[1.6] text-text-muted">
                TechCity Skills partners with universities so students leave able to join a team. Lab-first programs,
                on-campus trainers, faculty development, placement preparation and platforms for colleges – built with
                industry partners and delivered on your timetable.
              </p>
              <Link href="/company/story" className="btn btn-secondary btn-lg shadow-[var(--shadow-btn)]">
                Our story
                <HoverArrow />
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
            {aboutStats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col px-5 py-7 sm:px-10 sm:py-8 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
              >
                <dt className="order-2 mt-2 text-[14px] leading-[1.5] text-text-muted">{stat.label}</dt>
                <dd className="text-[clamp(28px,2.8vw,40px)] leading-none font-normal tracking-[-0.03em] text-text tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <ul className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
            {aboutPillars.map((p, i) => (
              <li
                key={p.title}
                className={`px-5 py-8 sm:px-10 sm:py-10 ${i > 0 ? "border-t border-line sm:border-t-0" : ""} ${i % 2 ? "sm:border-l sm:border-line" : ""} ${i > 1 ? "sm:border-t sm:border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l lg:border-line" : ""}`}
              >
                <span className="nav-icon inline-flex h-10 w-10 items-center justify-center rounded-md">
                  <Icon name={p.icon} size={19} />
                </span>
                <h3 className="mt-5 text-[16px] leading-[1.4] font-medium tracking-normal text-text">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Our mission: Build → Deliver → Improve, scroll-driven particle story on deep navy. */}
      <AboutFlow />

      {/* Products: pinned, scroll-driven walkthrough of all five products. */}
      <ProductScroll />

      <section id="programs" className="programs-section scroll-mt-20">
        <div className={`${container} border-x border-b border-line px-5 py-16 sm:px-10 sm:py-20 lg:py-24`}>
          <h2 className="max-w-[860px] text-[clamp(24px,2.6vw,32px)] leading-[1.25] font-normal tracking-[-0.02em] text-text">
            Programs for every step from classroom to career.{" "}
            <span className="text-text-muted">
              Train students on campus, get them placement-ready and keep your faculty ahead – with programs that
              work on their own or together.
            </span>
          </h2>
          <div className="mt-10 sm:mt-12">
            <ProgramBento />
          </div>
        </div>
      </section>

      <section id="projects" className="projects-section scroll-mt-20">
        <div className={`${container} flex flex-col border-x border-b border-line md:h-[min(84svh,760px)] md:min-h-[600px]`}>
          <div className="flex flex-col gap-6 px-5 pt-12 pb-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pt-14 sm:pb-10">
            <h2 className="max-w-[760px] text-[clamp(24px,2.4vw,32px)] leading-[1.2] font-normal tracking-[-0.02em] text-text">
              Learning in action on campuses across India.
            </h2>
            <Link href="/projects" className="btn btn-secondary btn-lg shrink-0 self-start shadow-[var(--shadow-btn)] sm:self-auto">
              All projects
              <HoverArrow />
            </Link>
          </div>
          <ProjectsGlobe />
        </div>
      </section>

      <section id="partners" className="scroll-mt-20">
        <div className={`${container} border-x border-b border-line`}>
          <div className="flex flex-col gap-6 px-5 pt-12 pb-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pt-14 sm:pb-10">
            <h2 className="max-w-[760px] text-[clamp(24px,2.6vw,32px)] leading-[1.25] font-normal tracking-[-0.02em] text-text">
              Trusted by colleges and industry teams.{" "}
              <span className="text-text-muted">
                Universities and institutes across north India, and the companies that shape what we teach.
              </span>
            </h2>
            <Link href="/company/testimonials" className="btn btn-secondary btn-lg shrink-0 self-start shadow-[var(--shadow-btn)] sm:self-auto">
              See stories
              <HoverArrow />
            </Link>
          </div>
          <PartnersCloud />
        </div>
      </section>

      <section id="testimonials" className="scroll-mt-20">
        <div className={`${container} border-x border-b border-line px-5 py-14 sm:px-10 sm:py-16 lg:py-20`}>
          <TestimonialsCarousel />
        </div>
      </section>
      {/* Lines end here: a full-width rule over the last section's bottom line. */}
      <div aria-hidden="true" className="relative -mt-px border-t border-line" />
    </main>
  );
}
