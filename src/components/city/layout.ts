import * as THREE from "three";
import { rng } from "./palette";

/**
 * The city plan. Pure data: where every building, tree, road, walker and
 * track goes.
 *
 * Axes: x runs left → right across the hero, z runs far (negative) → near
 * (positive), y is up. Units are roughly metres.
 *
 *   x < -24   Campus: low white buildings, a stadium, a library, lawns
 *   |x| < 22  The hub, its forecourt, pools and the tram station
 *   x >  24   Industry: light-glass towers (one carries the TechCity mark),
 *             a factory and a data centre
 *   z ≈ 12    The city road (cars, buses, zebra crossings)
 *   z ≈ 24    Tram lines, campus → hub → industry; one swings towards the viewer
 */

export type MatKey =
  | "white" | "stone" | "glass" | "silver" | "amber" | "honey"
  | "pave" | "road" | "line" | "grass" | "garden" | "hedge" | "solar" | "water";
export type Box = { p: [number, number, number]; s: [number, number, number]; m: MatKey; r?: number };
/** A glass tower (or one tier of one), standing on `y`. */
export type Tower = { x: number; z: number; y: number; w: number; d: number; h: number; seed: number; lit: number; fins?: boolean };
export type TreeKind = 0 | 1; // 0 = round (clustered crown), 1 = cypress
export type Tree = { x: number; z: number; s: number; r: number; kind: TreeKind; tint: number };

const boxes: Box[] = [];
const towers: Tower[] = [];
const footprints: [number, number, number, number][] = [];

const add = (m: MatKey, p: [number, number, number], s: [number, number, number], r?: number) =>
  boxes.push({ m, p, s, r });

function reserve(x: number, z: number, w: number, d: number, pad = 1.5) {
  footprints.push([x - w / 2 - pad, z - d / 2 - pad, x + w / 2 + pad, z + d / 2 + pad]);
}

const R = rng(5);

/**
 * A white building: ribbon windows on every floor, a parapet, then one of a
 * rooftop garden, light solar panels or a plant room. Optional amber corner
 * strip, vertical fins and an entrance canopy facing the viewer.
 */
function block(
  x: number, z: number, w: number, d: number, h: number,
  opts: { strip?: boolean; floor?: number; fins?: boolean; canopy?: boolean } = {},
) {
  const floor = opts.floor ?? 3.4;
  add("white", [x, h / 2, z], [w, h, d]);
  for (let y = 1.7; y + 1 < h; y += floor) add("glass", [x, y + 0.75, z], [w + 0.08, 1.5, d + 0.08]);
  add("white", [x, h + 0.25, z], [w + 0.3, 0.5, d + 0.3]);
  const roof = R();
  if (roof < 0.35) {
    add("garden", [x, h + 0.55, z], [w - 1.2, 0.2, d - 1.2]);
    for (let i = 0; i < 3; i++) add("hedge", [x - w / 3 + (i * w) / 3, h + 0.9, z + (R() - 0.5) * (d - 3)], [1.4, 0.8, 1.4]);
  } else if (roof < 0.7) {
    for (let i = 0; i < Math.floor(w / 2.6); i++)
      add("solar", [x - w / 2 + 1.6 + i * 2.6, h + 0.85, z], [2.1, 0.12, d * 0.65], 0);
  } else {
    add("stone", [x + w * 0.15, h + 1, z - d * 0.1], [w * 0.3, 1.2, d * 0.3]);
  }
  if (opts.fins) for (let i = 0; i <= 4; i++) add("white", [x - w / 2 + (i * w) / 4, h / 2, z + d / 2 + 0.25], [0.25, h - 0.6, 0.5]);
  if (opts.canopy) {
    add("white", [x, 3.2, z + d / 2 + 1.2], [Math.min(6, w * 0.5), 0.3, 2.4]);
    add("honey", [x, 1.5, z + d / 2 + 0.05], [Math.min(4, w * 0.35), 2.6, 0.06]);
  }
  if (opts.strip) add("amber", [x + w / 2 + 0.06, h * 0.45, z + d / 2 + 0.06], [0.3, h * 0.8, 0.3]);
  reserve(x, z, w, d);
}

