import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Eyebrow, GridBg, Reveal, Tag, Words } from "../components/ui";
import { Pcb, StudioLights } from "../three/Pcb";
import { Cam, project, Stage } from "../three/Stage";
import { cue } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

const ID = "mirror";

const arc = (t: number, from: number, to: number, h: number, z: number, y0 = 0.35): [number, number, number] => [lerp(from, to, t), y0 + Math.sin(Math.PI * t) * h, z];

const Flow: React.FC<{ from: number; to: number; h: number; z: number; color: string; speed: number; on: number }> = ({ from, to, h, z, color, speed, on }) => {
  const f = useCurrentFrame();
  const n = 16;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const t = (((f * speed) / 100 + i / n) % 1 + 1) % 1;
        const visible = on > i / n;
        if (!visible) return null;
        return (
          <mesh key={i} position={arc(t, from, to, h, z)}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={Math.sin(Math.PI * t)} />
          </mesh>
        );
      })}
    </>
  );
};

const BoardsPart: React.FC = () => {
  const f = useCurrentFrame();
  const tBut = cue(ID, "but");
  const tWorking = cue(ID, "working");
  const tFed = cue(ID, "fed");
  const tLive = cue(ID, "live");
  const tReal = cue(ID, "real");
  const tChange1 = cue(ID, "changes");
  const tChange2 = cue(ID, "changes", 2);

  const split = prog(f, tFed - 14, 30, EASE_IN_OUT);
  const twinX = lerp(1.9, 2.5, split);
  const physY = lerp(-3.2, 0, prog(f, tFed - 8, 30));
  const cam: Cam = {
    pos: [lerp(1.0, 0, split) + Math.sin(f / 90) * 0.25, lerp(4.6, 5.4, split), lerp(6.0, 7.9, split)],
    target: [lerp(0.9, 0, split), 0, 0.3],
    fov: 38,
  };
  const hl1 = f >= tChange1 - 2 && f < tChange1 + 70;
  const hl2 = f >= tChange2 - 2 && f < tChange2 + 60;
  const dataOn = prog(f, tLive - 4, 24);
  const backOn = prog(f, tReal, 24);

  const physLabel = project(cam, [-2.5, -0.1, 1.5]);
  const twinLabel = project(cam, [twinX, -0.1, 1.5]);
  const dataLabel = project(cam, [0, 1.95, -0.6]);
  const backLabel = project(cam, [0, 0.95, 1.3]);
  const sameLabel = project(cam, [0, -0.2, 2.1]);
  const textOut = prog(f, tFed - 16, 12);

  return (
    <AbsoluteFill>
      <GridBg />
      <Stage cam={cam}>
        <StudioLights />
        <Pcb scan={99} position={[twinX, 0, 0]} scale={0.82} highlight={hl2 ? "qfn" : undefined} />
        {physY > -3.1 ? <Pcb scan={-99} position={[-2.5, physY, 0]} scale={0.82} highlight={hl1 ? "qfn" : undefined} /> : null}
        <Flow from={-2.5} to={twinX} h={1.6} z={-0.6} color={C.mint} speed={0.9} on={dataOn} />
        <Flow from={twinX} to={-2.5} h={0.7} z={1.3} color={C.paper} speed={0.6} on={backOn} />
      </Stage>

      {/* left kinetic copy while the twin is centre-stage */}
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 70, opacity: 1 - textOut }}>
        <div style={{ position: "relative", alignSelf: "flex-start" }}>
          <Words text="Not a drawing." at={4} size={54} weight={600} color="rgba(244,247,243,0.85)" />
          <div style={{ position: "absolute", left: -6, top: 34, height: 4, width: `${prog(f, tBut - 4, 10) * 105}%`, background: C.red }} />
        </div>
        <Words text="A working copy." at={tWorking - 2} size={54} weight={700} accent={["working"]} style={{ marginTop: 12 }} />
      </AbsoluteFill>

      {/* tags once both boards are on stage */}
      <div style={{ position: "absolute", left: physLabel.x, top: physLabel.y, transform: "translate(-50%,0)", opacity: prog(f, tFed + 10, 14) }}>
        <Tag color={C.paper}>Physical board + line</Tag>
      </div>
      <div style={{ position: "absolute", left: twinLabel.x, top: twinLabel.y, transform: "translate(-50%,0)", opacity: prog(f, tFed + 14, 14) }}>
        <Tag>Digital twin</Tag>
      </div>
      <div style={{ position: "absolute", left: dataLabel.x, top: dataLabel.y, transform: "translate(-50%,-50%)", opacity: dataOn }}>
        <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.14em", color: C.mint }}>LIVE SENSOR DATA →</div>
      </div>
      <div style={{ position: "absolute", left: backLabel.x, top: backLabel.y, transform: "translate(-50%,-50%)", opacity: backOn }}>
        <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.14em", color: C.paper }}>← INSIGHTS + ADJUSTMENTS</div>
      </div>
      <div style={{ position: "absolute", left: sameLabel.x, top: sameLabel.y, transform: "translate(-50%,-50%)", opacity: prog(f, tChange2, 10) * (1 - prog(f, tChange2 + 50, 10)) }}>
        <Tag color={C.amber} solid>
          Same state
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- map vs mirror ---------- */
const ROADS = [
  "M0 120 C140 110 220 160 500 140",
  "M90 0 C110 120 80 260 120 440",
  "M260 0 L300 440",
  "M420 0 C400 160 440 300 410 440",
  "M0 320 C160 300 320 340 500 300",
];
const HWY: [number, number][] = [
  [0, 230],
  [70, 222],
  [140, 214],
  [210, 222],
  [280, 236],
  [350, 238],
  [420, 228],
  [500, 220],
];

