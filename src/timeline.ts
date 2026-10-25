import vo from "./vo.json";

export const FPS = 30;
export const OVERLAP = 12; // frames the incoming scene overlaps the outgoing one

type Word = { w: string; s: number; e: number };
type Def = { id: string; lead: number; tail: number; chapter?: string };

// lead: frames of picture before the narration starts; tail: frames after it ends.
const DEFS: Def[] = [
  { id: "hook", lead: 24, tail: 14 },
  { id: "factory", lead: 12, tail: 18 },
  { id: "mirror", lead: 12, tail: 14, chapter: "01 — The idea" },
  { id: "ai", lead: 12, tail: 14, chapter: "02 — The AI part" },
  { id: "line", lead: 12, tail: 16, chapter: "03 — How it works on a PCB line" },
  { id: "predict", lead: 12, tail: 16, chapter: "04 — Defect prediction" },
  { id: "simulate", lead: 12, tail: 16, chapter: "05 — Process simulation" },
  { id: "maintain", lead: 12, tail: 16, chapter: "06 — Predictive maintenance" },
  { id: "limits", lead: 12, tail: 14, chapter: "07 — The honest limits" },
  { id: "payoff", lead: 12, tail: 14, chapter: "08 — What it adds up to" },
  { id: "cta", lead: 12, tail: 150 },
];

export type SceneT = {
  id: string;
  from: number; // global start frame
  dur: number;
  lead: number;
  voFrom: number; // global frame the narration starts
  voDur: number;
  words: Word[];
  chapter?: string;
};

const voById = Object.fromEntries((vo as { id: string; duration: number; words: Word[] }[]).map((v) => [v.id, v]));

export const SCENES: SceneT[] = (() => {
  const out: SceneT[] = [];
  let cursor = 0;
  for (const d of DEFS) {
    const v = voById[d.id];
    const voDur = Math.ceil(v.duration * FPS);
    const dur = d.lead + voDur + d.tail;
    out.push({ id: d.id, from: cursor, dur, lead: d.lead, voFrom: cursor + d.lead, voDur, words: v.words, chapter: d.chapter });
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

/**
 * Local frame (relative to the scene start) at which a spoken word begins.
 * `n` picks the n-th occurrence. Lets every animation land on the narration.
 */
export const cue = (id: string, word: string, n = 1, edge: "s" | "e" = "s") => {
  const sc = scene(id);
  let seen = 0;
  for (const w of sc.words) {
    if (norm(w.w) === norm(word) && ++seen === n) return sc.lead + Math.round(w[edge] * FPS);
  }
  throw new Error(`cue not found: ${id} / ${word} #${n}`);
};
