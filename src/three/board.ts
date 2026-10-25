import * as THREE from "three";
import { rng } from "../theme";

/**
 * Board layout in millimetres (origin = board centre, +x right, +z towards the viewer).
 * Every visual (texture pads, paste, 3D parts, twin) is derived from this one list.
 */
export const MM = 0.042; // world units per mm
export const BW = 100;
export const BD = 66;
export const BT = 1.6;

export type Pad = { x: number; z: number; w: number; d: number };
export type Kind = "qfp" | "qfn" | "soic" | "r" | "c" | "elec" | "ind" | "xtal" | "usbc" | "led" | "hdr";
export type Part = { ref: string; kind: Kind; x: number; z: number; w: number; d: number; h: number; rot: 0 | 90; pads: Pad[] };

const twoPad = (x: number, z: number, len: number, rot: 0 | 90, pw: number, pd: number): Pad[] =>
  rot === 0
    ? [
        { x: x - len / 2, z, w: pw, d: pd },
        { x: x + len / 2, z, w: pw, d: pd },
      ]
    : [
        { x, z: z - len / 2, w: pd, d: pw },
        { x, z: z + len / 2, w: pd, d: pw },
      ];

const quadPads = (x: number, z: number, body: number, n: number, pitch: number, reach: number, pl: number, pw: number): Pad[] => {
  const pads: Pad[] = [];
  const span = (n - 1) * pitch;
  for (let i = 0; i < n; i++) {
    const o = -span / 2 + i * pitch;
    pads.push({ x: x + o, z: z - body / 2 - reach, w: pw, d: pl });
    pads.push({ x: x + o, z: z + body / 2 + reach, w: pw, d: pl });
    pads.push({ x: x - body / 2 - reach, z: z + o, w: pl, d: pw });
    pads.push({ x: x + body / 2 + reach, z: z + o, w: pl, d: pw });
  }
  return pads;
};

const soicPads = (x: number, z: number): Pad[] => {
  const pads: Pad[] = [];
  for (let i = 0; i < 4; i++) {
    const o = -1.905 + i * 1.27;
    pads.push({ x: x + o, z: z - 2.7, w: 0.6, d: 1.5 });
    pads.push({ x: x + o, z: z + 2.7, w: 0.6, d: 1.5 });
  }
  return pads;
};

