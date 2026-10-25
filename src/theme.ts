import { Easing, interpolate } from "remotion";

// STIM brand: forest/ink greens from premium.css, logo green for accents.
export const C = {
  bg: "#06110D",
  bg2: "#0B1E17",
  forest: "#0D2920",
  panel: "rgba(16, 38, 30, 0.72)",
  panelSolid: "#10261E",
  line: "rgba(214, 232, 222, 0.12)",
  lineStrong: "rgba(214, 232, 222, 0.28)",
  paper: "#F4F7F3",
  mist: "#EDF3EF",
  muted: "#93A79C",
  green: "#1AAB4A",
  greenDeep: "#087844",
  mint: "#7CF0B0",
  amber: "#F2A33A",
  red: "#EF5350",
  ink: "#142820",
};

export const FONT = "'DM Sans', 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'IBM Plex Mono', 'Consolas', monospace";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

/** 0→1 progress between start and start+dur (frames), clamped and eased. */
export const prog = (frame: number, start: number, dur: number, easing = EASE_OUT) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic pseudo-random generator so layouts never change between renders. */
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
