import React from "react";
import { Enter } from "../components/frame";
import { S01Hook } from "./S01Hook";
import { S02Title } from "./S02Title";
import { S03Copy } from "./S03Copy";
import { S04Map } from "./S04Map";
import { S05Ai } from "./S05Ai";
import { SAoi, SPlace, SPrint, SReflow } from "./S06Process";
import { S07Notes } from "./S07Notes";
import { S08Predict } from "./S08Predict";
import { S09Simulate } from "./S09Simulate";
import { S10Maintain } from "./S10Maintain";
import { S11Limits, S12Payoff, S13Cta } from "./S11End";

export const SCENE_VIEWS: Record<string, { C: React.FC; enter: Enter }> = {
  hook: { C: S01Hook, enter: "cut" },
  title: { C: S02Title, enter: "flash" },
  copy: { C: S03Copy, enter: "zoom" },
  map: { C: S04Map, enter: "whip" },
  ai: { C: S05Ai, enter: "whipUp" },
  print: { C: SPrint, enter: "zoom" },
  place: { C: SPlace, enter: "whip" },
  reflow: { C: SReflow, enter: "whip" },
  aoi: { C: SAoi, enter: "whip" },
  notes: { C: S07Notes, enter: "zoom" },
  predict: { C: S08Predict, enter: "flash" },
  simulate: { C: S09Simulate, enter: "whip" },
  maintain: { C: S10Maintain, enter: "whipUp" },
  limits: { C: S11Limits, enter: "zoom" },
  payoff: { C: S12Payoff, enter: "whip" },
  cta: { C: S13Cta, enter: "zoom" },
};
