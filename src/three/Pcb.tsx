import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ALL_PADS, BD, BT, BW, MM, Part, PARTS, boardTexture, markTexture, twinTexture } from "./board";

const TIN = { color: "#CFD5D8", metalness: 1, roughness: 0.25 };
const TWIN = "#12B76A";

type Planes = { phys: THREE.Plane[]; twin: THREE.Plane[] };

/** Instanced boxes from a list of [x, y, z, sx, sy, sz] (mm, board-local). */
const Boxes: React.FC<{ items: number[][]; mat: THREE.Material; castShadow?: boolean }> = ({ items, mat, castShadow }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    items.forEach((it, i) => {
      m.compose(new THREE.Vector3(it[0], it[1], it[2]), new THREE.Quaternion(), new THREE.Vector3(it[3], it[4], it[5]));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} castShadow={castShadow} />;
};

const top = BT / 2;

/* ---------- physical parts ---------- */
const leadItems = (p: Part) => {
  // gull-wing: shoulder from body + foot on the pad
  const out: number[][] = [];
  for (const pad of p.pads) {
    const horizontal = pad.w > pad.d; // lead runs along x
    const dir = horizontal ? Math.sign(pad.x - p.x) : Math.sign(pad.z - p.z);
    const footLen = 0.9;
    const fx = horizontal ? pad.x + dir * 0.15 : pad.x;
    const fz = horizontal ? pad.z : pad.z + dir * 0.15;
    out.push([fx, top + 0.08, fz, horizontal ? footLen : 0.22, 0.14, horizontal ? 0.22 : footLen]);
    const sx = horizontal ? p.x + dir * (p.w / 2 + 0.35) : pad.x;
    const sz = horizontal ? pad.z : p.z + dir * (p.d / 2 + 0.35);
    out.push([sx, top + p.h * 0.45, sz, horizontal ? 0.7 : 0.22, 0.14, horizontal ? 0.22 : 0.7]);
    out.push([horizontal ? sx + dir * 0.3 : sx, top + p.h * 0.25, horizontal ? sz : sz + dir * 0.3, 0.2, p.h * 0.45, 0.2]);
  }
  return out;
};

const PhysPart: React.FC<{ p: Part; planes: Planes; lift: number; glow?: string; tinMat: THREE.Material }> = ({ p, planes, lift, glow, tinMat }) => {
  const y = top + lift;
  const emissive = glow ?? "#000000";
  const ei = glow ? 0.28 : 0;
  const jointMat = useMemo(
    () => (glow ? new THREE.MeshStandardMaterial({ color: glow, emissive: glow, emissiveIntensity: 1.6, metalness: 0.3, roughness: 0.3, clippingPlanes: planes.phys }) : tinMat),
    [glow, tinMat, planes],
  );
  const clip = planes.phys;
  const markMat = useMemo(() => {
    if (p.kind !== "qfp" && p.kind !== "qfn" && p.kind !== "soic" && p.kind !== "ind") return null;
    const label = p.kind === "qfp" ? "DT-4812" : p.kind === "qfn" ? "Q32" : p.kind === "ind" ? "100" : "S8";
    return markTexture(label, p.kind === "qfp" ? "2641  CA" : "");
  }, [p.kind]);
  const bodyMats = useMemo(() => {
    const side = new THREE.MeshPhysicalMaterial({ color: "#1B1E20", roughness: 0.55, clearcoat: 0.2, clippingPlanes: clip, emissive, emissiveIntensity: ei });
    const topM = markMat
      ? new THREE.MeshPhysicalMaterial({ map: markMat, roughness: 0.5, clearcoat: 0.25, clippingPlanes: clip, emissive, emissiveIntensity: ei * 0.6 })
      : side;
    return [side, side, topM, side, side, side];
  }, [markMat, clip, emissive, ei]);

  const geo = useMemo(() => {
    if (p.kind === "ind") return new RoundedBoxGeometry(p.w, p.h, p.d, 3, 0.5);
    if (p.kind === "xtal") return new RoundedBoxGeometry(p.w, p.h, p.d, 3, 0.4);
    if (p.kind === "usbc") return new RoundedBoxGeometry(p.w, p.h, p.d, 4, 1.4);
    return new THREE.BoxGeometry(p.w, p.h, p.d);
  }, [p]);
  const leads = useMemo(() => (p.kind === "qfp" || p.kind === "soic" ? leadItems(p) : []), [p]);
  const qfnPads = useMemo(() => p.pads.filter((q) => q.w < 1).map((q) => [q.x, top + 0.12, q.z, q.w * 0.9, 0.22, q.d * 0.7]), [p]);

  if (p.kind === "qfp" || p.kind === "qfn" || p.kind === "soic" || p.kind === "ind") {
    return (
      <group>
        <mesh geometry={geo} material={p.kind === "ind" ? bodyMats[0] : bodyMats} position={[p.x, y + p.h / 2, p.z]} castShadow />
        {lift < 0.01 && leads.length ? <Boxes items={leads} mat={jointMat} /> : null}
        {lift < 0.01 && p.kind === "qfn" ? (
          <Boxes items={qfnPads} mat={jointMat} />
        ) : null}
      </group>
    );
  }
  if (p.kind === "r" || p.kind === "c") {
    const along = p.rot ? "z" : "x";
    const body = p.kind === "r" ? "#1E1F21" : "#A98157";
    const L = 1.6;
    const cap = 0.32;
    return (
      <group position={[p.x, y + p.h / 2, p.z]}>
        <mesh castShadow>
          <boxGeometry args={along === "x" ? [L - cap * 2, p.h, 0.8] : [0.8, p.h, L - cap * 2]} />
          <meshStandardMaterial color={body} roughness={0.6} clippingPlanes={clip} emissive={emissive} emissiveIntensity={ei} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={along === "x" ? [s * (L / 2 - cap / 2), 0, 0] : [0, 0, s * (L / 2 - cap / 2)]} material={jointMat}>
            <boxGeometry args={along === "x" ? [cap, p.h + 0.02, 0.82] : [0.82, p.h + 0.02, cap]} />
          </mesh>
        ))}
      </group>
    );
  }
  if (p.kind === "elec")
    return (
      <group position={[p.x, y, p.z]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[6.6, 0.5, 6.6]} />
          <meshStandardMaterial color="#222629" roughness={0.7} clippingPlanes={clip} />
        </mesh>
        <mesh position={[0, 0.5 + (p.h - 0.5) / 2, 0]} castShadow>
          <cylinderGeometry args={[p.w / 2, p.w / 2, p.h - 0.5, 40]} />
          <meshPhysicalMaterial color="#1D3A5F" roughness={0.35} clearcoat={0.8} clippingPlanes={clip} />
        </mesh>
        <mesh position={[0, p.h + 0.01, 0]}>
          <cylinderGeometry args={[p.w / 2 - 0.15, p.w / 2 - 0.15, 0.04, 40]} />
          <meshStandardMaterial color="#C9CED2" metalness={1} roughness={0.25} clippingPlanes={clip} />
        </mesh>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} position={[0, p.h + 0.04, 0]} rotation={[0, r, 0]}>
            <boxGeometry args={[p.w * 0.7, 0.03, 0.12]} />
            <meshStandardMaterial color="#6E757A" metalness={0.8} roughness={0.4} clippingPlanes={clip} />
          </mesh>
        ))}
        <mesh position={[-p.w / 2 + 0.3, 0.5 + (p.h - 0.5) / 2, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.2, p.h - 0.6, 2.2]} />
          <meshStandardMaterial color="#9DB0C4" roughness={0.5} clippingPlanes={clip} />
        </mesh>
      </group>
    );
  if (p.kind === "xtal")
    return (
      <mesh position={[p.x, y + p.h / 2, p.z]} castShadow geometry={geo}>
        <meshStandardMaterial color="#C6CBCE" metalness={1} roughness={0.28} clippingPlanes={clip} />
      </mesh>
    );
  if (p.kind === "usbc")
    return (
      <group position={[p.x, y + p.h / 2, p.z]}>
        <mesh castShadow geometry={geo}>
          <meshStandardMaterial color="#C9CED1" metalness={1} roughness={0.2} clippingPlanes={clip} />
        </mesh>
        <mesh position={[-p.w / 2 - 0.01, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[p.d * 0.8, p.h * 0.6]} />
          <meshStandardMaterial color="#141618" clippingPlanes={clip} />
        </mesh>
      </group>
    );
  if (p.kind === "led")
    return (
      <group position={[p.x, y, p.z]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1.6, 0.5, 0.8]} />
          <meshStandardMaterial color="#EDEDE6" roughness={0.5} clippingPlanes={clip} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[1.0, 0.2, 0.6]} />
          <meshStandardMaterial color="#FFD86B" emissive="#FFC23D" emissiveIntensity={0.6} roughness={0.2} clippingPlanes={clip} />
        </mesh>
      </group>
    );
  if (p.kind === "hdr")
    return (
      <group position={[p.x, y, p.z]}>
        <mesh position={[0, 1.25, 0]} castShadow>
          <boxGeometry args={[p.w, 2.5, p.d]} />
          <meshStandardMaterial color="#1C1F21" roughness={0.6} clippingPlanes={clip} />
        </mesh>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[(i % 2 ? 1 : -1) * 1.27, 4.3, -5.08 + Math.floor(i / 2) * 2.54]} castShadow>
            <boxGeometry args={[0.64, 6, 0.64]} />
            <meshStandardMaterial color="#D6B159" metalness={1} roughness={0.25} clippingPlanes={clip} />
          </mesh>
        ))}
      </group>
    );
  return null;
};

