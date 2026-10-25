import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bg, Card, Eyebrow, Pop, Words } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_BACK, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

const ID = "simulate";

const Idea: React.FC<{ label: string; icon: React.ReactNode; at: number; x: number; y: number; tx: number; ty: number; land: number; result?: { ok: boolean; text: string; at: number }; out?: number }> = ({
  label,
  icon,
  at,
  x,
  y,
  tx,
  ty,
  land,
  result,
  out,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 14, EASE_BACK);
  const m = prog(f, land, 18, EASE_IN_OUT);
  const o = out === undefined ? 1 : 1 - prog(f, out, 10);
  const rp = result ? prog(f, result.at, 12, EASE_BACK) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: lerp(x, tx, m),
        top: lerp(y, ty, m),
        transform: `scale(${lerp(0.5, 1, p)})`,
        opacity: prog(f, at, 5) * o,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 20px 14px 14px",
        borderRadius: 18,
        background: C.white,
        boxShadow: C.shadow,
        border: `2px solid ${result && rp > 0.5 ? (result.ok ? C.green : C.red) : C.line}`,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.ink }}>{label}</div>
        {result ? (
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: result.ok ? C.green : C.red, opacity: rp, height: rp > 0 ? "auto" : 0 }}>
            {result.ok ? "✓ " : "✕ "}
            {result.text}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Flame = (
  <svg width="26" height="30" viewBox="0 0 26 30">
    <path d="M13 2 C16 9 23 12 23 20 A10 10 0 0 1 3 20 C3 14 8 12 9 6 C11 10 13 11 13 2 Z" fill={C.amber} />
  </svg>
);
const Tube = (
  <svg width="30" height="30" viewBox="0 0 30 30">
    <rect x="9" y="3" width="12" height="20" rx="3" fill="#9EA4A7" />
    <rect x="12" y="23" width="6" height="5" rx="1" fill="#6E757A" />
    <rect x="9" y="8" width="12" height="5" fill="#2F7BEF" />
  </svg>
);

export const S09Simulate: React.FC = () => {
  const f = useCurrentFrame();
  const tHot = cue(ID, "hotter");
  const tNew = cue(ID, "new");
  const tTest = cue(ID, "test");
  const tNot = cue(ID, "not");
  const tOnly = cue(ID, "only");
  const tBuilt = cue(ID, "built");
  const run = prog(f, tTest + 4, 26, (x) => x);
  const sandboxIn = prog(f, 4, 18, EASE_BACK);
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill style={{ paddingLeft: 70, paddingTop: 66 }}>
        <Words text="A safe place to experiment." at={cue(ID, "safe") - 6} size={54} mark={["safe"]} />
      </AbsoluteFill>
      {/* sandbox */}
      <div style={{ position: "absolute", left: 70, top: 180, transform: `scale(${sandboxIn})`, transformOrigin: "left top" }}>
        <Card style={{ width: 640, height: 420, padding: 24, border: `2px solid ${C.green}`, overflow: "hidden", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(rgba(18,183,106,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(18,183,106,0.10) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Eyebrow>Twin sandbox</Eyebrow>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 16, color: C.white, background: run > 0 && run < 1 ? C.amber : C.green, padding: "6px 14px", borderRadius: 10, opacity: prog(f, tTest - 4, 6) }}>
              {run >= 1 ? "Done" : "▶ Running"}
            </div>
          </div>
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, height: 10, borderRadius: 10, background: C.line, overflow: "hidden", opacity: prog(f, tTest - 4, 6) }}>
            <div style={{ width: `${run * 100}%`, height: "100%", background: C.green }} />
          </div>
        </Card>
      </div>
      <Idea label="Hotter oven?" icon={Flame} at={tHot - 6} x={860} y={150} tx={110} ty={260} land={tHot + 10} result={{ ok: true, text: "Joints look good", at: tTest + 22 }} />
      <Idea label="New solder paste?" icon={Tube} at={tNew - 6} x={860} y={250} tx={110} ty={370} land={tNew + 8} result={{ ok: false, text: "More voids", at: tTest + 30 }} out={tOnly + 6} />
      {/* real boards counter */}
      <div style={{ position: "absolute", left: 820, top: 300 }}>
        <Pop at={tNot - 4}>
          <Card style={{ width: 380, padding: "24px 28px" }}>
            <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.14em", color: C.muted }}>REAL BOARDS USED</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 110, color: C.green, letterSpacing: "-0.05em", lineHeight: 1 }}>
              0
            </div>
          </Card>
        </Pop>
      </div>
      {/* only what works gets built */}
      <div style={{ position: "absolute", left: 820, top: 470, opacity: prog(f, tOnly, 8) }}>
        <div
          style={{
            width: 380,
            padding: "20px 24px",
            borderRadius: 20,
            background: C.green,
            color: C.white,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 30,
            boxShadow: "0 20px 40px rgba(14,159,85,0.3)",
            transform: `scale(${lerp(0.8, 1, prog(f, tBuilt - 6, 12, EASE_BACK))})`,
          }}
        >
          Real build: <span style={{ fontWeight: 600 }}>hotter oven ✓</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
