import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Bg, Card, DrawPath, Eyebrow, Pop, Tag, Words } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_BACK, EASE_IN_OUT, FONT, MONO, lerp, prog, rng } from "../theme";

const ID = "ai";
const COLS = 26;
const ROWS = 7;
const R = rng(3);
const CELLS = Array.from({ length: COLS * ROWS }).map(() => R());
// warning sign (amber) → problem (red) pairs: [col,row] → [col,row]
const PAIRS: [[number, number], [number, number]][] = [
  [
    [4, 2],
    [6, 3],
  ],
  [
    [11, 5],
    [13, 4],
  ],
  [
    [18, 1],
    [20, 2],
  ],
];

const Heatmap: React.FC<{ off: number }> = ({ off }) => {
  const f = useCurrentFrame() + off;
  const tMonths = cue(ID, "months");
  const tTiny = cue(ID, "tiny");
  const tBig = cue(ID, "big");
  const cell = 30;
  const gap = 6;
  const x0 = 640 - (COLS * (cell + gap)) / 2;
  const y0 = 250;
  const pos = (c: number, r: number) => ({ x: x0 + c * (cell + gap) + cell / 2, y: y0 + r * (cell + gap) + cell / 2 });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: x0, top: 160 }}>
        <Eyebrow>Months of production data</Eyebrow>
        <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em", marginTop: 6, opacity: prog(f, tTiny - 6, 10) }}>
          Small warning signs come <span style={{ color: C.red }}>before</span> big problems.
        </div>
      </div>
      <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {CELLS.map((v, i) => {
          const c = Math.floor(i / ROWS);
          const r = i % ROWS;
          const p = prog(f, tMonths - 8 + c * 1.3 + r * 0.4, 8);
          const { x, y } = pos(c, r);
          const g = Math.round(lerp(220, 150, v));
          return <rect key={i} x={x - (cell / 2) * p} y={y - (cell / 2) * p} width={cell * p} height={cell * p} rx={6} fill={`rgb(${Math.round(lerp(200, 40, v))},${g + 20},${Math.round(lerp(210, 110, v))})`} opacity={0.55 + v * 0.45} />;
        })}
        {PAIRS.map(([a, b], i) => {
          const A = pos(...a);
          const B = pos(...b);
          const pa = prog(f, tTiny + i * 4, 10, EASE_BACK);
          const pb = prog(f, tBig + i * 4, 10, EASE_BACK);
          const arcP = prog(f, tBig + i * 4 + 4, 14);
          return (
            <g key={i}>
              <rect x={A.x - 16 * pa} y={A.y - 16 * pa} width={32 * pa} height={32 * pa} rx={7} fill={C.amber} />
              <rect x={B.x - 16 * pb} y={B.y - 16 * pb} width={32 * pb} height={32 * pb} rx={7} fill={C.red} />
              <DrawPath d={`M${A.x} ${A.y - 18} Q ${(A.x + B.x) / 2} ${Math.min(A.y, B.y) - 70} ${B.x} ${B.y - 18}`} p={arcP} stroke={C.ink} width={2.5} />
              {pa > 0.5 ? <circle cx={A.x} cy={A.y} r={18 + ((f % 20) / 20) * 16} fill="none" stroke={C.amber} strokeWidth={2} opacity={1 - (f % 20) / 20} /> : null}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: x0, top: 520, display: "flex", gap: 22, opacity: prog(f, tTiny, 10) }}>
        <Tag color={C.amber}>Tiny warning sign</Tag>
        <div style={{ opacity: prog(f, tBig, 10) }}>
          <Tag color={C.red}>Big problem, later</Tag>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Compare: React.FC<{ off: number }> = ({ off }) => {
  const f = useCurrentFrame() + off;
  const tHappening = cue(ID, "happening");
  const tTells = cue(ID, "tells");
  const tAbout = cue(ID, "about");
  const pL = prog(f, cue(ID, "doesn't") - 4, 16, EASE_BACK);
  const pR = prog(f, tTells - 6, 16, EASE_BACK);
  const fc = prog(f, tAbout - 4, 26, EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, top: 150, transform: `scale(${lerp(0.85, 1, pL)})`, opacity: prog(f, cue(ID, "doesn't") - 4, 6) * lerp(1, 0.55, prog(f, tTells, 10)) }}>
        <Card style={{ width: 470, height: 360, padding: 28 }}>
          <Eyebrow color={C.muted}>Dashboard</Eyebrow>
          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 800, color: C.ink, marginTop: 6 }}>What's happening</div>
          <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
            {[0.72, 0.55, 0.86].map((v, i) => (
              <svg key={i} width={120} height={120} viewBox="0 0 120 120">
                <circle cx={60} cy={60} r={46} stroke={C.line} strokeWidth={12} fill="none" />
                <circle cx={60} cy={60} r={46} stroke={C.green} strokeWidth={12} fill="none" strokeDasharray={`${289 * (v + 0.04 * Math.sin(f / 9 + i))} 289`} transform="rotate(-90 60 60)" strokeLinecap="round" />
                <text x={60} y={68} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.ink}>
                  {Math.round((v + 0.04 * Math.sin(f / 9 + i)) * 100)}
                </text>
              </svg>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: C.muted, marginTop: 24, letterSpacing: "0.1em", opacity: prog(f, tHappening - 4, 8) }}>● NOW</div>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 640, top: 120, transform: `scale(${lerp(0.85, 1.04, pR)})`, transformOrigin: "left center", opacity: prog(f, tTells - 6, 6) }}>
        <Card style={{ width: 520, height: 410, padding: 28, border: `2px solid ${C.green}` }}>
          <Eyebrow>AI digital twin</Eyebrow>
          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 800, color: C.ink, marginTop: 6 }}>What's about to happen</div>
          <svg width={460} height={200} viewBox="0 0 460 200" style={{ marginTop: 16 }}>
            <rect x={260} y={0} width={200} height={190} fill="rgba(14,159,85,0.07)" />
            <line x1={260} x2={260} y1={0} y2={190} stroke={C.ink} strokeDasharray="4 5" />
            <text x={266} y={16} fontFamily="IBM Plex Mono" fontSize={12} fill={C.muted}>
              FORECAST
            </text>
            <text x={232} y={186} fontFamily="IBM Plex Mono" fontSize={12} fill={C.muted}>
              NOW
            </text>
            <DrawPath d="M0 120 C40 112 80 128 120 116 C160 104 200 118 260 108" p={prog(f, tTells - 4, 16)} stroke={C.ink} width={3} />
            <DrawPath d="M260 108 C300 100 340 70 380 52 C410 40 440 32 460 26" p={fc} stroke={C.red} width={3.5} dash={fc > 0 ? "8 7" : "0 999"} />
            <path d="M260 108 C300 92 340 40 460 0 L460 70 C420 70 340 100 260 108 Z" fill="rgba(229,72,77,0.10)" opacity={fc} />
          </svg>
          <div style={{ marginTop: 6 }}>
            <Pop at={tAbout + 4 - off}>
              <Tag color={C.red} solid>
                Risk rising · act now
              </Tag>
            </Pop>
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

