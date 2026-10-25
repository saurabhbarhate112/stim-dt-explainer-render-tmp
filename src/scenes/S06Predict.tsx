import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Stock } from "../components/frame";
import { DrawPath, Eyebrow, GridBg, Reveal, Tag, Words } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

const ID = "predict";

/* ---------- stencil close-up ---------- */
const Stencil: React.FC<{ off: number }> = ({ off }) => {
  const f = useCurrentFrame() + off;
  const tDry = cue(ID, "dry");
  const tThin = cue(ID, "corner");
  const tEvery = cue(ID, "every");
  const thin = prog(f, tThin - 8, 70, EASE_IN_OUT);
  const hour = Math.min(3, 1 + Math.floor(interpolate(f, [tThin, tEvery], [0, 2.99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const cols = 11;
  const rows = 6;
  const x0 = 120;
  const y0 = 130;
  const cw = 58;
  const rh = 68;
  const inCorner = (c: number, r: number) => c >= 7 && r <= 2;
  return (
    <AbsoluteFill>
      <GridBg opacity={0.5} />
      <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9AA4A6" />
            <stop offset="0.5" stopColor="#C7CED0" />
            <stop offset="1" stopColor="#8B9597" />
          </linearGradient>
          <radialGradient id="paste" cx="0.4" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#D9DCDC" />
            <stop offset="1" stopColor="#7E8586" />
          </radialGradient>
        </defs>
        <rect x={x0 - 30} y={y0 - 30} width={cols * cw + 48} height={rows * rh + 40} rx={6} fill="url(#steel)" opacity={0.92} />
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const x = x0 + c * cw;
            const y = y0 + r * rh;
            const corner = inCorner(c, r);
            const s = corner ? lerp(1, 0.72 - (c - 7) * 0.03, thin) : 1;
            const dry = corner && f > tDry;
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width={30} height={42} rx={3} fill="#2A3133" />
                <rect x={x + 15 - 13 * s} y={y + 21 - 19 * s} width={26 * s} height={38 * s} rx={6} fill="url(#paste)" />
                {dry ? <rect x={x - 2} y={y - 2} width={34} height={46} rx={4} fill="none" stroke={C.amber} strokeWidth={2} opacity={prog(f, tDry, 12)} /> : null}
              </g>
            );
          }),
        )}
        <text x={x0 - 18} y={y0 + rows * rh + 2} fill="#3B4446" fontFamily={MONO} fontSize={12} letterSpacing={2}>
          STAINLESS STENCIL · TOP VIEW
        </text>
      </svg>
      <div style={{ position: "absolute", left: 560, top: 92, opacity: prog(f, tDry, 12) }}>
        <Tag color={C.amber}>Apertures drying out</Tag>
      </div>
      {/* hour clock + rate */}
      <div style={{ position: "absolute", right: 70, top: 140, width: 300, opacity: prog(f, tThin - 6, 14) }}>
        <Eyebrow color={C.muted}>Paste volume · corner</Eyebrow>
        <div style={{ fontFamily: FONT, fontSize: 64, fontWeight: 700, color: C.paper, marginTop: 6 }}>
          {Math.round(100 - thin * 6)}
          <span style={{ fontSize: 30, color: C.muted }}>% of target</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 14, color: C.amber, letterSpacing: "0.1em", marginTop: 4 }}>−1–2 % PER HOUR · HOUR {hour}</div>
      </div>
      {/* every board still passes */}
      <div style={{ position: "absolute", right: 70, top: 330, width: 300, display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const p = prog(f, tEvery - 6 + i * 5, 10);
          return (
            <div
              key={i}
              style={{
                opacity: p,
                transform: `translateX(${(1 - p) * 30}px)`,
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 5,
                background: C.panel,
                border: `1px solid ${C.line}`,
                fontFamily: MONO,
                fontSize: 14,
                color: C.paper,
              }}
            >
              <span>BOARD #{4807 + i}</span>
              <span style={{ color: C.green }}>✓ PASS</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- drift chart (blog fig. 3) ---------- */
const X0 = 170;
const X1 = 1090;
const yv = (v: number) => 150 + ((110 - v) / 50) * 380;
const xh = (h: number) => X0 + (h / 8) * (X1 - X0);
const GHOST = [100, 98, 95.5, 92.5, 89, 84.5, 79.5, 73, 69];
const path = (pts: [number, number][]) => pts.map(([h, v], i) => `${i ? "L" : "M"}${xh(h).toFixed(1)} ${yv(v).toFixed(1)}`).join(" ");

const Chart: React.FC<{ off: number }> = ({ off }) => {
  const f = useCurrentFrame() + off;
  const tPattern = cue(ID, "pattern");
  const tWeak = cue(ID, "weak");
  const tQfn = cue(ID, "qfn");
  const tSo = cue(ID, "so");
  const tFlags = cue(ID, "flags");
  const tWipes = cue(ID, "wipes");
  const tNever = cue(ID, "never");
  const base = cue(ID, "but") - 6;

  const axes = prog(f, base, 18);
  const current = prog(f, base + 10, tSo - base - 10, EASE_IN_OUT);
  const ghost = prog(f, tPattern - 6, tQfn - tPattern + 6, EASE_IN_OUT);
  const after = prog(f, tWipes - 4, tNever - tWipes + 4, EASE_IN_OUT);
  const ghostFade = 1 - 0.75 * prog(f, tNever - 4, 14);

  const curPts: [number, number][] = [
    [0, 100],
    [1, 98.4],
    [2, 96.1],
    [3, 93.4],
  ];
  const afterPts: [number, number][] = [
    [3, 93.4],
    [3.12, 100],
    [4, 100.6],
    [5, 99.6],
    [6, 100.3],
    [7, 99.8],
    [8, 100.2],
  ];

  return (
    <AbsoluteFill>
      <GridBg opacity={0.35} />
      <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: axes }}>
        {/* weak-joint zone */}
        <rect x={X0} y={yv(75)} width={X1 - X0} height={yv(60) - yv(75)} fill="rgba(239,83,80,0.10)" />
        <text x={X1 - 10} y={yv(62)} textAnchor="end" fill={C.red} fontFamily={MONO} fontSize={12} letterSpacing={2} opacity={0.8}>
          WEAK-JOINT ZONE
        </text>
        {[60, 70, 80, 90, 100, 110].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={yv(v)} y2={yv(v)} stroke={C.line} />
            <text x={X0 - 14} y={yv(v) + 4} textAnchor="end" fill={C.muted} fontFamily={MONO} fontSize={12}>
              {v}%
            </text>
          </g>
        ))}
        <line x1={X0} x2={X1} y1={yv(75)} y2={yv(75)} stroke={C.red} strokeDasharray="6 6" strokeWidth={1.5} />
        <text x={X0 + 8} y={yv(75) - 8} fill={C.red} fontFamily={MONO} fontSize={12} letterSpacing={2}>
          SPEC MINIMUM 75%
        </text>
        {Array.from({ length: 9 }).map((_, h) => (
          <text key={h} x={xh(h)} y={yv(60) + 24} textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize={12}>
            {h}h
          </text>
        ))}
        <text x={X0} y={128} fill={C.green} fontFamily={MONO} fontSize={13} letterSpacing={2}>
          PASTE VOLUME, % OF TARGET · HOURS INTO THE SHIFT
        </text>
        {/* last time */}
        <g opacity={ghostFade}>
          <DrawPath d={path(GHOST.map((v, h) => [h, v]))} p={ghost} stroke={C.amber} width={2.5} />
          {ghost > 0.98 ? <circle cx={xh(7)} cy={yv(73)} r={9} fill="none" stroke={C.red} strokeWidth={2.5} /> : null}
        </g>
        {/* this shift */}
        <DrawPath d={path(curPts)} p={current} stroke={C.mint} width={3.5} />
        <DrawPath d={path(afterPts)} p={after} stroke={C.mint} width={3.5} />
        {f > tFlags - 4 ? (
          <g>
            <circle cx={xh(3)} cy={yv(93.4)} r={10 + 8 * ((f - tFlags) % 20) / 20} fill="none" stroke={C.amber} strokeWidth={2} opacity={1 - ((f - tFlags) % 20) / 20} />
            <circle cx={xh(3)} cy={yv(93.4)} r={7} fill={C.amber} />
          </g>
        ) : null}
      </svg>
      {/* legend */}
      <div style={{ position: "absolute", right: 190, top: 112, display: "flex", gap: 22, opacity: axes, fontFamily: FONT, fontSize: 16, color: C.paper }}>
        <span style={{ display: "flex", gap: 8, alignItems: "center", opacity: prog(f, tPattern - 6, 10) }}>
          <i style={{ width: 22, height: 3, background: C.amber, display: "inline-block" }} />
          Last time
        </span>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <i style={{ width: 22, height: 3, background: C.mint, display: "inline-block" }} />
          This shift
        </span>
      </div>
      <div style={{ position: "absolute", left: xh(7) - 230, top: yv(73) + 18, opacity: prog(f, tWeak - 2, 12) * ghostFade }}>
        <Tag color={C.red}>Weak joints under the QFN</Tag>
      </div>
      <div style={{ position: "absolute", left: xh(3) - 30, top: yv(93.4) + 26, opacity: prog(f, tFlags - 4, 10) }}>
        <Tag color={C.amber} solid>
          Hour 3 · twin flags the trend
        </Tag>
        <div style={{ marginTop: 8, opacity: prog(f, tWipes - 4, 10) }}>
          <Tag color={C.mint}>Operator wipes the stencil</Tag>
        </div>
      </div>
      <div style={{ position: "absolute", right: 80, top: yv(100) - 76 }}>
        <Reveal at={tNever - 4}>
          <Tag color={C.green} solid>
            Bad batch: never built
          </Tag>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

export const S06Predict: React.FC = () => {
  const f = useCurrentFrame();
  const tFew = cue(ID, "few") - 8;
  const tChart = cue(ID, "but") - 8;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence durationInFrames={tFew + 12}>
        <Stock src="bga_macro" dur={tFew + 12} scale={[1.05, 1.18]} />
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(6,17,13,0.85) 0%, rgba(6,17,13,0.1) 60%)" }} />
        <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 120px 80px" }}>
          <Words text="One drifting stencil." at={6} size={56} weight={700} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={tFew} durationInFrames={tChart - tFew + 12}>
        <AbsoluteFill style={{ opacity: prog(f, tFew, 12) }}>
          <Stencil off={tFew} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={tChart}>
        <AbsoluteFill style={{ opacity: prog(f, tChart, 12), transform: `scale(${lerp(1.03, 1, prog(f, tChart, 24))})` }}>
          <Chart off={tChart} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
