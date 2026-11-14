import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return (
    <PageShell title="Team" />
  );
}
