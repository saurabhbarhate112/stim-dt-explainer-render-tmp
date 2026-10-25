import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../theme";

/**
 * Procedural surface-mount PCB.
 * `scan` (board-local x) splits the board: right of it renders as the physical
 * board, left of it as the digital twin (wireframe + glow). Use scan = -99 for
 * all-physical and +99 for all-twin.
 */

export const BOARD = { w: 4.2, d: 2.8, t: 0.08 };
const TOP = BOARD.t / 2;

type Part = { kind: "box" | "cyl"; x: number; z: number; w: number; d: number; h: number; color: string; metal?: number; rough?: number; id?: string };

const MASK = "#0A4128";
const MASK_TRACE = "#16683F";
const BLACK = "#16191B";
const TIN = "#C9CED1";
const GOLD = "#C9A44A";

const buildParts = (): Part[] => {
  const r = rng(7);
  const p: Part[] = [];
  const chip = (x: number, z: number, w: number, d: number, h: number, id?: string) => p.push({ kind: "box", x, z, w, d, h, color: BLACK, rough: 0.55, id });
  // main BGA processor + heat-spreader look
  chip(-0.45, -0.05, 1.0, 1.0, 0.11, "bga");
  p.push({ kind: "box", x: -0.45, z: -0.05, w: 0.62, d: 0.62, h: 0.125, color: "#8E979C", metal: 0.85, rough: 0.35 });
  // fine-pitch QFNs
  chip(1.05, -0.62, 0.46, 0.46, 0.06, "qfn");
  chip(1.05, 0.55, 0.46, 0.46, 0.06, "qfn2");
  // SOICs with gull-wing leads
  for (const [x, z] of [
    [-1.6, 0.85],
    [-1.6, -0.85],
    [0.25, 1.05],
  ]) {
    chip(x, z, 0.52, 0.3, 0.07);
    for (let i = 0; i < 4; i++) {
      for (const s of [-1, 1]) p.push({ kind: "box", x: x - 0.18 + i * 0.12, z: z + s * 0.19, w: 0.04, d: 0.09, h: 0.025, color: TIN, metal: 0.9, rough: 0.3 });
    }
  }
  // electrolytic caps
  for (const [x, z] of [
    [1.75, 1.0],
    [1.75, -1.0],
    [-1.05, 1.05],
  ])
    p.push({ kind: "cyl", x, z, w: 0.34, d: 0.34, h: 0.36, color: "#AEB6BB", metal: 0.75, rough: 0.35 });
  // crystal
  p.push({ kind: "box", x: 0.3, z: -1.0, w: 0.34, d: 0.14, h: 0.08, color: "#B8C0C4", metal: 0.9, rough: 0.25 });
  // connector header
  p.push({ kind: "box", x: -1.95, z: 0, w: 0.18, d: 1.3, h: 0.22, color: "#202426", rough: 0.6 });
  for (let i = 0; i < 8; i++) p.push({ kind: "box", x: -1.95, z: -0.55 + i * 0.157, w: 0.04, d: 0.04, h: 0.34, color: GOLD, metal: 1, rough: 0.25 });
  // 0603 passives scattered around the ICs
  const spots: [number, number][] = [];
  for (let i = 0; i < 70; i++) {
    const x = -1.9 + r() * 3.8;
    const z = -1.25 + r() * 2.5;
    const blocked = p.some((q) => Math.abs(q.x - x) < q.w / 2 + 0.1 && Math.abs(q.z - z) < q.d / 2 + 0.1) || spots.some(([a, b]) => Math.hypot(a - x, b - z) < 0.16);
    if (blocked) continue;
    spots.push([x, z]);
    const rot = r() > 0.5;
    const body = r() > 0.5 ? "#2B2420" : "#9C7F5C"; // resistor black / ceramic cap tan
    p.push({ kind: "box", x, z, w: rot ? 0.06 : 0.12, d: rot ? 0.12 : 0.06, h: 0.035, color: body, rough: 0.6 });
    for (const s of [-1, 1]) p.push({ kind: "box", x: x + (rot ? 0 : s * 0.055), z: z + (rot ? s * 0.055 : 0), w: rot ? 0.065 : 0.02, d: rot ? 0.02 : 0.065, h: 0.04, color: TIN, metal: 0.9, rough: 0.3 });
  }
  return p;
};

const buildTraces = () => {
  const r = rng(21);
  const segs: { x: number; z: number; len: number; horiz: boolean }[] = [];
  for (let i = 0; i < 46; i++) {
    let x = -1.9 + r() * 3.8;
    let z = -1.25 + r() * 2.5;
    for (let k = 0; k < 3; k++) {
      const horiz = (i + k) % 2 === 0;
      const len = 0.2 + r() * 0.9;
      const dir = r() > 0.5 ? 1 : -1;
      const nx = horiz ? Math.max(-2, Math.min(2, x + dir * len)) : x;
      const nz = horiz ? z : Math.max(-1.3, Math.min(1.3, z + dir * len));
      segs.push({ x: (x + nx) / 2, z: (z + nz) / 2, len: Math.abs(horiz ? nx - x : nz - z), horiz });
      x = nx;
      z = nz;
    }
  }
  return segs;
};

const PARTS = buildParts();
const TRACES = buildTraces();

const twinColor = new THREE.Color("#7CF0B0");

