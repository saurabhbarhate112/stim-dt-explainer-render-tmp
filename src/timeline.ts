import vo from "./vo.json";

export const FPS = 30;
export const OVERLAP = 8; // frames the incoming scene overlaps the outgoing one

type Word = { w: string; s: number; e: number };
type Def = { id: string; lead: number; tail: number };

// lead: frames of picture before the narration starts; tail: frames after it ends.
const DEFS: Def[] = [
  { id: "hook", lead: 18, tail: 6 },
  { id: "title", lead: 8, tail: 16 },
  { id: "copy", lead: 8, tail: 8 },
  { id: "map", lead: 8, tail: 8 },
  { id: "ai", lead: 8, tail: 8 },
  { id: "print", lead: 8, tail: 10 },
  { id: "place", lead: 8, tail: 10 },
  { id: "reflow", lead: 8, tail: 10 },
  { id: "aoi", lead: 8, tail: 10 },
  { id: "notes", lead: 8, tail: 10 },
  { id: "predict", lead: 8, tail: 12 },
  { id: "simulate", lead: 8, tail: 8 },
  { id: "maintain", lead: 8, tail: 8 },
  { id: "limits", lead: 8, tail: 8 },
  { id: "payoff", lead: 8, tail: 8 },
  { id: "cta", lead: 8, tail: 135 },
];

export type SceneT = { id: string; from: number; dur: number; lead: number; voFrom: number; voDur: number; words: Word[] };

const voById = Object.fromEntries((vo as { id: string; duration: number; words: Word[] }[]).map((v) => [v.id, v]));

export const SCENES: SceneT[] = (() => {
  const out: SceneT[] = [];
  let cursor = 0;
  for (const d of DEFS) {
    const v = voById[d.id];
    const voDur = Math.ceil(v.duration * FPS);
    const dur = d.lead + voDur + d.tail;
    out.push({ id: d.id, from: cursor, dur, lead: d.lead, voFrom: cursor + d.lead, voDur, words: v.words });
    cursor += dur - OVERLAP;
  }
  return out;
})();

export const TOTAL = (() => {
  const last = SCENES[SCENES.length - 1];
  return last.from + last.dur;
})();

export const scene = (id: string) => SCENES.find((s) => s.id === id)!;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");

/** Local frame (relative to the scene start) at which the n-th occurrence of a spoken word begins. */
export const cue = (id: string, word: string, n = 1, edge: "s" | "e" = "s") => {
  const sc = scene(id);
  let seen = 0;
  for (const w of sc.words) {
    if (norm(w.w) === norm(word) && ++seen === n) return sc.lead + Math.round(w[edge] * FPS);
  }
  throw new Error(`cue not found: ${id} / ${word} #${n}`);
};
