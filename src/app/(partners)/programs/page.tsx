import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Programs" };

export default function Page() {
  return (
    <PageShell title="Programs">
      <div id="trainers" className="scroll-mt-4" />
      <div id="faculty" className="scroll-mt-4" />
      <div id="placement" className="scroll-mt-4" />
      <div id="placing" className="scroll-mt-4" />
      <div id="mentorship" className="scroll-mt-4" />
      <div id="online" className="scroll-mt-4" />
      <div id="content" className="scroll-mt-4" />
      <div id="platforms" className="scroll-mt-4" />
    </PageShell>
  );
}
