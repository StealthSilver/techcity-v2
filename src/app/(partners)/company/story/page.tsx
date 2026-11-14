import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Our story" };

export default function Page() {
  return (
    <PageShell title="Our story" />
  );
}
