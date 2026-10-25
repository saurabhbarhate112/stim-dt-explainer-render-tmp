import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Stock } from "../components/frame";
import { Bg, Pop, Tag, Words } from "../components/ui";
import { MM } from "../three/board";
import { Pcb } from "../three/Pcb";
import { Cam, Stage, Studio, camPath, project } from "../three/Stage";
import { cue } from "../timeline";
import { C, EASE_BACK, FONT, MONO, lerp, prog } from "../theme";

const ID = "hook";
const U3: [number, number, number] = [17 * MM, 0.05, 7 * MM];

const PassStack: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", right: 70, top: 120, display: "flex", flexDirection: "column", gap: 10 }}>
      {[4809, 4810, 4811, 4812].map((n, i) => {
        const p = prog(f, at + i * 7, 12, EASE_BACK);
        return (
          <div
            key={n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 18px",
              borderRadius: 14,
              background: C.white,
              boxShadow: C.shadow,
              opacity: prog(f, at + i * 7, 5),
              transform: `translateX(${(1 - p) * 60}px) scale(${lerp(0.9, 1, p)})`,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 20,
              color: C.ink,
              width: 290,
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 15, color: C.muted }}>BOARD #{n.toLocaleString("en-US")}</span>
            <span style={{ marginLeft: "auto", color: C.white, background: C.green, padding: "4px 12px", borderRadius: 20, fontSize: 16 }}>✓ PASS</span>
          </div>
        );
      })}
    </div>
  );
};

export const S01Hook: React.FC = () => {
  const f = useCurrentFrame();
  const tThey = cue(ID, "they");
  const tBut = cue(ID, "but");
  const tHours = cue(ID, "hours");
  const tFail = cue(ID, "fail");
  const tNobody = cue(ID, "nobody");
  const tOne = cue(ID, "one");

  // 3D shots B + C share one stage
  const cam: Cam = camPath(f, [
    [tThey - 6, { pos: [-1.9, 0.62, 1.55], target: [-0.6, 0.0, -0.05], fov: 30 }],
    [tBut, { pos: [0.1, 0.55, 1.45], target: [0.25, 0.0, 0.1], fov: 30 }],
    [tFail, { pos: [1.25, 0.62, 1.15], target: [0.7, 0.0, 0.28], fov: 26 }],
    [tNobody + 6, { pos: [1.35, 0.7, 1.05], target: [0.71, 0.0, 0.29], fov: 22 }],
  ]);
  const failing = prog(f, tHours + 10, tFail - tHours);
  const pulse = 0.5 + 0.5 * Math.sin(f / 3);
  const u3 = project(cam, U3);
  const hours = Math.min(4, Math.floor(interpolate(f, [tHours, tFail], [0, 4.99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* A: factory, everything looks perfect */}
      <Sequence durationInFrames={tThey + 2}>
        <Stock src="pcb_panel" dur={tThey} scale={[1.1, 1.22]} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(243,246,242,0.92) 0%, rgba(243,246,242,0.55) 45%, rgba(243,246,242,0) 75%)" }} />
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 90 }}>
          <Words text="Looks" at={cue(ID, "looks") - 6} size={110} />
          <Words text="perfect." at={cue(ID, "perfect") - 6} size={110} mark={["perfect"]} />
        </AbsoluteFill>
      </Sequence>

      {/* B + C: 3D macro, passing… then failing */}
      <Sequence from={tThey} durationInFrames={tNobody - tThey + 2}>
        <AbsoluteFill>
          <Bg />
          <Stage cam={cam} exposure={1.0}>
            <Studio floorY={-0.06} />
            <Pcb glow={failing > 0.05 ? { U3: `rgb(${Math.round(200 + 55 * pulse)}, 40, 50)` } : {}} />
          </Stage>
          <div style={{ opacity: 1 - prog(f, tBut - 4, 8) }}>
            <PassStack at={tThey - tThey + 2} />
          </div>
          {/* time-lapse clock */}
          <div style={{ position: "absolute", right: 70, top: 110, opacity: prog(f, tBut, 8) }}>
            <div style={{ padding: "18px 26px", borderRadius: 20, background: C.ink, color: C.white, fontFamily: FONT, boxShadow: C.shadow, textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.16em", color: C.mint }}>FAST-FORWARD</div>
              <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 2 }}>+{hours}h</div>
            </div>
          </div>
          {failing > 0.1 ? (
            <div style={{ position: "absolute", left: u3.x, top: u3.y, transform: "translate(-50%,-50%)" }}>
              {[0, 1].map((k) => {
                const t = ((f + k * 12) % 24) / 24;
                return (
                  <div
                    key={k}
                    style={{ position: "absolute", left: -60 * (0.5 + t), top: -60 * (0.5 + t), width: 120 * (0.5 + t), height: 120 * (0.5 + t), borderRadius: "50%", border: `3px solid ${C.red}`, opacity: (1 - t) * failing }}
                  />
                );
              })}
            </div>
          ) : null}
          <div style={{ position: "absolute", left: u3.x - 260, top: u3.y + 70 }}>
            <Pop at={tFail - 6 - tThey}>
              <Tag color={C.red} solid size={20}>
                Weak solder joints · U3
              </Tag>
            </Pop>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* D: the line keeps running, nobody notices */}
      <Sequence from={tNobody} durationInFrames={tOne - tNobody + 2}>
        <Stock src="boards_conveyor" dur={tOne - tNobody} scale={[1.12, 1.24]} origin="60% 60%" />
        <AbsoluteFill style={{ background: "rgba(243,246,242,0.12)" }} />
        <div style={{ position: "absolute", left: 80, bottom: 150 }}>
          <Pop at={6}>
            <Tag color={C.green} size={20}>
              Line running · inspection: all PASS
            </Tag>
          </Pop>
        </div>
      </Sequence>

      {/* E: one thing can */}
      <Sequence from={tOne - 2}>
        <AbsoluteFill style={{ opacity: prog(f - tOne + 2, 0, 4) }}>
          <Bg tint="#C9F2DA" />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <Words text="One thing can." at={2} size={130} accent={["can."]} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
