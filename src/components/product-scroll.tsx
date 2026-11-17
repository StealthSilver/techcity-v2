"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalArrow, newTab } from "@/components/hover-arrow";
import { ProductScene } from "@/components/product-scenes";
import { TechStack } from "@/components/tech-stack";
import { container } from "@/lib/layout";
import { products } from "@/lib/products";
import "./product-scroll.css";

/*
 * Products section: the TechCity stack.
 *
 * Desktop: a pinned stage in two columns.
 * - Right, on a dotted panel: the TechCity stack, five isometric plates. The
 *   plate in focus lifts out with its callout; every plate is clickable.
 * - Left, one thing below the other: the product in focus (its numbered label
 *   on the left border, headline, blurb and link) at the top, and its scene
 *   (components/product-scenes) at the bottom, a real moment in the product
 *   that plays once as the product arrives and keeps its payoff on screen.
 *   A progress line runs down the left border from the top of the section,
 *   filling in the product's colour while it is in focus.
 *
 * Progress P is in "product units" (UNIT_VH of the viewport height each):
 *   P in [-INTRO, 0)  intro headline over the stack
 *   product i owns P in [i, i + 1):
 *     0    – 0.14  its text rises in, its scene mounts and plays
 *     0.08 – 0.86  progress line fills down the border
 *     0.86 – 1     its text lifts away (not the last product)
 * Keep INTRO, UNIT_VH and the last product's end (0.86) in sync with `.pscroll`
 * height in globals.css.
 */
const INTRO = 0.4;
const UNIT_VH = 1.1;
const RUN_START = 0.08;
const RUN_END = 0.86;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function ProductScroll() {
  return (
    <section id="products" className="products-light scroll-mt-16">
      <DesktopScroll />
      <MobileList />
    </section>
  );
}

function DesktopScroll() {
  const trackRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef<number | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const last = products.length - 1;

    let raf = 0;
    const update = () => {
      raf = 0;
      const unit = window.innerHeight * UNIT_VH;
      const P = (64 - track.getBoundingClientRect().top) / unit - INTRO;

      const intro = 1 - clamp01(P / 0.12);
      if (introRef.current) {
        introRef.current.style.opacity = intro.toFixed(3);
        introRef.current.style.transform = `translateY(calc(-50% - ${((1 - intro) * 40).toFixed(1)}px))`;
        introRef.current.style.pointerEvents = intro > 0.5 ? "auto" : "none";
      }

      let focus: number | null = null;
      products.forEach((_, i) => {
        const u = clamp01(P - i);
        const out = i === last ? 0 : clamp01((u - 0.86) / 0.12);
        if (u > 0 && out < 0.5) focus = i;
        const block = blockRefs.current[i];
        if (!block) return;
        const inn = clamp01(u / 0.14);
        block.style.opacity = (inn * (1 - out)).toFixed(3);
        block.style.transform = `translateY(${((1 - inn) * 18 - out * 40).toFixed(1)}px)`;
        block.style.pointerEvents = inn > 0.9 && out < 0.1 ? "auto" : "none";
      });

      // The progress line: down the left border from the top, in the product's colour.
      const line = lineRef.current;
      if (line) {
        if (focus === null) line.style.opacity = "0";
        else {
          const u = clamp01(P - focus);
          line.style.opacity = clamp01(u / 0.08).toFixed(3);
          line.style.setProperty("--fill", clamp01((u - RUN_START) / (RUN_END - RUN_START)).toFixed(4));
          line.dataset.product = products[focus].id;
        }
      }

      if (focus !== activeRef.current) {
        activeRef.current = focus;
        setActive(focus);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  /** Scroll to the middle of a product's turn (from the stack). */
  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const trackTop = track.getBoundingClientRect().top + window.scrollY - 64;
    const unit = window.innerHeight * UNIT_VH;
    window.scrollTo({ top: trackTop + (INTRO + i + 0.5) * unit, behavior: "smooth" });
  }, []);

  const current = active === null ? null : products[active];

  return (
    <div ref={trackRef} className="pscroll relative hidden lg:block">
      <div className="pscroll__stage sticky top-16">
        <div className={`${container} relative grid h-full grid-cols-2 grid-rows-1 border-x border-line`}>
          {/* Left: the product in focus at the top, its scene below. */}
          <div className="pscroll__left">
            <span ref={lineRef} className="pscroll__progress pscroll__progress--full" aria-hidden="true" />

            <div ref={introRef} className="pscroll__intro-wrap">
              <h2 className="pscroll__intro">
                The TechCity stack: five tools, one account, <em>first lesson to first offer</em>.
              </h2>
            </div>

            {products.map((p, i) => (
              <div
                key={p.id}
                ref={(el) => {
                  blockRefs.current[i] = el;
                }}
                className={`pscroll__block pscroll__label--${p.id}`}
                style={{ opacity: 0 }}
              >
                <p className="pscroll__block-label">
                  <span className="pscroll__bullet" aria-hidden="true" />
                  <span className="pscroll__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="pscroll__name">{p.name}</span>
                  <span className="pscroll__cat">{p.category}</span>
                </p>
                <h3 className="pscroll__headline">{p.headline}</h3>
                <p className="pscroll__blurb">{p.blurb}</p>
                <a href={p.href} {...newTab} className="pscroll__more btn btn-secondary btn-lg shadow-[var(--shadow-btn)]">
                  Explore {p.name}
                  <ExternalArrow />
                </a>
              </div>
            ))}

            {current && (
              <div className="pscroll__scene" data-ss-fill="">
                <ProductScene key={current.id} id={current.id} variant="panel" />
              </div>
            )}
          </div>

          {/* Right: the stack on a dotted panel. */}
          <div className="pscroll__panel min-h-0">
            <TechStack active={active} onSelect={goTo} className="pscroll__stack" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Below lg: the stack (tap a plate to jump to it) and a stacked list. */
function MobileList() {
  const goTo = (i: number) =>
    document.getElementById(`product-${products[i].id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <div className={`${container} border-x border-line px-5 py-16 sm:px-10 lg:hidden`}>
      <h2 className="pscroll__intro">
        The TechCity stack: five tools, one account, <em>first lesson to first offer</em>.
      </h2>
      <div className="pscroll__panel mt-8 -mx-5 px-5 py-6 sm:-mx-10 sm:px-10">
        <TechStack onSelect={goTo} className="mx-auto max-w-[460px]" />
      </div>
      <div className="mt-10 flex flex-col gap-12">
        {products.map((p, i) => (
          <article key={p.id} id={`product-${p.id}`} className="scroll-mt-24">
            <p className={`pscroll__label-static pscroll__label--${p.id}`}>
              <span className="pscroll__bullet" aria-hidden="true" />
              <span className="pscroll__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="pscroll__name">{p.name}</span>
            </p>
            <h3 className="pscroll__headline mt-4">{p.headline}</h3>
            <p className="pscroll__blurb">{p.blurb}</p>
            <a href={p.href} {...newTab} className="pscroll__more btn btn-secondary btn-lg shadow-[var(--shadow-btn)]">
              Explore {p.name}
              <ExternalArrow />
            </a>
            <div className="mt-8">
              <ProductScene id={p.id} variant="card" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
