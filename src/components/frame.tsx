import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { OVERLAP, SCENES, TOTAL } from "../timeline";
import { C, EASE_IN_OUT, EASE_OUT, FONT, prog } from "../theme";

export type Enter = "cut" | "fade" | "whip" | "whipUp" | "zoom" | "flash" | "push";

/** Incoming-scene transition over the overlap with the previous scene. */
export const SceneWrap: React.FC<{ enter: Enter; children: React.ReactNode }> = ({ enter, children }) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, OVERLAP, EASE_IN_OUT);
  const q = prog(f, 0, OVERLAP, EASE_OUT);
  let style: React.CSSProperties = {};
  let overlay: React.ReactNode = null;
  if (enter === "fade") style = { opacity: p };
  if (enter === "zoom") style = { opacity: q, transform: `scale(${1.25 - 0.25 * q})`, filter: `blur(${(1 - q) * 14}px)` };
  if (enter === "whip") style = { transform: `translateX(${(1 - q) * 100}%)`, filter: `blur(${(1 - q) * 24}px)` };
  if (enter === "whipUp") style = { transform: `translateY(${(1 - q) * 100}%)`, filter: `blur(${(1 - q) * 20}px)` };
  if (enter === "push") style = { clipPath: `inset(0 0 0 ${(1 - p) * 100}%)` };
  if (enter === "flash") {
    style = { opacity: f >= OVERLAP / 2 ? 1 : 0 };
    const w = 1 - Math.abs(f - OVERLAP / 2) / (OVERLAP / 2);
    overlay = <AbsoluteFill style={{ background: "#FFFFFF", opacity: Math.max(0, w) * 0.9, pointerEvents: "none" }} />;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ ...style, overflow: "hidden" }}>{children}</AbsoluteFill>
      {overlay}
    </AbsoluteFill>
  );
};

/** Bright stock clip with a slow push-in. */
export const Stock: React.FC<{ src: string; scale?: [number, number]; dur?: number; style?: React.CSSProperties; origin?: string; trimBefore?: number }> = ({
  src,
  scale = [1.04, 1.14],
  dur = 120,
  style,
  origin = "50% 50%",
  trimBefore,
}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], scale, { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.bg, ...style }}>
      <Video src={staticFile(`stock/${src}.mp4`)} muted objectFit="cover" trimBefore={trimBefore} style={{ width: "100%", height: "100%", transform: `scale(${s})`, transformOrigin: origin }} />
    </AbsoluteFill>
  );
};

/* ---------- brand chrome ---------- */
export const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const last = SCENES[SCENES.length - 1];
  const bugO = prog(f, SCENES[1].from + 10, 14) * (1 - prog(f, last.from, 10));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img src={staticFile("img/stim-logo.svg")} style={{ position: "absolute", right: 40, top: 30, height: 28, opacity: 0.9 * bugO }} />
      <div style={{ position: "absolute", left: 0, top: 0, height: 4, width: `${(f / TOTAL) * 100}%`, background: C.green, opacity: f > last.from ? 0 : 0.9 }} />
    </AbsoluteFill>
  );
};

/* ---------- karaoke captions ---------- */
const DISPLAY: Record<string, string> = { "Stim's": "STIM's" };
type W = { w: string; s: number; e: number };
const merge = (words: W[]): W[] => {
  const out: W[] = [];
  for (let i = 0; i < words.length; i++) {
    const a = words[i];
    const b = words[i + 1];
    if (a.w === "A" && (b?.w === "I" || b?.w === "I." || b?.w === "I,")) {
      out.push({ w: "AI" + b.w.slice(1), s: a.s, e: b.e });
      i++;
    } else out.push({ ...a, w: DISPLAY[a.w] ?? a.w });
  }
  return out;
};
const chunk = (words: W[]) => {
  const groups: W[][] = [];
  let cur: W[] = [];
  let len = 0;
  words.forEach((w, i) => {
    cur.push(w);
    len += w.w.length + 1;
    const next = words[i + 1];
    const pause = next ? next.s - w.e > 0.25 : true;
    if (!next || len > 26 || (/[,]$/.test(w.w) && len > 10) || (pause && len > 10) || /[.?!]$/.test(w.w)) {
      groups.push(cur);
      cur = [];
      len = 0;
    }
  });
  return groups;
};

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  for (const s of SCENES) {
    const local = (f - s.voFrom) / 30;
    if (local < -0.15 || local > s.voDur / 30 + 0.4) continue;
    const groups = chunk(merge(s.words));
    const gi = groups.findIndex((gr, i) => {
      const end = groups[i + 1] ? groups[i + 1][0].s - 0.02 : gr[gr.length - 1].e + 0.35;
      return local >= gr[0].s - 0.1 && local < end;
    });
    if (gi < 0) return null;
    const g = groups[gi];
    const gStart = (g[0].s - 0.1) * 30 + s.voFrom;
    const pin = prog(f, gStart, 5, EASE_OUT);
    return (
      <AbsoluteFill style={{ pointerEvents: "none", justifyContent: "flex-end", alignItems: "center", paddingBottom: 34 }}>
        <div
          style={{
            display: "flex",
            gap: 7,
            fontFamily: FONT,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "-0.015em",
            padding: "8px 12px",
            borderRadius: 16,
            background: "rgba(14,34,25,0.86)",
            boxShadow: "0 12px 30px rgba(14,34,25,0.25)",
            transform: `translateY(${(1 - pin) * 14}px) scale(${0.94 + 0.06 * pin})`,
            opacity: pin,
            whiteSpace: "nowrap",
          }}
        >
          {g.map((w, i) => {
            const active = local >= w.s - 0.04 && (i === g.length - 1 ? true : local < g[i + 1].s - 0.04);
            const spoken = local >= w.s - 0.04;
            return (
              <span
                key={i}
                style={{
                  padding: "2px 7px",
                  borderRadius: 8,
                  background: active ? C.mint : "transparent",
                  color: active ? C.ink : spoken ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                }}
              >
                {w.w.replace(/[,.]$/, "")}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }
  return null;
};
