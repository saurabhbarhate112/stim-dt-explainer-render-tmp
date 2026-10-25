import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Captions, Chrome, Enter, SceneWrap } from "./components/frame";
import { Finish, useBrandFonts } from "./components/ui";
import { FPS, SCENES, TOTAL } from "./timeline";
import { SFX } from "./sfx";
import { C } from "./theme";
import { SCENE_VIEWS } from "./scenes";

// Music: offset so the track's bass drop lands on the title.
const MUSIC_OFFSET_S = 4.853;
const speaking = (f: number) => SCENES.some((s) => f >= s.voFrom - 4 && f <= s.voFrom + s.voDur + 4);

export const Main: React.FC = () => {
  const ready = useBrandFonts();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {ready
        ? SCENES.map((s) => {
            const V = SCENE_VIEWS[s.id] ?? { C: () => <AbsoluteFill style={{ background: "#ddd" }} />, enter: "cut" as Enter };
            return (
              <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id} premountFor={20}>
                <SceneWrap enter={V.enter}>
                  <V.C />
                </SceneWrap>
              </Sequence>
            );
          })
        : null}
      <Finish />
      <Chrome />
      <Captions />
      {SCENES.map((s) => (
        <Sequence key={`vo-${s.id}`} from={s.voFrom} durationInFrames={s.voDur + 8} name={`vo-${s.id}`}>
          <Audio src={staticFile(`vo/${s.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
      <Audio
        src={staticFile("music/bed.mp3")}
        trimBefore={Math.round(MUSIC_OFFSET_S * FPS)}
        volume={(f) => {
          let duck = 0.42;
          for (let k = -6; k <= 6; k += 3) if (speaking(f + k)) duck = Math.min(duck, 0.16 + Math.abs(k) * 0.02);
          const fadeIn = interpolate(f, [0, 20], [0.4, 1], { extrapolateRight: "clamp" });
          const fadeOut = interpolate(f, [TOTAL - 40, TOTAL - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return duck * fadeIn * fadeOut;
        }}
      />
      {SFX.map((x, i) => (
        <Sequence key={`sfx-${i}`} from={x.at} durationInFrames={Math.round((x.len ?? 2) * FPS)} name={`sfx-${x.src}`}>
          <Audio src={staticFile(`sfx/${x.src}.mp3`)} volume={x.vol ?? 0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
