"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { BRAND, rng } from "./palette";
import {
  CAMPUS, DATACENTER, FACTORY, HUB, LOGO_TOWER, ROAD, TRACKS, WALKS,
  boxes, hedges, lamps, towers, trees, type MatKey,
} from "./layout";
import { makeClouds, makeFacade, makeLobby, makeMark } from "./textures";

/* ------------------------------------------------------------------ materials */

export function useMaterials() {
  return useMemo(() => {
    const glow = (c: string, k: number) =>
      new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, toneMapped: false });
    const std = (color: string, roughness: number, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    const m: Record<MatKey, THREE.MeshStandardMaterial> = {
      white: std("#FBFCFF", 0.78),
      stone: std("#E6EAF3", 0.85),
      glass: std("#B9C4F6", 0.1, 0.35, { envMapIntensity: 1.4 }),
      silver: std("#D3D9E8", 0.4, 0.5),
      amber: glow(BRAND.amber, 2.4),
      honey: glow(BRAND.honey, 1.6),
      pave: std("#F3F5FA", 0.5),
      road: std("#E2E6EF", 0.65),
      line: std("#FFFFFF", 0.6),
      grass: std("#D5EAD8", 0.95),
      garden: std("#B9DCBF", 0.95),
      hedge: std("#94C7A2", 0.9, 0, { flatShading: true }),
      solar: std("#C3CDF6", 0.15, 0.6),
      water: std("#D9E5FA", 0.04, 0.85, { envMapIntensity: 1.8 }),
    };
    return m;
  }, []);
}

type Mats = ReturnType<typeof useMaterials>;

/* ------------------------------------------------------------------ instanced boxes */

const unitBox = new THREE.BoxGeometry(1, 1, 1);

/** Every plain box in the city, one draw call per material. */
export function Boxes({ mats }: { mats: Mats }) {
  const groups = useMemo(() => {
    const g = new Map<MatKey, typeof boxes>();
    for (const b of boxes) g.set(b.m, [...(g.get(b.m) ?? []), b]);
    return [...g.entries()];
  }, []);
  return (
    <>
      {groups.map(([key, list]) => (
        <BoxGroup
          key={key}
          list={list}
          material={mats[key]}
          cast={!["amber", "honey", "pave", "road", "line", "grass", "water"].includes(key)}
          receive={!["amber", "honey"].includes(key)}
        />
      ))}
    </>
  );
}