const buildParts = (): Part[] => {
  const P: Part[] = [];
  P.push({ ref: "U1", kind: "qfp", x: -14, z: -3, w: 10, d: 10, h: 1.4, rot: 0, pads: quadPads(-14, -3, 10, 16, 0.5, 1.3, 1.6, 0.28) });
  P.push({ ref: "U2", kind: "qfn", x: 17, z: -15, w: 5, d: 5, h: 0.9, rot: 0, pads: [...quadPads(17, -15, 5, 8, 0.5, 0.1, 0.8, 0.26), { x: 17, z: -15, w: 3.3, d: 3.3 }] });
  P.push({ ref: "U3", kind: "qfn", x: 17, z: 7, w: 5, d: 5, h: 0.9, rot: 0, pads: [...quadPads(17, 7, 5, 8, 0.5, 0.1, 0.8, 0.26), { x: 17, z: 7, w: 3.3, d: 3.3 }] });
  P.push({ ref: "U4", kind: "soic", x: -37, z: -18, w: 4.9, d: 3.9, h: 1.5, rot: 0, pads: soicPads(-37, -18) });
  P.push({ ref: "U5", kind: "soic", x: -37, z: 5, w: 4.9, d: 3.9, h: 1.5, rot: 0, pads: soicPads(-37, 5) });
  P.push({ ref: "U6", kind: "soic", x: 2, z: 22, w: 4.9, d: 3.9, h: 1.5, rot: 0, pads: soicPads(2, 22) });
  P.push({ ref: "C1", kind: "elec", x: 37, z: -21, w: 6.3, d: 6.3, h: 7.7, rot: 0, pads: twoPad(37, -21, 5.2, 90, 2.2, 1.6) });
  P.push({ ref: "C2", kind: "elec", x: 37, z: 21, w: 6.3, d: 6.3, h: 7.7, rot: 0, pads: twoPad(37, 21, 5.2, 90, 2.2, 1.6) });
  P.push({ ref: "L1", kind: "ind", x: 31, z: 0, w: 6, d: 6, h: 3.2, rot: 0, pads: twoPad(31, 0, 5, 0, 1.8, 5.6) });
  P.push({ ref: "Y1", kind: "xtal", x: 0, z: -22, w: 5, d: 3.2, h: 1.1, rot: 0, pads: twoPad(0, -22, 4.2, 0, 1.6, 2.4) });
  P.push({ ref: "J1", kind: "usbc", x: -45, z: 24, w: 9, d: 7.4, h: 3.2, rot: 0, pads: [...Array.from({ length: 6 }).map((_, i) => ({ x: -48 + i * 1.2, z: 19.6, w: 0.6, d: 1.2 }))] });
  P.push({ ref: "J2", kind: "hdr", x: 46, z: 0, w: 5.1, d: 12.7, h: 8.5, rot: 0, pads: [] });
  ["D1", "D2", "D3"].forEach((ref, i) => P.push({ ref, kind: "led", x: -20 + i * 4, z: 27, w: 1.6, d: 0.8, h: 0.7, rot: 0, pads: twoPad(-20 + i * 4, 27, 1.6, 0, 0.8, 0.9) }));

  // passives: decoupling around the ICs plus a scatter, collision-checked
  const r = rng(11);
  const taken = (x: number, z: number, m: number) =>
    P.some((q) => Math.abs(q.x - x) < (q.rot ? q.d : q.w) / 2 + m + 1.8 && Math.abs(q.z - z) < (q.rot ? q.w : q.d) / 2 + m + 1.8) ||
    Math.abs(x) > 47 ||
    Math.abs(z) > 30;
  const want: [number, number][] = [
    [-14, -11.5],
    [-10, -11.5],
    [-18, -11.5],
    [-14, 5.6],
    [-10, 5.6],
    [-22.6, -3],
    [-22.6, 1],
    [-5.4, -6],
    [-5.4, -1],
    [17, -10.6],
    [21.5, -15],
    [17, 11.4],
    [21.5, 7],
    [12.5, 7],
    [12.5, -15],
    [-37, -13.8],
    [-37, 9.2],
    [2, 17.8],
  ];
  for (let i = 0; i < 46; i++) want.push([-46 + r() * 92, -29 + r() * 58]);
  let n = 0;
  for (const [x, z] of want) {
    const rot: 0 | 90 = r() > 0.55 ? 90 : 0;
    if (taken(x, z, 0.4)) continue;
    const isR = r() > 0.45;
    n++;
    P.push({ ref: `${isR ? "R" : "C"}${n + 2}`, kind: isR ? "r" : "c", x, z, w: rot ? 0.8 : 1.6, d: rot ? 1.6 : 0.8, h: isR ? 0.45 : 0.8, rot, pads: twoPad(x, z, 1.6, rot, 0.85, 0.95) });
  }
  return P;
};

export const PARTS = buildParts();
export const ALL_PADS = PARTS.flatMap((p) => p.pads.map((pad) => ({ ...pad, ref: p.ref })));

/* ---------- textures ---------- */
const PX = 20; // texture pixels per mm
const W = BW * PX;
const H = BD * PX;
const tx = (x: number) => (x + BW / 2) * PX;
const tz = (z: number) => (z + BD / 2) * PX;

