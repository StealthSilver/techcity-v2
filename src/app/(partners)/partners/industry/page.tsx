import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Industry partners" };

export default function Page() {
  return (
    <PageShell title="Industry partners">
      <div>
        <div className="mx-auto w-full max-w-[1266px] border-b border-line px-5 py-12 sm:px-10 sm:py-16 lg:px-[120px] lg:py-20">
          <p className="max-w-2xl text-[16px] text-text-muted">
            Partner with TechCity to connect industry expertise with campus learning and help prepare students for modern tech careers.
          </p>
          <Link href="/#contact" className="btn btn-primary mt-8">
            Start a conversation
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