function BoxGroup({ list, material, cast, receive }: { list: typeof boxes; material: THREE.Material; cast: boolean; receive: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    list.forEach((b, i) => {
      o.position.set(...b.p);
      o.scale.set(...b.s);
      o.rotation.set(0, b.r ?? 0, 0);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [list]);
  return <instancedMesh ref={ref} args={[unitBox, material, list.length]} castShadow={cast} receiveShadow={receive} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ towers */

/** Light-glass towers. Four facade variants, tiled to each tower's size. */
export function Towers() {
  const variants = useMemo(
    () => [0, 1, 2, 3].map((v) => makeFacade(300 + v, { lit: 0.05 + v * 0.025, fins: v % 2 === 1 })),
    [],
  );
  const items = useMemo(
    () =>
      towers.map((t) => {
        const v = variants[(t.seed % 2) * 2 + (t.fins ? 1 : 0)];
        const map = v.map.clone();
        const em = v.emissiveMap.clone();
        const rx = Math.max(0.5, t.w / (2.2 * 8));
        const ry = t.h / (3.4 * 8);
        map.repeat.set(rx, ry);
        em.repeat.set(rx, ry);
        const mat = new THREE.MeshStandardMaterial({
          map,
          emissiveMap: em,
          emissive: "#ffffff",
          emissiveIntensity: 1,
          metalness: 0.25,
          roughness: 0.12,
          envMapIntensity: 1.2,
        });
        return { t, mat };
      }),
    [variants],
  );
  return (
    <>
      {items.map(({ t, mat }, i) => (
        <mesh key={i} position={[t.x, t.y + t.h / 2, t.z]} material={mat} castShadow receiveShadow>
          <boxGeometry args={[t.w, t.h, t.d]} />
        </mesh>
      ))}
    </>
  );
}

/** The TechCity mark on the tallest tower: the navy mark (same as the navbar logo) on a white plate. */
export function TowerMark({ mats }: { mats: Mats }) {
  const mark = useMemo(() => makeMark(BRAND.navy), []);
  const { x, z, d, markY, markSize } = LOGO_TOWER;
  const front = z + d / 2;
  return (
    <group position={[x, markY, front]}>
      <mesh position={[0, 0, 0.12]} material={mats.white} castShadow>
        <boxGeometry args={[markSize + 1.4, markSize + 1.4, 0.24]} />
      </mesh>
      <mesh position={[0, 0, 0.26]}>
        <planeGeometry args={[markSize, markSize]} />
        {/* Unlit, so the navy reads exactly as in the navbar regardless of the scene lighting. */}
        <meshBasicMaterial map={mark} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, -(markSize + 1.4) / 2 - 0.1, 0.3]} material={mats.amber}>
        <boxGeometry args={[markSize + 1.4, 0.12, 0.12]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ hub */

function vaultGeometry(length: number, chord: number, radius: number, thickness: number) {
  const a = Math.asin(chord / 2 / radius);
  const base = radius * Math.cos(a);
  const s = new THREE.Shape();
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const p = -a + (2 * a * i) / steps;
    const px = radius * Math.sin(p);
    const py = radius * Math.cos(p) - base;
    if (i === 0) s.moveTo(px, py);
    else s.lineTo(px, py);
  }
  for (let i = steps; i >= 0; i--) {
    const p = -a + (2 * a * i) / steps;
    s.lineTo(radius * Math.sin(p), (radius - thickness) * Math.cos(p) - base);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, -length / 2);
  g.rotateY(Math.PI / 2);
  return g;
}

/** The hub: a light-glass hall under a white vault, with a warm lobby. */
export function Hub({ mats }: { mats: Mats }) {
  const { w, d, h, x, z } = HUB;
  const lobby = useMemo(() => makeLobby(), []);
  const upper = useMemo(() => makeFacade(77, { cols: 16, rows: 4, lit: 0.04, fins: true }), []);
  const vault = useMemo(() => vaultGeometry(w + 10, d + 8, 26, 0.7), [w, d]);
  const lobbyH = h * 0.42;
  const front = d / 2 + 0.06;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.4, 0]} material={mats.white} receiveShadow castShadow>
        <boxGeometry args={[w + 8, 0.8, d + 7]} />
      </mesh>
      <mesh position={[0, 0.2, d / 2 + 5]} material={mats.stone} receiveShadow>
        <boxGeometry args={[w * 0.6, 0.4, 3]} />
      </mesh>
      <mesh position={[0, 0.8 + h / 2, 0]} material={mats.glass} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh position={[0, 0.8 + lobbyH / 2, front]}>
        <planeGeometry args={[w - 0.4, lobbyH]} />
        <meshStandardMaterial map={lobby.map} emissiveMap={lobby.emissiveMap} emissive="#ffffff" emissiveIntensity={1} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8 + lobbyH + (h - lobbyH) / 2, front]}>
        <planeGeometry args={[w - 0.4, h - lobbyH]} />
        <meshStandardMaterial map={upper.map} emissiveMap={upper.emissiveMap} emissive="#ffffff" emissiveIntensity={1} metalness={0.25} roughness={0.12} envMapIntensity={1.2} />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[(sx * w) / 2, 0.8 + (h + 0.6) / 2, 0]} material={mats.white} castShadow receiveShadow>
          <boxGeometry args={[1.6, h + 0.6, d + 0.6]} />
        </mesh>
      ))}
      <mesh geometry={vault} position={[0, 0.8 + h + 0.25, 0]} material={mats.white} castShadow receiveShadow />
      <mesh position={[0, 0.8 + h + 0.15, d / 2 + 3.6]} material={mats.amber}>
        <boxGeometry args={[w + 9, 0.12, 0.2]} />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (w / 2 + 4.6), 0.8 + (h + 0.4) / 2, d / 2 + 3.4]} material={mats.white} castShadow>
          <boxGeometry args={[0.5, h + 0.4, 0.5]} />
        </mesh>
      ))}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * (w / 2 + 6.5), 0.8, -1]}>
          <mesh position={[0, 2.6, 0]} material={mats.white} castShadow receiveShadow>
            <boxGeometry args={[9, 5.2, d - 3]} />
          </mesh>
          <mesh position={[0, 2.4, 0]} material={mats.glass}>
            <boxGeometry args={[9.1, 1.4, d - 2.9]} />
          </mesh>
          <mesh position={[0, 5.35, 0]} material={mats.garden}>
            <boxGeometry args={[8, 0.2, d - 4]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ campus */

/** A small stadium with a lit rim and four floodlights. */
export function Arena({ mats }: { mats: Mats }) {
  const { x, z, r } = CAMPUS.arena;
  const bowl = useMemo(() => {
    const ri = r - 3.6;
    const pts = [[ri, 0], [ri, 0.6], [r - 0.8, 4.2], [r, 4.4], [r, 0]].map(([a, b]) => new THREE.Vector2(a, b));
    return new THREE.LatheGeometry(pts, 64);
  }, [r]);
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={bowl} castShadow receiveShadow>
        <meshStandardMaterial color="#FBFCFF" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[r - 3.6, 48]} />
        <meshStandardMaterial color="#A9D6B2" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[r - 5.2, r - 4.6, 64]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      <mesh position={[0, 4.45, 0]} rotation-x={-Math.PI / 2} material={mats.amber}>
        <torusGeometry args={[r - 0.4, 0.08, 6, 96]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        return (
          <group key={i} position={[Math.cos(a) * (r + 1), 0, Math.sin(a) * (r + 1)]}>
            <mesh position={[0, 5, 0]} material={mats.silver} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 10, 6]} />
            </mesh>
            <mesh position={[0, 10.1, 0]} material={mats.white}>
              <boxGeometry args={[1.4, 0.5, 0.5]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** The library: a colonnade under a deep roof slab. */
export function Library({ mats }: { mats: Mats }) {
  const { x, z, w, d, h } = CAMPUS.library;
  const face = useMemo(() => makeFacade(55, { cols: 12, rows: 3, lit: 0.18 }), []);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.4, 1.2]} material={mats.white} receiveShadow castShadow>
        <boxGeometry args={[w + 3, 0.8, d + 4]} />
      </mesh>
      <mesh position={[0, h / 2, 0]} material={mats.white} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh position={[0, 0.8 + (h - 2) / 2, d / 2 + 0.05]}>
        <planeGeometry args={[w - 1.5, h - 2]} />
        <meshStandardMaterial map={face.map} emissiveMap={face.emissiveMap} emissive="#ffffff" emissiveIntensity={1} metalness={0.2} roughness={0.15} />
      </mesh>
      <mesh position={[0, h + 0.35, 1.4]} material={mats.white} castShadow receiveShadow>
        <boxGeometry args={[w + 2.4, 0.7, d + 3.4]} />
      </mesh>
      <mesh position={[0, h + 0.8, 0.6]} material={mats.garden}>
        <boxGeometry args={[w, 0.2, d]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-w / 2 + 0.6 + (i * (w - 1.2)) / 7, 0.8 + (h - 0.8) / 2, d / 2 + 2.6]} material={mats.white} castShadow>
          <cylinderGeometry args={[0.32, 0.32, h - 0.8, 12]} />
        </mesh>
      ))}
    </group>
  );
}

