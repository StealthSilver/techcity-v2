import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "News" };

export default function Page() {
  return (
    <PageShell title="News" />
  );
}
