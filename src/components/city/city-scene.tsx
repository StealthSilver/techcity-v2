"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, TiltShift2, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { BRAND } from "./palette";
import {
  Arena, Boxes, Classroom, CloudShadows, DataCentre, Factory, Gateway, Gym, Hedges, Hub, Lamps,
  Library, TowerMark, Towers, TrackPulses, Tracks, Traffic, Tram, Trees, Walkers, useMaterials,
} from "./parts";

/**
 * TechCity hero scene: a light, airy miniature city on a white page. Campus
 * on the left, the hub in the middle, industry on the right with the TechCity
 * tower; trams, cars and people moving between them.
 */

const HORIZON = "#F3F4F6";
const ZENITH = "#FFFFFF";

/* ------------------------------------------------------------------ sky */

function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { top: { value: new THREE.Color(ZENITH) }, bottom: { value: new THREE.Color(HORIZON) } },
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying vec3 vP;
          void main(){ float h = smoothstep(0.0, 0.2, vP.y); gl_FragColor = vec4(mix(bottom, top, h), 1.0);
          #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[700, 32, 16]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ ground */

function Ground({ lite }: { lite: boolean }) {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      {lite ? (
        <meshStandardMaterial color="#F1F2F5" roughness={0.45} metalness={0.1} />
      ) : (
        <MeshReflectorMaterial
          resolution={1024}
          blur={[500, 160]}
          mixBlur={1}
          mixStrength={0.9}
          mixContrast={1}
          roughness={0.7}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#F0F1F4"
          metalness={0.3}
          mirror={0.35}
        />
      )}
    </mesh>
  );
}

/* ------------------------------------------------------------------ camera */

const CAM_TARGET = new THREE.Vector3(-6, 13, -12);
const CAM_BASE = new THREE.Vector3(-4, 36, 152);
const CAM_INTRO = new THREE.Vector3(-40, 110, 250);

const _goal = new THREE.Vector3();
const _look = new THREE.Vector3();
const _target = new THREE.Vector3();
const _base = new THREE.Vector3();

/**
 * Framing for the hero's shape. Wide screens use the base shot; narrower ones
 * pull the camera back and aim a little right, so the hub and the TechCity
 * tower both stay in view.
 */
function frame(aspect: number) {
  const narrow = THREE.MathUtils.clamp((1.55 - aspect) / 1, 0, 1);
  const zoom = Math.min(2.1, Math.max(1, (1.55 / aspect) ** 0.65));
  _target.copy(CAM_TARGET);
  _target.x += 22 * narrow;
  _target.y += 16 * narrow;
  _base.copy(CAM_BASE).sub(CAM_TARGET).multiplyScalar(zoom).add(_target);
  return zoom;
}

/** Keeps the fog's start and end the same distance past the city as the camera pulls back. */
function fitFog(scene: THREE.Scene, zoom: number) {
  const extra = (zoom - 1) * 165;
  if (scene.fog instanceof THREE.Fog) {
    scene.fog.near = 150 + extra;
    scene.fog.far = 470 + extra;
  }
}

/**
 * Eases in from high above once, on first appearance, then drifts slowly and
 * leans towards the pointer. Time is counted here from frame deltas rather
 * than the renderer clock, which restarts whenever the scene pauses offscreen;
 * that's what used to replay the intro on scroll.
 */
function CameraRig({ still }: { still: boolean }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const pointer = useRef({ x: 0, y: 0 });
  const elapsed = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const scene = useThree((s) => s.scene);
  useEffect(() => {
    fitFog(scene, frame(size.width / size.height));
    // Only place the camera before the intro has run; later resizes (e.g. a phone's
    // address bar showing/hiding on scroll) are picked up smoothly by the frame loop.
    if (still) camera.position.copy(_base);
    else if (elapsed.current === 0) camera.position.copy(CAM_INTRO);
    else return;
    camera.lookAt(_target);
  }, [camera, scene, still, size]);

  useFrame((state, delta) => {
    if (still) return;
    const dt = Math.min(delta, 0.05);
    elapsed.current += dt;
    const time = elapsed.current;
    const p = Math.min(1, time / 3.6);
    const ease = 1 - Math.pow(1 - p, 4);

    fitFog(state.scene, frame(state.size.width / state.size.height));
    _goal.copy(CAM_INTRO).lerp(_base, ease);
    _goal.x += Math.sin(time * 0.06) * 6 * ease + pointer.current.x * 7 * ease;
    _goal.y += -pointer.current.y * 3 * ease;
    _goal.z += Math.cos(time * 0.05) * 3 * ease;

    const k = p < 1 ? 1 : 1 - Math.exp(-dt * 2.2);
    state.camera.position.lerp(_goal, k);
    _look.copy(_target);
    _look.x += pointer.current.x * 2.5;
    state.camera.lookAt(_look);
  });
  return null;
}