/** A long, low classroom block with solar panels on the roof. */
export function Classroom({ mats }: { mats: Mats }) {
  const { x, z, w, d, h } = CAMPUS.classroom;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} material={mats.white} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      {[1.6, 4.6].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={mats.glass}>
          <boxGeometry args={[w + 0.08, 1.7, d + 0.08]} />
        </mesh>
      ))}
      <mesh position={[w * 0.2, 1.4, d / 2 + 0.07]} material={mats.honey}>
        <boxGeometry args={[3, 2.6, 0.06]} />
      </mesh>
      <mesh position={[w * 0.2, 3.1, d / 2 + 1.1]} material={mats.white} castShadow>
        <boxGeometry args={[4.4, 0.3, 2.2]} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-w / 2 + 2 + i * 3, h + 0.6, 0]} rotation-x={-0.35} material={mats.solar} castShadow>
          <boxGeometry args={[2.6, 0.1, d * 0.7]} />
        </mesh>
      ))}
      <mesh position={[-w / 2 - 0.08, h * 0.5, d / 2 + 0.08]} material={mats.amber}>
        <boxGeometry args={[0.25, h * 0.85, 0.25]} />
      </mesh>
    </group>
  );
}

/** A glass practice hall framed in white, amber edges. */
export function Gym({ mats }: { mats: Mats }) {
  const { x, z, w, d, h } = CAMPUS.gym;
  const face = useMemo(() => makeFacade(91, { cols: 6, rows: 4, lit: 0.22 }), []);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial map={face.map} emissiveMap={face.emissiveMap} emissive="#ffffff" emissiveIntensity={1} metalness={0.25} roughness={0.12} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[0, h + 0.3, 0]} material={mats.white} castShadow>
        <boxGeometry args={[w + 0.8, 0.6, d + 0.8]} />
      </mesh>
      <mesh position={[0, 0.3, 0]} material={mats.white}>
        <boxGeometry args={[w + 0.8, 0.6, d + 0.8]} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} position={[(sx * (w + 0.5)) / 2, h / 2, (sz * (d + 0.5)) / 2]} material={mats.amber}>
          <boxGeometry args={[0.2, h - 0.6, 0.2]} />
        </mesh>
      ))}
    </group>
  );
}

