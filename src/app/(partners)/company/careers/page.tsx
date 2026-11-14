import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Careers" };

export default function Page() {
  return (
    <PageShell title="Careers" />
  );
}
