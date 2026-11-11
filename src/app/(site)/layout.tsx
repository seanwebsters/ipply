import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-40">
        <SiteHeader />
      </div>
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
