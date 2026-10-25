import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Bg, Card, DrawPath, Eyebrow, Notice, Pop, Tag, Words } from "../components/ui";
import { MM } from "../three/board";
import { Pcb } from "../three/Pcb";
import { Cam, Stage, Studio, camPath } from "../three/Stage";
import { cue } from "../timeline";
import { C, EASE_BACK, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

const ID = "predict";

/* a: callback to the board from the hook */
const Callback: React.FC = () => {
  const f = useCurrentFrame();
  const cam: Cam = camPath(f, [
    [0, { pos: [2.4, 1.9, 2.6], target: [0.3, 0, 0.1], fov: 34 }],
    [80, { pos: [1.45, 0.8, 1.25], target: [17 * MM, 0, 7 * MM], fov: 30 }],
  ]);
  return (
    <AbsoluteFill>
      <Bg />
      <Stage cam={cam}>
        <Studio floorY={-0.06} />
        <Pcb />
      </Stage>
      <div style={{ position: "absolute", left: 70, top: 80 }}>
        <Pop at={4}>
          <Tag color={C.ink} size={24}>
            Back to board #4,812
          </Tag>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

/* b: why paste volume drops — cross-section through a stencil aperture */
const CrossSection: React.FC<{ off: number }> = ({ off }) => {
  const f = useCurrentFrame() + off;
  const dry = prog(f, cue(ID, "drying") - 6, 40);
  const each = cue(ID, "each");
  const fill = 1 - dry * 0.35;
  return (
    <AbsoluteFill>
      <Bg />
      <div style={{ position: "absolute", left: 80, top: 80 }}>
        <Eyebrow>Inside the stencil · side view</Eyebrow>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: C.ink, letterSpacing: "-0.03em", marginTop: 6 }}>
          Paste is <span style={{ color: C.amber }}>drying</span> in the holes
        </div>
      </div>
      <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {/* board + pads */}
        <rect x={80} y={470} width={720} height={60} rx={6} fill="#0B4F2E" />
        {[210, 450].map((x) => (
          <rect key={x} x={x - 70} y={458} width={140} height={14} rx={2} fill="#E3B65C" />
        ))}
        {/* stencil with apertures */}
        {[
          [80, 120],
          [280, 100],
          [520, 280],
        ].map(([x, w]) => (
          <rect key={x} x={x} y={380} width={w} height={60} fill="#B9C0C3" stroke="#8E979B" strokeWidth={2} />
        ))}
        {[210, 450].map((cx) => (
          <g key={cx}>
            {/* dried crust on aperture walls */}
            <rect x={cx - 80} y={380} width={10 + dry * 26} height={60} fill="#B07A3A" opacity={0.9} />
            <rect x={cx + 70 - dry * 26} y={380} width={10 + dry * 26} height={60} fill="#B07A3A" opacity={0.9} />
            {/* deposit on the pad */}
            <path
              d={`M${cx - 62 * fill} 458 C${cx - 62 * fill} ${458 - 40 * fill} ${cx + 62 * fill} ${458 - 40 * fill} ${cx + 62 * fill} 458 Z`}
              fill="#8E9497"
            />
          </g>
        ))}
        <text x={210} y={370} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize={14} fill={C.muted}>
          STENCIL
        </text>
        <text x={440} y={560} fontFamily="IBM Plex Mono" fontSize={14} fill={C.muted}>
          PAD + PASTE DEPOSIT
        </text>
      </svg>
      {/* each board, a little less paste */}
      <div style={{ position: "absolute", left: 850, top: 220, width: 360 }}>
        <Card style={{ padding: "18px 22px" }}>
          <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.14em", color: C.muted }}>PASTE PER BOARD</div>
          {[100, 99, 97, 96, 94].map((v, i) => {
            const p = prog(f, each - 4 + i * 6, 10);
            return (
              <div key={v} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, opacity: p }}>
                <span style={{ fontFamily: MONO, fontSize: 14, width: 64, color: C.ink }}>#{4808 + i}</span>
                <div style={{ flex: 1, height: 16, borderRadius: 8, background: C.line, overflow: "hidden" }}>
                  <div style={{ width: `${(v - 50) * 2 * p}%`, height: "100%", borderRadius: 8, background: i > 2 ? C.amber : C.green }} />
                </div>
                <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 18, width: 52, textAlign: "right", color: C.ink }}>{v}%</span>
              </div>
            );
          })}
        </Card>
      </div>
    </AbsoluteFill>
  );
};

