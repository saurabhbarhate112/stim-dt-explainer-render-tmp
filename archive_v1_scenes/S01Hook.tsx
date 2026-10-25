import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stock } from "../components/frame";
import { Brackets, Eyebrow, GridBg, Reveal, Words } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, prog } from "../theme";

const ID = "hook";

/** Line-art flight-simulator HUD. */
const Hud: React.FC<{ crash: number }> = ({ crash }) => {
  const f = useCurrentFrame();
  const roll = Math.sin(f / 40) * 6 + crash * 38;
  const pitch = Math.sin(f / 55) * 14 + crash * 60;
  const ladder = [-30, -20, -10, 10, 20, 30];
  return (
    <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <clipPath id="hudclip">
          <circle cx={640} cy={350} r={230} />
        </clipPath>
      </defs>
      <circle cx={640} cy={350} r={232} fill="none" stroke={C.lineStrong} strokeWidth={1.5} />
      <g clipPath="url(#hudclip)">
        <g transform={`rotate(${roll} 640 350) translate(0 ${pitch})`}>
          <rect x={300} y={-200} width={680} height={550} fill="rgba(124,240,176,0.05)" />
          <line x1={300} x2={980} y1={350} y2={350} stroke={C.mint} strokeWidth={2} />
          {ladder.map((d) => (
            <g key={d}>
              <line x1={600} x2={680} y1={350 - d * 5} y2={350 - d * 5} stroke={C.mint} strokeOpacity={0.55} strokeWidth={1.3} />
              <text x={690} y={354 - d * 5} fill={C.mint} fillOpacity={0.6} fontFamily={MONO} fontSize={11}>
                {Math.abs(d)}
              </text>
            </g>
          ))}
        </g>
      </g>
      {/* fixed aircraft reference */}
      <path d="M560 350 h50 l15 14 l15 -14 h50" fill="none" stroke={C.amber} strokeWidth={3} />
      {/* altitude + speed tapes */}
      {[0, 1].map((side) => {
        const x = side ? 930 : 280;
        const val = side ? 3200 - f * 6 - crash * 2800 : 142 - crash * 40;
        return (
          <g key={side}>
            <rect x={x} y={200} width={70} height={300} fill="rgba(6,17,13,0.6)" stroke={C.lineStrong} />
            {Array.from({ length: 11 }).map((_, i) => {
              const y = 200 + ((i * 30 + (f * (side ? 3 : 1.2)) % 30) % 300);
              return <line key={i} x1={side ? x : x + 50} x2={side ? x + 20 : x + 70} y1={y} y2={y} stroke={C.mint} strokeOpacity={0.5} />;
            })}
            <rect x={x - 6} y={336} width={82} height={28} fill={C.bg} stroke={crash > 0.2 ? C.red : C.mint} />
            <text x={x + 35} y={355} textAnchor="middle" fill={crash > 0.2 ? C.red : C.paper} fontFamily={MONO} fontSize={14}>
              {Math.max(0, Math.round(val))}
            </text>
          </g>
        );
      })}
      {/* heading */}
      <g>
        {Array.from({ length: 13 }).map((_, i) => {
          const x = 460 + ((i * 30 - f * 0.8) % 390 + 390) % 390;
          return <line key={i} x1={x} x2={x} y1={598} y2={i % 3 === 0 ? 614 : 607} stroke={C.mint} strokeOpacity={0.5} />;
        })}
      </g>
    </svg>
  );
};

export const S01Hook: React.FC = () => {
  const f = useCurrentFrame();
  const tCrash = cue(ID, "crashed");
  const tBefore = cue(ID, "before");
  const tAircraft = cue(ID, "aircraft");
  const tEvery = cue(ID, "every");
  const tCrashes = cue(ID, "crashes");
  const tWhere = cue(ID, "where");
  const tNothing = cue(ID, "nothing");
  const tPride = cue(ID, "pride");

  const bars = prog(f, 0, 30, EASE_IN_OUT) * 62;
  const glitch = f >= tCrash && f < tBefore;
  const shake = glitch ? Math.sin(f * 2.3) * 6 * (1 - prog(f, tCrash, 40)) : 0;
  const footageOut = prog(f, tEvery - 8, 12, EASE_IN_OUT);
  const hudCrash = prog(f, tCrashes, 22, EASE_IN_OUT) * (1 - prog(f, tWhere - 6, 18));
  const resets = Math.floor(interpolate(f, [tCrash + 2, tBefore - 4], [0, 9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* real cockpit footage */}
      <AbsoluteFill style={{ opacity: prog(f, 4, 22) * (1 - footageOut), transform: `translateX(${shake}px)` }}>
        <Stock src="cockpit" dur={tEvery} scale={[1.02, 1.1]} style={{ filter: glitch ? "saturate(0.3) contrast(1.25) hue-rotate(-20deg)" : undefined }} />
        {glitch ? (
          <AbsoluteFill
            style={{
              background: "repeating-linear-gradient(0deg, rgba(239,83,80,0.10) 0 2px, transparent 2px 5px)",
              mixBlendMode: "screen",
              opacity: 0.6 + 0.4 * Math.sin(f),
            }}
          />
        ) : null}
        {glitch ? (
          <AbsoluteFill style={{ padding: "110px 0 0 70px", gap: 10, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            {Array.from({ length: resets }).map((_, i) => (
              <div
                key={i}
                style={{
                  fontFamily: MONO,
                  fontSize: 15,
                  letterSpacing: "0.14em",
                  color: C.red,
                  border: `1px solid ${C.red}`,
                  padding: "3px 10px",
                  background: "rgba(0,0,0,0.55)",
                  transform: `translateX(${i * 14}px)`,
                }}
              >
                SIM CRASH · RESET {String(i + 1).padStart(2, "0")}
              </div>
            ))}
          </AbsoluteFill>
        ) : null}
        <Brackets x={300} y={175} w={680} h={150} at={tAircraft - 6} color={C.paper} label="Real aircraft" />
      </AbsoluteFill>

      {/* simulator HUD */}
      <AbsoluteFill style={{ opacity: footageOut }}>
        <GridBg opacity={0.6} />
        <Hud crash={hudCrash} />
        <div style={{ position: "absolute", left: 70, top: 112 }}>
          <Eyebrow color={hudCrash > 0.3 ? C.red : C.green}>{hudCrash > 0.3 ? "Simulator · terrain" : "Flight simulator"}</Eyebrow>
        </div>
        {hudCrash > 0.35 ? (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.3em", color: C.red, border: `2px solid ${C.red}`, padding: "8px 20px", background: "rgba(0,0,0,0.6)" }}>
              CRASH · NO DAMAGE
            </div>
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>

      {/* cost of a mistake */}
      <AbsoluteFill style={{ background: `rgba(6,17,13,${0.86 * prog(f, tWhere - 4, 12)})` }} />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 140 }}>
        <Words text="Cost of a mistake:" at={tWhere - 2} size={58} weight={500} color="rgba(244,247,243,0.8)" />
        <Words text="nothing." at={tNothing - 3} size={150} weight={700} color={C.green} style={{ marginTop: 4 }} />
        <Reveal at={tPride} y={10}>
          <div style={{ fontFamily: FONT, fontSize: 30, color: C.muted, fontStyle: "italic", marginTop: 10, marginLeft: 8 }}>…but pride.</div>
        </Reveal>
      </AbsoluteFill>

      {/* cinematic letterbox */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bars, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bars, background: "#000" }} />
    </AbsoluteFill>
  );
};
