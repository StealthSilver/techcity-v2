import { container } from "@/lib/layout";

/** Empty page: title framed by the guide lines. Content comes later. */
export function PageShell({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <main>
      {/* mt-16 clears the fixed navbar; the top rule sits right under it */}
      <section className="mt-16 border-t border-line">
        <div className={`${container} border-b border-line px-5 py-16 sm:px-10 sm:py-20 lg:px-[120px] lg:py-[96px]`}>
          <h1 className="text-[clamp(28px,3.4vw,40px)] leading-[1.15] font-normal tracking-[-0.02em]">{title}</h1>
        </div>
      </section>
      {children}
      {/* Lines end here: a full-width rule over the last section's bottom line. */}
      <div aria-hidden="true" className="relative -mt-px border-t border-line" />
    </main>
  );
}
