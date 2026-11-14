import { container } from "@/lib/layout";
import { site } from "@/lib/site";

/** Site footer. `#contact` links in the navbar scroll here. */
export function Footer() {
  return (
    <footer id="contact" className="relative z-10 scroll-mt-4 border-t border-line">
      <div className={`${container} flex flex-col gap-6 border-x border-line px-5 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-10 lg:px-[120px]`}>
        <div>
          <p className="text-[14px] font-medium text-text">Contact</p>
          <p className="mt-2 flex flex-col gap-1 text-[14px] text-text-muted">
            <a href={`mailto:${site.email}`} className="transition-colors duration-200 hover:text-text">{site.email}</a>
            <a href={`tel:${site.phoneE164}`} className="transition-colors duration-200 hover:text-text">{site.phone}</a>
          </p>
        </div>
        <p className="text-[13px] text-text-muted">© {site.legalName}</p>
      </div>
    </footer>
  );
}
