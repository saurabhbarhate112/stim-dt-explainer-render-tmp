import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Eyebrow, GridBg, Tag } from "../components/ui";
import { StudioLights } from "../three/Pcb";
import { Cam, project, Stage } from "../three/Stage";
import { cue } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

const ID = "line";
const BELT_Y = 0.92;
const TWIN_Y = 4.4;

type St = { key: string; name: string; x: number; w: number; h: number; d: number; data: string };
const STATIONS: St[] = [
  { key: "print", name: "Paste print", x: -5.4, w: 2.2, h: 1.7, d: 2.0, data: "Paste height" },
  { key: "place", name: "Placement", x: -2.1, w: 2.5, h: 1.9, d: 2.1, data: "Mis-picks" },
  { key: "reflow", name: "Reflow", x: 1.7, w: 3.6, h: 1.35, d: 1.8, data: "Zone temps" },
  { key: "aoi", name: "AOI + test", x: 5.3, w: 2.0, h: 1.75, d: 1.9, data: "Joint images" },
];

const Machine: React.FC<{ s: St; glow: number; twin?: boolean }> = ({ s, glow, twin }) => {
  const body = useMemo(() => new THREE.BoxGeometry(s.w, s.h, s.d), [s]);
  const edges = useMemo(() => new THREE.EdgesGeometry(body), [body]);
  const rounded = useMemo(() => new RoundedBoxGeometry(s.w, s.h * 0.5 - 0.16, s.d, 4, 0.05), [s]);
  if (twin) {
    return (
      <group position={[s.x, TWIN_Y + s.h / 2 * 0.35, 0]} scale={[1, 0.35, 1]}>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={glow > 0.5 ? "#F2A33A" : "#7CF0B0"} transparent opacity={0.55 + glow * 0.45} />
        </lineSegments>
        <mesh geometry={body}>
          <meshBasicMaterial color="#7CF0B0" transparent opacity={0.05 + glow * 0.12} depthWrite={false} />
        </mesh>
      </group>
    );
  }
  const cab = s.h * 0.5; // lower cabinet height
  const hood = s.h - cab;
  return (
    <group position={[s.x, 0, 0]}>
      {/* plinth */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[s.w * 0.94, 0.16, s.d * 0.9]} />
        <meshStandardMaterial color="#1E2623" roughness={0.7} />
      </mesh>
      {/* lower cabinet */}
      <mesh geometry={rounded} position={[0, 0.16 + (cab - 0.16) / 2, 0]}>
        <meshStandardMaterial color="#B9C2BD" roughness={0.5} metalness={0.25} emissive="#1AAB4A" emissiveIntensity={glow * 0.15} />
      </mesh>
      {/* cabinet door seams */}
      {[-0.25, 0.25].map((k) => (
        <mesh key={k} position={[s.w * k, 0.16 + (cab - 0.16) / 2, s.d / 2 + 0.004]}>
          <planeGeometry args={[0.012, cab * 0.7]} />
          <meshBasicMaterial color="#6E7873" />
        </mesh>
      ))}
      <mesh position={[0, cab - 0.1, s.d / 2 + 0.006]}>
        <planeGeometry args={[s.w * 0.98, 0.045]} />
        <meshBasicMaterial color="#1AAB4A" />
      </mesh>
      {/* glass hood: frame posts, top cover, tinted panels */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh key={i} position={[(sx * s.w) / 2 - sx * 0.04, cab + hood / 2, (sz * s.d) / 2 - sz * 0.04]}>
          <boxGeometry args={[0.08, hood, 0.08]} />
          <meshStandardMaterial color="#8C9691" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, s.h - 0.04, 0]}>
        <boxGeometry args={[s.w, 0.08, s.d]} />
        <meshStandardMaterial color="#9AA49F" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, cab + hood / 2, 0]}>
        <boxGeometry args={[s.w - 0.1, hood - 0.04, s.d - 0.1]} />
        <meshStandardMaterial color="#7FB79C" transparent opacity={0.16 + glow * 0.08} roughness={0.05} metalness={0.2} depthWrite={false} />
      </mesh>
      <Interior s={s} glow={glow} y={cab} />
      {/* HMI screen on an arm */}
      <group position={[-s.w / 2 + 0.1, cab + 0.25, s.d / 2 + 0.28]} rotation={[-0.25, 0.45, 0]}>
        <mesh>
          <boxGeometry args={[0.38, 0.27, 0.04]} />
          <meshStandardMaterial color="#171D1B" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[0.32, 0.21]} />
          <meshBasicMaterial color={glow > 0.5 ? "#7CF0B0" : "#2E6B52"} />
        </mesh>
      </group>
      {/* stack light */}
      <group position={[s.w / 2 - 0.22, s.h, -s.d / 2 + 0.28]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        {["#1AAB4A", "#F2A33A", "#3a3f3d"].map((c, i) => (
          <mesh key={i} position={[0, 0.18 + i * 0.12, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.11, 16]} />
            <meshStandardMaterial color={c} emissive={i === 0 ? c : "#000"} emissiveIntensity={i === 0 ? 1.2 : 0} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** What you can see through each machine's glass. */
const Interior: React.FC<{ s: St; glow: number; y: number }> = ({ s, glow, y }) => {
  const f = useCurrentFrame();
  if (s.key === "reflow")
    return (
      <group position={[0, y + 0.05, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-s.w * 0.36 + (i * (s.w * 0.72)) / 7, 0, 0]}>
            <boxGeometry args={[0.3, 0.05, s.d * 0.6]} />
            <meshBasicMaterial color={i === 5 ? "#FF7A2E" : i > 2 ? "#E8892F" : "#B5652A"} transparent opacity={0.6 + glow * 0.35} />
          </mesh>
        ))}
      </group>
    );
  const headX = Math.sin(f / (s.key === "place" ? 9 : 22)) * s.w * 0.28;
  const headZ = s.key === "place" ? Math.cos(f / 13) * 0.35 : 0;
  const hood = s.h * 0.5;
  return (
    <group position={[0, y, 0]}>
      {/* gantry rail */}
      <mesh position={[0, hood * 0.72, headZ]}>
        <boxGeometry args={[s.w * 0.86, 0.08, 0.1]} />
        <meshStandardMaterial color="#5C6661" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[headX, hood * 0.5, headZ]}>
        <boxGeometry args={[s.key === "print" ? 0.12 : 0.22, hood * 0.38, s.key === "print" ? s.d * 0.7 : 0.2]} />
        <meshStandardMaterial
          color={s.key === "aoi" ? "#20302A" : "#D3D9D6"}
          metalness={0.6}
          roughness={0.35}
          emissive={s.key === "aoi" ? "#7CF0B0" : "#000"}
          emissiveIntensity={s.key === "aoi" ? 0.7 : 0}
        />
      </mesh>
      {s.key === "place" ? (
        <mesh position={[headX, hood * 0.24, headZ]}>
          <cylinderGeometry args={[0.025, 0.012, 0.16, 10]} />
          <meshStandardMaterial color="#E8ECEA" metalness={0.8} roughness={0.2} />
        </mesh>
      ) : null}
      {/* feeders for placement */}
      {s.key === "place"
        ? Array.from({ length: 7 }).map((_, i) => (
            <mesh key={i} position={[-s.w * 0.36 + i * 0.12, 0.16, s.d / 2 - 0.22]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.05, 20]} />
              <meshStandardMaterial color={i % 2 ? "#3B4446" : "#C9CED1"} metalness={0.3} roughness={0.5} />
            </mesh>
          ))
        : null}
    </group>
  );
};

