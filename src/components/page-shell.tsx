import { container } from "@/lib/layout";

/** Empty page: title framed by the guide lines. Content comes later. */
export function PageShell({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <main>
      {/* mt-16 clears the fixed navbar; the top rule sits right under it */}
      <section className="mt-16 border-y border-line">
        <div className={`${container} border-x border-line px-5 py-16 sm:px-10 sm:py-20 lg:px-[120px] lg:py-[96px]`}>
          <h1 className="text-[clamp(28px,3.4vw,40px)] leading-[1.15] font-normal tracking-[-0.02em]">{title}</h1>
        </div>
      </section>
      {children}
      <div aria-hidden="true" className={`${container} h-28 border-x border-line`} />
    </main>
  );
}
