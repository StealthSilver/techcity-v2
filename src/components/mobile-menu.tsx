"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { HoverArrow } from "@/components/hover-arrow";
import { Icon } from "@/components/icons";
import { ProductLogo } from "@/components/product-logo";
import { groupItems, type NavConfig } from "@/lib/nav";

/** Menu button and full-height sheet for screens below the desktop nav (lg). */
export function MobileMenu({ nav }: { nav: NavConfig }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<number | null>(null);
  const [top, setTop] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetId = useId();

  const toggle = () => {
    const header = rootRef.current?.closest("header");
    if (header) setTop(header.getBoundingClientRect().bottom);
    setOpen((o) => !o);
  };
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={sheetId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={toggle}
        className="menu-toggle relative inline-flex size-10 items-center justify-center rounded text-text"
      >
        {/* Two bars that cross into an X */}
        <span
          aria-hidden="true"
          className={`absolute h-[1.75px] w-[18px] rounded-full bg-current transition-transform duration-300 ease-[var(--ease-out)] ${
            open ? "rotate-45" : "-translate-y-[4px]"
          }`}
        />
        <span
          aria-hidden="true"
          className={`absolute h-[1.75px] w-[18px] rounded-full bg-current transition-transform duration-300 ease-[var(--ease-out)] ${
            open ? "-rotate-45" : "translate-y-[4px]"
          }`}
        />
      </button>

      <div
        id={sheetId}
        inert={!open}
        style={{ top }}
        className={`fixed inset-x-0 bottom-0 z-40 flex flex-col bg-bg transition-[opacity,transform] duration-300 ease-[var(--ease-out)] ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 pt-2 pb-6">
          <ul>
            {nav.groups.map((group, i) => {
              if (!group.sections) {
                return (
                  <li key={group.label} className="border-b border-line">
                    <Link href={group.href ?? "#"} onClick={close} className="flex items-center py-3.5 text-[16px] font-medium text-text">
                      {group.label}
                    </Link>
                  </li>
                );
              }
              const expanded = section === i;
              return (
                <li key={group.label} className="border-b border-line">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setSection(expanded ? null : i)}
                    className="flex w-full items-center justify-between py-4 text-left text-[17px] font-medium text-text"
                  >
                    {group.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                      className={`text-text-muted transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                    >
                      <path d="M1.5 3.5L5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {/* Height animates via grid rows 0fr -> 1fr */}
                  <div
                    inert={!expanded}
                    className={`grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out)] ${
                      expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <ul className="overflow-hidden">
                      {groupItems(group).map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 active:bg-surface"
                          >
                            {item.product ? (
                              <ProductLogo id={item.product} size={34} />
                            ) : item.icon ? (
                              <span className="nav-icon flex size-[34px] shrink-0 items-center justify-center rounded-[10px]">
                                <Icon name={item.icon} size={17} />
                              </span>
                            ) : null}
                            <span>
                              <span className="flex items-center gap-2 text-[15px] leading-5 font-medium text-text">
                                {item.label}
                              </span>
                              {item.description && (
                                <span className="block text-[13px] leading-[18px] text-text-soft">
                                  {item.description}
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      ))}
                      <li aria-hidden="true" className="h-3" />
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex gap-3 border-t border-line px-5 pt-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <Link href={nav.secondary.href} onClick={close} className="btn btn-secondary flex-1 !border-line">
            {nav.secondary.label}
          </Link>
          <Link href={nav.primary.href} onClick={close} className="btn btn-primary flex-1">
            {nav.primary.label}
            <HoverArrow />
          </Link>
        </div>
      </div>
    </div>
  );
}
