import { cue, scene } from "./timeline";

export type Sfx = { at: number; src: string; vol?: number; len?: number };

// Global frame for a word in a scene, plus an offset in frames.
const w = (id: string, word: string, n = 1, off = 0) => scene(id).from + cue(id, word, n) + off;
const start = (id: string, off = 0) => scene(id).from + off;

export const SFX: Sfx[] = [
  // hook
  { at: 0, src: "machine_hum", vol: 0.12, len: 3 },
  { at: w("hook", "crashed", 1, -2), src: "device_fail", vol: 0.28, len: 2.4 },
  { at: w("hook", "before", 1, -2), src: "quick_glitch", vol: 0.22, len: 1 },
  { at: w("hook", "every", 1, -8), src: "air_woosh", vol: 0.25, len: 2 },
  { at: w("hook", "crashes", 1, 6), src: "quick_glitch", vol: 0.18, len: 1.2 },
  { at: w("hook", "nothing", 1, -3), src: "deep_impact", vol: 0.32, len: 3 },
  // factory
  { at: start("factory"), src: "fast_whoosh", vol: 0.3, len: 1.6 },
  { at: start("factory", 6), src: "machine_hum", vol: 0.1, len: 7 },
  { at: w("factory", "smt", 1, -4), src: "tech_select", vol: 0.25, len: 0.5 },
  { at: w("factory", "printed", 1, -2), src: "tech_select", vol: 0.25, len: 0.5 },
  { at: w("factory", "that's", 1, -6), src: "power_up", vol: 0.22, len: 3 },
  { at: w("factory", "digital", 1, -2), src: "logo_impact", vol: 0.2, len: 3 },
  // mirror
  { at: w("mirror", "but", 1, -4), src: "negative_tap", vol: 0.2, len: 1 },
  { at: w("mirror", "fed", 1, -10), src: "tech_slide", vol: 0.28, len: 1.6 },
  { at: w("mirror", "live", 1, -2), src: "computer_calc", vol: 0.12, len: 3 },
  { at: w("mirror", "changes", 1, -2), src: "bleep", vol: 0.25, len: 0.7 },
  { at: w("mirror", "changes", 2, -2), src: "bleep_confirm", vol: 0.25, len: 0.7 },
  { at: w("mirror", "paper", 1, -14), src: "air_woosh", vol: 0.22, len: 2 },
  { at: w("mirror", "navigation", 1, -6), src: "tech_select", vol: 0.25, len: 0.5 },
  { at: w("mirror", "mirror", 1, -4), src: "bleep_confirm", vol: 0.25, len: 0.7 },
  // ai
  { at: start("ai"), src: "tech_slide", vol: 0.28, len: 1.6 },
  { at: w("ai", "learning", 1, -4), src: "computer_calc", vol: 0.16, len: 4 },
  { at: w("ai", "coming", 1, -4), src: "tech_alert", vol: 0.2, len: 1.5 },
  // line
  { at: start("line"), src: "fast_whoosh", vol: 0.28, len: 1.6 },
  { at: start("line", 4), src: "machine_hum", vol: 0.08, len: 22 },
  { at: w("line", "printer", 1, -2), src: "ui_click", vol: 0.35, len: 0.3 },
  { at: w("line", "pick", 1, -2), src: "ui_click", vol: 0.35, len: 0.3 },
  { at: w("line", "reflow", 1, -2), src: "ui_click", vol: 0.35, len: 0.3 },
  { at: w("line", "automated", 1, -2), src: "ui_click", vol: 0.35, len: 0.3 },
  { at: w("line", "lines", 1, -6), src: "tech_slide", vol: 0.25, len: 1.6 },
  { at: w("line", "fails", 1, -2), src: "negative_tap", vol: 0.3, len: 1.2 },
  { at: w("line", "trace", 1, 0), src: "bleep", vol: 0.2, len: 0.7 },
  { at: w("line", "station", 1, 0), src: "bleep", vol: 0.2, len: 0.7 },
  { at: w("line", "station", 2, 0), src: "bleep", vol: 0.2, len: 0.7 },
  { at: w("line", "drift", 1, -4), src: "tech_alert", vol: 0.22, len: 1.5 },
  // predict
  { at: start("predict"), src: "tech_slide", vol: 0.28, len: 1.6 },
  { at: w("predict", "dry", 1, 0), src: "bleep", vol: 0.18, len: 0.7 },
  { at: w("predict", "every", 1, -6), src: "tech_select", vol: 0.2, len: 0.5 },
  { at: w("predict", "but", 1, -8), src: "air_woosh", vol: 0.2, len: 2 },
  { at: w("predict", "flags", 1, -4), src: "tech_alert", vol: 0.26, len: 1.8 },
  { at: w("predict", "wipes", 1, -2), src: "fast_whoosh", vol: 0.18, len: 1.2 },
  { at: w("predict", "never", 1, -4), src: "bleep_confirm", vol: 0.28, len: 0.7 },
  // simulate
  { at: start("simulate"), src: "air_woosh", vol: 0.25, len: 2 },
  { at: w("simulate", "raise", 1, -4), src: "ui_click", vol: 0.3, len: 0.3 },
  { at: w("simulate", "switch", 1, -4), src: "ui_click", vol: 0.3, len: 0.3 },
  { at: w("simulate", "only", 1, -4), src: "computer_calc", vol: 0.18, len: 3 },
  { at: w("simulate", "survive", 1, -4), src: "bleep_confirm", vol: 0.22, len: 0.7 },
  { at: w("simulate", "real", 1, 2), src: "tech_select", vol: 0.26, len: 0.5 },
  // maintain
  { at: start("maintain"), src: "tech_slide", vol: 0.26, len: 1.6 },
  { at: w("maintain", "catches", 1, 0), src: "tech_alert", vol: 0.22, len: 1.6 },
  { at: w("maintain", "books", 1, -8), src: "air_woosh", vol: 0.2, len: 2 },
  { at: w("maintain", "six", 1, -2), src: "bleep_confirm", vol: 0.24, len: 0.7 },
  { at: w("maintain", "three", 1, -4), src: "negative_tap", vol: 0.24, len: 1.2 },
  // limits
  { at: start("limits"), src: "fast_whoosh", vol: 0.25, len: 1.6 },
  { at: w("limits", "data", 1, 0), src: "quick_glitch", vol: 0.12, len: 1 },
  { at: w("limits", "let", 1, -6), src: "tech_slide", vol: 0.22, len: 1.6 },
  // payoff
  { at: w("payoff", "fewer", 1, -4), src: "tech_select", vol: 0.22, len: 0.5 },
  { at: w("payoff", "less", 1, -4), src: "tech_select", vol: 0.22, len: 0.5 },
  { at: w("payoff", "planned", 1, -4), src: "tech_select", vol: 0.22, len: 0.5 },
  { at: w("payoff", "calmer", 1, -4), src: "tech_select", vol: 0.22, len: 0.5 },
  // cta
  { at: start("cta"), src: "air_woosh", vol: 0.22, len: 2 },
  { at: scene("cta").from + scene("cta").lead + scene("cta").voDur + 6, src: "logo_impact", vol: 0.3, len: 5 },
];