/** A light-glass tower with a white crown, sometimes stepped. */
function tower(x: number, z: number, w: number, d: number, h: number, seed: number, lit = 0.06, stepped = false) {
  towers.push({ x, z, y: 0, w, d, h, seed, lit, fins: seed % 2 === 0 });
  let top = h;
  if (stepped) {
    const h2 = h * 0.18;
    towers.push({ x, z, y: h + 0.8, w: w * 0.72, d: d * 0.72, h: h2, seed: seed + 1, lit, fins: false });
    add("white", [x, h + 0.4, z], [w + 0.4, 0.8, d + 0.4]);
    top = h + 0.8 + h2;
    add("white", [x, top + 0.35, z], [w * 0.72 + 0.4, 0.7, d * 0.72 + 0.4]);
  } else {
    add("white", [x, h + 0.4, z], [w + 0.4, 0.8, d + 0.4]);
    add("stone", [x, h + 1.6, z], [w * 0.5, 1.6, d * 0.5]);
  }
  reserve(x, z, w, d);
  return top;
}

function lawn(x: number, z: number, w: number, d: number) {
  add("grass", [x, 0.04, z], [w, 0.08, d]);
}

// ---------------------------------------------------------------- campus (left)

/** Signature campus buildings, drawn by their own components. */
export const CAMPUS = {
  arena: { x: -64, z: -30, r: 10 },
  library: { x: -40, z: -28, w: 15, d: 12, h: 9 },
  classroom: { x: -58, z: -6, w: 19, d: 10, h: 7 },
  gym: { x: -36, z: -7, w: 11, d: 11, h: 10 },
  gate: { x: -46, z: 4.5 },
} as const;
reserve(CAMPUS.arena.x, CAMPUS.arena.z, 22, 22);
reserve(CAMPUS.library.x, CAMPUS.library.z, CAMPUS.library.w + 4, CAMPUS.library.d + 4);
reserve(CAMPUS.classroom.x, CAMPUS.classroom.z, CAMPUS.classroom.w, CAMPUS.classroom.d);
reserve(CAMPUS.gym.x, CAMPUS.gym.z, CAMPUS.gym.w, CAMPUS.gym.d);

lawn(-62, -30, 36, 30);
lawn(-47, -6, 30, 8);
lawn(-86, -22, 16, 40);
lawn(-30, -46, 18, 12);

block(-82, -12, 10, 12, 6, { strip: true, canopy: true });
block(-80, 1, 9, 8, 5, { canopy: true });
// Nothing behind the campus (z < -38): the sky above it stays open behind the headline.
block(-27, -25, 7, 9, 11, { strip: true });
block(-98, -28, 9, 14, 7);
block(-102, -6, 8, 10, 5, { canopy: true });

// Campus walkways.
add("pave", [-60, 0.03, 6.5], [100, 0.06, 3]);
add("pave", [-56, 0.03, -18], [70, 0.06, 3.2]);
add("pave", [-46, 0.03, -6], [3, 0.06, 22]);

// ---------------------------------------------------------------- hub (centre)

export const HUB = { x: 0, z: -10, w: 34, d: 15, h: 12 };
reserve(HUB.x, HUB.z, HUB.w + 12, HUB.d + 6);
add("pave", [0, 0.03, 6], [44, 0.06, 14]); // forecourt
add("pave", [0, 0.03, 18], [40, 0.06, 4]); // station side
// Reflecting pools either side of the entrance, with a white rim.
for (const sx of [-1, 1]) {
  add("stone", [sx * 12.5, 0.12, 3.2], [11, 0.24, 3.4]);
  add("water", [sx * 12.5, 0.2, 3.2], [10.2, 0.1, 2.6]);
}

// ---------------------------------------------------------------- industry (right)

/** The TechCity tower: the tallest building, carrying the glowing mark near its top. */
export const LOGO_TOWER = { x: 47, z: -16, w: 13, d: 11, h: 42, markY: 34, markSize: 9.5 };
{
  const { x, z, w, d, h } = LOGO_TOWER;
  towers.push({ x, z, y: 0, w, d, h, seed: 400, lit: 0.05, fins: true });
  add("white", [x, h + 0.5, z], [w + 0.6, 1, d + 0.6]);
  towers.push({ x, z, y: h + 1, w: w * 0.7, d: d * 0.7, h: 7, seed: 401, lit: 0.05 });
  add("white", [x, h + 8.4, z], [w * 0.7 + 0.5, 0.8, d * 0.7 + 0.5]);
  add("silver", [x, h + 13, z], [0.3, 8.5, 0.3]); // spire
  add("amber", [x, h + 17.4, z], [0.5, 0.5, 0.5]);
  // Plinth and entrance.
  add("white", [x, 1.8, z + d / 2 + 1.4], [8, 0.35, 2.8]);
  add("honey", [x, 1.6, z + d / 2 + 0.05], [5, 3, 0.06]);
  reserve(x, z, w, d);
}