export const S05Ai: React.FC = () => {
  const f = useCurrentFrame();
  const tLearns = cue(ID, "learns") - 6;
  const tDoesnt = cue(ID, "doesn't") - 8;
  const slam = prog(f, cue(ID, "a") - 4, 14, EASE_BACK);
  return (
    <AbsoluteFill>
      <Bg tint="#CFF5DE" />
      <Sequence durationInFrames={tLearns + 8}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30, flexDirection: "row" }}>
          <Words text="Now add" at={2} size={110} />
          <div
            style={{
              width: 210,
              height: 210,
              borderRadius: 52,
              background: `linear-gradient(135deg, ${C.mint}, ${C.green})`,
              boxShadow: `0 30px 70px rgba(14,159,85,${0.25 + 0.15 * Math.sin(f / 4)})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 110,
              color: C.white,
              letterSpacing: "-0.04em",
              transform: `scale(${slam}) rotate(${(1 - slam) * -20}deg)`,
            }}
          >
            AI
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={tLearns} durationInFrames={tDoesnt - tLearns + 8}>
        <AbsoluteFill style={{ opacity: prog(f, tLearns, 8) }}>
          <Heatmap off={tLearns} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={tDoesnt}>
        <AbsoluteFill style={{ opacity: prog(f, tDoesnt, 8) }}>
          <Compare off={tDoesnt} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
