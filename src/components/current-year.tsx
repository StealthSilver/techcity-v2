import { cacheLife } from "next/cache";

/**
 * The current year. `use cache` lets `new Date()` run inside the prerendered
 * shell (cacheComponents), and the daily lifetime rolls it over on 1 January.
 */
export async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
