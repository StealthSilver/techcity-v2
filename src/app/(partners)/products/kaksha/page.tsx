import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Kaksha" };

export default function Page() {
  return (
    <PageShell title="Kaksha" />
  );
}
