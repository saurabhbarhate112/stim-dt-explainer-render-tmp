import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ALL_PADS, BD, BT, BW, MM } from "./board";

export const TOP = (BT / 2) * MM;

/* ---------- stencil with real apertures (alpha mask from the pad list) ---------- */
let stencilAlpha: THREE.CanvasTexture | null = null;
const stencilTexture = () => {
  if (stencilAlpha) return stencilAlpha;
  const PX = 16;
  const c = document.createElement("canvas");
  c.width = (BW + 20) * PX;
  c.height = (BD + 20) * PX;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#000";
  for (const p of ALL_PADS) {
    if (p.w > 3) continue;
    g.fillRect((p.x + BW / 2 + 10 - (p.w * 0.9) / 2) * PX, (p.z + BD / 2 + 10 - (p.d * 0.9) / 2) * PX, p.w * 0.9 * PX, p.d * 0.9 * PX);
  }
  stencilAlpha = new THREE.CanvasTexture(c);
  return stencilAlpha;
};

export const Stencil: React.FC<{ lift: number }> = ({ lift }) => {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#A3AAAE", metalness: 0.85, roughness: 0.38, alphaMap: stencilTexture(), alphaTest: 0.5, side: THREE.DoubleSide }),
    [],
  );
  const fw = (BW + 20) * MM;
  const fd = (BD + 20) * MM;
  return (
    <group position={[0, TOP + 0.004 + lift * 1.6, -lift * 0.8]} rotation={[lift * 0.25, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat} castShadow>
        <planeGeometry args={[fw, fd]} />
      </mesh>
      {[
        [0, -fd / 2, fw + 0.24, 0.12],
        [0, fd / 2, fw + 0.24, 0.12],
        [-fw / 2, 0, 0.12, fd],
        [fw / 2, 0, 0.12, fd],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.03, z]} castShadow>
          <boxGeometry args={[w, 0.06, d]} />
          <meshStandardMaterial color="#9AA3A7" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
};

/** Squeegee blade + holder + rolling bead of paste, travelling along +x. */
export const Squeegee: React.FC<{ x: number; frame: number }> = ({ x, frame }) => {
  const len = (BD + 16) * MM;
  return (
    <group position={[x, TOP + 0.01, 0]}>
      <mesh position={[-0.06, 0.12, 0]} rotation={[0, 0, 0.75]} castShadow>
        <boxGeometry args={[0.01, 0.26, len]} />
        <meshStandardMaterial color="#DADFE2" metalness={1} roughness={0.18} />
      </mesh>
      <mesh position={[-0.17, 0.24, 0]} castShadow>
        <boxGeometry args={[0.1, 0.07, len + 0.1]} />
        <meshStandardMaterial color="#6F7A76" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.06, 0.045, 0]} rotation={[Math.PI / 2, frame * 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, len - 0.05, 18]} />
        <meshStandardMaterial color="#8E9497" roughness={0.9} metalness={0.25} />
      </mesh>
    </group>
  );
};

/** Pick-and-place head: carriage with four nozzles; `down` lowers the active one. */
export const PlaceHead: React.FC<{ x: number; z: number; down: number; tipY: number }> = ({ x, z, down, tipY }) => {
  const body = useMemo(() => new RoundedBoxGeometry(0.62, 0.36, 0.3, 3, 0.04), []);
  const rise = 0.55 * (1 - down);
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={body} position={[0.21, tipY + 0.75 + 0.18, 0]} castShadow>
        <meshStandardMaterial color="#E9EDEB" metalness={0.3} roughness={0.35} />
      </mesh>
      <mesh position={[0.21, tipY + 0.75 + 0.37, 0]}>
        <boxGeometry args={[0.66, 0.03, 0.34]} />
        <meshStandardMaterial color="#0E9F55" emissive="#0E9F55" emissiveIntensity={0.3} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const active = i === 0;
        const yb = tipY + (active ? rise : 0.55);
        return (
          <group key={i} position={[i * 0.14, 0, 0]}>
            <mesh position={[0, yb + 0.38, 0]} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.75, 14]} />
              <meshStandardMaterial color="#B9C1C4" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0, yb + 0.02, 0]}>
              <cylinderGeometry args={[0.012, 0.007, 0.04, 12]} />
              <meshStandardMaterial color="#F2F4F3" metalness={0.6} roughness={0.25} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** Cut-away reflow oven: dark tunnel, top heater bank glowing per zone. */