tower(30, -27, 8, 8, 30, 11, 0.06, true);
tower(58, -36, 9, 9, 38, 13);
tower(36, -46, 12, 8, 26, 14, 0.04);
tower(71, -12, 8, 8, 28, 15, 0.06, true);
tower(74, -46, 10, 10, 42, 16);
tower(88, -27, 9, 9, 34, 17, 0.05, true);
tower(27, -9, 7, 7, 20, 18);
tower(100, -50, 11, 11, 40, 19);

lawn(52, 4, 70, 14);
lawn(60, -28, 70, 50);

export const FACTORY = { x: 64, z: -1, w: 24, d: 11, h: 6, teeth: 6 };
reserve(FACTORY.x, FACTORY.z, FACTORY.w, FACTORY.d + 4);
export const DATACENTER = { x: 34, z: 0, w: 12, d: 8, h: 5 };
reserve(DATACENTER.x, DATACENTER.z, DATACENTER.w, DATACENTER.d);

// ---------------------------------------------------------------- far skyline

{
  const r = rng(42);
  for (let i = 0; i < 40; i++) {
    const x = -190 + r() * 380;
    const z = -82 - r() * 90;
    const right = x > 10;
    const h = (right ? 14 : 6) + r() * (right ? 28 : 12);
    const w = 7 + r() * 10;
    const d = 7 + r() * 10;
    const stepped = r() < 0.3;
    // Keep the sky behind the campus and hub clear: skyline only on the industry side.
    if (x < 28) continue;
    tower(x, z, w, d, h, 100 + i, 0.04, stepped);
  }
}

// ---------------------------------------------------------------- road

/** The city road runs the full width at z = ROAD.z, two lanes each way of traffic. */
export const ROAD = { z: 12, w: 9, lanes: [9.8, 14.2] };
add("road", [0, 0.05, ROAD.z], [460, 0.1, ROAD.w]);
add("stone", [0, 0.12, ROAD.z - ROAD.w / 2 - 0.2], [460, 0.24, 0.4]); // kerbs
add("stone", [0, 0.12, ROAD.z + ROAD.w / 2 + 0.2], [460, 0.24, 0.4]);
for (let x = -228; x < 228; x += 7) add("line", [x, 0.11, ROAD.z], [3.2, 0.02, 0.22]);
/** Zebra crossings link the forecourt to the station. */
export const CROSSINGS = [-8, 8];
for (const cx of CROSSINGS)
  for (let i = -3; i <= 3; i++) add("line", [cx + i * 0.9, 0.11, ROAD.z], [0.5, 0.02, ROAD.w - 1.2]);

// ---------------------------------------------------------------- foreground

function kiosk(x: number, z: number) {
  add("white", [x, 1.6, z], [3.2, 3.2, 3.2]);
  add("amber", [x, 1.2, z + 1.62], [1.1, 2.2, 0.05]);
  add("white", [x, 3.35, z], [3.8, 0.3, 3.8]);
  reserve(x, z, 3.2, 3.2, 0.8);
}
kiosk(66, 40);
kiosk(-14, 40);
kiosk(18, 54);
add("pave", [-30, 0.03, 44], [70, 0.06, 6]);
add("pave", [70, 0.03, 44], [50, 0.06, 6]);
lawn(-60, 52, 50, 12);
lawn(80, 56, 40, 10);

// ---------------------------------------------------------------- tram lines

const curve = (pts: number[][]) =>
  new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "centripetal");

/**
 * Track A runs across the city: campus → hub station → industry.
 * Track B runs beside it to the hub, then swings out towards the viewer.
 */
export const TRACKS = [
  curve([[-190, 23], [-110, 21], [-50, 22], [0, 23.5], [50, 26], [110, 30], [190, 27]]),
  curve([[-190, 27.4], [-110, 25.4], [-50, 26.4], [0, 27.9], [24, 31], [38, 40], [44, 54], [42, 74], [32, 110], [20, 160]]),
];

const trackSamples = TRACKS.flatMap((c) => c.getSpacedPoints(180));
const nearTrack = (x: number, z: number, r: number) => trackSamples.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < r * r);

export const STATION = { x: 0, z: 19.8, w: 30, d: 3.2 };
add("stone", [STATION.x, 0.45, STATION.z], [STATION.w, 0.9, STATION.d]);
add("white", [STATION.x, 4.3, STATION.z + 0.4], [STATION.w + 2, 0.35, STATION.d + 2.4]);
add("glass", [STATION.x, 4.55, STATION.z + 0.4], [STATION.w - 2, 0.15, STATION.d + 1]);
add("honey", [STATION.x, 4.1, STATION.z + 0.4], [STATION.w, 0.06, 0.5]);
for (let x = -13; x <= 13; x += 6.5) add("silver", [x, 2.5, STATION.z - 0.8], [0.25, 3.6, 0.25]);

