import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Eyebrow, GridBg, Reveal, Tag } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, lerp, prog, rng } from "../theme";

const ID = "ai";

const Card: React.FC<{ title: string; i: number; children: React.ReactNode }> = ({ title, i, children }) => {
  const f = useCurrentFrame();
  const p = prog(f, 4 + i * 4, 18);
  return (
    <div
      style={{
        width: 250,
        height: 150,
        borderRadius: 8,
        background: C.panel,
        border: `1px solid ${C.line}`,
        padding: "14px 16px",
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", color: C.muted }}>{title}</div>
        <div style={{ width: 7, height: 7, borderRadius: 7, background: C.green, opacity: 0.5 + 0.5 * Math.sin(f / 6 + i) }} />
      </div>
      <div style={{ flex: 1, position: "relative" }}>{children}</div>
    </div>
  );
};

const Bars: React.FC<{ n: number; seed: number; color?: string; base?: number }> = ({ n, seed, color = C.mint, base = 0.6 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: "100%" }}>
      {Array.from({ length: n }).map((_, i) => {
        const h = base + 0.25 * Math.sin(f / 9 + i * 1.7 + seed) * Math.sin(f / 23 + i);
        return <div key={i} style={{ flex: 1, height: `${h * 100}%`, background: color, opacity: 0.75, borderRadius: 2 }} />;
      })}
    </div>
  );
};

const Spark: React.FC<{ seed: number }> = ({ seed }) => {
  const f = useCurrentFrame();
  const pts = Array.from({ length: 40 }).map((_, i) => {
    const y = 40 + 18 * Math.sin((i + f * 0.5) / 4 + seed) + 8 * Math.sin((i + f) / 1.7);
    return `${i * 5.6},${y}`;
  });
  return (
    <svg width="100%" height="100%" viewBox="0 0 220 80" preserveAspectRatio="none">
      <polyline points={pts.join(" ")} fill="none" stroke={C.mint} strokeWidth={2} />
    </svg>
  );
};

// history events: background noise + learned A→B pairs
const R = rng(5);
const NOISE = Array.from({ length: 70 }).map(() => ({ x: 120 + R() * 760, h: 8 + R() * 16 }));
const PAIRS = [190, 330, 460, 610, 760].map((x) => ({ a: x, b: x + 46 + R() * 20 }));