export const OVEN_ZONES = 8;
export const OVEN_L = 9;
export const zoneX = (i: number) => -OVEN_L / 2 + (i + 0.5) * (OVEN_L / OVEN_ZONES);
export const ZONE_HEAT = [0.3, 0.38, 0.46, 0.5, 0.56, 1, 0.62, 0.1];

export const Oven: React.FC<{ glow: number }> = ({ glow }) => (
  <group>
    <mesh position={[0, 0.55, -1.7]}>
      <boxGeometry args={[OVEN_L, 1.5, 0.1]} />
      <meshStandardMaterial color="#2A302E" roughness={0.8} />
    </mesh>
    <mesh position={[0, -0.12, -0.6]} receiveShadow>
      <boxGeometry args={[OVEN_L, 0.06, 2.4]} />
      <meshStandardMaterial color="#3A413E" roughness={0.85} />
    </mesh>
    <mesh position={[0, 1.45, -0.6]} castShadow>
      <boxGeometry args={[OVEN_L + 0.2, 0.36, 2.5]} />
      <meshStandardMaterial color="#E7ECEA" roughness={0.45} metalness={0.2} />
    </mesh>
    <mesh position={[0, 1.27, 0.66]}>
      <boxGeometry args={[OVEN_L + 0.2, 0.04, 0.04]} />
      <meshStandardMaterial color="#0E9F55" emissive="#0E9F55" emissiveIntensity={0.4} />
    </mesh>
    {[-0.55, 0.55].map((z) => (
      <mesh key={z} position={[0, TOP - 0.03, z]}>
        <boxGeometry args={[OVEN_L + 4, 0.05, 0.06]} />
        <meshStandardMaterial color="#8C9497" metalness={0.9} roughness={0.3} />
      </mesh>
    ))}
    {Array.from({ length: OVEN_ZONES }).map((_, i) => {
      const x = zoneX(i);
      const heat = ZONE_HEAT[i];
      const col = new THREE.Color().setHSL(0.075 - heat * 0.055, 1, 0.42 + heat * 0.1);
      return (
        <group key={i}>
          <mesh position={[x, 1.24, -0.6]}>
            <boxGeometry args={[OVEN_L / OVEN_ZONES - 0.06, 0.05, 2.3]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={(0.5 + heat * 2.2) * glow} roughness={0.6} />
          </mesh>
          <mesh position={[x + OVEN_L / OVEN_ZONES / 2, 0.55, -1.0]}>
            <boxGeometry args={[0.03, 1.3, 1.3]} />
            <meshStandardMaterial color="#4A524F" roughness={0.6} />
          </mesh>
          <mesh position={[x, 0.75, -1.64]}>
            <planeGeometry args={[OVEN_L / OVEN_ZONES - 0.1, 0.9]} />
            <meshBasicMaterial color={col} transparent opacity={0.18 + heat * 0.35 * glow} />
          </mesh>
          <pointLight position={[x, 1.0, 0.1]} color={col} intensity={glow * (0.6 + heat * 3)} distance={2.2} />
        </group>
      );
    })}
  </group>
);

/** AOI camera with ring light and scan beam. */
export const AoiHead: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 1.55, 0]} castShadow>
      <boxGeometry args={[0.5, 0.6, 0.5]} />
      <meshStandardMaterial color="#1E2624" metalness={0.4} roughness={0.35} />
    </mesh>
    <mesh position={[0, 1.15, 0]}>
      <cylinderGeometry args={[0.13, 0.15, 0.25, 32]} />
      <meshStandardMaterial color="#2C3330" metalness={0.8} roughness={0.25} />
    </mesh>
    <mesh position={[0, 1.02, 0]}>
      <cylinderGeometry args={[0.09, 0.09, 0.01, 32]} />
      <meshStandardMaterial color="#1A3B6B" metalness={1} roughness={0.05} />
    </mesh>
    <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.24, 0.025, 12, 48]} />
      <meshStandardMaterial color="#FFFFFF" emissive="#D8F7FF" emissiveIntensity={2.2} />
    </mesh>
    <spotLight position={[0, 0.95, 0]} angle={0.5} penumbra={0.6} intensity={18} distance={3} color="#EFFBFF" target-position={[x, 0, z]} />
    <mesh position={[0, TOP + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.9, 0.9]} />
      <meshBasicMaterial color="#2CCB7F" transparent opacity={0.16} depthWrite={false} />
    </mesh>
  </group>
);
