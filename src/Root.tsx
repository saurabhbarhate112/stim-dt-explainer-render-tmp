import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, TOTAL } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition id="DigitalTwinExplainer" component={Main} durationInFrames={TOTAL} fps={FPS} width={1280} height={720} />
);