/* c: still in spec, still passing */
const Stamps: React.FC<{ off: number }> = ({ off }) => {
  const f = useCurrentFrame() + off;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
      <Bg tint="#CFF5DE" />
      {[
        ["Still in spec", cue(ID, "still")],
        ["Still passing", cue(ID, "still", 2)],
      ].map(([t, at]) => {
        const p = prog(f, (at as number) - 4, 12, EASE_BACK);
        return (
          <div
            key={t as string}
            style={{
              position: "relative",
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 84,
              letterSpacing: "-0.03em",
              color: C.green,
              border: `8px solid ${C.green}`,
              borderRadius: 26,
              padding: "6px 36px",
              transform: `scale(${lerp(1.8, 1, p)}) rotate(${-3}deg)`,
              opacity: prog(f, (at as number) - 4, 4),
              background: "rgba(255,255,255,0.7)",
            }}
          >
            ✓ {t as string}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* d–f: the pattern, the flag, the wipe */
const X0 = 110;
const X1 = 830;
const yv = (v: number) => 180 + ((105 - v) / 45) * 380;
const xh = (h: number) => X0 + (h / 8) * (X1 - X0);
const GHOST = [100, 98, 95.5, 92.5, 89, 84.5, 79.5, 73, 68];
const path = (pts: [number, number][]) => pts.map(([h, v], i) => `${i ? "L" : "M"}${xh(h).toFixed(1)} ${yv(v).toFixed(1)}`).join(" ");

const Chart: React.FC<{ off: number }> = ({ off }) => {
  const f = useCurrentFrame() + off;
  const tPattern = cue(ID, "pattern");
  const tWeak = cue(ID, "weak");
  const tHour = cue(ID, "hour");
  const tFlag = cue(ID, "flag");
  const tRaises = cue(ID, "raises");
  const tWipes = cue(ID, "wipes");
  const ghost = prog(f, tPattern - 10, tWeak - tPattern + 14, EASE_IN_OUT);
  const cur = prog(f, cue(ID, "so") - 10, tHour - cue(ID, "so") + 20, EASE_IN_OUT);
  const after = prog(f, tWipes - 2, 40, EASE_IN_OUT);
  const curPts: [number, number][] = [
    [0, 100],
    [1, 98.2],
    [2, 95.9],
    [3, 93.2],
  ];
  const afterPts: [number, number][] = [
    [3, 93.2],
    [3.1, 100],
    [4, 100.4],
    [5, 99.6],
    [6, 100.2],
    [7, 99.8],
    [8, 100.1],
  ];
  const flagged = f > tRaises - 4;
  return (
    <AbsoluteFill>
      <Bg />
      <div style={{ position: "absolute", left: X0, top: 90 }}>
        <Eyebrow>Paste volume · hours into the shift</Eyebrow>
      </div>
      <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <rect x={X0} y={yv(75)} width={X1 - X0} height={yv(60) - yv(75)} rx={8} fill="rgba(229,72,77,0.10)" />
        <text x={X1 - 12} y={yv(62)} textAnchor="end" fontFamily="IBM Plex Mono" fontSize={14} fill={C.red}>
          WEAK-JOINT ZONE
        </text>
        <line x1={X0} x2={X1} y1={yv(75)} y2={yv(75)} stroke={C.red} strokeDasharray="7 7" strokeWidth={2} />
        <text x={X0 + 8} y={yv(75) - 10} fontFamily="IBM Plex Mono" fontSize={13} fill={C.red}>
          SPEC MINIMUM
        </text>
        {Array.from({ length: 9 }).map((_, h) => (
          <text key={h} x={xh(h)} y={yv(60) + 26} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize={13} fill={C.muted}>
            {h}h
          </text>
        ))}
        <line x1={X0} x2={X1} y1={yv(60)} y2={yv(60)} stroke={C.lineStrong} />
        <g opacity={1 - 0.7 * prog(f, tWipes + 20, 16)}>
          <DrawPath d={path(GHOST.map((v, h) => [h, v]))} p={ghost} stroke="rgba(229,72,77,0.65)" width={4} dash={ghost > 0.02 ? "10 8" : "0 999"} />
          {ghost > 0.95 ? <circle cx={xh(7)} cy={yv(73)} r={12} fill={C.red} /> : null}
        </g>
        <DrawPath d={path(curPts)} p={cur} stroke={C.ink} width={5} />
        <DrawPath d={path(afterPts)} p={after} stroke={C.green} width={5} />
        {flagged ? (
          <g>
            <circle cx={xh(3)} cy={yv(93.2)} r={14 + ((f % 18) / 18) * 18} fill="none" stroke={C.amber} strokeWidth={3} opacity={1 - (f % 18) / 18} />
            <circle cx={xh(3)} cy={yv(93.2)} r={10} fill={C.amber} />
          </g>
        ) : null}
      </svg>
      <div style={{ position: "absolute", left: X0 + 10, top: 130, display: "flex", gap: 14, opacity: prog(f, tPattern - 10, 10) }}>
        <Tag color={C.red} size={16}>
          Last time
        </Tag>
        <div style={{ opacity: prog(f, cue(ID, "so") - 8, 8) }}>
          <Tag color={C.ink} size={16}>
            This shift
          </Tag>
        </div>
      </div>
      <div style={{ position: "absolute", left: xh(7) - 250, top: yv(73) + 24 }}>
        <Pop at={tWeak - 4 - off} out={tWipes + 20 - off}>
          <Tag color={C.red} solid size={18}>
            Ends in weak solder joints
          </Tag>
        </Pop>
      </div>
      <div style={{ position: "absolute", left: xh(3) - 40, top: yv(93.2) + 30 }}>
        <Pop at={cue(ID, "three") - 4 - off}>
          <Tag color={C.amber} size={17}>
            Hour 3
          </Tag>
        </Pop>
      </div>
      <div style={{ position: "absolute", right: 50, top: 150 }}>
        <Notice at={tRaises - 4 - off} icon="!" title="Twin alert · Stencil 2" body="Paste volume trending down. Wipe now." color={C.amber} style={{ width: 400 }} />
      </div>
      <div style={{ position: "absolute", right: 50, top: 270 }}>
        <Notice at={tWipes - 4 - off} icon="✓" title="Stencil wiped" body="Paste volume back to 100%" color={C.green} style={{ width: 400 }} />
      </div>
      <div style={{ position: "absolute", right: 190, top: 400, opacity: prog(f, tFlag, 8) }}>
        <div style={{ fontFamily: MONO, fontSize: 13, color: C.muted, letterSpacing: "0.12em" }}>FLAGGED BEFORE ANY BOARD FAILED</div>
      </div>
    </AbsoluteFill>
  );
};

/* g: the bad batch never happens */
const Never: React.FC<{ off: number }> = ({ off }) => {
  const f = useCurrentFrame() + off;
  const tNever = cue(ID, "never");
  const p = prog(f, tNever - 4, 12, EASE_BACK);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Bg tint="#CFF5DE" />
      <div style={{ position: "relative" }}>
        <Words text="The bad batch?" at={cue(ID, "bad") - off - 6} size={92} />
        <div style={{ position: "absolute", left: -20, right: -20, top: "52%", height: 10, borderRadius: 10, background: C.red, transformOrigin: "left", transform: `scaleX(${prog(f, tNever - 2, 10)})` }} />
      </div>
      <div
        style={{
          marginTop: 30,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 76,
          color: C.white,
          background: C.green,
          borderRadius: 24,
          padding: "10px 36px",
          transform: `scale(${lerp(1.6, 1, p)}) rotate(-2deg)`,
          opacity: prog(f, tNever - 4, 4),
          boxShadow: "0 24px 50px rgba(14,159,85,0.35)",
        }}
      >
        Never happens.
      </div>
    </AbsoluteFill>
  );
};

export const S08Predict: React.FC = () => {
  const f = useCurrentFrame();
  const b = cue(ID, "stencil") - 6;
  const c = cue(ID, "still") - 6;
  const d = cue(ID, "but") - 6;
  const g = cue(ID, "and") - 4;
  const seq = (from: number, to: number, el: React.ReactNode, enter = 6) => (
    <Sequence from={from} durationInFrames={to - from + 6}>
      <AbsoluteFill style={{ opacity: prog(f, from, enter), transform: `scale(${interpolate(prog(f, from, 10), [0, 1], [1.04, 1])})` }}>{el}</AbsoluteFill>
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {seq(0, b, <Callback />, 1)}
      {seq(b, c, <CrossSection off={b} />)}
      {seq(c, d, <Stamps off={c} />, 3)}
      {seq(d, g, <Chart off={d} />)}
      {seq(g, 9999, <Never off={g} />, 3)}
    </AbsoluteFill>
  );
};