// ---------------------------------------------------------------- lamps

export const lamps: [number, number, number][] = [];
{
  const tmp = new THREE.Vector3();
  const tan = new THREE.Vector3();
  for (const [k, c] of TRACKS.entries()) {
    for (let u = 0.02; u < 1; u += 0.028) {
      c.getPointAt(u, tmp);
      c.getTangentAt(u, tan);
      const side = k === 0 ? -2.4 : 2.4;
      if (k === 0 && Math.abs(tmp.x) < 17) continue;
      lamps.push([tmp.x - tan.z * side, 0, tmp.z + tan.x * side]);
    }
  }
  // Street lights along the road.
  for (let x = -200; x <= 200; x += 16) {
    if (Math.abs(x) < 18) continue;
    lamps.push([x, 0, ROAD.z - ROAD.w / 2 - 1]);
  }
}

// ---------------------------------------------------------------- trees and hedges

function free(x: number, z: number) {
  if (nearTrack(x, z, 5.5)) return false;
  if (Math.abs(z - ROAD.z) < ROAD.w / 2 + 1.2) return false;
  if (Math.abs(x) < 23 && z > -20 && z < 21) return false;
  return !footprints.some(([x0, z0, x1, z1]) => x > x0 && x < x1 && z > z0 && z < z1);
}

export const trees: Tree[] = [];
{
  const r = rng(9);
  const tryAdd = (x: number, z: number, s = 1, kind?: TreeKind) => {
    if (!free(x, z)) return;
    trees.push({ x, z, s: s * (0.8 + r() * 0.45), r: r() * Math.PI * 2, kind: kind ?? (r() < 0.22 ? 1 : 0), tint: r() });
  };
  // Avenues along the road and the campus walk.
  for (let x = -110; x < 120; x += 6.5) {
    tryAdd(x + r() * 1.5, ROAD.z - ROAD.w / 2 - 3, 1, 0);
    tryAdd(x + r() * 1.5, ROAD.z + ROAD.w / 2 + 2.6, 0.9, 0);
  }
  // Cypress rows framing the hub.
  for (let z = -20; z <= 0; z += 4) {
    trees.push({ x: -22.5, z, s: 1, r: 0, kind: 1, tint: r() });
    trees.push({ x: 22.5, z, s: 1, r: 0, kind: 1, tint: r() });
  }
  for (let i = 0; i < 110; i++) tryAdd(-115 + r() * 92, -66 + r() * 66, 0.95);
  for (let i = 0; i < 50; i++) tryAdd(24 + r() * 96, -66 + r() * 74, 0.9);
  for (let i = 0; i < 36; i++) tryAdd(-25 + r() * 120, 34 + r() * 26, 1.1);
  for (let i = 0; i < 14; i++) tryAdd(-120 + r() * 90, 34 + r() * 26, 1.15);
}

/** Low hedges: along the forecourt, the walkways and the foreground plazas. */
export const hedges: [number, number, number, number][] = []; // x, z, length, rotation
{
  for (const sx of [-1, 1]) hedges.push([sx * 19, 6, 6, Math.PI / 2], [sx * 12.5, 0.8, 9, 0]);
  for (let x = -54; x < 10; x += 10) hedges.push([x, 47.6, 7, 0]);
  for (let x = 52; x < 92; x += 10) hedges.push([x, 47.6, 7, 0]);
}

// ---------------------------------------------------------------- walkers

/**
 * Footpaths for the little people. Each is a polyline; walkers go back and
 * forth along it. Most head between the station and the hub, across the
 * zebra crossings, and along the campus walkway towards the hub.
 */
export const WALKS: [number, number][][] = [
  [[-8, 18.6], [-8, 7], [-4, 2], [0, 1.6]],
  [[8, 18.6], [8, 7], [4, 2], [0, 1.6]],
  [[-100, 6.5], [-60, 6.5], [-30, 6.5], [-18, 5], [-6, 2]],
  [[-46, -16], [-46, -4], [-46, 5.5], [-30, 6.5]],
  [[-90, -18], [-56, -18], [-24, -18]],
  [[18, 4], [26, 6.2], [60, 6.2], [100, 6.2]],
  [[-60, 44], [-20, 44], [10, 44]],
  [[50, 44], [92, 44]],
  [[-17, 5.6], [17, 5.6]],
];

export { boxes, towers };
