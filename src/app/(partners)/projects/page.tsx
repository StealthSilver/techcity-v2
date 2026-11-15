import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { container } from "@/lib/layout";
import { projects, projectStatuses } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects" };

/** Every campus project, grouped by status (same data as the home page globe). */
export default function Page() {
  return (
    <PageShell title="Projects">
      <div className={`${container} grid gap-12 border-b border-line px-5 py-12 sm:px-10 sm:py-16 lg:grid-cols-3 lg:px-[120px] lg:py-20`}>
        {projectStatuses.map((s) => {
          const list = projects.filter((p) => p.status === s.id);
          return (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-[20px] font-normal tracking-[-0.02em] text-text">
                <i className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                {s.label}
                <span className="text-text-muted">{list.length}</span>
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {list.map((p) => (
                  <li key={p.title} className="border border-line p-5">
                    <p className="text-[15px] leading-[1.4] font-medium text-text">{p.title}</p>
                    <p className="mt-1 text-[14px] text-text-muted">
                      {p.city} · {p.dates}
                    </p>
                    <p className="mt-3 text-[13px] text-text-muted">{p.tracks.join(" · ")}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
