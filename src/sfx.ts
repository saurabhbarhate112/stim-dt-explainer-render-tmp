import { SCENES, cue, scene } from "./timeline";

export type Sfx = { at: number; src: string; vol?: number; len?: number };

const w = (id: string, word: string, off = 0, n = 1) => scene(id).from + cue(id, word, n) + off;

// one transition swish per scene change, picked to match the transition style
const TRANSITION: Record<string, string> = {
  title: "logo_impact",
  copy: "air_woosh",
  map: "fast_whoosh",
  ai: "tech_slide",
  print: "air_woosh",
  place: "fast_whoosh",
  reflow: "fast_whoosh",
  aoi: "fast_whoosh",
  notes: "air_woosh",
  predict: "tech_slide",
  simulate: "fast_whoosh",
  maintain: "tech_slide",
  limits: "air_woosh",
  payoff: "fast_whoosh",
  cta: "air_woosh",
};

export const SFX: Sfx[] = [
  ...SCENES.filter((s) => TRANSITION[s.id]).map((s) => ({ at: Math.max(0, s.from - 4), src: TRANSITION[s.id], vol: s.id === "title" ? 0.22 : 0.18, len: 2 })),
  // hook
  { at: w("hook", "pass", -2), src: "tech_select", vol: 0.2, len: 0.5 },
  { at: w("hook", "pass", 6), src: "tech_select", vol: 0.18, len: 0.5 },
  { at: w("hook", "pass", 14), src: "tech_select", vol: 0.16, len: 0.5 },
  { at: w("hook", "hours", 0), src: "computer_calc", vol: 0.12, len: 1.8 },
  { at: w("hook", "fail", -4), src: "device_fail", vol: 0.2, len: 2 },
  { at: w("hook", "one", -2), src: "deep_impact", vol: 0.22, len: 2.5 },
  // copy
  { at: w("copy", "every", 0), src: "computer_calc", vol: 0.1, len: 3 },
  { at: w("copy", "changes", -2), src: "bleep", vol: 0.2, len: 0.7 },
  { at: w("copy", "changes", -2, 2), src: "bleep_confirm", vol: 0.22, len: 0.7 },
  // map
  { at: w("map", "traffic", -4), src: "tech_alert", vol: 0.16, len: 1.5 },
  // ai
  { at: w("ai", "a", -4), src: "power_up", vol: 0.16, len: 2 },
  { at: w("ai", "tiny", 0), src: "bleep", vol: 0.16, len: 0.7 },
  { at: w("ai", "big", 0), src: "negative_tap", vol: 0.16, len: 1 },
  { at: w("ai", "tells", -4), src: "tech_alert", vol: 0.16, len: 1.5 },
  // process
  { at: w("print", "printer", -6), src: "ui_click", vol: 0.28, len: 0.3 },
  { at: scene("place").from + 2, src: "ui_click", vol: 0.28, len: 0.3 },
  { at: w("place", "misses", -2), src: "negative_tap", vol: 0.18, len: 1 },
  { at: w("reflow", "oven", -4), src: "ui_click", vol: 0.28, len: 0.3 },
  { at: w("aoi", "camera", -4), src: "ui_click", vol: 0.28, len: 0.3 },
  { at: w("aoi", "checks", 0), src: "bleep_confirm", vol: 0.14, len: 0.7 },
  // notes
  { at: w("notes", "twin", -4), src: "tech_slide", vol: 0.2, len: 1.6 },
  // predict
  { at: w("predict", "still", -4), src: "deep_impact", vol: 0.14, len: 1.5 },
  { at: w("predict", "still", -4, 2), src: "deep_impact", vol: 0.14, len: 1.5 },
  { at: w("predict", "weak", -4), src: "negative_tap", vol: 0.18, len: 1 },
  { at: w("predict", "raises", -4), src: "tech_alert", vol: 0.24, len: 1.8 },
  { at: w("predict", "wipes", -4), src: "bleep_confirm", vol: 0.24, len: 0.7 },
  { at: w("predict", "never", -4), src: "logo_impact", vol: 0.2, len: 2.5 },
  // simulate
  { at: w("simulate", "hotter", -6), src: "tech_select", vol: 0.22, len: 0.5 },
  { at: w("simulate", "new", -6), src: "tech_select", vol: 0.22, len: 0.5 },
  { at: w("simulate", "test", 4), src: "computer_calc", vol: 0.14, len: 1.2 },
  { at: w("simulate", "not", -4), src: "bleep_confirm", vol: 0.2, len: 0.7 },
  // maintain
  { at: w("maintain", "notices", -2), src: "tech_alert", vol: 0.2, len: 1.5 },
  { at: w("maintain", "books", 4), src: "bleep_confirm", vol: 0.22, len: 0.7 },
  { at: w("maintain", "two", 0), src: "negative_tap", vol: 0.2, len: 1 },
  // limits
  { at: w("limits", "no", -3), src: "deep_impact", vol: 0.2, len: 2 },
  { at: w("limits", "watches", -8), src: "tech_select", vol: 0.2, len: 0.5 },
  { at: w("limits", "people", -6), src: "tech_select", vol: 0.2, len: 0.5 },
  // payoff
  { at: w("payoff", "fewer", -6), src: "tech_select", vol: 0.22, len: 0.5 },
  { at: w("payoff", "less", -6), src: "tech_select", vol: 0.22, len: 0.5 },
  { at: w("payoff", "fewer", -6, 2), src: "tech_select", vol: 0.22, len: 0.5 },
  { at: w("payoff", "smoother", -6), src: "tech_select", vol: 0.22, len: 0.5 },
  // end card
  { at: scene("cta").from + scene("cta").lead + scene("cta").voDur + 6, src: "logo_impact", vol: 0.24, len: 4 },
];
