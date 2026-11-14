/* eslint-disable @next/next/no-img-element */
import { site } from "@/lib/site";

/**
 * Full Techcity logo (mark + wordmark). Uses public/techcity-logo-bold.png —
 * a heavier-stroke version of public/techcity-logo.png (alpha dilated ~6px
 * at source resolution) so the logo stands apart from the nav links.
 */
export function Logo({ height = 30 }: { height?: number }) {
  const width = Math.round(height * (1855 / 457));
  return <img src="/techcity-logo-bold.png" alt={site.name} width={width} height={height} />;
}
