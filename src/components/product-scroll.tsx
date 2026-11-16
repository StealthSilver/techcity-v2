"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalArrow, newTab } from "@/components/hover-arrow";
import { TechStack } from "@/components/tech-stack";
import { container } from "@/lib/layout";
import { products } from "@/lib/products";

/*
 * Products section: the TechCity stack.
 *
 * Desktop: a pinned stage. Left, styled after griffin.com's scroll story: the
 * products are numbered labels with ringed bullets on the left border line.
 * As you scroll, each label rises from the list to the middle, its headline and
 * blurb appear, and a progress line fills down the border while it is in focus.
 * Right, on a dotted panel: the TechCity stack, five isometric plates; the plate
 * in focus lifts out with a callout, and every plate is clickable.
 *
 * Progress P is in "product units" (UNIT_VH of the viewport height each):
 *   P in [-INTRO, 0)  intro headline, all labels in the list
 *   product i owns P in [i, i + 1):
 *     0    – 0.18  its label rises from the list to the middle
 *     0.12 – 0.24  headline and blurb fade in
 *     0.18 – 0.86  progress line fills
 *     0.86 – 1     label and text lift away (not the last product)
 * Keep INTRO, UNIT_VH and the last product's end (0.86) in sync with `.pscroll`
 * height in globals.css.
 */
const INTRO = 0.4;
const UNIT_VH = 1.1;
const RUN_START = 0.18;
const RUN_END = 0.86;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const LIST_GAP = 32;
const LIST_BOTTOM = 40;

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
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const infoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef<number | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const last = products.length - 1;

    let slotY = 0;
    let listY: number[] = [];
    const measure = () => {
      const h = stage.clientHeight;
      slotY = Math.round(h / 2 - 96);
      listY = products.map((_, i) => h - LIST_BOTTOM - (products.length - i) * LIST_GAP);
      stage.style.setProperty("--slot-y", `${slotY}px`);
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      const unit = window.innerHeight * UNIT_VH;
      const P = (64 - track.getBoundingClientRect().top) / unit - INTRO;

      const intro = 1 - clamp01(P / 0.12);
      if (introRef.current) {
        introRef.current.style.opacity = intro.toFixed(3);
        introRef.current.style.transform = `translateY(calc(-50% - ${((1 - intro) * 40).toFixed(1)}px))`;
      }

      let focus: number | null = null;
      products.forEach((_, i) => {
        const u = clamp01(P - i);
        const out = i === last ? 0 : clamp01((u - 0.86) / 0.12);
        if (u > 0 && out < 0.5) focus = i;

        const label = labelRefs.current[i];
        if (label) {
          const e = ease(clamp01(u / 0.18));
          const y = lerp(listY[i] - slotY, 0, e) - out * 90;
          label.style.transform = `translateY(${y.toFixed(1)}px)`;
          label.style.opacity = (1 - out).toFixed(3);
          label.toggleAttribute("data-active", u > 0.02 && out < 1);
        }

        const info = infoRefs.current[i];
        if (info) {
          const inn = clamp01((u - 0.12) / 0.12);
          info.style.opacity = (inn * (1 - out)).toFixed(3);
          info.style.transform = `translateY(${((1 - inn) * 16 - out * 70).toFixed(1)}px)`;
          info.style.pointerEvents = inn > 0.9 && out < 0.1 ? "auto" : "none";
        }
      });

      // Progress line under the label in focus, filling towards the list.
      const line = lineRef.current;
      if (line) {
        if (focus === null) {
          line.style.opacity = "0";
        } else {
          const u = clamp01(P - focus);
          const t = clamp01((u - RUN_START) / (RUN_END - RUN_START));
          const nextY = focus < last ? listY[focus + 1] : stage.clientHeight - LIST_BOTTOM;
          const length = Math.max(0, nextY - slotY - 34);
          line.style.opacity = clamp01(u / 0.18).toFixed(3);
          line.style.height = `${length}px`;
          line.style.setProperty("--fill", t.toFixed(4));
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
    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /** Scroll to the middle of a product's turn (from the stack or a label). */
  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const trackTop = track.getBoundingClientRect().top + window.scrollY - 64;
    const unit = window.innerHeight * UNIT_VH;
    window.scrollTo({ top: trackTop + (INTRO + i + 0.5) * unit, behavior: "smooth" });
  }, []);

  return (
    <div ref={trackRef} className="pscroll relative hidden lg:block">
      <div ref={stageRef} className="pscroll__stage sticky top-16">
        <div className={`${container} relative grid h-full grid-cols-2 border-x border-line`}>
          {/* Left: intro, labels on the border line, headline and blurb. */}
          <div className="relative h-full">
            <span ref={lineRef} className="pscroll__progress" aria-hidden="true" />

            <div ref={introRef} className="absolute top-1/2 left-11 max-w-[480px] -translate-y-1/2">
              <h2 className="pscroll__intro">
                The TechCity stack: five tools, one account, <em>first lesson to first offer</em>.
              </h2>
            </div>

            {products.map((p, i) => (
              <div
                key={p.id}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className={`pscroll__label pscroll__label--${p.id}`}
              >
                <button type="button" className="pscroll__label-btn" onClick={() => goTo(i)}>
                  <span className="pscroll__bullet" aria-hidden="true" />
                  <span className="pscroll__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="pscroll__name">{p.name}</span>
                  <span className="pscroll__cat">{p.category}</span>
                </button>
              </div>
            ))}

            {products.map((p, i) => (
              <div
                key={p.id}
                ref={(el) => {
                  infoRefs.current[i] = el;
                }}
                className="pscroll__info"
                style={{ opacity: 0 }}
              >
                <h3 className="pscroll__headline">{p.headline}</h3>
                <p className="pscroll__blurb">{p.blurb}</p>
                <a href={p.href} {...newTab} className="pscroll__more btn btn-secondary btn-lg shadow-[var(--shadow-btn)]">
                  Explore {p.name}
                  <ExternalArrow />
                </a>
              </div>
            ))}
          </div>

          {/* Right: the stack on a dotted panel. */}
          <div className="pscroll__panel">
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
          </article>
        ))}
      </div>
    </div>
  );
}
