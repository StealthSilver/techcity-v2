"use client";

/* eslint-disable @next/next/no-img-element -- local, pre-trimmed logo files */
import { useState } from "react";

/**
 * Partners: the same tab band as the Projects section over a plain table of
 * partners (logo and name, location or focus, type), ruled with the page's
 * guide lines.
 *
 * College logos are the pre-trimmed copies in public/logos/ticker;
 * industry logos are in public/partners (froyo-mark.png is the Froyo mark
 * cropped from its white-on-dark wordmark so it reads on a white tile).
 */

type Kind = { label: string; color: string };

const KIND = {
  university: { label: "University", color: "#1C257D" },
  institute: { label: "Institute", color: "#6B7BE6" },
  technology: { label: "Technology", color: "#F59E0B" },
  training: { label: "Training", color: "#3B47C4" },
} satisfies Record<string, Kind>;

type Row = { name: string; src: string; detail: string; kind: Kind };

const colleges: Row[] = [
  { name: "Ajay Kumar Garg Engineering College", src: "/logos/ticker/akgec.webp", detail: "Ghaziabad, Uttar Pradesh", kind: KIND.institute },
  { name: "KIET University", src: "/logos/ticker/kiet.webp", detail: "Ghaziabad, Uttar Pradesh", kind: KIND.university },
  { name: "Echelon Institute of Technology", src: "/logos/ticker/echelon.webp", detail: "Faridabad, Haryana", kind: KIND.institute },
  { name: "Chitkara University", src: "/logos/ticker/chitkara.webp", detail: "Rajpura, Punjab", kind: KIND.university },
  { name: "Inmantec Institutions", src: "/logos/ticker/inmantec.webp", detail: "Ghaziabad, Uttar Pradesh", kind: KIND.institute },
  { name: "KCNIT Group of Institutions", src: "/logos/ticker/kcnit.webp", detail: "Banda, Uttar Pradesh", kind: KIND.institute },
  {
    name: "St. Andrews Institute of Technology and Management",
    src: "/logos/ticker/st-andrews.webp",
    detail: "Gurugram, Haryana",
    kind: KIND.institute,
  },
  { name: "Chandigarh University", src: "/logos/ticker/chandigarh.webp", detail: "Mohali, Punjab", kind: KIND.university },
  { name: "Shobhit University", src: "/logos/ticker/shobhit.webp", detail: "Meerut, Uttar Pradesh", kind: KIND.university },
  { name: "Jai Prakash Vishwavidyalaya", src: "/logos/ticker/jpu-chapra.webp", detail: "Chapra, Bihar", kind: KIND.university },
  { name: "Adhunik Group of Institutions", src: "/logos/ticker/adhunik.webp", detail: "Ghaziabad, Uttar Pradesh", kind: KIND.institute },
  { name: "School of Management Sciences", src: "/logos/ticker/sms-lucknow.webp", detail: "Lucknow, Uttar Pradesh", kind: KIND.institute },
  { name: "Lovely Professional University", src: "/logos/ticker/lpu.webp", detail: "Phagwara, Punjab", kind: KIND.university },
];

const industry: Row[] = [
  { name: "HCL GUVI", src: "/partners/hcl-guvi.webp", detail: "Tech upskilling and certification", kind: KIND.training },
  { name: "Chetu", src: "/partners/chetu.png", detail: "AI and digital transformation", kind: KIND.technology },
  { name: "Hitbullseye", src: "/partners/hitbullseye.png", detail: "Aptitude and placement preparation", kind: KIND.training },
  { name: "VTS Infosoft", src: "/partners/vts-infosoft.png", detail: "Digital transformation", kind: KIND.technology },
  { name: "Victory Tech Solutions", src: "/partners/victory.png", detail: "Technology solutions", kind: KIND.technology },
  { name: "epiTech Infosystems", src: "/partners/epitech.png", detail: "IT services", kind: KIND.technology },
  { name: "Froyo Technologies", src: "/partners/froyo-mark.png", detail: "Technology services", kind: KIND.technology },
  { name: "Hadwik Data Solutions", src: "/partners/hadwick.jpeg", detail: "IT training and placement", kind: KIND.training },
  { name: "Edcept", src: "/partners/edcept.svg", detail: "Education services", kind: KIND.training },
  { name: "My Edu Galaxy", src: "/partners/my-edu-galaxy.svg", detail: "Education services", kind: KIND.training },
];

const tabs = [
  { id: "colleges", label: "College partners", rows: colleges, detail: "Location", color: "#1C257D" },
  { id: "industry", label: "Industry partners", rows: industry, detail: "Focus", color: "#F59E0B" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function PartnersCloud() {
  const [tabId, setTabId] = useState<TabId>("colleges");
  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0];

  return (
    <div>
      <div role="tablist" aria-label="Partner type" className="grid grid-cols-2 border-y border-line">
        {tabs.map((t) => {
          const active = t.id === tabId;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`partners-tab-${t.id}`}
              aria-selected={active}
              aria-controls="partners-panel"
              onClick={() => setTabId(t.id)}
              className="projects-tab group relative px-3 py-5 text-center sm:py-6"
              data-active={active || undefined}
            >
              <span
                className={`block text-[clamp(28px,2.8vw,40px)] leading-none font-normal tracking-[-0.03em] tabular-nums transition-colors duration-300 ${
                  active ? "text-text" : "text-text-muted/70 group-hover:text-text-muted"
                }`}
              >
                {t.rows.length}
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

      <div id="partners-panel" role="tabpanel" aria-labelledby={`partners-tab-${tab.id}`}>
        <table className="partners-table w-full text-left">
          <caption className="sr-only">{tab.label}</caption>
          <thead>
            <tr>
              <th scope="col">Partner</th>
              <th scope="col" className="max-sm:hidden">
                {tab.detail}
              </th>
              <th scope="col" className="w-[1%] whitespace-nowrap">
                Type
              </th>
            </tr>
          </thead>
          <tbody key={tab.id}>
            {tab.rows.map((r, i) => (
              <tr key={r.name} style={{ animationDelay: `${i * 30}ms` }}>
                <td>
                  <div className="flex items-center gap-4 sm:gap-5">
                    <span className="partners-table__logo">
                      <img src={r.src} alt="" loading="lazy" decoding="async" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15px] leading-[1.4] font-medium text-text">{r.name}</p>
                      <p className="mt-0.5 text-[13px] leading-[1.5] text-text-muted sm:hidden">{r.detail}</p>
                    </div>
                  </div>
                </td>
                <td className="text-[14px] leading-[1.5] text-text-muted max-sm:hidden">{r.detail}</td>
                <td className="whitespace-nowrap">
                  <span className="flex items-center gap-2 text-[14px] leading-[1.5] text-text-muted">
                    <i className="h-1.5 w-1.5 rounded-full" style={{ background: r.kind.color }} aria-hidden="true" />
                    {r.kind.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
