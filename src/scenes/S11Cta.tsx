import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Stock } from "../components/frame";
import { Eyebrow, Reveal, Words } from "../components/ui";
import { Pcb, StudioLights } from "../three/Pcb";
import { Stage } from "../three/Stage";
import { cue, scene } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

const ID = "cta";

const Chip: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Reveal at={at} y={10} blur={0}>
    <div style={{ padding: "9px 16px", borderRadius: 40, border: `1px solid rgba(124,240,176,0.45)`, fontFamily: FONT, fontSize: 19, fontWeight: 600, color: C.paper }}>
      {children}
    </div>
  </Reveal>
);

export const S11Cta: React.FC = () => {
  const f = useCurrentFrame();
  const sc = scene(ID);
  const tEng = cue(ID, "engineers");
  const tManu = cue(ID, "manufacturability");
  const tInsp = cue(ID, "inspection");
  const tTest = cue(ID, "test");
  const tBefore = cue(ID, "before");
  const endAt = sc.lead + sc.voDur + 8;
  const end = prog(f, endAt, 24, EASE_IN_OUT);

  const spin = f * 0.006;
  const cam = { pos: [Math.sin(spin) * 6.4, 3.4, Math.cos(spin) * 6.4] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 34 };

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* panel macro in the background, very dark */}
      <AbsoluteFill style={{ opacity: 0.22 }}>
        <Stock src="pcb_macro" dur={sc.dur} scale={[1.1, 1.25]} style={{ filter: "blur(3px) saturate(0.6)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 70% at 70% 50%, rgba(13,41,32,0.4) 0%, rgba(6,17,13,0.92) 70%)" }} />

      {/* hero board */}
      <AbsoluteFill style={{ left: lerp(330, 0, end), opacity: 1 - end * 0.85, transform: `scale(${lerp(1, 1.15, end)})` }}>
        <Stage cam={cam}>
          <StudioLights />
          <Pcb scan={-99} position={[0, lerp(-0.6, 0, prog(f, 0, 40)), 0]} />
        </Stage>
      </AbsoluteFill>

      {/* pitch */}
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 90, opacity: 1 - end }}>
        <Eyebrow style={{ marginBottom: 16, opacity: prog(f, 2, 14) }}>New board coming up?</Eyebrow>
        <Words text="Talk it through" at={tEng - 6} size={60} weight={700} />
        <Words text="before the first panel." at={tBefore - 6} size={60} weight={700} accent={["first", "panel."]} />
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <Chip at={tManu - 4}>Manufacturability</Chip>
          <Chip at={tInsp - 4}>Inspection</Chip>
          <Chip at={tTest - 4}>Test</Chip>
        </div>
      </AbsoluteFill>

      {/* end card */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: end }}>
        <Img src={staticFile("img/stim-logo-light.svg")} style={{ height: 96, transform: `scale(${lerp(0.94, 1, end)})` }} />
        <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.22em", color: C.muted, marginTop: 26, textTransform: "uppercase" }}>
          Precision in every connection · Toronto, Canada
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 40, opacity: prog(f, endAt + 16, 16) }}>
          <div style={{ padding: "14px 26px", borderRadius: 4, background: C.green, color: C.bg, fontFamily: FONT, fontWeight: 700, fontSize: 22 }}>Request a quote ↗</div>
          <div style={{ padding: "14px 26px", borderRadius: 4, border: `1px solid ${C.lineStrong}`, color: C.paper, fontFamily: FONT, fontWeight: 600, fontSize: 22 }}>stimcanada.com</div>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 17, color: C.muted, marginTop: 26, opacity: prog(f, endAt + 30, 16) }}>Read the full article on the STIM blog</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
