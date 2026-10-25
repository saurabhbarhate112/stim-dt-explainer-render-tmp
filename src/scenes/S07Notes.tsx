import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bg, Card, Eyebrow, Words } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, lerp, prog, rng } from "../theme";

const ID = "notes";
const LOGS = [
  { name: "Printer log", color: "#2F7BEF", x: 170, y: 150, r: -7 },
  { name: "Placement log", color: "#8B5CF6", x: 700, y: 120, r: 5 },
  { name: "Oven log", color: C.amber, x: 220, y: 390, r: 4 },
  { name: "AOI log", color: C.green, x: 760, y: 380, r: -5 },
];
const R = rng(8);
const SCRIBBLE = Array.from({ length: 6 }).map(() => 0.4 + R() * 0.55);

export const S07Notes: React.FC = () => {
  const f = useCurrentFrame();
  const tTwin = cue(ID, "twin");
  const merge = prog(f, tTwin - 4, 20, EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <Bg />
      {LOGS.map((l, i) => {
        const p = prog(f, cue(ID, "each") - 6 + i * 4, 14);
        // separate notebook → one row of the shared record
        const x = lerp(l.x, 300, merge);
        const y = lerp(l.y, 250 + i * 66, merge);
        const w = lerp(340, 680, merge);
        const h = lerp(190, 56, merge);
        return (
          <div
            key={l.name}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: lerp(14, 12, merge),
              background: C.white,
              boxShadow: C.shadow,
              transform: `rotate(${l.r * (1 - merge)}deg) scale(${lerp(0.7, 1, p)})`,
              opacity: p,
              overflow: "hidden",
              display: "flex",
              flexDirection: merge > 0.5 ? "row" : "column",
              alignItems: merge > 0.5 ? "center" : "stretch",
            }}
          >
            <div style={{ height: merge > 0.5 ? "100%" : 40, width: merge > 0.5 ? 170 : "100%", background: l.color, color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", paddingLeft: 16, flexShrink: 0 }}>
              {l.name}
            </div>
            {merge < 0.5 ? (
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 11, opacity: 1 - merge * 2 }}>
                {SCRIBBLE.slice(0, 4).map((v, k) => (
                  <div key={k} style={{ height: 6, width: `${v * 100}%`, borderRadius: 6, background: "rgba(14,34,25,0.14)" }} />
                ))}
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", gap: 6, padding: "0 16px", alignItems: "center", opacity: (merge - 0.5) * 2 }}>
                {Array.from({ length: 14 }).map((_, k) => (
                  <div key={k} style={{ flex: 1, height: 22, borderRadius: 5, background: l.color, opacity: 0.25 + 0.6 * Math.abs(Math.sin(k * 1.3 + i)) }} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 300, top: 170, opacity: prog(f, tTwin + 8, 10) }}>
        <Eyebrow>One shared record</Eyebrow>
        <div style={{ fontFamily: MONO, fontSize: 16, color: C.ink, marginTop: 6 }}>BOARD #4,812 · PRINTER → PLACEMENT → OVEN → AOI</div>
      </div>
      <div style={{ position: "absolute", left: 1010, top: 300, opacity: prog(f, tTwin + 6, 12) }}>
        <Card style={{ width: 170, height: 170, borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${C.green}` }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.green, textAlign: "center", lineHeight: 1.1 }}>
            Digital
            <br />
            twin
          </div>
        </Card>
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120, opacity: 1 - merge }}>
        <Words text="Every machine, its own notes." at={cue(ID, "each") - 4} size={52} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
