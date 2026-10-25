import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bg, Eyebrow, Words } from "../components/ui";
import { Pcb } from "../three/Pcb";
import { Stage, Studio } from "../three/Stage";
import { C, EASE_IN_OUT, lerp, prog } from "../theme";

/** Title on the music drop: the board is scanned into its twin. */
export const S02Title: React.FC = () => {
  const f = useCurrentFrame();
  const s = prog(f, 4, 34, EASE_IN_OUT);
  const scan = lerp(2.3, -2.3, s);
  const a = -0.55 + f * 0.006;
  const cam = { pos: [Math.sin(a) * 4.6, 2.9 - f * 0.004, Math.cos(a) * 4.6] as [number, number, number], target: [0, -0.25, 0] as [number, number, number], fov: 34 };
  return (
    <AbsoluteFill>
      <Bg tint="#C9F2DA" />
      <AbsoluteFill style={{ transform: `translateY(${lerp(40, 70, prog(f, 0, 30))}px)` }}>
        <Stage cam={cam} exposure={1.0}>
          <Studio floorY={-0.08} />
          <Pcb scan={scan} />
          {s > 0 && s < 1 ? (
            <mesh position={[scan, 0.06, 0]}>
              <boxGeometry args={[0.025, 0.03, 3.0]} />
              <meshBasicMaterial color="#2CCB7F" />
            </mesh>
          ) : null}
        </Stage>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
        <Eyebrow style={{ opacity: prog(f, 4, 10) }}>Physical → digital</Eyebrow>
        <Words text="AI Digital Twin" at={4} size={104} accent={["AI"]} style={{ marginTop: 10 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.white, opacity: 0.85 * (1 - prog(f, 0, 8)), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