export const S04Ai: React.FC = () => {
  const f = useCurrentFrame();
  const tDash = cue(ID, "dashboard");
  const tHappening = cue(ID, "happening");
  const tAdd = cue(ID, "add");
  const tLearning = cue(ID, "learning");
  const tMonths = cue(ID, "months");
  const tStarts = cue(ID, "starts");
  const tComing = cue(ID, "coming");

  const up = prog(f, tAdd - 6, 26, EASE_IN_OUT);
  const histIn = prog(f, tAdd + 4, 20);
  const scanX = lerp(110, 900, prog(f, tLearning - 4, tStarts - tLearning - 6, EASE_IN_OUT));
  const futureIn = prog(f, tStarts - 10, 18);
  const NOW = 900;
  const Y = 520;

  return (
    <AbsoluteFill>
      <GridBg />
      {/* dashboard */}
      <div
        style={{
          position: "absolute",
          left: 640,
          top: lerp(330, 170, up),
          transform: `translate(-50%,-50%) scale(${lerp(1, 0.66, up)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center", opacity: prog(f, tDash - 6, 14) }}>
          <Eyebrow>A great dashboard</Eyebrow>
          <Tag style={{ opacity: prog(f, tHappening - 4, 10) }}>What's happening · now</Tag>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Card title="PASTE HEIGHT" i={0}>
            <Bars n={14} seed={1} />
          </Card>
          <Card title="PLACEMENT" i={1}>
            <Spark seed={2} />
          </Card>
          <Card title="REFLOW ZONES" i={2}>
            <Bars n={8} seed={3} color={C.amber} base={0.55} />
          </Card>
          <Card title="AOI" i={3}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4, height: "100%" }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 2, background: (i * 7 + Math.floor(f / 5)) % 23 === 0 ? C.amber : "rgba(124,240,176,0.35)" }} />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* production history → forecast */}
      <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: histIn }}>
        <defs>
          <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(124,240,176,0.18)" strokeWidth="2" />
          </pattern>
          <clipPath id="learned">
            <rect x={0} y={0} width={scanX} height={720} />
          </clipPath>
        </defs>
        <text x={110} y={Y - 110} fill={C.green} fontFamily={MONO} fontSize={13} letterSpacing={2}>
          MONTHS OF PRODUCTION HISTORY
        </text>
        <line x1={110} x2={NOW} y1={Y} y2={Y} stroke={C.lineStrong} strokeWidth={2} />
        {NOISE.map((n, i) => (
          <line key={i} x1={n.x} x2={n.x} y1={Y - n.h} y2={Y} stroke="rgba(244,247,243,0.28)" strokeWidth={2} />
        ))}
        {["−6 MO", "−4 MO", "−2 MO"].map((m, i) => (
          <text key={m} x={110 + i * 263} y={Y + 26} fill={C.muted} fontFamily={MONO} fontSize={12}>
            {m}
          </text>
        ))}
        {/* learned pairs revealed by the scan */}
        <g clipPath="url(#learned)">
          {PAIRS.map((p, i) => (
            <g key={i}>
              <path d={`M${p.a} ${Y - 30} Q${(p.a + p.b) / 2} ${Y - 90} ${p.b} ${Y - 30}`} fill="none" stroke={C.mint} strokeWidth={1.6} strokeDasharray="4 4" />
              <rect x={p.a - 6} y={Y - 36} width={12} height={12} transform={`rotate(45 ${p.a} ${Y - 30})`} fill={C.amber} />
              <circle cx={p.b} cy={Y - 30} r={7} fill={C.red} />
            </g>
          ))}
        </g>
        {scanX < 899 && f > tLearning - 4 ? <rect x={scanX - 2} y={Y - 100} width={3} height={110} fill={C.mint} /> : null}
        {/* NOW + forecast zone */}
        <g opacity={futureIn}>
          <rect x={NOW} y={Y - 100} width={280} height={100} fill="url(#hatch)" />
          <line x1={NOW} x2={NOW} y1={Y - 120} y2={Y + 10} stroke={C.paper} strokeWidth={2} />
          <text x={NOW} y={Y + 26} textAnchor="middle" fill={C.paper} fontFamily={MONO} fontSize={12}>
            NOW
          </text>
          <text x={NOW + 140} y={Y + 26} textAnchor="middle" fill={C.mint} fontFamily={MONO} fontSize={12}>
            FORECAST
          </text>
          <rect x={NOW - 26} y={Y - 36} width={12} height={12} transform={`rotate(45 ${NOW - 20} ${Y - 30})`} fill={C.amber} />
          <path
            d={`M${NOW - 20} ${Y - 30} Q${NOW + 30} ${Y - 100} ${NOW + 70} ${Y - 30}`}
            fill="none"
            stroke={C.red}
            strokeWidth={2}
            strokeDasharray="5 5"
            strokeDashoffset={-f}
            opacity={prog(f, tComing - 8, 10)}
          />
          <circle cx={NOW + 70} cy={Y - 30} r={9} fill="none" stroke={C.red} strokeWidth={2.5} opacity={prog(f, tComing - 4, 10) * (0.6 + 0.4 * Math.sin(f / 4))} />
        </g>
      </svg>

      {/* legend */}
      <div style={{ position: "absolute", left: 110, top: Y + 52, display: "flex", gap: 28, opacity: prog(f, tMonths, 16) }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: FONT, fontSize: 18, color: C.paper }}>
          <div style={{ width: 11, height: 11, background: C.amber, transform: "rotate(45deg)" }} />
          small upstream signal
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: FONT, fontSize: 18, color: C.paper }}>
          <div style={{ width: 13, height: 13, borderRadius: 13, background: C.red }} />
          costly problem, a day or two later
        </div>
      </div>
      <div style={{ position: "absolute", left: NOW - 60, top: Y - 176 }}>
        <Reveal at={tComing - 6}>
          <Tag color={C.red}>What's coming</Tag>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