const MiniBoard: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, BELT_Y + 0.05, 0]}>
    <mesh>
      <boxGeometry args={[0.7, 0.03, 0.5]} />
      <meshStandardMaterial color="#0A4128" roughness={0.4} />
    </mesh>
    {[
      [-0.1, 0, 0.18],
      [0.18, 0.12, 0.1],
      [0.18, -0.12, 0.1],
      [-0.24, 0.15, 0.08],
    ].map(([px, pz, s], i) => (
      <mesh key={i} position={[px, 0.03, pz]}>
        <boxGeometry args={[s, 0.03, s]} />
        <meshStandardMaterial color="#16191B" roughness={0.5} />
      </mesh>
    ))}
  </group>
);

const Beam: React.FC<{ x: number; from: number; on: number }> = ({ x, from, on }) => {
  const f = useCurrentFrame();
  if (on <= 0) return null;
  const top = lerp(from, TWIN_Y, on);
  return (
    <group>
      <mesh position={[x, (from + top) / 2, 0]}>
        <boxGeometry args={[0.02, Math.max(0.001, top - from), 0.02]} />
        <meshBasicMaterial color="#7CF0B0" transparent opacity={0.7} />
      </mesh>
      {on >= 1
        ? [0, 1, 2].map((i) => {
            const t = ((f / 40 + i / 3) % 1 + 1) % 1;
            return (
              <mesh key={i} position={[x, lerp(from, TWIN_Y, t), 0]}>
                <sphereGeometry args={[0.06, 10, 10]} />
                <meshBasicMaterial color="#7CF0B0" />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/* mini visualisations inside the station data cards */
const Viz: React.FC<{ k: string; drift?: number }> = ({ k, drift = 0 }) => {
  const f = useCurrentFrame();
  if (k === "print")
    return (
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 34 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: `${(0.75 + 0.12 * Math.sin(f / 7 + i)) * 100 - (i > 8 ? drift * 30 : 0)}%`, background: i > 8 && drift > 0 ? C.amber : C.mint, borderRadius: 1 }} />
        ))}
      </div>
    );
  if (k === "place")
    return (
      <div style={{ display: "flex", gap: 4, height: 34, alignItems: "center" }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: 9, background: (i + Math.floor(f / 9)) % 7 === 0 ? C.amber : "rgba(124,240,176,0.4)" }} />
        ))}
      </div>
    );
  if (k === "reflow")
    return (
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 34 }}>
        {[0.35, 0.45, 0.55, 0.62, 0.7, 0.95, 0.6, 0.3].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${(h + 0.03 * Math.sin(f / 8 + i)) * 100}%`, background: `hsl(${40 - h * 40}, 85%, ${50 + h * 6}%)`, borderRadius: 1 }} />
        ))}
      </div>
    );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3, height: 34 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ background: "#15241F", border: "1px solid rgba(124,240,176,0.35)", borderRadius: 2, position: "relative" }}>
          <div style={{ position: "absolute", inset: "30% 25%", borderRadius: 3, background: "rgba(201,206,209,0.7)" }} />
        </div>
      ))}
    </div>
  );
};

export const S05Line: React.FC = () => {
  const f = useCurrentFrame();
  const tPrinter = cue(ID, "printer");
  const tPick = cue(ID, "pick");
  const tReflow = cue(ID, "reflow");
  const tAoi = cue(ID, "automated");
  const tLines = cue(ID, "lines");
  const tFails = cue(ID, "fails");
  const tTrace = cue(ID, "trace");
  const tStation1 = cue(ID, "station", 1);
  const tStation2 = cue(ID, "station", 2);
  const tDrift = cue(ID, "drift");
  const starts = [tPrinter, tPick, tReflow, tAoi];

  // camera follows the station being described, then pulls wide for the record
  const focusX = interpolate(f, [0, tPrinter, tPick, tReflow, tAoi, tLines - 10, tLines + 20], [-7, -5.4, -2.1, 1.7, 5.3, 4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  const wide = prog(f, tLines - 14, 36, EASE_IN_OUT);
  const cam: Cam = {
    pos: [focusX + lerp(3.2, 1.2, wide), lerp(4.6, 6.4, wide) + Math.sin(f / 70) * 0.15, lerp(8.4, 15.5, wide)],
    target: [focusX * lerp(1, 0.6, wide), lerp(1.6, 3.4, wide), 0],
    fov: 36,
  };

  // trace back after a failure: AOI → reflow → placement → print
  const traceIdx = f < tTrace ? -1 : f < tStation1 ? 3 : f < tStation2 ? 2 : f < tDrift - 8 ? 1 : 0;
  const glowFor = (i: number) => {
    const live = prog(f, starts[i] - 4, 10) * (1 - prog(f, starts[i] + 70, 20));
    const traced = traceIdx === i ? 1 : 0;
    return Math.max(live, traced);
  };
  const boardSpeed = 0.022;
  const boards = Array.from({ length: 6 }).map((_, i) => ((-8 + i * 3 + f * boardSpeed + 16) % 16) - 8);
  const tableIn = prog(f, tLines - 4, 18);
  const cardsOut = prog(f, tLines - 8, 12);
  const twinLabel = project(cam, [-7.2, TWIN_Y + 0.5, 0]);
  const drift = prog(f, tDrift - 6, 10);

  return (
    <AbsoluteFill>
      <GridBg opacity={0.4} />
      <Stage cam={cam} fog={["#06110D", 14, 34]}>
        <StudioLights />
        <gridHelper args={[40, 40, "#1a3a2e", "#11251e"]} position={[0, 0.001, 0]} />
        {/* conveyor */}
        <mesh position={[0, BELT_Y - 0.03, 0]}>
          <boxGeometry args={[18, 0.04, 0.72]} />
          <meshStandardMaterial color="#1B2421" roughness={0.8} />
        </mesh>
        {[-0.4, 0.4].map((z) => (
          <mesh key={z} position={[0, BELT_Y, z]}>
            <boxGeometry args={[18, 0.08, 0.06]} />
            <meshStandardMaterial color="#7D8A84" metalness={0.8} roughness={0.35} />
          </mesh>
        ))}
        {boards.map((x, i) => (
          <MiniBoard key={i} x={x} />
        ))}
        {STATIONS.map((s, i) => (
          <Machine key={s.key} s={s} glow={glowFor(i)} />
        ))}
        {/* twin layer */}
        <group>
          <mesh position={[0, TWIN_Y - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[16, 3.6]} />
            <meshBasicMaterial color="#1AAB4A" transparent opacity={0.08 * prog(f, 6, 20)} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          {STATIONS.map((s, i) => (
            <Machine key={s.key} s={s} glow={traceIdx === i && i === 0 && drift > 0 ? 1 : glowFor(i) * 0.4} twin />
          ))}
        </group>
        {STATIONS.map((s, i) => (
          <Beam key={s.key} x={s.x} from={s.h + 0.1} on={prog(f, starts[i] + 2, 16)} />
        ))}
      </Stage>

      <div style={{ position: "absolute", left: twinLabel.x, top: twinLabel.y, transform: "translate(0,-50%)", opacity: prog(f, 10, 16) * (1 - tableIn) }}>
        <Tag>AI digital twin · one live model</Tag>
      </div>

      {/* station data cards */}
      {STATIONS.map((s, i) => {
        const p = project(cam, [s.x, s.h + 0.55, 0.6]);
        const o = prog(f, starts[i] - 2, 12) * (1 - cardsOut);
        if (o <= 0) return null;
        return (
          <div
            key={s.key}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: 170,
              transform: `translate(-50%,-100%) translateY(${(1 - o) * 12}px)`,
              opacity: o,
              background: "rgba(6,17,13,0.85)",
              border: `1px solid rgba(124,240,176,0.4)`,
              borderRadius: 6,
              padding: "8px 10px 10px",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase" }}>{s.name}</div>
            <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: C.paper, margin: "2px 0 6px" }}>{s.data}</div>
            <Viz k={s.key} />
          </div>
        );
      })}

      {/* one record per board */}
      <div style={{ position: "absolute", left: 640, top: 92, transform: "translate(-50%,0)", opacity: tableIn }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Eyebrow>One record per board</Eyebrow>
          <div style={{ fontFamily: MONO, fontSize: 13, color: C.paper, letterSpacing: "0.1em" }}>BOARD #4,812</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[...STATIONS.map((s) => s.name), "Test"].map((name, i) => {
            const p = prog(f, tLines - 2 + i * 4, 14);
            const isTest = i === 4;
            const fail = isTest && f >= tFails;
            const traced = !isTest && traceIdx >= 0 && traceIdx <= i;
            const isDrift = i === 0 && drift > 0;
            const border = fail ? C.red : isDrift ? C.amber : traced ? C.mint : C.line;
            return (
              <div
                key={name}
                style={{
                  width: 150,
                  padding: "10px 12px",
                  borderRadius: 6,
                  background: fail ? "rgba(239,83,80,0.16)" : isDrift ? "rgba(242,163,58,0.16)" : C.panel,
                  border: `1.5px solid ${border}`,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 14}px)`,
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase" }}>{name}</div>
                <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, marginTop: 4, color: fail ? C.red : isDrift ? C.amber : C.paper }}>
                  {isTest ? (fail ? "✕ Fail" : "…") : isDrift ? "⚠ Drift began" : traced ? "✓ Checked" : "Logged"}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ height: 2, marginTop: 10, background: C.amber, width: `${prog(f, tTrace, tDrift - tTrace, EASE_IN_OUT) * 100}%`, marginLeft: "auto", opacity: 0.8 }} />
      </div>
    </AbsoluteFill>
  );
};
