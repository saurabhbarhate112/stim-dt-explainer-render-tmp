import React, { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { C, EASE_BACK, FONT, MONO, lerp, prog } from "../theme";

/* ---------- fonts (textures draw text, so nothing renders until these load) ---------- */
export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const faces = [
      new FontFace("DM Sans", `url(${staticFile("fonts/dm-sans-latin.woff2")}) format('woff2')`, { weight: "100 1000" }),
      new FontFace("IBM Plex Mono", `url(${staticFile("fonts/ibm-plex-mono-latin.woff2")}) format('woff2')`, { weight: "100 900" }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        setReady(true);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [handle]);
  return ready;
};

/* ---------- motion primitives ---------- */
export const Reveal: React.FC<{ at: number; dur?: number; y?: number; x?: number; blur?: number; scale?: number; out?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at,
  dur = 14,
  y = 24,
  x = 0,
  blur = 8,
  scale = 1,
  out,
  style,
  children,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur);
  const o = out === undefined ? 1 : 1 - prog(f, out, 8);
  return (
    <div
      style={{
        opacity: p * o,
        transform: `translate(${lerp(x, 0, p)}px, ${lerp(y, 0, p)}px) scale(${lerp(scale, 1, p)})`,
        filter: blur ? `blur(${(1 - p) * blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Springy pop-in. */
export const Pop: React.FC<{ at: number; dur?: number; from?: number; style?: React.CSSProperties; children: React.ReactNode; out?: number }> = ({ at, dur = 14, from = 0.6, style, children, out }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur, EASE_BACK);
  const o = out === undefined ? 1 : 1 - prog(f, out, 8);
  return <div style={{ opacity: Math.min(1, prog(f, at, 6)) * o, transform: `scale(${lerp(from, 1, p)})`, ...style }}>{children}</div>;
};

/** Kinetic headline: words rise out of a mask; `mark` words get a green highlighter swipe. */
export const Words: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  size?: number;
  weight?: number;
  color?: string;
  accent?: string[];
  accentColor?: string;
  mark?: string[];
  style?: React.CSSProperties;
  lineHeight?: number;
  out?: number;
}> = ({ text, at, stagger = 2.5, size = 72, weight = 700, color = C.ink, accent = [], accentColor = C.green, mark = [], style, lineHeight = 1.04, out }) => {
  const f = useCurrentFrame();
  const o = out === undefined ? 1 : 1 - prog(f, out, 8);
  const words = text.split(" ");
  return (
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, lineHeight, letterSpacing: "-0.035em", opacity: o, ...style }}>
      {words.map((w, i) => {
        const p = prog(f, at + i * stagger, 14);
        const clean = w.replace(/[^\w°+'-]/g, "");
        const isAccent = accent.includes(clean);
        const isMark = mark.includes(clean);
        const mp = prog(f, at + i * stagger + 8, 12);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.1em", marginBottom: "-0.1em" }}>
            <span style={{ display: "inline-block", position: "relative", transform: `translateY(${(1 - p) * 110}%)`, color: isAccent ? accentColor : isMark ? C.ink : undefined }}>
              {isMark ? (
                <span
                  style={{
                    position: "absolute",
                    left: "-0.06em",
                    right: "-0.06em",
                    top: "0.18em",
                    bottom: "0.02em",
                    background: "#9BF0C2",
                    transformOrigin: "left center",
                    transform: `scaleX(${mp})`,
                    zIndex: -1,
                    borderRadius: 4,
                  }}
                />
              ) : null}
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.green, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color, ...style }}>{children}</div>
);

/** White pill label with a status dot. */
export const Tag: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties; solid?: boolean; size?: number }> = ({ children, color = C.green, style, solid, size = 15 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 16px 9px 13px",
      borderRadius: 40,
      background: solid ? color : C.white,
      color: solid ? C.white : C.ink,
      boxShadow: C.shadowSm,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    <span style={{ width: 9, height: 9, borderRadius: 9, background: solid ? C.white : color }} />
    {children}
  </div>
);

export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: C.white, borderRadius: 18, boxShadow: C.shadow, border: `1px solid ${C.line}`, ...style }}>{children}</div>
);

/* ---------- backgrounds ---------- */
export const Bg: React.FC<{ tint?: string; dots?: boolean }> = ({ tint = "#DDF3E6", dots = true }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 80% at 50% 40%, #FFFFFF 0%, ${C.bg} 55%, ${C.bgDeep} 100%)`, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: 900,
          left: 700 + Math.sin(f / 90) * 60,
          top: -380 + Math.cos(f / 110) * 40,
          background: `radial-gradient(circle, ${tint} 0%, rgba(255,255,255,0) 65%)`,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: 700,
          left: -260 + Math.cos(f / 100) * 50,
          top: 300 + Math.sin(f / 80) * 40,
          background: "radial-gradient(circle, #E3EEFF 0%, rgba(255,255,255,0) 65%)",
          opacity: 0.7,
        }}
      />
      {dots ? (
        <AbsoluteFill
          style={{
            backgroundImage: "radial-gradient(rgba(14,34,25,0.13) 1.2px, transparent 1.3px)",
            backgroundSize: "28px 28px",
            backgroundPosition: `${(f * 0.3) % 28}px 0px`,
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** Barely-there grain + soft edge falloff shared by every scene. */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  const seed = f % 6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 95% 90% at 50% 50%, transparent 65%, rgba(14,34,25,0.10) 100%)" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.035, mixBlendMode: "multiply" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const DrawPath: React.FC<{ d: string; p: number; stroke?: string; width?: number; dash?: string; opacity?: number; length?: number; fill?: string }> = ({
  d,
  p,
  stroke = C.green,
  width = 3,
  dash,
  opacity = 1,
  length = 3000,
  fill = "none",
}) => (
  <path
    d={d}
    fill={fill}
    stroke={stroke}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
    strokeDasharray={dash ?? `${length} ${length}`}
    strokeDashoffset={dash ? undefined : length * (1 - p)}
    pathLength={dash ? undefined : length}
  />
);

/** Counts up/down between values. */
export const Counter: React.FC<{ from: number; to: number; at: number; dur: number; suffix?: string; style?: React.CSSProperties; decimals?: number }> = ({ from, to, at, dur, suffix = "", style, decimals = 0 }) => {
  const f = useCurrentFrame();
  const v = lerp(from, to, prog(f, at, dur));
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{v.toFixed(decimals) + suffix}</span>;
};

/** Phone-style push notification. */
export const Notice: React.FC<{ at: number; icon: string; title: string; body: string; color?: string; style?: React.CSSProperties }> = ({ at, icon, title, body, color = C.amber, style }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 16, EASE_BACK);
  return (
    <div
      style={{
        width: 470,
        display: "flex",
        gap: 16,
        alignItems: "center",
        padding: "18px 20px",
        borderRadius: 22,
        background: "rgba(255,255,255,0.96)",
        boxShadow: "0 24px 60px rgba(14,34,25,0.22)",
        border: `1px solid ${C.line}`,
        transform: `translateY(${(1 - p) * -60}px) scale(${lerp(0.9, 1, p)})`,
        opacity: prog(f, at, 6),
        ...style,
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 14, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: C.white, fontWeight: 800, fontFamily: FONT, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 21, color: C.ink }}>{title}</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 17, color: C.muted, marginTop: 3 }}>{body}</div>
      </div>
    </div>
  );
};