const PartMesh: React.FC<{ part: Part; physPlane: THREE.Plane; twinPlane: THREE.Plane; twinOpacity: number; highlight?: string }> = ({
  part,
  physPlane,
  twinPlane,
  twinOpacity,
  highlight,
}) => {
  const geo = useMemo(
    () =>
      part.kind === "box"
        ? new THREE.BoxGeometry(part.w, part.h, part.d)
        : new THREE.CylinderGeometry(part.w / 2, part.w / 2, part.h, 28),
    [part],
  );
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 20), [geo]);
  const hl = highlight && part.id === highlight;
  return (
    <group position={[part.x, TOP + part.h / 2, part.z]}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color={part.color}
          metalness={part.metal ?? 0.1}
          roughness={part.rough ?? 0.5}
          clippingPlanes={[physPlane]}
          emissive={hl ? "#F2A33A" : "#000000"}
          emissiveIntensity={hl ? 0.9 : 0}
        />
      </mesh>
      <mesh geometry={geo}>
        <meshBasicMaterial color={hl ? "#F2A33A" : twinColor} transparent opacity={0.07 * twinOpacity} clippingPlanes={[twinPlane]} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={hl ? "#F2A33A" : twinColor} transparent opacity={twinOpacity} clippingPlanes={[twinPlane]} />
      </lineSegments>
    </group>
  );
};

export const Pcb: React.FC<{
  scan?: number;
  twinOpacity?: number;
  highlight?: string; // part id to glow amber in both states
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}> = ({ scan = -99, twinOpacity = 1, highlight, position, rotation, scale = 1 }) => {
  // Planes live in world space; the parent group is expected to keep x-axis aligned
  // with the board for scan effects, so offset the constant by the group's x position.
  const ox = (position?.[0] ?? 0) / 1;
  const physPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  const twinPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  physPlane.constant = -(ox + scan * scale);
  twinPlane.constant = ox + scan * scale;

  const boardGeo = useMemo(() => new THREE.BoxGeometry(BOARD.w, BOARD.t, BOARD.d), []);
  const boardEdges = useMemo(() => new THREE.EdgesGeometry(boardGeo), [boardGeo]);
  const traceGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts: number[] = [];
    for (const s of TRACES) {
      if (s.horiz) pts.push(s.x - s.len / 2, TOP + 0.002, s.z, s.x + s.len / 2, TOP + 0.002, s.z);
      else pts.push(s.x, TOP + 0.002, s.z - s.len / 2, s.x, TOP + 0.002, s.z + s.len / 2);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  const silkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts: number[] = [];
    const y = TOP + 0.003;
    for (const q of PARTS) {
      if (q.color !== BLACK || q.w < 0.25) continue;
      const hw = q.w / 2 + 0.06;
      const hd = q.d / 2 + 0.06;
      const c = [
        [q.x - hw, q.z - hd],
        [q.x + hw, q.z - hd],
        [q.x + hw, q.z + hd],
        [q.x - hw, q.z + hd],
      ];
      for (let i = 0; i < 4; i++) pts.push(c[i][0], y, c[i][1], c[(i + 1) % 4][0], y, c[(i + 1) % 4][1]);
      pts.push(q.x - hw + 0.02, y, q.z - hd + 0.08, q.x - hw + 0.08, y, q.z - hd + 0.02); // pin-1 chamfer
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* substrate */}
      <mesh geometry={boardGeo}>
        <meshPhysicalMaterial color={MASK} roughness={0.5} metalness={0.05} clearcoat={0.9} clearcoatRoughness={0.22} clippingPlanes={[physPlane]} />
      </mesh>
      {/* silkscreen outlines */}
      <lineSegments geometry={silkGeo}>
        <lineBasicMaterial color="#E8EEE9" transparent opacity={0.75} clippingPlanes={[physPlane]} />
      </lineSegments>
      <lineSegments geometry={boardEdges}>
        <lineBasicMaterial color={twinColor} transparent opacity={twinOpacity} clippingPlanes={[twinPlane]} />
      </lineSegments>
      <mesh geometry={boardGeo}>
        <meshBasicMaterial color={twinColor} transparent opacity={0.05 * twinOpacity} clippingPlanes={[twinPlane]} depthWrite={false} />
      </mesh>
      {/* copper under mask (physical) / glowing nets (twin) */}
      <lineSegments geometry={traceGeo}>
        <lineBasicMaterial color={MASK_TRACE} clippingPlanes={[physPlane]} />
      </lineSegments>
      <lineSegments geometry={traceGeo}>
        <lineBasicMaterial color={twinColor} transparent opacity={0.55 * twinOpacity} clippingPlanes={[twinPlane]} />
      </lineSegments>
      {/* mounting holes */}
      {[
        [-1.95, -1.25],
        [1.95, -1.25],
        [-1.95, 1.25],
        [1.95, 1.25],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, TOP + 0.003, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.05, 0.1, 24]} />
          <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} clippingPlanes={[physPlane]} />
        </mesh>
      ))}
      {PARTS.map((p, i) => (
        <PartMesh key={i} part={p} physPlane={physPlane} twinPlane={twinPlane} twinOpacity={twinOpacity} highlight={highlight} />
      ))}
    </group>
  );
};

/** Neutral studio lighting used by all 3D scenes. */
export const StudioLights: React.FC<{ rim?: string }> = ({ rim = "#1AAB4A" }) => (
  <>
    <ambientLight intensity={0.55} />
    <hemisphereLight args={["#dfeee6", "#0a1712", 0.6]} />
    <directionalLight position={[4, 7, 5]} intensity={2.2} />
    <directionalLight position={[-6, 3, -4]} intensity={1.4} color={rim} />
    <pointLight position={[0, 3, 4]} intensity={8} distance={12} color="#ffffff" />
  </>
);
