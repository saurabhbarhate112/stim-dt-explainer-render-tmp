import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Captions, Chrome, Enter, SceneWrap } from "./components/frame";
import { Finish, useBrandFonts } from "./components/ui";
import { FPS, SCENES, TOTAL } from "./timeline";
import { SFX } from "./sfx";
import { C } from "./theme";
import { S01Hook } from "./scenes/S01Hook";
import { S02Factory } from "./scenes/S02Factory";
import { S03Mirror } from "./scenes/S03Mirror";
import { S04Ai } from "./scenes/S04Ai";
import { S05Line } from "./scenes/S05Line";
import { S06Predict } from "./scenes/S06Predict";
import { S07Simulate } from "./scenes/S07Simulate";
import { S08Maintain } from "./scenes/S08Maintain";
import { S09Limits } from "./scenes/S09Limits";
import { S10Payoff } from "./scenes/S10Payoff";
import { S11Cta } from "./scenes/S11Cta";

const VIEWS: Record<string, { C: React.FC; enter: Enter }> = {
  hook: { C: S01Hook, enter: "cut" },
  factory: { C: S02Factory, enter: "zoom" },
  mirror: { C: S03Mirror, enter: "fade" },
  ai: { C: S04Ai, enter: "wipe" },
  line: { C: S05Line, enter: "zoom" },
  predict: { C: S06Predict, enter: "wipe" },
  simulate: { C: S07Simulate, enter: "iris" },
  maintain: { C: S08Maintain, enter: "wipe" },
  limits: { C: S09Limits, enter: "zoom" },
  payoff: { C: S10Payoff, enter: "fade" },
  cta: { C: S11Cta, enter: "zoom" },
};

// Music: the track's own ending (~173 s) is aligned with the end of the video.
const MUSIC_END_S = 173.5;
const musicStart = Math.max(0, MUSIC_END_S - TOTAL / FPS);

const speaking = (f: number) => SCENES.some((s) => f >= s.voFrom - 6 && f <= s.voFrom + s.voDur + 6);

export const Main: React.FC = () => {
  useBrandFonts();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {SCENES.map((s) => {
        const V = VIEWS[s.id];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id} premountFor={30}>
            <SceneWrap enter={V.enter}>
              <V.C />
            </SceneWrap>
          </Sequence>
        );
      })}
      <Finish />
      <Chrome />
      <Captions />

      {SCENES.map((s) => (
        <Sequence key={`vo-${s.id}`} from={s.voFrom} durationInFrames={s.voDur + 10} name={`vo-${s.id}`}>
          <Audio src={staticFile(`vo/${s.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
      <Audio
        src={staticFile("music/bed.mp3")}
        trimBefore={Math.round(musicStart * FPS)}
        volume={(f) => {
          // duck under narration, swell in gaps and on the end card
          let duck = 0.32;
          for (let k = -9; k <= 9; k += 3) if (speaking(f + k)) duck = Math.min(duck, 0.11 + Math.abs(k) * 0.012);
          const fadeIn = interpolate(f, [0, 30], [0, 1], { extrapolateRight: "clamp" });
          const fadeOut = interpolate(f, [TOTAL - 45, TOTAL - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return duck * fadeIn * fadeOut;
        }}
      />
      {SFX.map((x, i) => (
        <Sequence key={`sfx-${i}`} from={x.at} durationInFrames={Math.round((x.len ?? 3) * FPS)} name={`sfx-${x.src}`}>
          <Audio src={staticFile(`sfx/${x.src}.mp3`)} volume={x.vol ?? 0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
