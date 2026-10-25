import React, { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { C, EASE_OUT, FONT, MONO, lerp, prog } from "../theme";

/* ---------- fonts ---------- */
export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("DM Sans", `url(${staticFile("fonts/dm-sans-latin.woff2")}) format('woff2')`, { weight: "100 1000" }),
      new FontFace("IBM Plex Mono", `url(${staticFile("fonts/ibm-plex-mono-latin.woff2")}) format('woff2')`, { weight: "400" }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [handle]);
};

/* ---------- text reveals ---------- */
type RevealProps = {
  at: number;
  dur?: number;
  y?: number;
  x?: number;
  blur?: number;
  out?: number; // frame to start fading out
  outDur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/** Fade + slide + de-blur entrance, optional exit. */
export const Reveal: React.FC<RevealProps> = ({ at, dur = 18, y = 18, x = 0, blur = 6, out, outDur = 10, style, children }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur);
  const o = out === undefined ? 1 : 1 - prog(f, out, outDur);
  return (
    <div
      style={{
        opacity: p * o,
        transform: `translate(${lerp(x, 0, p)}px, ${lerp(y, 0, p) - (1 - o) * 8}px)`,
        filter: blur ? `blur(${(1 - p) * blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Word-by-word kinetic line; each word rises out of a mask. */
export const Words: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  size?: number;
  weight?: number;
  color?: string;
  accent?: string[]; // words drawn in brand green
  accentColor?: string;
  style?: React.CSSProperties;
  lineHeight?: number;
  out?: number;
}> = ({ text, at, stagger = 3, size = 64, weight = 600, color = C.paper, accent = [], accentColor = C.green, style, lineHeight = 1.05, out }) => {
  const f = useCurrentFrame();
  const o = out === undefined ? 1 : 1 - prog(f, out, 10);
  const words = text.split(" ");
  return (
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, lineHeight, letterSpacing: "-0.025em", opacity: o, ...style }}>
      {words.map((w, i) => {
        const p = prog(f, at + i * stagger, 16);
        const isAccent = accent.includes(w.replace(/[^\w°+-]/g, ""));
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 105}%)`, color: isAccent ? accentColor : undefined }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Small mono label, like the blog's figure captions. */
export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.green, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.14em", textTransform: "uppercase", color, ...style }}>{children}</div>
);

/** Mono data tag with a coloured dot. */
export const Tag: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties; solid?: boolean }> = ({ children, color = C.mint, style, solid }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      padding: "7px 12px 7px 10px",
      borderRadius: 3,
      border: `1px solid ${solid ? color : "rgba(124,240,176,0.35)"}`,
      background: solid ? color : "rgba(6,17,13,0.78)",
      color: solid ? C.bg : C.paper,
      fontFamily: MONO,
      fontSize: 14,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    <span style={{ width: 7, height: 7, borderRadius: 7, background: solid ? C.bg : color, boxShadow: solid ? undefined : `0 0 10px ${color}` }} />
    {children}
  </div>
);

/** Viewfinder-style corner brackets that snap onto a region. */
export const Brackets: React.FC<{ x: number; y: number; w: number; h: number; at: number; color?: string; label?: string }> = ({ x, y, w, h, at, color = C.mint, label }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 14);
  const grow = lerp(1.25, 1, p);
  const L = 22;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const W = w * grow;
  const H = h * grow;
  const corner = (dx: number, dy: number, key: string) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left: cx + (dx < 0 ? -W / 2 : W / 2 - L),
        top: cy + (dy < 0 ? -H / 2 : H / 2 - L),
        width: L,
        height: L,
        borderColor: color,
        borderStyle: "solid",
        borderWidth: `${dy < 0 ? 2 : 0}px ${dx > 0 ? 2 : 0}px ${dy > 0 ? 2 : 0}px ${dx < 0 ? 2 : 0}px`,
      }}
    />
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: p }}>
      {corner(-1, -1, "a")}
      {corner(1, -1, "b")}
      {corner(-1, 1, "c")}
      {corner(1, 1, "d")}
      {label ? (
        <div style={{ position: "absolute", left: cx - W / 2, top: cy - H / 2 - 34 }}>
          <Tag color={color}>{label}</Tag>
        </div>
      ) : null}
    </div>
  );
};

/* ---------- backgrounds ---------- */
export const GridBg: React.FC<{ drift?: number; opacity?: number; size?: number }> = ({ drift = 0.25, opacity = 1, size = 48 }) => {
  const f = useCurrentFrame();
  const off = (f * drift) % size;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 45%, ${C.bg2} 0%, ${C.bg} 70%)` }}>
      <AbsoluteFill
        style={{
          opacity: 0.55 * opacity,
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
          backgroundPosition: `${off}px ${off * 0.4}px`,
          maskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 30%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 30%, transparent 85%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Animated film grain + vignette shared by every scene. */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  const seed = f % 8;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.42) 100%)" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Draws an SVG path progressively. */
export const DrawPath: React.FC<{ d: string; p: number; stroke?: string; width?: number; dash?: string; opacity?: number; length?: number }> = ({
  d,
  p,
  stroke = C.mint,
  width = 2,
  dash,
  opacity = 1,
  length = 3000,
}) => (
  <path
    d={d}
    fill="none"
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

export { EASE_OUT };
