"use client";

/* eslint-disable @next/next/no-img-element -- local, pre-trimmed logo files */
import { useState, type CSSProperties } from "react";
import { colleges, industry } from "@/lib/partners";

/**
 * Partners: the Projects-style tab band over a logo wall. Every partner gets
 * one cell in a ruled grid: its logo in one shared treatment (grayscale,
 * colour on hover, so no brand fights the page's accent), its name and its
 * place or focus. Rules are drawn on the cells, so a short last row ends cleanly.
 */

const tabs = [
  {
    id: "colleges",
    label: "College partners",
    rows: colleges,
    color: "#1C257D",
  },
  {
    id: "industry",
    label: "Industry partners",
    rows: industry,
    color: "#F59E0B",
  },
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
        <ul key={tab.id} className="partners-wall" aria-label={tab.label}>
          {tab.rows.map((r, i) => (
            <li key={r.name} className="partners-wall__cell" style={{ "--i": i } as CSSProperties}>
              <span className="partners-wall__logo">
                <img src={r.src} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="mt-auto block pt-5">
                <span className="line-clamp-2 block text-[14px] leading-[1.4] font-medium text-text">{r.name}</span>
                <span className="mt-0.5 block text-[13px] leading-[1.5] text-text-muted">{r.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
