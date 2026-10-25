import { Easing, interpolate } from "remotion";

// Bright STIM studio look: paper backgrounds, forest ink, logo green accents.
export const C = {
  bg: "#F3F6F2",
  bgDeep: "#E6EEE8",
  white: "#FFFFFF",
  ink: "#0E2219",
  ink2: "#2A3D34",
  muted: "#5B6B63",
  line: "rgba(14,34,25,0.10)",
  lineStrong: "rgba(14,34,25,0.22)",
  green: "#0E9F55",
  greenDeep: "#087844",
  forest: "#0D2920",
  mint: "#2CCB7F",
  twin: "#12B76A",
  amber: "#F08C00",
  red: "#E5484D",
  blue: "#2F7BEF",
  card: "#FFFFFF",
  shadow: "0 18px 40px rgba(14,34,25,0.12), 0 2px 6px rgba(14,34,25,0.06)",
  shadowSm: "0 8px 20px rgba(14,34,25,0.10)",
};

export const FONT = "'DM Sans', 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'IBM Plex Mono', 'Consolas', monospace";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0→1 progress between start and start+dur (frames), clamped and eased. */
export const prog = (frame: number, start: number, dur: number, easing = EASE_OUT) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Deterministic pseudo-random generator so layouts never change between renders. */
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
