import Image from "next/image";
import Link from "next/link";
import { CurrentYear } from "@/components/current-year";
import { HoverArrow } from "@/components/hover-arrow";
import { Logo } from "@/components/logo";
import { container } from "@/lib/layout";
import { site } from "@/lib/site";

type FooterLink = { label: string; href: string };
type FooterGroup = { title: string; links: FooterLink[] };

/** Each column holds one or more stacked groups (like "Marketplace" + "Business"). */
const columns: FooterGroup[][] = [
  [
    {
      title: "Products",
      links: [
        { label: "Spardha", href: "/products/spardha" },
        { label: "Marg", href: "/products/marg" },
        { label: "Setu", href: "/products/setu" },
        { label: "Riyaaz", href: "/products/riyaaz" },
        { label: "Kaksha", href: "/products/kaksha" },
        { label: "Product roadmap", href: "/company/roadmap" },
      ],
    },
  ],
  [
    {
      title: "Programs",
      links: [
        { label: "Trainers for students", href: "/programs#trainers" },
        { label: "Placement preparation", href: "/programs#placement" },
        { label: "Student placement", href: "/programs#placing" },
        { label: "Mentorship", href: "/programs#mentorship" },
        { label: "Faculty development", href: "/programs#faculty" },
        { label: "Online lessons", href: "/programs#online" },
        { label: "Online content", href: "/programs#content" },
        { label: "Platforms for colleges", href: "/programs#platforms" },
      ],
    },
  ],
  [
    {
      title: "Projects",
      links: [
        { label: "Upcoming", href: "/projects/upcoming" },
        { label: "Ongoing", href: "/projects/ongoing" },
        { label: "Completed", href: "/projects/completed" },
      ],
    },
    {
      title: "Partners",
      links: [
        { label: "Colleges", href: "/partners/colleges" },
        { label: "Industry", href: "/partners/industry" },
        { label: "Partner with us", href: "#contact" },
      ],
    },
  ],
  [
    {
      title: "Students",
      links: [
        { label: "Student platform", href: "/students" },
        { label: "Features", href: "/students/features" },
        { label: "Student projects", href: "/students/projects" },
        { label: "Testimonials", href: "/students/testimonials" },
      ],
    },
  ],
  [
    {
      title: "Company",
      links: [
        { label: "Story", href: "/company/story" },
        { label: "Team", href: "/company/team" },
        { label: "Testimonials", href: "/company/testimonials" },
        { label: "News", href: "/company/news" },
        { label: "Careers", href: "/company/careers" },
      ],
    },
  ],
];

/** Social links. Swap the `#` hrefs once the real profiles are ready. */
const socials: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "X",
    href: "#",
    icon: (
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.57l11.1 14.43Z" />
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <path
        fillRule="evenodd"
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm5.25-3.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"
      />
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM8.34 18.5H5.67V9.94h2.67v8.56ZM7 8.77a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1Zm11.5 9.73h-2.66v-4.16c0-1 0-2.27-1.38-2.27-1.39 0-1.6 1.08-1.6 2.2v4.23H10.2V9.94h2.55v1.17h.04a2.8 2.8 0 0 1 2.52-1.39c2.7 0 3.19 1.78 3.19 4.09v4.69Z" />
    ),
  },
  {
    label: "Email",
    href: `mailto:${site.email}`,
    icon: (
      <path
        fillRule="evenodd"
        d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2.4V18h16V6.4l-8 5.6-8-5.6ZM18.2 6H5.8L12 10.35 18.2 6Z"
      />
    ),
  },
];

const linkClass =
  "text-[13px] leading-[1.5] text-white/65 transition-colors duration-200 hover:text-white";

type Audience = "partners" | "students";

const ctaCopy: Record<
  Audience,
  { title: string; body: string; primary: FooterLink; secondary: FooterLink }
> = {
  partners: {
    title: "Bring industry-ready skilling to your campus.",
    body: "Trainers, labs, placement preparation and platforms, run inside your college with your faculty.",
    primary: {
      label: "Partner with us",
      href: `mailto:${site.email}?subject=Partnering%20with%20TechCity`,
    },
    secondary: { label: "Explore programs", href: "/programs" },
  },
  students: {
    title: "Start building skills that get you hired.",
    body: "One TechCity account for tests, learning paths, daily practice and courses, from first lesson to first offer.",
    primary: {
      label: "Get started",
      href: `mailto:${site.email}?subject=Getting%20started%20with%20TechCity`,
    },
    secondary: { label: "See features", href: "/students/features" },
  },
};

/** Call to action over the city illustration; its navy base runs into the footer. */
function Cta({ audience }: { audience: Audience }) {
  const copy = ctaCopy[audience];
  return (
    <section
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden"
    >
      <Image
        src="/cta-image.png"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-bottom"
      />
      {/* Fade the sky into the page above and the water into the footer below. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-bg to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-20 bg-gradient-to-t from-accent to-transparent"
      />
      <div
        className={`${container} flex h-[clamp(540px,42vw,680px)] flex-col items-center px-5 pt-20 text-center sm:px-10 sm:pt-24 lg:pt-28`}
      >
        <h2
          id="cta-title"
          className="max-w-[720px] text-[clamp(30px,3.8vw,48px)] leading-[1.15] font-normal tracking-[-0.02em] text-text"
        >
          {copy.title}
        </h2>
        <p className="mt-5 max-w-[520px] text-[17px] leading-[1.55] text-text-muted">
          {copy.body}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href={copy.primary.href} className="btn btn-primary btn-lg">
            {copy.primary.label}
            <HoverArrow />
          </a>
          <Link
            href={copy.secondary.href}
            className="btn btn-secondary btn-lg shadow-[var(--shadow-btn)]"
          >
            {copy.secondary.label}
            <HoverArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** CTA plus the navy site footer. `#contact` links in the navbar scroll here. */
export function Footer({ audience = "partners" }: { audience?: Audience }) {
  return (
    <div id="contact" className="relative z-10 scroll-mt-16">
      <Cta audience={audience} />
      <footer className="bg-accent text-white">
        <div className={container}>
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-6 gap-y-10 px-5 pt-14 pb-16 sm:grid-cols-3 sm:px-10 lg:grid-cols-5 lg:gap-x-8 lg:pt-16 lg:pb-20"
          >
            {columns.map((groups, i) => (
              <div key={i} className="flex flex-col gap-9">
                {groups.map((group) => (
                  <div key={group.title}>
                    <p className="text-[13px] leading-[1.5] font-medium text-white">
                      {group.title}
                    </p>
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link href={link.href} className={linkClass}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Full-width rule above the bottom bar. */}
        <div className="border-t border-white/15">
          <div
            className={`${container} flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10`}
          >
            <div className="flex items-center gap-6">
              <Link
                href="/"
                aria-label={`${site.name} home`}
                className="shrink-0 [&_img]:brightness-0 [&_img]:invert"
              >
                <Logo height={20} />
              </Link>
              <ul className="flex items-center gap-4">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      aria-label={s.label}
                      className="block text-white/65 transition-colors duration-200 hover:text-white"
                      {...(s.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width={16}
                        height={16}
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        {s.icon}
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <p className="flex items-center gap-6 text-[13px] leading-[1.5] text-white/65">
              <span>Gurugram, India</span>
              <span>
                TechCity © <CurrentYear />
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