/* ---------- twin parts ---------- */
const TwinPart: React.FC<{ p: Part; planes: Planes; opacity: number; glow?: string }> = ({ p, planes, opacity, glow }) => {
  const h = p.kind === "hdr" ? 8.5 : p.h;
  const geo = useMemo(
    () => (p.kind === "elec" ? new THREE.CylinderGeometry(p.w / 2, p.w / 2, h, 20) : new THREE.BoxGeometry(p.rot ? p.d : p.w, h, p.rot ? p.w : p.d)),
    [p, h],
  );
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 25), [geo]);
  const col = glow ?? TWIN;
  return (
    <group position={[p.x, top + h / 2, p.z]}>
      <mesh geometry={geo}>
        <meshBasicMaterial color={col} transparent opacity={(glow ? 0.45 : 0.14) * opacity} clippingPlanes={planes.twin} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={col} transparent opacity={0.95 * opacity} clippingPlanes={planes.twin} />
      </lineSegments>
    </group>
  );
};

export type PcbProps = {
  /** world-x of the physical/twin split: right of it is physical, left is twin. -99 = all physical, 99 = all twin */
  scan?: number;
  twinOpacity?: number;
  glow?: Record<string, string>;
  /** mm lift above the board per part ref (for placement shots); hidden when undefined returned as -1 */
  lift?: (ref: string) => number;
  /** show wet paste on pads; visible where world-x < pasteX */
  paste?: boolean;
  pasteX?: number;
  pasteShine?: number; // 0 wet grey → 1 reflowed tin
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

export const Pcb: React.FC<PcbProps> = ({ scan = -99, twinOpacity = 1, glow = {}, lift, paste, pasteX = 99, pasteShine = 0, position = [0, 0, 0], rotation, scale = 1 }) => {
  const planes = useMemo<Planes>(() => ({ phys: [new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)], twin: [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)] }), []);
  const pastePlane = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  planes.phys[0].constant = -scan;
  planes.twin[0].constant = scan;
  pastePlane.constant = pasteX;

  const boardMats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: "#B9AE84", roughness: 0.8, clippingPlanes: planes.phys });
    const topM = new THREE.MeshPhysicalMaterial({ map: boardTexture(), roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.25, clippingPlanes: planes.phys });
    const bottom = new THREE.MeshStandardMaterial({ color: "#0C4F2F", roughness: 0.6, clippingPlanes: planes.phys });
    return [edge, edge, topM, bottom, edge, edge];
  }, [planes]);
  const twinMats = useMemo(() => {
    const side = new THREE.MeshBasicMaterial({ color: TWIN, transparent: true, opacity: 0.25, clippingPlanes: planes.twin, depthWrite: false });
    const topM = new THREE.MeshBasicMaterial({ map: twinTexture(), transparent: true, clippingPlanes: planes.twin, depthWrite: false });
    return [side, side, topM, side, side, side];
  }, [planes]);
  twinMats.forEach((m) => {
    m.opacity = (m.map ? 1 : 0.25) * twinOpacity;
  });
  const tinMat = useMemo(() => new THREE.MeshStandardMaterial({ ...TIN, clippingPlanes: planes.phys }), [planes]);
  const pasteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#9EA4A7", roughness: 0.95, metalness: 0.2, clippingPlanes: [pastePlane, planes.phys[0]] }), [pastePlane, planes]);
  pasteMat.roughness = 0.95 - pasteShine * 0.75;
  pasteMat.metalness = 0.2 + pasteShine * 0.8;
  pasteMat.color.set(pasteShine > 0.5 ? "#D9DEE1" : "#B3B8BB");

  const boardGeo = useMemo(() => new THREE.BoxGeometry(BW, BT, BD), []);
  const boardEdges = useMemo(() => new THREE.EdgesGeometry(boardGeo), [boardGeo]);
  const pasteItems = useMemo(() => ALL_PADS.filter((p) => p.w < 3).map((p) => [p.x, top + 0.11, p.z, p.w * 0.86, 0.22, p.d * 0.86]), []);

  return (
    <group position={position} rotation={rotation} scale={scale * MM}>
      {scan < 99 ? <mesh geometry={boardGeo} material={boardMats} castShadow receiveShadow /> : null}
      <mesh geometry={boardGeo} material={twinMats} />
      <lineSegments geometry={boardEdges}>
        <lineBasicMaterial color={TWIN} transparent opacity={twinOpacity} clippingPlanes={planes.twin} />
      </lineSegments>
      {paste ? <Boxes items={pasteItems} mat={pasteMat} /> : null}
      {PARTS.map((p) => {
        const l = lift ? lift(p.ref) : 0;
        if (l < 0) return null;
        return (
          <group key={p.ref}>
            {scan < 99 ? <PhysPart p={p} planes={planes} lift={l} glow={glow[p.ref]} tinMat={tinMat} /> : null}
            {twinOpacity > 0 && scan > -60 ? <TwinPart p={p} planes={planes} opacity={twinOpacity} glow={glow[p.ref]} /> : null}
          </group>
        );
      })}
    </group>
  );
};