/** The campus gateway over the walkway. */
export function Gateway({ mats }: { mats: Mats }) {
  const { x, z } = CAMPUS.gate;
  return (
    <group position={[x, 0, z]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 4.5, s * 3]} material={mats.white} castShadow>
          <boxGeometry args={[1.2, 9, 1.2]} />
        </mesh>
      ))}
      <mesh position={[0, 9.6, 0]} material={mats.white} castShadow>
        <boxGeometry args={[1.6, 1.6, 7.8]} />
      </mesh>
      <mesh position={[0, 8.74, 0]} material={mats.amber}>
        <boxGeometry args={[0.3, 0.12, 5.8]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ industry */

export function Factory({ mats }: { mats: Mats }) {
  const { x, z, w, d, h, teeth } = FACTORY;
  const tooth = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(w / teeth, 0);
    s.lineTo(w / teeth, 2.6);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
    g.translate(-w / teeth / 2, 0, -d / 2);
    return g;
  }, [w, d, teeth]);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} material={mats.white} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh position={[0, h * 0.55, 0]} material={mats.glass}>
        <boxGeometry args={[w + 0.08, 1.3, d + 0.08]} />
      </mesh>
      {Array.from({ length: teeth }, (_, i) => (
        <group key={i} position={[-w / 2 + (w / teeth) * (i + 0.5), h, 0]}>
          <mesh geometry={tooth} material={mats.stone} castShadow receiveShadow />
          <mesh position={[w / teeth / 2 - 0.05, 1.3, 0]} material={mats.glass}>
            <boxGeometry args={[0.08, 2.2, d - 0.6]} />
          </mesh>
        </group>
      ))}
      {[0, 1].map((i) => (
        <group key={i} position={[w / 2 - 3 - i * 4, 0, -d / 2 + 2]}>
          <mesh position={[0, h + 7, 0]} material={mats.white} castShadow>
            <cylinderGeometry args={[0.9, 1.1, 14, 20]} />
          </mesh>
          <mesh position={[0, h + 12, 0]} material={mats.amber}>
            <cylinderGeometry args={[0.95, 0.95, 0.22, 20]} />
          </mesh>
        </group>
      ))}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 6, 1.6, d / 2 + 0.06]} material={mats.honey}>
          <boxGeometry args={[3.2, 3.2, 0.06]} />
        </mesh>
      ))}
    </group>
  );
}

