import type { Metadata } from "next";
import { container } from "@/lib/layout";

export const metadata: Metadata = { title: "For students" };

export default function StudentsHome() {
  return (
    <main>
      {/* mt-16 clears the fixed navbar; the top rule sits right under it */}
      <section className="mt-16 border-y border-line">
        <div className={`${container} border-x border-line px-5 py-16 sm:px-10 sm:py-20 lg:px-[120px] lg:pt-[96px] lg:pb-[120px]`}>
          <h1 className="text-[clamp(32px,4.2vw,48px)] leading-[1.15] font-normal tracking-[-0.02em]">Student part</h1>
        </div>
      </section>
      <div aria-hidden="true" className={`${container} h-28 border-x border-line`} />
    </main>
  );
}
