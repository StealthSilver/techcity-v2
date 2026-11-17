"use client";

import type { ComponentType } from "react";
import type { ProductId } from "@/components/product-logo";
import KakshaScene from "./kaksha";
import MargScene from "./marg";
import RiyaazScene from "./riyaaz";
import SetuScene from "./setu";
import SpardhaScene from "./spardha";
import "./scenes.css";

/**
 * Product scenes for the Products section, built with the stageshow kit
 * (src/stageshow/kit): one small, real moment per product, played once as it
 * comes into view, with the payoff left on screen.
 *
 * - panel: the desktop scroll's left column, under the product's text. The
 *   scene fills the column's width at its foot, so its window runs off the
 *   bottom and stops at the stack panel's border.
 * - card: the stacked list below lg. A dotted card cut to the stage's shape,
 *   the scene's compact design inside it.
 */
const scenes: Record<ProductId, ComponentType> = {
  setu: SetuScene,
  marg: MargScene,
  spardha: SpardhaScene,
  riyaaz: RiyaazScene,
  kaksha: KakshaScene,
};

export function ProductScene({ id, variant }: { id: ProductId; variant: "panel" | "card" }) {
  const Scene = scenes[id];
  return (
    <div className={`product-scene product-scene--${variant}`}>
      <Scene />
    </div>
  );
}