const MapCard: React.FC<{ live: boolean; x: number; at: number; dim?: number; glow?: number }> = ({ live, x, at, dim = 0, glow = 0 }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 20);
  const W = 500;
  const H = 440;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 120,
        width: W,
        height: H,
        borderRadius: live ? 26 : 4,
        overflow: "hidden",
        opacity: p * (1 - dim * 0.55),
        transform: `translateY(${(1 - p) * 30}px) rotate(${live ? 0 : -1.2}deg)`,
        background: live ? "#0E1A16" : "#E9E1CC",
        boxShadow: live ? `0 0 0 2px rgba(124,240,176,${0.25 + glow * 0.6}), 0 0 ${60 * glow}px rgba(26,171,74,${0.5 * glow})` : "0 20px 50px rgba(0,0,0,0.45)",
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {!live ? (
          <>
            <path d="M330 0 C360 120 300 200 380 440 L500 440 L500 0 Z" fill="#BFD3D6" opacity={0.7} />
            <line x1={W / 2} x2={W / 2} y1={0} y2={H} stroke="#CFC4A8" strokeWidth={2} />
            <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="#CFC4A8" strokeWidth={2} />
          </>
        ) : (
          <path d="M330 0 C360 120 300 200 380 440 L500 440 L500 0 Z" fill="#12302B" />
        )}
        {ROADS.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={live ? "#2C3D37" : "#B9A98A"} strokeWidth={6} strokeLinecap="round" />
        ))}
        {HWY.slice(1).map((pt, i) => {
          const a = HWY[i];
          let col = live ? "#3B4B45" : "#D49B3A";
          if (live) {
            const v = Math.sin(f / 18 + i * 1.3) + Math.sin(f / 31 - i * 0.7);
            col = v > 0.9 ? C.red : v > 0 ? C.amber : C.green;
          }
          return <line key={i} x1={a[0]} y1={a[1]} x2={pt[0]} y2={pt[1]} stroke={col} strokeWidth={live ? 9 : 11} strokeLinecap="round" />;
        })}
        {live
          ? Array.from({ length: 9 }).map((_, i) => {
              const t = ((f * 0.004 + i / 9) % 1) * (HWY.length - 1);
              const k = Math.floor(t);
              const r = t - k;
              const px = lerp(HWY[k][0], HWY[k + 1][0], r);
              const py = lerp(HWY[k][1], HWY[k + 1][1], r);
              return <circle key={i} cx={px} cy={py - 2} r={4} fill={C.paper} />;
            })
          : null}
        {!live ? (
          <text x={24} y={410} fontFamily={MONO} fontSize={14} fill="#8C7C5C" letterSpacing={2}>
            PRINTED EDITION
          </text>
        ) : null}
      </svg>
      {live ? (
        <div style={{ position: "absolute", left: 20, top: 18, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 10, height: 10, borderRadius: 10, background: C.red, opacity: 0.5 + 0.5 * Math.sin(f / 5) }} />
          <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.14em", color: C.paper }}>LIVE · TRAFFIC NOW</div>
        </div>
      ) : null}
    </div>
  );
};

const MapPart: React.FC<{ offset: number }> = ({ offset }) => {
  const f = useCurrentFrame();
  const t = (w: string, n = 1) => cue(ID, w, n) - offset;
  const tPicture = t("picture");
  const tMirror = t("mirror");
  return (
    <AbsoluteFill>
      <GridBg opacity={0.6} />
      <MapCard live={false} x={110} at={t("paper") - 8} dim={prog(f, tMirror - 4, 14)} />
      <MapCard live x={670} at={t("navigation") - 8} glow={prog(f, tMirror - 4, 14)} />
      <div style={{ position: "absolute", left: 110, top: 584, width: 500, textAlign: "center" }}>
        <Reveal at={tPicture - 4}>
          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 600, color: C.paper }}>A picture</div>
        </Reveal>
      </div>
      <div style={{ position: "absolute", left: 670, top: 584, width: 500, textAlign: "center" }}>
        <Reveal at={tMirror - 4}>
          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 700, color: C.green }}>A mirror</div>
        </Reveal>
      </div>
      <div style={{ position: "absolute", left: 110, top: 76, opacity: prog(f, 4, 12) }}>
        <Eyebrow color={C.muted}>Analogy</Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

export const S03Mirror: React.FC = () => {
  const f = useCurrentFrame();
  const cut = cue(ID, "paper") - 14;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence durationInFrames={cut + 12}>
        <BoardsPart />
      </Sequence>
      <Sequence from={cut}>
        <AbsoluteFill style={{ opacity: prog(f, cut, 12), transform: `scale(${lerp(1.04, 1, prog(f, cut, 20))})` }}>
          <MapPart offset={cut} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