type Seg = [number, number][];
const buildTraces = (): Seg[] => {
  const r = rng(29);
  const segs: Seg[] = [];
  const u1 = PARTS[0];
  for (const p of PARTS) {
    if (p.ref === "U1" || p.pads.length === 0) continue;
    const a = p.pads[0];
    const tgt = u1.pads[Math.floor(r() * u1.pads.length)];
    const mx = a.x + (tgt.x - a.x) * (0.3 + r() * 0.4);
    const dz = tgt.z - a.z;
    const run = Math.min(Math.abs(dz), Math.abs(tgt.x - mx));
    segs.push([
      [a.x, a.z],
      [mx, a.z],
      [mx + Math.sign(tgt.x - mx) * run, a.z + Math.sign(dz) * run],
      [tgt.x, tgt.z],
    ]);
  }
  // bus lines
  for (let i = 0; i < 14; i++) {
    const z = -26 + i * 4;
    const x0 = -44 + r() * 20;
    segs.push([
      [x0, z],
      [x0 + 18 + r() * 30, z],
      [x0 + 22 + r() * 30, z + (r() > 0.5 ? 4 : -4)],
    ]);
  }
  return segs;
};
export const TRACES = buildTraces();

const VIAS = (() => {
  const r = rng(41);
  return Array.from({ length: 60 }).map(() => [-47 + r() * 94, -30 + r() * 60] as [number, number]);
})();

const canvas = () => {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return c;
};

