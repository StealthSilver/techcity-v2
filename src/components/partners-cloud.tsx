"use client";

/* eslint-disable @next/next/no-img-element -- local, pre-trimmed logo files */
import { useState } from "react";

/**
 * Partners: two logo clouds (colleges and industry) behind the same tab band
 * as the Projects section. Logos sit in a calm grid with plenty of air, in
 * full colour, modelled on the "used by" cloud on pikaicons.com.
 *
 * College logos are the pre-trimmed copies in public/logos/ticker.
 * Industry entries are illustrative sector marks until real partner logos
 * are confirmed; swap each for `{ name, src }` once they're in public/logos.
 */

/** `size` evens out optical weight: square marks need more height than wide wordmarks. */
type CollegeLogo = { name: string; src: string; size?: number };
type IndustryMark = { name: string; mark: "spark" | "grid" | "orbit" | "wave" | "nodes" | "frame"; color: string };

const colleges: CollegeLogo[] = [
  { name: "Ajay Kumar Garg Engineering College", src: "/logos/ticker/akgec.webp", size: 64 },
  { name: "KIET University", src: "/logos/ticker/kiet.webp" },
  { name: "Echelon Institute of Technology", src: "/logos/ticker/echelon.webp" },
  { name: "Chitkara University", src: "/logos/ticker/chitkara.webp" },
  { name: "Inmantec Institutions", src: "/logos/ticker/inmantec.webp" },
  { name: "KCNIT Group of Institutions", src: "/logos/ticker/kcnit.webp" },
  { name: "St. Andrews Institute of Technology and Management", src: "/logos/ticker/st-andrews.webp", size: 60 },
  { name: "Chandigarh University", src: "/logos/ticker/chandigarh.webp" },
  { name: "Shobhit University", src: "/logos/ticker/shobhit.webp" },
  { name: "Jai Prakash Vishwavidyalaya", src: "/logos/ticker/jpu-chapra.webp", size: 64 },
  { name: "Adhunik Group of Institutions", src: "/logos/ticker/adhunik.webp" },
  { name: "School of Management Sciences, Lucknow", src: "/logos/ticker/sms-lucknow.webp" },
  { name: "Lovely Professional University", src: "/logos/ticker/lpu.webp" },
];

const industry: IndustryMark[] = [
  { name: "AI & Data", mark: "spark", color: "#3B47C4" },
  { name: "Cloud Systems", mark: "grid", color: "#1C257D" },
  { name: "Digital Products", mark: "orbit", color: "#6B7BE6" },
  { name: "Fintech", mark: "wave", color: "#F59E0B" },
  { name: "Engineering", mark: "nodes", color: "#3B47C4" },
  { name: "Emerging Tech", mark: "frame", color: "#1C257D" },
];

const tabs = [
  { id: "colleges", label: "College partners", count: colleges.length, color: "#1C257D" },
  { id: "industry", label: "Industry partners", count: industry.length, color: "#F59E0B" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SectorMark({ item }: { item: IndustryMark }) {
  return (
    <span className="partners-mark" style={{ color: item.color }}>
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {item.mark === "spark" && <path d="M24 4 28 19l15 5-15 4-4 16-4-16-15-4 15-5 4-15Z" />}
        {item.mark === "grid" && (
          <>
            <rect x="6" y="6" width="15" height="15" rx="4" />
            <rect x="27" y="6" width="15" height="15" rx="4" />
            <rect x="6" y="27" width="15" height="15" rx="4" />
            <rect x="27" y="27" width="15" height="15" rx="4" />
          </>
        )}
        {item.mark === "orbit" && (
          <>
            <circle cx="24" cy="24" r="6" />
            <ellipse cx="24" cy="24" rx="20" ry="9" transform="rotate(-35 24 24)" />
          </>
        )}
        {item.mark === "wave" && <path d="M5 18c6-8 12-8 19 0s13 8 19 0M5 30c6-8 12-8 19 0s13 8 19 0" />}
        {item.mark === "nodes" && (
          <>
            <path d="m12 13 12 22 12-22H12" />
            <circle cx="12" cy="13" r="4" />
            <circle cx="36" cy="13" r="4" />
            <circle cx="24" cy="35" r="4" />
          </>
        )}
        {item.mark === "frame" && <path d="M8 18V8h10M30 8h10v10M40 30v10H30M18 40H8V30m7-5 6 6 12-14" />}
      </svg>
      <span>{item.name}</span>
    </span>
  );
}

export function PartnersCloud() {
  const [tab, setTab] = useState<TabId>("colleges");

  return (
    <div>
      <div role="tablist" aria-label="Partner type" className="grid grid-cols-2 border-y border-line">
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`partners-tab-${t.id}`}
              aria-selected={active}
              aria-controls="partners-panel"
              onClick={() => setTab(t.id)}
              className="projects-tab group relative px-3 py-5 text-center sm:py-6"
              data-active={active || undefined}
            >
              <span
                className={`block text-[clamp(28px,2.8vw,40px)] leading-none font-normal tracking-[-0.03em] tabular-nums transition-colors duration-300 ${
                  active ? "text-text" : "text-text-muted/70 group-hover:text-text-muted"
                }`}
              >
                {t.count}
              </span>
              <span
                className={`mt-2.5 inline-flex items-center gap-2 text-[14px] leading-[1.5] font-medium transition-colors duration-300 ${
                  active ? "text-text" : "text-text-muted"
                }`}
              >
                <i className="h-2 w-2 rounded-full" style={{ background: t.color }} aria-hidden="true" />
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <div id="partners-panel" role="tabpanel" aria-labelledby={`partners-tab-${tab}`} className="px-5 py-14 sm:px-10 sm:py-16 lg:py-20">
        <ul key={tab} className="partners-cloud flex flex-wrap justify-center gap-y-12 sm:gap-y-14 lg:gap-y-16">
          {tab === "colleges"
            ? colleges.map((c, i) => (
                <li key={c.src} style={{ animationDelay: `${i * 40}ms` }}>
                  <img
                    src={c.src}
                    alt={c.name}
                    title={c.name}
                    loading="lazy"
                    decoding="async"
                    className="partners-logo"
                    style={{ maxHeight: c.size ?? 48 }}
                  />
                </li>
              ))
            : industry.map((m, i) => (
                <li key={m.name} style={{ animationDelay: `${i * 40}ms` }}>
                  <SectorMark item={m} />
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
}
