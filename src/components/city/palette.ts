/** Brand colours for the 3D city. Mirrors the tokens in globals.css. */
export const BRAND = {
  navy: "#1C257D",
  indigo: "#3B47C4",
  periwinkle: "#6B7BE6",
  lavender: "#A5B1F5",
  mist: "#E4E8FD",
  cream: "#FFF1D6",
  honey: "#FCD38A",
  amber: "#F59E0B",
  ink: "#061B31",
} as const;

/** Small deterministic PRNG (mulberry32), so the city is the same on every load. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
