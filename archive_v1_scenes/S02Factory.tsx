import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Stock } from "../components/frame";
import { Brackets, Eyebrow, GridBg, Words } from "../components/ui";
import { Pcb, StudioLights } from "../three/Pcb";
import { Stage } from "../three/Stage";
import { cue } from "../timeline";
import { C, EASE_IN_OUT, lerp, prog } from "../theme";

const ID = "factory";

/** Solid board swept into its digital twin by a scan plane. */
export const TwinReveal: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  const s = prog(f, start, 46, EASE_IN_OUT);
  const scan = lerp(2.4, -2.4, s);
  const orbit = (f - start) * 0.004;
  const cam = {
    pos: [Math.sin(-0.5 + orbit) * 6.2, 3.6 - (f - start) * 0.003, Math.cos(-0.5 + orbit) * 6.2] as [number, number, number],
    target: [0, 0, 0.2] as [number, number, number],
    fov: 34,
  };
  return (
    <AbsoluteFill>
      <GridBg />
      <Stage cam={cam}>
        <StudioLights />
        <Pcb scan={scan} />
        {s > 0 && s < 1 ? (
          <group position={[scan, 0.06, 0]}>
            <mesh>
              <boxGeometry args={[0.02, 0.02, 3.0]} />
              <meshBasicMaterial color={C.mint} />
            </mesh>
            <mesh position={[0.18, 0, 0]}>
              <boxGeometry args={[0.36, 0.004, 3.0]} />
              <meshBasicMaterial color={C.mint} transparent opacity={0.18} depthWrite={false} />
            </mesh>
          </group>
        ) : null}
      </Stage>
    </AbsoluteFill>
  );
};

export const S02Factory: React.FC = () => {
  const f = useCurrentFrame();
  const tSwap = cue(ID, "swap");
  const tSmt = cue(ID, "smt");
  const tPrinted = cue(ID, "printed");
  const tThats = cue(ID, "that's");
  const tDigital = cue(ID, "digital");
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence durationInFrames={tSwap + 6}>
        <Stock src="factory_floor" dur={tSwap + 6} scale={[1.0, 1.1]} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(6,17,13,0.75) 0%, rgba(6,17,13,0) 55%)" }} />
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 80 }}>
          <Eyebrow style={{ marginBottom: 14, opacity: prog(f, 4, 14) }}>Same idea, new cockpit</Eyebrow>
          <Words text="Point it at a factory." at={8} size={64} accent={["factory."]} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={tSwap} durationInFrames={tThats - tSwap + 4}>
        <AbsoluteFill style={{ opacity: prog(f - tSwap, 0, 6) }}>
          <Stock src="boards_conveyor" dur={tThats - tSwap} scale={[1.06, 1.16]} origin="40% 60%" />
          <AbsoluteFill style={{ background: "rgba(6,17,13,0.18)" }} />
          <Brackets x={110} y={170} w={430} h={430} at={tSmt - tSwap - 4} label="SMT line" />
          <Brackets x={640} y={430} w={560} h={190} at={tPrinted - tSwap - 2} label="Printed circuit boards" color={C.paper} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={tThats - 4}>
        <AbsoluteFill style={{ opacity: prog(f - tThats + 4, 0, 8) }}>
          <TwinReveal start={8} />
          <AbsoluteFill style={{ justifyContent: "flex-start", paddingTop: 70, alignItems: "center" }}>
            <Eyebrow style={{ opacity: prog(f, tDigital - 6, 12) }}>Physical → virtual</Eyebrow>
            <Words text="Digital twin" at={tDigital - tThats + 4 - 2} size={84} weight={700} style={{ marginTop: 10 }} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
