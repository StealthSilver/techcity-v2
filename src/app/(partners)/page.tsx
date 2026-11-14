import { HeroStat } from "@/components/hero-stat";
import { HeroGlobe } from "@/components/hero-globe";
import { HoverArrow } from "@/components/hover-arrow";
import { LogoTicker } from "@/components/logo-ticker";
import { container } from "@/lib/layout";

export default function Home() {
  return (
    <>
      <main className="overflow-x-clip">
        {/* Hero: starts under the fixed navbar with a full-width rule (mt-16 = navbar height),
            framed by vertical guide lines, closed by a full-width rule.
            The globe sits behind the copy and spills past the hero (and up behind the navbar) on purpose. */}
        <section className="relative mt-16 border-y border-line">
          <div
            className={`${container} relative border-x border-line px-5 pt-12 sm:px-10 sm:pt-16 lg:flex lg:min-h-[760px] lg:items-center lg:px-[120px] lg:py-24`}
          >
            <div className="hero-copy relative z-10 lg:-translate-x-6 lg:-translate-y-10">
              <HeroStat label="Students mentored across India on TechCity" value={23899} />

              <h1 className="mt-10 max-w-[960px] text-[clamp(32px,4.1vw,48px)] leading-[1.15] font-normal tracking-[-0.02em] text-text">
                Industry-aligned skilling that makes students stand out, get hired and grow.
              </h1>

              <div className="mt-10">
                <a href="#contact" className="btn btn-primary btn-lg">
                  Partner with us
                  <HoverArrow />
                </a>
              </div>
            </div>

            <HeroGlobe className="relative left-1/2 z-[2] -mt-4 -mb-[18%] w-[130vw] max-w-[640px] -translate-x-1/2 sm:-mb-[14%] lg:absolute lg:top-[-74px] lg:right-[-260px] lg:left-auto lg:m-0 lg:w-[1000px] lg:max-w-none lg:translate-x-0 xl:right-[-280px] xl:w-[1060px]" />
          </div>

          {/* Partner logo ticker: under the globe (z-1 < z-2), so logos start from behind it. */}
          <LogoTicker className={`${container} relative z-[1] border-x border-t border-line`} />
        </section>

        {/* Guide lines continue below the hero. */}
        <div aria-hidden="true" className={`${container} h-28 border-x border-line`} />
      </main>
    </>
  );
}