/* ------------------------------------------------------------------ scene */

function City({ lite, still }: { lite: boolean; still: boolean }) {
  const mats = useMaterials();
  return (
    <>
      <Sky />
      <fog attach="fog" args={[HORIZON, 150, 470]} />

      <hemisphereLight args={["#FFFFFF", "#D8DBE2", 1.6]} />
      <directionalLight
        position={[-70, 90, 70]}
        intensity={2.4}
        color="#FFF7EC"
        castShadow={!lite}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-radius={6}
        shadow-camera-left={-140}
        shadow-camera-right={140}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-camera-near={10}
        shadow-camera-far={320}
      />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 50, -40]} scale={[140, 40, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.4} position={[-70, 20, 40]} rotation-y={Math.PI / 3} scale={[70, 24, 1]} color={BRAND.mist} />
        <Lightformer form="rect" intensity={0.7} position={[70, 12, 40]} rotation-y={-Math.PI / 3} scale={[60, 12, 1]} color={BRAND.cream} />
        <Lightformer form="ring" intensity={1} position={[0, 70, 0]} rotation-x={Math.PI / 2} scale={50} color="#ffffff" />
      </Environment>

      <Ground lite={lite} />
      <CloudShadows still={still} />
      <Boxes mats={mats} />
      <Towers />
      <TowerMark mats={mats} />
      <Hub mats={mats} />
      <Arena mats={mats} />
      <Library mats={mats} />
      <Classroom mats={mats} />
      <Gym mats={mats} />
      <Gateway mats={mats} />
      <Factory mats={mats} />
      <DataCentre mats={mats} />
      <Tracks />
      <TrackPulses mats={mats} still={still} />
      <Tram mats={mats} track={0} start={0.12} dir={1} still={still} />
      <Tram mats={mats} track={0} start={0.62} dir={1} still={still} />
      <Tram mats={mats} track={1} start={0.45} dir={1} still={still} />
      <Tram mats={mats} track={1} start={0.95} dir={1} still={still} />
      <Traffic mats={mats} still={still} />
      <Walkers still={still} />
      <Trees still={still} />
      <Hedges mats={mats} />
      <Lamps mats={mats} />
      <CameraRig still={still} />
    </>
  );
}

export default function CityScene({ active = true, onReady }: { active?: boolean; onReady?: () => void }) {
  const [env] = useState(() => {
    if (typeof window === "undefined") return { lite: false, still: false };
    const lite = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return { lite, still };
  });

  return (
    <Canvas
      shadows={!env.lite}
      dpr={env.lite ? [1, 1.5] : [1, 1.75]}
      frameloop={active && !env.still ? "always" : "demand"}
      camera={{ fov: 32, near: 1, far: 2000, position: CAM_BASE.toArray() }}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      onCreated={() => onReady?.()}
    >
      <City lite={env.lite} still={env.still} />
      {env.lite ? (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.45} luminanceThreshold={1.6} luminanceSmoothing={0.2} />
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={4}>
          <N8AO halfRes aoRadius={5} distanceFalloff={1.2} intensity={2.2} color="#8C96C4" quality="medium" />
          <Bloom mipmapBlur intensity={0.5} luminanceThreshold={1.6} luminanceSmoothing={0.3} radius={0.6} />
          <TiltShift2 blur={0.1} taper={0.6} start={[0, 0.5]} end={[1, 0.5]} samples={8} />
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
