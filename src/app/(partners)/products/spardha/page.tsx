import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Spardha" };

export default function Page() {
  return (
    <PageShell title="Spardha" />
  );
}
