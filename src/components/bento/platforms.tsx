import type { CSSProperties } from "react";
import { InView } from "@/components/in-view";
import { ProductLogo } from "@/components/product-logo";
import { products } from "@/lib/products";

/**
 * Platforms: a collection tile. The five TechCity tools as small app tiles in
 * two offset rows, left on the copy's gutter. They rise in once, staggered,
 * when the card scrolls into view.
 */
const rows = [products.slice(0, 3), products.slice(3)];

export function PlatformsItem() {
  return (
    <InView className="bx-apps" threshold={0.4}>
      {rows.map((row, r) => (
        <div key={r} className="bx-apps__row" data-row={r}>
          {row.map((p, i) => (
            <span key={p.id} className="bx-apps__tile" style={{ "--i": r * 3 + i } as CSSProperties}>
              <ProductLogo id={p.id} size={40} />
              <span className="text-[13px] leading-[1.3] font-medium text-text">{p.name}</span>
            </span>
          ))}
        </div>
      ))}
    </InView>
  );
}
