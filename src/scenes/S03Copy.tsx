import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bg, Pop, Tag, Words } from "../components/ui";
import { MM } from "../three/board";
import { Pcb } from "../three/Pcb";
import { Cam, Stage, Studio, Vec3, camPath, project } from "../three/Stage";
import { cue } from "../timeline";
import { C, FONT, MONO, lerp, prog } from "../theme";

const ID = "copy";
const S = 0.5;
const PX = -1.12;
const TX = 1.18;
const TY = 0.5;

const arc = (t: number, h: number, z: number): Vec3 => [lerp(PX, TX, t), 0.15 + lerp(0, TY, t) + Math.sin(Math.PI * t) * h, z];

export const S03Copy: React.FC = () => {
  const f = useCurrentFrame();
  const tLive = cue(ID, "live");
  const tComputer = cue(ID, "computer");
  const tEvery = cue(ID, "every");
  const tChanges = cue(ID, "changes");
  const tChanges2 = cue(ID, "changes", 2);

  const cam: Cam = camPath(f, [
    [0, { pos: [0.3, 2.3, 4.7], target: [0.05, 0.42, 0], fov: 36 }],
    [tChanges - 10, { pos: [0.0, 2.0, 4.2], target: [0.05, 0.4, 0], fov: 36 }],
    [tChanges2 + 40, { pos: [0.1, 1.9, 3.9], target: [0.05, 0.42, 0], fov: 36 }],
  ]);
  const twinIn = prog(f, 4, 26);
  const flowOn = prog(f, tEvery - 4, 20);
  const hl1 = f >= tChanges && f < tChanges + 75;
  const hl2 = f >= tChanges2 - 2;
  const amber = "#F08C00";
  const physL = project(cam, [PX, -0.05, 0.9]);
  const twinL = project(cam, [TX, TY - 0.05, 0.9]);
  const twinTop = project(cam, [TX - 1.1, TY + 0.4, -0.75]);
  const twinBot = project(cam, [TX + 1.1, TY - 0.1, 0.8]);
  const u1p = project(cam, [PX + -14 * MM * S, 0.06, -3 * MM * S]);
  const u1t = project(cam, [TX + -14 * MM * S, TY + 0.06, -3 * MM * S]);

  return (
    <AbsoluteFill>
      <Bg />
      <Stage cam={cam} exposure={1.0}>
        <Studio floorY={-0.05} />
        <Pcb position={[PX, 0, 0]} scale={S} glow={hl1 || hl2 ? { U1: amber } : {}} />
        <Pcb position={[TX, TY, 0]} scale={S} scan={99} twinOpacity={twinIn} glow={hl2 ? { U1: amber } : {}} />
        {/* hologram projector */}
        <mesh position={[TX, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.022, 12, 80]} />
          <meshStandardMaterial color="#2CCB7F" emissive="#2CCB7F" emissiveIntensity={1.4} />
        </mesh>
        <mesh position={[TX, TY / 2, 0]}>
          <cylinderGeometry args={[1.15, 0.85, TY, 48, 1, true]} />
          <meshBasicMaterial color="#2CCB7F" transparent opacity={0.07 * twinIn} depthWrite={false} side={2} />
        </mesh>
        {Array.from({ length: 14 }).map((_, i) => {
          if (flowOn <= i / 14) return null;
          const t = ((f / 45 + i / 14) % 1 + 1) % 1;
          return (
            <mesh key={i} position={arc(t, 0.7, -0.4 + (i % 3) * 0.4)}>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshBasicMaterial color={i % 4 === 0 ? "#2F7BEF" : "#12B76A"} />
            </mesh>
          );
        })}
      </Stage>

      {/* app window framing the twin once it is "running on a computer" */}
      <div
        style={{
          position: "absolute",
          left: twinTop.x - 20,
          top: twinTop.y - 40,
          width: twinBot.x - twinTop.x + 40,
          height: twinBot.y - twinTop.y + 60,
          borderRadius: 16,
          border: `2px solid ${C.ink}`,
          opacity: prog(f, tComputer - 4, 10),
          transform: `scale(${lerp(1.06, 1, prog(f, tComputer - 4, 12))})`,
        }}
      >
        <div style={{ height: 34, borderBottom: `2px solid ${C.ink}`, display: "flex", alignItems: "center", gap: 7, padding: "0 12px", background: "rgba(255,255,255,0.8)", borderRadius: "14px 14px 0 0" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span key={c} style={{ width: 11, height: 11, borderRadius: 11, background: c }} />
          ))}
          <span style={{ fontFamily: MONO, fontSize: 13, color: C.ink, marginLeft: 10 }}>line-2.twin</span>
          <span style={{ marginLeft: "auto", fontFamily: FONT, fontWeight: 800, fontSize: 13, color: C.white, background: C.red, padding: "2px 8px", borderRadius: 6, opacity: 0.6 + 0.4 * Math.sin(f / 5) }}>● LIVE</span>
        </div>
      </div>

      <div style={{ position: "absolute", left: physL.x, top: physL.y, transform: "translate(-50%,0)" }}>
        <Pop at={6}>
          <Tag color={C.ink} size={18}>
            Real line
          </Tag>
        </Pop>
      </div>
      <div style={{ position: "absolute", left: twinL.x, top: twinL.y + 30, transform: "translate(-50%,0)" }}>
        <Pop at={14}>
          <Tag color={C.green} size={18}>
            Digital twin
          </Tag>
        </Pop>
      </div>
      <AbsoluteFill style={{ paddingLeft: 70, paddingTop: 70 }}>
        <Words text="A live copy" at={tLive - 4} size={62} mark={["live"]} out={tEvery - 6} />
      </AbsoluteFill>
      <AbsoluteFill style={{ paddingLeft: 70, paddingTop: 70 }}>
        <Words text="Data in, all the time" at={tEvery - 2} size={56} accent={["all", "the", "time"]} out={tChanges - 6} />
      </AbsoluteFill>
      {hl1 ? (
        <div style={{ position: "absolute", left: u1p.x, top: u1p.y - 90, transform: "translate(-50%,0)" }}>
          <Pop at={tChanges}>
            <Tag color={amber} solid size={17}>
              Real change
            </Tag>
          </Pop>
        </div>
      ) : null}
      {hl2 ? (
        <div style={{ position: "absolute", left: u1t.x, top: u1t.y - 100, transform: "translate(-50%,0)" }}>
          <Pop at={tChanges2}>
            <Tag color={amber} solid size={17}>
              Twin updates in real time
            </Tag>
          </Pop>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
