import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { OVERLAP, SCENES, TOTAL } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, prog } from "../theme";

export type Enter = "fade" | "wipe" | "zoom" | "iris" | "cut" | "slide";

/** Incoming-scene transition, played over the overlap with the previous scene. */
export const SceneWrap: React.FC<{ enter: Enter; children: React.ReactNode }> = ({ enter, children }) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, OVERLAP, EASE_IN_OUT);
  let style: React.CSSProperties = {};
  let edge: React.ReactNode = null;
  if (enter === "fade") style = { opacity: p };
  if (enter === "zoom") style = { opacity: p, transform: `scale(${1.08 - 0.08 * p})`, filter: `blur(${(1 - p) * 10}px)` };
  if (enter === "slide") style = { transform: `translateX(${(1 - p) * 100}%)` };
  if (enter === "iris") style = { clipPath: `circle(${p * 80}% at 50% 50%)` };
  if (enter === "wipe") {
    style = { clipPath: `inset(0 0 0 ${(1 - p) * 100}%)` };
    edge =
      p > 0 && p < 1 ? (
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(1 - p) * 100}%`, width: 3, background: C.mint, boxShadow: `0 0 24px 6px ${C.green}` }} />
      ) : null;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ ...style, overflow: "hidden" }}>{children}</AbsoluteFill>
      {edge}
    </AbsoluteFill>
  );
};

/** Graded stock clip with a slow push-in. */
export const Stock: React.FC<{ src: string; from?: number; scale?: [number, number]; dur?: number; style?: React.CSSProperties; origin?: string }> = ({
  src,
  scale = [1.04, 1.12],
  dur = 150,
  style,
  origin = "50% 50%",
}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], scale, { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.bg, ...style }}>
      <Video src={staticFile(`stock/${src}.mp4`)} muted objectFit="cover" style={{ width: "100%", height: "100%", transform: `scale(${s})`, transformOrigin: origin }} />
    </AbsoluteFill>
  );
};

/* ---------- persistent brand chrome ---------- */
export const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const current = [...SCENES].reverse().find((s) => f >= s.from + OVERLAP / 2);
  const showBug = f > SCENES[2].from && f < SCENES[SCENES.length - 1].from + 20;
  const bugO = prog(f, SCENES[2].from, 20) * (1 - prog(f, SCENES[SCENES.length - 1].from, 14));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {SCENES.filter((s) => s.chapter).map((s) => {
        const local = f - s.from;
        if (local < 0 || local > s.dur) return null;
        const pin = prog(local, 4, 18);
        const pout = prog(local, s.dur - OVERLAP - 6, 10);
        const [num, ...rest] = s.chapter!.split(" — ");
        return (
          <div key={s.id} style={{ position: "absolute", left: 48, top: 38, display: "flex", alignItems: "center", gap: 12, opacity: pin * (1 - pout) }}>
            <div style={{ width: 26 * pin, height: 2, background: C.green }} />
            <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.16em", color: C.green }}>{num}</div>
            <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.16em", color: "rgba(244,247,243,0.72)", textTransform: "uppercase" }}>{rest.join(" — ")}</div>
          </div>
        );
      })}
      {showBug ? <Img src={staticFile("img/stim-logo-light.svg")} style={{ position: "absolute", right: 46, top: 30, height: 30, opacity: 0.82 * bugO }} /> : null}
      {/* thin progress rule */}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 2, width: `${(f / TOTAL) * 100}%`, background: C.green, opacity: current?.id === "cta" ? 0 : 0.5 }} />
    </AbsoluteFill>
  );
};

/* ---------- animated captions ---------- */
const DISPLAY: Record<string, string> = { "Stim's": "STIM's", "mis-pick.": "mis‑pick.", "fine-pitch": "fine‑pitch", "what-if": "what‑if" };

type W = { w: string; s: number; e: number };
const merge = (words: W[]): W[] => {
  // "A I" → "AI", "six P M" → "6 PM"
  const out: W[] = [];
  for (let i = 0; i < words.length; i++) {
    const a = words[i];
    const b = words[i + 1];
    if (a.w === "A" && b?.w === "I") {
      out.push({ w: "AI", s: a.s, e: b.e });
      i++;
    } else if (a.w === "six" && b?.w === "P" && words[i + 2]?.w === "M") {
      out.push({ w: "6", s: a.s, e: a.e }, { w: "PM", s: b.s, e: words[i + 2].e });
      i += 2;
    } else out.push({ ...a, w: DISPLAY[a.w] ?? a.w });
  }
  return out;
};

const chunk = (words: W[]) => {
  // Break into caption phrases: max ~38 chars, prefer sentence/comma ends and pauses.
  const groups: W[][] = [];
  let cur: W[] = [];
  let len = 0;
  words.forEach((w, i) => {
    cur.push(w);
    len += w.w.length + 1;
    const next = words[i + 1];
    const pause = next ? next.s - w.e > 0.28 : true;
    const punct = /[.?!,]$/.test(w.w);
    if (!next || len > 34 || (punct && len > 12) || (pause && len > 14) || /[.?!]$/.test(w.w)) {
      groups.push(cur);
      cur = [];
      len = 0;
    }
  });
  return groups;
};

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = (frame: number) => frame / 30;
  for (const s of SCENES) {
    const local = t(f - s.voFrom);
    if (local < -0.2 || local > s.voDur / 30 + 0.5) continue;
    const groups = chunk(merge(s.words));
    const g = groups.find((gr, i) => {
      const end = groups[i + 1] ? groups[i + 1][0].s - 0.02 : gr[gr.length - 1].e + 0.45;
      return local >= gr[0].s - 0.12 && local < end;
    });
    if (!g) return null;
    const gStart = (g[0].s - 0.12) * 30 + s.voFrom;
    const pin = prog(f, gStart, 6);
    return (
      <AbsoluteFill style={{ pointerEvents: "none", justifyContent: "flex-end", alignItems: "center", paddingBottom: 30 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 27,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            padding: "8px 18px 9px",
            borderRadius: 6,
            background: "rgba(5,14,11,0.62)",
            backdropFilter: "blur(6px)",
            opacity: pin,
            transform: `translateY(${(1 - pin) * 6}px)`,
            whiteSpace: "nowrap",
          }}
        >
          {g.map((w, i) => {
            const spoken = local >= w.s - 0.03;
            return (
              <span key={i} style={{ color: spoken ? C.paper : "rgba(244,247,243,0.45)" }}>
                {w.w.replace(/[,]$/, "")}
                {i < g.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }
  return null;
};
