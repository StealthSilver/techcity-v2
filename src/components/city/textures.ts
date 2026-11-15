import * as THREE from "three";
import { BRAND, rng } from "./palette";

/**
 * Canvas-generated textures for the city: light-glass facades, the hub's
 * lobby glazing, the TechCity mark, and soft cloud shadows. Drawn once on
 * load, no image files involved.
 */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function toTexture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Pale blue glass tones, light to deeper. All from the brand mist → lavender range. */
const PANE_TOP = ["#EEF1FE", "#E4E8FD", "#DCE2FC"];
const PANE_BOTTOM = ["#C9D2FA", "#BCC6F6", "#AEBAF2"];

/**
 * Curtain-wall facade: pale blue panes in white frames, a few warm lit
 * windows. Returns a colour map and an emissive map (lit windows only).
 * One tile = `cols` x `rows` windows; meshes repeat it to match their size.
 */
export function makeFacade(seed: number, { cols = 8, rows = 8, lit = 0.08, fins = false } = {}) {
  const S = 256;
  const [c, x] = canvas(S, S);
  const [e, y] = canvas(S, S);
  const r = rng(seed);
  const cw = S / cols;
  const rh = S / rows;

  x.fillStyle = "#FBFCFF"; // frames
  x.fillRect(0, 0, S, S);
  y.fillStyle = "#000";
  y.fillRect(0, 0, S, S);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const px = i * cw + 2;
      const py = j * rh + 3;
      const w = cw - 4;
      const h = rh - 7;
      if (r() < lit) {
        x.fillStyle = r() < 0.5 ? "#FFE7B8" : "#FFF1D6";
        x.fillRect(px, py, w, h);
        y.fillStyle = r() < 0.5 ? "#C98A2E" : "#8A6A3C";
        y.fillRect(px, py, w, h);
      } else {
        const k = Math.floor(r() * 3);
        const g = x.createLinearGradient(px, py, px + w * 0.4, py + h);
        g.addColorStop(0, PANE_TOP[k]);
        g.addColorStop(1, PANE_BOTTOM[k]);
        x.fillStyle = g;
        x.fillRect(px, py, w, h);
        // A soft diagonal reflection on some panes.
        if (r() < 0.35) {
          x.fillStyle = "rgba(255,255,255,0.35)";
          x.beginPath();
          x.moveTo(px, py + h * 0.6);
          x.lineTo(px + w * 0.5, py);
          x.lineTo(px + w * 0.8, py);
          x.lineTo(px, py + h);
          x.fill();
        }
      }
    }
    // Floor slab line: a slightly stronger white band every row.
  }
  x.fillStyle = "rgba(255,255,255,0.9)";
  for (let j = 0; j < rows; j++) x.fillRect(0, j * rh, S, 3);
  if (fins) {
    x.fillStyle = "#FFFFFF";
    for (let i = 0; i < cols; i++) x.fillRect(i * cw - 2, 0, 4, S);
  }
  return { map: toTexture(c), emissiveMap: toTexture(e) };
}

/** Hub lobby: tall warm-lit glazing in white frames, with a mezzanine line and visitors. */
export function makeLobby() {
  const W = 512;
  const H = 192;
  const [c, x] = canvas(W, H);
  const [e, y] = canvas(W, H);
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#FFF6E6");
  g.addColorStop(1, "#FFE2AE");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  const ge = y.createLinearGradient(0, 0, 0, H);
  ge.addColorStop(0, "#3A2C18");
  ge.addColorStop(1, "#8A6431");
  y.fillStyle = ge;
  y.fillRect(0, 0, W, H);

  for (const ctx of [x, y]) {
    ctx.fillStyle = ctx === x ? "#FFFFFF" : "#000";
    for (let i = 0; i <= 24; i++) ctx.fillRect((i * W) / 24 - 2, 0, 4, H);
    ctx.fillRect(0, H * 0.42, W, 7);
    ctx.fillRect(0, 0, W, 6);
  }
  const r = rng(7);
  const coats = ["#6B7BE6", "#A5B1F5", "#F59E0B", "#7E8AA8", "#3B47C4"];
  for (let i = 0; i < 30; i++) {
    const px = r() * W;
    const onTop = r() < 0.35;
    const base = onTop ? H * 0.42 : H;
    const h = onTop ? 20 : 28;
    x.fillStyle = coats[Math.floor(r() * coats.length)];
    x.fillRect(px, base - h, 5, h);
    x.fillStyle = "#8C7A6B";
    x.beginPath();
    x.arc(px + 2.5, base - h - 4, 3.2, 0, Math.PI * 2);
    x.fill();
  }
  return { map: toTexture(c), emissiveMap: toTexture(e) };
}

/** The TechCity mark (three buildings), traced from public/min-logo-light.png. */
const MARK: [number, number][][] = [
  [[372, 658], [590, 508], [590, 826], [530, 826], [530, 628], [432, 692], [432, 826], [372, 826]],
  [[631, 256], [818, 377], [818, 530], [760, 492], [760, 414], [692, 374], [692, 826], [631, 826]],
  [[738, 535], [940, 661], [940, 826], [881, 826], [881, 697], [800, 648], [800, 826], [738, 826]],
];

export function makeMark(color: string = BRAND.amber) {
  const S = 512;
  const [c, x] = canvas(S, S);
  const s = (S * 0.9) / 570;
  const ox = (S - 568 * s) / 2 - 372 * s;
  const oy = (S - 570 * s) / 2 - 256 * s;
  x.fillStyle = color;
  for (const poly of MARK) {
    x.beginPath();
    poly.forEach(([px, py], i) => (i ? x.lineTo(px * s + ox, py * s + oy) : x.moveTo(px * s + ox, py * s + oy)));
    x.closePath();
    x.fill();
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** Soft blotches for drifting cloud shadows. Alpha only; tiles seamlessly. */
export function makeClouds() {
  const S = 512;
  const [c, x] = canvas(S, S);
  const r = rng(21);
  for (let i = 0; i < 14; i++) {
    const cx = r() * S;
    const cy = r() * S;
    const rad = 50 + r() * 110;
    // Draw each blob with wrap-around copies so the texture tiles.
    for (const dx of [-S, 0, S])
      for (const dy of [-S, 0, S]) {
        const g = x.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, rad);
        g.addColorStop(0, "rgba(255,255,255,0.55)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = g;
        x.fillRect(0, 0, S, S);
      }
  }
  const t = toTexture(c, false);
  return t;
}
