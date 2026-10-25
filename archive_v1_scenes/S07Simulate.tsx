import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DrawPath, Eyebrow, GridBg, Tag } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

const ID = "simulate";

const QS = [
  { q: "Oven peak +5 °C?", r: "Joints OK", ok: true },
  { q: "New paste supplier?", r: "More voids", ok: false },
  { q: "Slower conveyor?", r: "OK", ok: true },
  { q: "Thinner stencil?", r: "Bridging", ok: false },
];
const ROW_Y = (i: number) => 196 + i * 92;
const NODE = { x: 640, y: ROW_Y(1.5) };

const Lane: React.FC<{ y: number; label: string; at: number; fill: number; color: string; children: React.ReactNode }> = ({ y, label, at, fill, color, children }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 16);
  return (
    <div style={{ position: "absolute", left: 470, top: y, width: 720, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
      <Eyebrow color={color}>{label}</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 12 }}>{children}</div>
      <div style={{ height: 8, borderRadius: 8, background: "rgba(255,255,255,0.06)", marginTop: 14, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${fill * 100}%`, background: color, borderRadius: 8 }} />
      </div>
    </div>
  );
};

const Chip: React.FC<{ children: React.ReactNode; at: number; color?: string }> = ({ children, at, color = C.paper }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 12);
  return (
    <div
      style={{
        opacity: p,
        transform: `scale(${lerp(0.85, 1, p)})`,
        padding: "10px 16px",
        borderRadius: 6,
        border: `1px solid ${C.line}`,
        background: C.panel,
        fontFamily: FONT,
        fontSize: 21,
        fontWeight: 600,
        color,
      }}
    >
      {children}
    </div>
  );
};

export const S07Simulate: React.FC = () => {
  const f = useCurrentFrame();
  const tWhat = cue(ID, "what-if");
  const tRaise = cue(ID, "raise");
  const tSwitch = cue(ID, "switch");
  const tLive = cue(ID, "live");
  const tBoards = cue(ID, "boards");
  const tMachine = cue(ID, "machine");
  const tTwin = cue(ID, "twin");
  const tMinutes = cue(ID, "minutes");
  const tOnly = cue(ID, "only");
  const tSurvive = cue(ID, "survive");
  const tReal = cue(ID, "real");
  const tNew = cue(ID, "new");

  const titleMove = prog(f, tRaise - 8, 20, EASE_IN_OUT);
  const qAt = [tRaise - 4, tSwitch - 4, tSwitch + 10, tSwitch + 18];
  const lanesOut = prog(f, tOnly - 10, 12);
  const sim = prog(f, tOnly - 4, 20, EASE_IN_OUT);
  const resAt = (i: number) => tSurvive - 10 + i * 6;
  const buildAt = tReal - 6;

  return (
    <AbsoluteFill>
      <GridBg />
      {/* title */}
      <div
        style={{
          position: "absolute",
          left: lerp(640, 90, titleMove),
          top: lerp(330, 96, titleMove),
          transform: `translate(${lerp(-50, 0, titleMove)}%, -50%)`,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: lerp(120, 40, titleMove),
          letterSpacing: "-0.03em",
          color: C.paper,
          opacity: prog(f, tWhat - 10, 14),
          whiteSpace: "nowrap",
        }}
      >
        What if<span style={{ color: C.green }}>…?</span>
      </div>

      {/* question cards */}
      {QS.map((q, i) => {
        const p = prog(f, qAt[i], 14);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 90,
              top: ROW_Y(i) - 30,
              width: 300,
              padding: "16px 18px",
              borderRadius: 8,
              background: C.panelSolid,
              border: `1px solid ${sim > 0.5 ? "rgba(124,240,176,0.45)" : C.lineStrong}`,
              fontFamily: FONT,
              fontSize: 22,
              fontWeight: 600,
              color: C.paper,
              opacity: p,
              transform: `translateX(${(1 - p) * -40}px)`,
            }}
          >
            {q.q}
          </div>
        );
      })}

      {/* live line vs twin */}
      <div style={{ opacity: 1 - lanesOut }}>
        <Lane y={190} label="On a live line" at={tLive - 6} fill={interpolate(f, [tBoards, tMachine + 30], [0.1, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} color={C.amber}>
          <Chip at={tBoards - 4}>Scrap boards</Chip>
          <Chip at={tBoards + 6}>Parts</Chip>
          <Chip at={tMachine - 4}>Hours of machine time</Chip>
        </Lane>
        <Lane y={390} label="On the twin" at={tTwin - 6} fill={interpolate(f, [tMinutes - 6, tMinutes + 10], [0, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} color={C.mint}>
          <Chip at={tMinutes - 4} color={C.mint}>
            Minutes of compute
          </Chip>
          <div style={{ fontFamily: MONO, fontSize: 14, color: C.muted, letterSpacing: "0.1em", opacity: prog(f, tMinutes + 4, 10) }}>NO BOARDS · NO PARTS</div>
        </Lane>
      </div>

      {/* simulation routing */}
      <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: sim }}>
        {QS.map((q, i) => (
          <DrawPath key={i} d={`M390 ${ROW_Y(i)} C 500 ${ROW_Y(i)}, 520 ${NODE.y}, ${NODE.x - 70} ${NODE.y}`} p={sim} stroke="rgba(124,240,176,0.55)" width={1.6} />
        ))}
        {QS.map((q, i) => (
          <DrawPath
            key={`o${i}`}
            d={`M${NODE.x + 70} ${NODE.y} C 760 ${NODE.y}, 760 ${ROW_Y(i)}, 820 ${ROW_Y(i)}`}
            p={prog(f, resAt(i) - 6, 10)}
            stroke={q.ok ? C.mint : "rgba(239,83,80,0.6)"}
            width={1.6}
          />
        ))}
        {QS.filter((q) => q.ok).map((q) => {
          const i = QS.indexOf(q);
          return <DrawPath key={`b${i}`} d={`M1000 ${ROW_Y(i)} C 1050 ${ROW_Y(i)}, 1040 ${NODE.y}, 1078 ${NODE.y}`} p={prog(f, buildAt, 14)} stroke={C.green} width={2.4} />;
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: NODE.x,
          top: NODE.y,
          transform: `translate(-50%,-50%) scale(${lerp(0.8, 1, sim)})`,
          opacity: sim,
          width: 140,
          height: 120,
          borderRadius: 14,
          border: `2px solid ${C.mint}`,
          background: "rgba(10,40,30,0.92)",
          boxShadow: `0 0 40px rgba(26,171,74,${0.25 + 0.15 * Math.sin(f / 6)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: C.paper }}>Digital twin</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.mint, letterSpacing: "0.1em" }}>MINUTES, NOT BOARDS</div>
      </div>
      {QS.map((q, i) => {
        const p = prog(f, resAt(i), 12);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 820,
              top: ROW_Y(i) - 22,
              width: 180,
              padding: "10px 12px",
              borderRadius: 6,
              border: `1.5px solid ${q.ok ? C.mint : C.red}`,
              background: q.ok ? "rgba(26,171,74,0.14)" : "rgba(239,83,80,0.12)",
              fontFamily: FONT,
              fontSize: 17,
              fontWeight: 600,
              color: q.ok ? C.paper : "rgba(244,247,243,0.6)",
              opacity: p * (q.ok ? 1 : 1 - 0.4 * prog(f, buildAt, 12)),
              transform: `translateX(${(1 - p) * -20}px)`,
              textDecoration: !q.ok && f > buildAt ? "line-through" : undefined,
            }}
          >
            <span style={{ color: q.ok ? C.mint : C.red, marginRight: 8 }}>{q.ok ? "✓" : "✕"}</span>
            {q.r}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 1078,
          top: NODE.y,
          transform: "translate(0,-50%)",
          opacity: prog(f, buildAt + 8, 12),
          width: 130,
          padding: "14px 12px",
          borderRadius: 8,
          background: C.green,
          color: C.bg,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.15,
          textAlign: "center",
        }}
      >
        1 real build
        <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 400, letterSpacing: "0.1em", marginTop: 4 }}>CONFIRMATION</div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 560, opacity: prog(f, tNew - 6, 14) }}>
        <Tag color={C.green} solid>
          Most valuable in NPI · new product introduction
        </Tag>
      </div>
    </AbsoluteFill>
  );
};
