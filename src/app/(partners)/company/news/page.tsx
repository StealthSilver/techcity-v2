import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { container } from "@/lib/layout";

export const metadata: Metadata = { title: "News" };

export default function Page() {
  return (
    <PageShell title="News">
      {/* The expanding story rail, moved here from the home page. */}
      <section className="scroll-mt-20">
        <div className={`${container} border-x border-b border-line px-5 py-14 sm:px-10 sm:py-16 lg:py-20`}>
          <TestimonialsCarousel />
        </div>
      </section>
    </PageShell>
  );
}