export function DataCentre({ mats }: { mats: Mats }) {
  const { x, z, w, d, h } = DATACENTER;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} material={mats.white} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      {[1.2, 2.6, 4].map((y) => (
        <mesh key={y} position={[0, y, d / 2 + 0.04]} material={mats.glass}>
          <boxGeometry args={[w - 1, 0.5, 0.04]} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-w / 2 + 1.5 + (i % 3) * 4.5, h + 0.5, i < 3 ? -1.8 : 1.8]} material={mats.silver} castShadow>
          <cylinderGeometry args={[1.1, 1.1, 1, 20]} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ track, pulses, trams */

function ribbon(curve: THREE.Curve<THREE.Vector3>, width: number, offset: number, y: number, segments = 400) {
  const pos: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    curve.getPointAt(u, p);
    curve.getTangentAt(u, t);
    for (const s of [-1, 1]) {
      const o = offset + (s * width) / 2;
      pos.push(p.x - t.z * o, y, p.z + t.x * o);
    }
    if (i < segments) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const lightSide = (k: number) => (k === 0 ? -2 : 2);

export function Tracks() {
  const parts = useMemo(
    () =>
      TRACKS.map((c, k) => ({
        bed: ribbon(c, 3.6, 0, 0.14),
        sleepers: ribbon(c, 2.6, 0, 0.16),
        rails: [ribbon(c, 0.16, -0.72, 0.22), ribbon(c, 0.16, 0.72, 0.22)],
        light: ribbon(c, 0.14, lightSide(k), 0.17),
      })),
    [],
  );
  return (
    <>
      {parts.map((p, k) => (
        <group key={k}>
          <mesh geometry={p.bed} receiveShadow>
            <meshStandardMaterial color="#E4E8F1" roughness={0.6} />
          </mesh>
          <mesh geometry={p.sleepers} receiveShadow>
            <meshStandardMaterial color="#D6DCE8" roughness={0.8} />
          </mesh>
          {p.rails.map((g, i) => (
            <mesh key={i} geometry={g}>
              <meshStandardMaterial color="#AEB6CA" metalness={0.8} roughness={0.25} />
            </mesh>
          ))}
          <mesh geometry={p.light}>
            <meshStandardMaterial color={BRAND.honey} emissive={BRAND.honey} emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Amber light pulses running along the tracks' light strips. */
export function TrackPulses({ mats, still }: { mats: Mats; still: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const per = 14;
  const lengths = useMemo(() => TRACKS.map((c) => c.getLength()), []);
  const geo = useMemo(() => new THREE.BoxGeometry(2.2, 0.08, 0.2), []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const t = useMemo(() => new THREE.Vector3(), []);

  const place = (time: number) => {
    TRACKS.forEach((c, k) => {
      for (let i = 0; i < per; i++) {
        const u = (((i / per + (time * 16) / lengths[k]) % 1) + 1) % 1;
        c.getPointAt(u, p);
        c.getTangentAt(u, t);
        const off = lightSide(k);
        o.position.set(p.x - t.z * off, 0.2, p.z + t.x * off);
        o.rotation.set(0, Math.atan2(-t.z, t.x), 0);
        o.updateMatrix();
        ref.current!.setMatrixAt(k * per + i, o.matrix);
      }
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => place(0));
  useFrame((s) => {
    if (!still) place(s.clock.elapsedTime);
  });
  return <instancedMesh ref={ref} args={[geo, mats.amber, per * TRACKS.length]} frustumCulled={false} />;
}

const CAR = 9;
const GAP = 0.5;

function Car({ mats, lead }: { mats: Mats; lead: boolean }) {
  return (
    <group>
      <RoundedBox args={[CAR, 2.7, 2.4]} radius={0.5} smoothness={3} position={[0, 1.85, 0]} material={mats.white} castShadow />
      <mesh position={[0, 0.45, 0]} material={mats.silver}>
        <boxGeometry args={[CAR - 0.6, 0.4, 2]} />
      </mesh>
      <mesh position={[0, 2.25, 0]} material={mats.glass}>
        <boxGeometry args={[CAR - 0.9, 0.95, 2.46]} />
      </mesh>
      {[-2.3, 2.3].map((dx) => (
        <mesh key={dx} position={[dx, 1.75, 0]} material={mats.amber}>
          <boxGeometry args={[1, 1.9, 2.47]} />
        </mesh>
      ))}
      <mesh position={[0, 3.3, 0]} material={mats.stone}>
        <boxGeometry args={[3.2, 0.35, 1.4]} />
      </mesh>
      <mesh position={[1.5, 4.2, 0]} rotation-z={0.5} material={mats.silver}>
        <boxGeometry args={[2.4, 0.06, 0.06]} />
      </mesh>
      {lead && (
        <>
          <mesh position={[CAR / 2 - 0.05, 2.3, 0]} material={mats.glass}>
            <boxGeometry args={[0.3, 1.1, 2]} />
          </mesh>
          {[-0.75, 0.75].map((dz) => (
            <mesh key={dz} position={[CAR / 2 + 0.02, 1.05, dz]} material={mats.honey}>
              <boxGeometry args={[0.12, 0.2, 0.45]} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

/** A three-car tram that bends through curves and slows past the station. */
export function Tram({ mats, track, start, dir, still }: { mats: Mats; track: number; start: number; dir: 1 | -1; still: boolean }) {
  const cars = useRef<(THREE.Group | null)[]>([]);
  const curve = TRACKS[track];
  const length = useMemo(() => curve.getLength(), [curve]);
  const s = useRef(start * length);
  const p = useMemo(() => new THREE.Vector3(), []);
  const t = useMemo(() => new THREE.Vector3(), []);

  const place = () => {
    cars.current.forEach((g, i) => {
      if (!g) return;
      let d = s.current - dir * i * (CAR + GAP);
      d = ((d % length) + length) % length;
      const u = d / length;
      curve.getPointAt(u, p);
      curve.getTangentAt(u, t);
      g.position.set(p.x, 0, p.z);
      g.rotation.y = Math.atan2(-t.z * dir, t.x * dir);
    });
  };
  useLayoutEffect(place);
  useFrame((_, dt) => {
    if (still) return;
    curve.getPointAt((((s.current % length) + length) % length) / length, p);
    const slow = THREE.MathUtils.smoothstep(Math.abs(p.x), 4, 24);
    s.current += dir * 11 * (0.3 + 0.7 * slow) * Math.min(dt, 0.05);
    place();
  });
  return (
    <>
      {[0, 1, 2].map((i) => (
        <group key={i} ref={(g) => void (cars.current[i] = g)}>
          <Car mats={mats} lead={i === 0} />
        </group>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ trees, hedges */

/** Round tree: a trunk-less crown made of four overlapping clumps. Origin at the ground. */
function roundCrown() {
  const parts = [
    [0, 3.4, 0, 1.55],
    [0.9, 2.9, 0.4, 1.15],
    [-0.8, 3.0, -0.3, 1.2],
    [0.1, 4.4, -0.2, 1.05],
    [-0.3, 2.8, 0.9, 1.0],
  ].map(([x, y, z, r]) => {
    const g = new THREE.IcosahedronGeometry(r, 1);
    g.translate(x, y, z);
    return g;
  });
  return mergeGeometries(parts)!;
}

function cypressCrown() {
  const a = new THREE.IcosahedronGeometry(1, 2);
  a.scale(0.95, 3.1, 0.95);
  a.translate(0, 4.4, 0);
  const b = new THREE.IcosahedronGeometry(0.8, 1);
  b.translate(0, 2.2, 0);
  return mergeGeometries([a, b])!;
}

const GREENS = ["#86BF98", "#9ACCA4", "#78B38E", "#A8D3AC", "#8FC5A0"].map((c) => new THREE.Color(c));

/**
 * Trees in two kinds (round and cypress), each tinted from a soft green
 * palette, swaying gently from their base.
 */
export function Trees({ still }: { still: boolean }) {
  const kinds = useMemo(
    () => [0, 1].map((k) => trees.filter((t) => t.kind === k)),
    [],
  );
  const geo = useMemo(
    () => ({
      crowns: [roundCrown(), cypressCrown()],
      trunks: [new THREE.CylinderGeometry(0.16, 0.24, 2.6, 6).translate(0, 1.3, 0), new THREE.CylinderGeometry(0.14, 0.2, 1.6, 6).translate(0, 0.8, 0)],
    }),
    [],
  );
  const leaf = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.92, flatShading: true }), []);
  const bark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#B4A596", roughness: 1 }), []);
  const crowns = useRef<(THREE.InstancedMesh | null)[]>([]);
  const trunks = useRef<(THREE.InstancedMesh | null)[]>([]);
  const o = useMemo(() => new THREE.Object3D(), []);

  const place = (time: number) => {
    kinds.forEach((list, k) => {
      const c = crowns.current[k];
      const t = trunks.current[k];
      if (!c || !t) return;
      list.forEach((tr, i) => {
        const sway = still ? 0 : Math.sin(time * 0.9 + tr.x * 0.21 + tr.z * 0.17) * 0.025;
        o.position.set(tr.x, 0, tr.z);
        o.rotation.set(sway, tr.r, sway * 0.6);
        o.scale.setScalar(tr.s);
        o.updateMatrix();
        c.setMatrixAt(i, o.matrix);
        t.setMatrixAt(i, o.matrix);
      });
      c.instanceMatrix.needsUpdate = true;
      t.instanceMatrix.needsUpdate = true;
    });
  };

  useLayoutEffect(() => {
    kinds.forEach((list, k) => {
      list.forEach((tr, i) => crowns.current[k]!.setColorAt(i, GREENS[Math.floor(tr.tint * GREENS.length)]));
      crowns.current[k]!.instanceColor!.needsUpdate = true;
    });
    place(0);
  });
  useFrame((s) => {
    if (!still) place(s.clock.elapsedTime);
  });

  return (
    <>
      {kinds.map((list, k) => (
        <group key={k}>
          <instancedMesh ref={(m) => void (crowns.current[k] = m)} args={[geo.crowns[k], leaf, list.length]} castShadow receiveShadow frustumCulled={false} />
          <instancedMesh ref={(m) => void (trunks.current[k] = m)} args={[geo.trunks[k], bark, list.length]} castShadow frustumCulled={false} />
        </group>
      ))}
    </>
  );
}

export function Hedges({ mats }: { mats: Mats }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.35), []);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    hedges.forEach(([x, z, len, r], i) => {
      o.position.set(x, 0.55, z);
      o.rotation.set(0, r, 0);
      o.scale.set(len, 1.1, 1.3);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={ref} args={[geo, mats.hedge, hedges.length]} castShadow receiveShadow frustumCulled={false} />;
}

/* ------------------------------------------------------------------ lamps */

export function Lamps({ mats }: { mats: Mats }) {
  const pole = useRef<THREE.InstancedMesh>(null);
  const head = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => ({ pole: new THREE.CylinderGeometry(0.07, 0.09, 5, 6), head: new THREE.BoxGeometry(0.35, 0.16, 1) }), []);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    lamps.forEach(([x, , z], i) => {
      o.position.set(x, 2.5, z);
      o.updateMatrix();
      pole.current!.setMatrixAt(i, o.matrix);
      o.position.set(x, 5, z);
      o.updateMatrix();
      head.current!.setMatrixAt(i, o.matrix);
    });
    pole.current!.instanceMatrix.needsUpdate = true;
    head.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <>
      <instancedMesh ref={pole} args={[geo.pole, mats.silver, lamps.length]} castShadow frustumCulled={false} />
      <instancedMesh ref={head} args={[geo.head, mats.honey, lamps.length]} frustumCulled={false} />
    </>
  );
}

/* ------------------------------------------------------------------ people */

const COATS = ["#FFFFFF", "#A5B1F5", "#6B7BE6", "#F59E0B", "#E4E8FD", "#9ACCA4", "#FCD38A", "#C9D0E2"].map((c) => new THREE.Color(c));

type Walker = { path: number; d: number; speed: number; side: number; coat: number };

function pathInfo(pts: [number, number][]) {
  const segs = pts.slice(1).map((p, i) => {
    const a = pts[i];
    return { a, b: p, len: Math.hypot(p[0] - a[0], p[1] - a[1]) };
  });
  return { segs, total: segs.reduce((s, x) => s + x.len, 0) };
}

/** Tiny people walking the footpaths, mostly between the station, the campus and the hub. */
export function Walkers({ still }: { still: boolean }) {
  const paths = useMemo(() => WALKS.map(pathInfo), []);
  const walkers = useMemo(() => {
    const r = rng(33);
    const list: Walker[] = [];
    paths.forEach((p, i) => {
      const n = Math.round(p.total / 5);
      for (let j = 0; j < n; j++)
        list.push({ path: i, d: r() * p.total * 2, speed: 1.1 + r() * 0.7, side: (r() - 0.5) * 1.6, coat: Math.floor(r() * COATS.length) });
    });
    return list;
  }, [paths]);
  const body = useRef<THREE.InstancedMesh>(null);
  const head = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => ({ body: new THREE.CapsuleGeometry(0.28, 0.85, 3, 8), head: new THREE.SphereGeometry(0.22, 10, 8) }), []);
  const mat = useMemo(() => ({ body: new THREE.MeshStandardMaterial({ roughness: 0.7 }), head: new THREE.MeshStandardMaterial({ color: "#C9A38A", roughness: 0.8 }) }), []);
  const o = useMemo(() => new THREE.Object3D(), []);

  const place = (time: number) => {
    walkers.forEach((w, i) => {
      const p = paths[w.path];
      // Ping-pong along the path; position is a pure function of time.
      const d = (w.d + w.speed * time) % (p.total * 2);
      const forward = d < p.total;
      let s = forward ? d : p.total * 2 - d;
      let seg = p.segs[0];
      for (const sg of p.segs) {
        seg = sg;
        if (s <= sg.len) break;
        s -= sg.len;
      }
      const f = seg.len ? Math.min(1, s / seg.len) : 0;
      const dx = (seg.b[0] - seg.a[0]) / (seg.len || 1);
      const dz = (seg.b[1] - seg.a[1]) / (seg.len || 1);
      // Walk on the right-hand side of the path, by direction.
      const side = forward ? w.side : -w.side;
      const x = seg.a[0] + (seg.b[0] - seg.a[0]) * f - dz * side;
      const z = seg.a[1] + (seg.b[1] - seg.a[1]) * f + dx * side;
      const bob = Math.abs(Math.sin(time * 7 * w.speed + i)) * 0.08;
      o.rotation.set(0, Math.atan2(forward ? dx : -dx, forward ? dz : -dz), 0);
      o.position.set(x, 0.72 + bob, z);
      o.updateMatrix();
      body.current!.setMatrixAt(i, o.matrix);
      o.position.set(x, 1.55 + bob, z);
      o.updateMatrix();
      head.current!.setMatrixAt(i, o.matrix);
    });
    body.current!.instanceMatrix.needsUpdate = true;
    head.current!.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    walkers.forEach((w, i) => body.current!.setColorAt(i, COATS[w.coat]));
    body.current!.instanceColor!.needsUpdate = true;
    place(0);
  });
  useFrame((s) => {
    if (!still) place(s.clock.elapsedTime);
  });

  return (
    <>
      <instancedMesh ref={body} args={[geo.body, mat.body, walkers.length]} castShadow frustumCulled={false} />
      <instancedMesh ref={head} args={[geo.head, mat.head, walkers.length]} castShadow frustumCulled={false} />
    </>
  );
}

/* ------------------------------------------------------------------ traffic */

const PAINT = ["#FFFFFF", "#E4E8FD", "#C9D0E2", "#A5B1F5", "#FFFFFF", "#F4F6FB", "#FCD38A"].map((c) => new THREE.Color(c));

type Vehicle = { lane: number; x: number; speed: number; paint: number; bus: boolean };

/** Small cars and a couple of buses on the city road, both directions. */
export function Traffic({ mats, still }: { mats: Mats; still: boolean }) {
  const vehicles = useMemo(() => {
    const r = rng(77);
    const list: Vehicle[] = [];
    for (let i = 0; i < 26; i++) {
      const lane = i % 2;
      list.push({ lane, x: -220 + r() * 440, speed: (lane ? -1 : 1) * (9 + r() * 5), paint: Math.floor(r() * PAINT.length), bus: i % 9 === 4 });
    }
    return list;
  }, []);
  const cars = useMemo(() => vehicles.filter((v) => !v.bus), [vehicles]);
  const buses = useMemo(() => vehicles.filter((v) => v.bus), [vehicles]);
  const geo = useMemo(
    () => ({
      car: new RoundedBoxGeometry(4.2, 1.2, 1.9, 2, 0.35),
      cabin: new RoundedBoxGeometry(2.3, 0.9, 1.7, 2, 0.3),
      bus: new RoundedBoxGeometry(10, 2.8, 2.4, 2, 0.45),
      busGlass: new THREE.BoxGeometry(9.2, 0.9, 2.44),
    }),
    [],
  );
  const paint = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.3 }), []);
  const refs = useRef<Record<string, THREE.InstancedMesh | null>>({});
  const o = useMemo(() => new THREE.Object3D(), []);

  const place = (time: number) => {
    // Position is a pure function of time, wrapped to the road's length.
    const xAt = (v: Vehicle) => ((((v.x + v.speed * time + 230) % 460) + 460) % 460) - 230;
    const put = (key: string, list: Vehicle[], y: number, dx = 0) => {
      const m = refs.current[key];
      if (!m) return;
      list.forEach((v, i) => {
        o.position.set(xAt(v) + (v.speed > 0 ? dx : -dx), y, ROAD.lanes[v.lane]);
        o.rotation.set(0, v.speed > 0 ? 0 : Math.PI, 0);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    };
    put("car", cars, 0.85);
    put("cabin", cars, 1.75, -0.3);
    put("bus", buses, 1.65);
    put("busGlass", buses, 2.1);
  };

  useLayoutEffect(() => {
    cars.forEach((v, i) => refs.current.car!.setColorAt(i, PAINT[v.paint]));
    refs.current.car!.instanceColor!.needsUpdate = true;
    place(0);
  });
  useFrame((s) => {
    if (!still) place(s.clock.elapsedTime);
  });

  return (
    <>
      <instancedMesh ref={(m) => void (refs.current.car = m)} args={[geo.car, paint, cars.length]} castShadow frustumCulled={false} />
      <instancedMesh ref={(m) => void (refs.current.cabin = m)} args={[geo.cabin, mats.glass, cars.length]} frustumCulled={false} />
      <instancedMesh ref={(m) => void (refs.current.bus = m)} args={[geo.bus, mats.white, buses.length]} castShadow frustumCulled={false} />
      <instancedMesh ref={(m) => void (refs.current.busGlass = m)} args={[geo.busGlass, mats.glass, buses.length]} frustumCulled={false} />
    </>
  );
}

/* ------------------------------------------------------------------ cloud shadows */

/** Soft cloud shadows drifting slowly across the ground. */
export function CloudShadows({ still }: { still: boolean }) {
  const tex = useMemo(() => {
    const t = makeClouds();
    t.repeat.set(1.6, 1.1);
    return t;
  }, []);
  useFrame((s) => {
    if (!still) tex.offset.set(s.clock.elapsedTime * 0.004, s.clock.elapsedTime * 0.0015);
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.3, -20]} renderOrder={1}>
      <planeGeometry args={[520, 300]} />
      <meshBasicMaterial map={tex} color="#7F89B8" transparent opacity={0.16} depthWrite={false} />
    </mesh>
  );
}
