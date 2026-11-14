import { Navbar } from "@/components/navbar";
import { studentNav } from "@/lib/nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar nav={studentNav} />
      {children}
    </>
  );
}