let boardTex: THREE.CanvasTexture | null = null;
export const boardTexture = () => {
  if (boardTex) return boardTex;
  const c = canvas();
  const g = c.getContext("2d")!;
  // solder mask
  const grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0B4F2E");
  grad.addColorStop(1, "#083F24");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  // copper pour hatch at the edges (lighter under mask)
  g.fillStyle = "rgba(40,140,85,0.22)";
  g.fillRect(0, 0, W, 2.5 * PX);
  g.fillRect(0, H - 2.5 * PX, W, 2.5 * PX);
  // traces under mask
  g.lineCap = "round";
  g.lineJoin = "round";
  for (const s of TRACES) {
    g.strokeStyle = "rgba(24,100,60,0.95)";
    g.lineWidth = 0.26 * PX;
    g.beginPath();
    s.forEach(([x, z], i) => (i ? g.lineTo(tx(x), tz(z)) : g.moveTo(tx(x), tz(z))));
    g.stroke();
  }
  // vias
  for (const [x, z] of VIAS) {
    g.fillStyle = "#D9B25C";
    g.beginPath();
    g.arc(tx(x), tz(z), 0.45 * PX, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#1A2A22";
    g.beginPath();
    g.arc(tx(x), tz(z), 0.2 * PX, 0, Math.PI * 2);
    g.fill();
  }
  // ENIG pads
  for (const p of ALL_PADS) {
    const gg = g.createLinearGradient(tx(p.x - p.w / 2), tz(p.z - p.d / 2), tx(p.x + p.w / 2), tz(p.z + p.d / 2));
    gg.addColorStop(0, "#F1CF7A");
    gg.addColorStop(1, "#C99B3E");
    g.fillStyle = gg;
    g.fillRect(tx(p.x - p.w / 2), tz(p.z - p.d / 2), p.w * PX, p.d * PX);
  }
  // fiducials
  for (const [x, z] of [
    [-47, -30],
    [47, 30],
    [47, -30],
  ]) {
    g.fillStyle = "rgba(255,255,255,0.12)";
    g.beginPath();
    g.arc(tx(x), tz(z), 1.5 * PX, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#E7C26A";
    g.beginPath();
    g.arc(tx(x), tz(z), 0.6 * PX, 0, Math.PI * 2);
    g.fill();
  }
  // silkscreen
  g.strokeStyle = "#F4F4EC";
  g.fillStyle = "#F4F4EC";
  g.lineWidth = 0.18 * PX;
  g.font = `600 ${1.5 * PX}px 'IBM Plex Mono', monospace`;
  for (const p of PARTS) {
    if (p.kind === "r" || p.kind === "c" || p.kind === "led") {
      g.font = `600 ${0.9 * PX}px 'IBM Plex Mono', monospace`;
      g.fillText(p.ref, tx(p.x + (p.rot ? 0.9 : -0.9)), tz(p.z + (p.rot ? 0.4 : -0.9)));
      continue;
    }
    const m = p.kind === "qfp" ? 3.2 : p.kind === "qfn" ? 1.6 : p.kind === "soic" ? 0.6 : 0.8;
    const w = p.w + m * 2;
    const d = p.d + m * 2 + (p.kind === "soic" ? 4 : 0);
    g.strokeRect(tx(p.x - w / 2), tz(p.z - d / 2), w * PX, d * PX);
    if (p.kind !== "elec") {
      g.beginPath();
      g.arc(tx(p.x - w / 2 + 0.9), tz(p.z - d / 2 + 0.9), 0.35 * PX, 0, Math.PI * 2);
      g.fill();
    } else {
      g.beginPath();
      g.arc(tx(p.x), tz(p.z), (p.w / 2 + 0.7) * PX, 0, Math.PI * 2);
      g.stroke();
    }
    g.font = `600 ${1.4 * PX}px 'IBM Plex Mono', monospace`;
    g.fillText(p.ref, tx(p.x - w / 2), tz(p.z - d / 2 - 0.6));
  }
  g.font = `700 ${2.2 * PX}px 'DM Sans', sans-serif`;
  g.fillText("STIM", tx(24), tz(29.5));
  g.font = `500 ${1.4 * PX}px 'IBM Plex Mono', monospace`;
  g.fillText("DT-4812  REV B", tx(31.5), tz(29.3));
  boardTex = new THREE.CanvasTexture(c);
  boardTex.colorSpace = THREE.SRGBColorSpace;
  boardTex.anisotropy = 8;
  return boardTex;
};

/** Holographic "blueprint" of the same layout for the digital twin. */
let twinTex: THREE.CanvasTexture | null = null;
export const twinTexture = () => {
  if (twinTex) return twinTex;
  const c = canvas();
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(18,183,106,0.10)";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(18,183,106,0.95)";
  g.lineWidth = 0.4 * PX;
  g.strokeRect(0.2 * PX, 0.2 * PX, W - 0.4 * PX, H - 0.4 * PX);
  g.lineWidth = 0.22 * PX;
  g.strokeStyle = "rgba(18,183,106,0.75)";
  for (const s of TRACES) {
    g.beginPath();
    s.forEach(([x, z], i) => (i ? g.lineTo(tx(x), tz(z)) : g.moveTo(tx(x), tz(z))));
    g.stroke();
  }
  g.strokeStyle = "rgba(10,140,80,1)";
  g.lineWidth = 0.12 * PX;
  for (const p of ALL_PADS) g.strokeRect(tx(p.x - p.w / 2), tz(p.z - p.d / 2), p.w * PX, p.d * PX);
  // fine grid
  g.strokeStyle = "rgba(18,183,106,0.12)";
  g.lineWidth = 1;
  for (let x = 0; x < W; x += 5 * PX) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let z = 0; z < H; z += 5 * PX) {
    g.beginPath();
    g.moveTo(0, z);
    g.lineTo(W, z);
    g.stroke();
  }
  twinTex = new THREE.CanvasTexture(c);
  twinTex.colorSpace = THREE.SRGBColorSpace;
  twinTex.anisotropy = 8;
  return twinTex;
};

/** Laser-marked package top. */
const markCache: Record<string, THREE.CanvasTexture> = {};
export const markTexture = (label: string, sub = "") => {
  const key = label + sub;
  if (markCache[key]) return markCache[key];
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#17191B";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(255,255,255,0.05)";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = "#8D9396";
  g.font = "600 46px 'IBM Plex Mono', monospace";
  g.textAlign = "center";
  g.fillText(label, 128, 128);
  if (sub) {
    g.font = "500 28px 'IBM Plex Mono', monospace";
    g.fillText(sub, 128, 172);
  }
  g.beginPath();
  g.arc(40, 40, 12, 0, Math.PI * 2);
  g.fillStyle = "#2B2F31";
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  markCache[key] = t;
  return t;
};
