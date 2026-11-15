import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "College partners" };

export default function Page() {
  return (
    <PageShell title="College partners">
      <div>
        <div className="mx-auto w-full max-w-[1266px] border-x border-b border-line px-5 py-12 sm:px-10 sm:py-16 lg:px-[120px] lg:py-20">
          <p className="max-w-2xl text-[16px] text-text-muted">
            We work alongside colleges and their faculty to bring industry-aligned training, placement preparation and learning platforms to campus.
          </p>
          <Link href="/programs" className="btn btn-primary mt-8">
            Explore our programs
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
