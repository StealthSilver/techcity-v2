import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { partnerNav } from "@/lib/nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar nav={partnerNav} />
      {children}
      <Footer />
    </>
  );
}
