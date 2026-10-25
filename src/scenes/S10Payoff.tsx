import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DrawPath, Eyebrow, GridBg } from "../components/ui";
import { cue } from "../timeline";
import { C, FONT, lerp, prog } from "../theme";

const ID = "payoff";

const ICONS: Record<string, string[]> = {
  defects: ["M40 8 L68 20 V44 C68 62 54 72 40 78 C26 72 12 62 12 44 V20 Z", "M27 42 L37 52 L55 32"],
  scrap: ["M10 24 H70 V58 H10 Z", "M20 34 H34 M44 34 H60 M20 46 H50", "M40 64 V78 M32 70 L40 78 L48 70"],
  maint: ["M12 18 H68 V70 H12 Z", "M12 32 H68", "M26 10 V24 M54 10 V24", "M28 50 L36 58 L54 42"],
  builds: ["M10 60 H24 L32 44 L42 66 L50 52 H70", "M58 14 L62 22 L70 23 L64 29 L66 37 L58 33 L50 37 L52 29 L46 23 L54 22 Z"],
};

const TILES = [
  { k: "defects", word: "fewer", title: "Fewer defects", sub: "Catch drift before boards fail." },
  { k: "scrap", word: "less", title: "Less scrap", sub: "Test changes on the model, not on real boards." },
  { k: "maint", word: "planned", title: "Planned maintenance", sub: "Fix machines on your schedule." },
  { k: "builds", word: "calmer", title: "Calmer first builds", sub: "Start new products from a proven setup." },
];

export const S10Payoff: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GridBg />
      <div style={{ position: "absolute", left: 90, top: 110, opacity: prog(f, 4, 14) }}>
        <Eyebrow>What an AI digital twin adds up to</Eyebrow>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 170, display: "flex", gap: 20 }}>
        {TILES.map((t) => {
          const at = cue(ID, t.word) - 6;
          const p = prog(f, at, 18);
          const draw = prog(f, at + 4, 26);
          return (
            <div
              key={t.k}
              style={{
                flex: 1,
                height: 330,
                borderRadius: 10,
                padding: "28px 24px",
                background: C.panel,
                border: `1px solid ${p > 0.9 ? "rgba(124,240,176,0.35)" : C.line}`,
                opacity: p,
                transform: `translateY(${lerp(30, 0, p)}px)`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <svg width={80} height={86} viewBox="0 0 80 86">
                {ICONS[t.k].map((d, j) => (
                  <DrawPath key={j} d={d} p={prog(f, at + 4 + j * 5, 22)} stroke={j === ICONS[t.k].length - 1 ? C.green : C.paper} width={3} length={400} />
                ))}
              </svg>
              <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: C.paper, marginTop: 28, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{t.title}</div>
              <div style={{ fontFamily: FONT, fontSize: 18, color: C.muted, marginTop: 12, lineHeight: 1.4, opacity: draw }}>{t.sub}</div>
              <div style={{ marginTop: "auto", height: 3, width: `${draw * 100}%`, background: C.green, opacity: 0.8 }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
