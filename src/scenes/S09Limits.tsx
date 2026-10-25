import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Stock } from "../components/frame";
import { Eyebrow, GridBg, Tag, Words } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

const ID = "limits";

const Pipeline: React.FC = () => {
  const f = useCurrentFrame();
  const tTwin = cue(ID, "twin");
  const tData = cue(ID, "data");
  const vendors = ["Vendor A", "Vendor B", "Vendor C", "Vendor D", "Vendor E"];
  const gaps = [false, true, false, true, true];
  const on = prog(f, tTwin - 8, 18);
  const wobble = prog(f, tData, 20);
  const NX = 820;
  const NY = 420;
  return (
    <AbsoluteFill style={{ opacity: on }}>
      <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {vendors.map((v, i) => {
          const y = 270 + i * 66;
          return (
            <g key={v}>
              <rect x={140} y={y - 20} width={170} height={40} rx={5} fill={C.panelSolid} stroke={C.lineStrong} />
              <text x={225} y={y + 5} textAnchor="middle" fill={C.paper} fontFamily={MONO} fontSize={13} letterSpacing={1}>
                {v.toUpperCase()}
              </text>
              <path d={`M310 ${y} C 520 ${y}, 600 ${NY}, ${NX - 60} ${NY}`} fill="none" stroke={gaps[i] ? "rgba(239,83,80,0.55)" : "rgba(124,240,176,0.5)"} strokeWidth={1.6} strokeDasharray={gaps[i] ? "3 14" : undefined} />
              {Array.from({ length: 4 }).map((_, k) => {
                const t = ((f / 60 + k / 4 + i * 0.13) % 1 + 1) % 1;
                if (gaps[i] && (k === 1 || k === 2)) return null;
                const x = lerp(310, NX - 60, t);
                const yy = lerp(y, NY, EASE_IN_OUT(t));
                return <circle key={k} cx={x} cy={yy} r={4} fill={gaps[i] ? C.red : C.mint} />;
              })}
            </g>
          );
        })}
        <rect x={NX - 60} y={NY - 50} width={120} height={100} rx={12} fill="rgba(10,40,30,0.92)" stroke={C.mint} strokeWidth={2} />
        <text x={NX} y={NY + 6} textAnchor="middle" fill={C.paper} fontFamily={FONT} fontWeight={700} fontSize={18}>
          Twin
        </text>
        {/* prediction with widening uncertainty */}
        <path
          d={Array.from({ length: 40 })
            .map((_, i) => {
              const x = NX + 70 + i * 6;
              const y = NY + Math.sin(i / 4 + f / 12) * (4 + wobble * 26 * (i / 40));
              return `${i ? "L" : "M"}${x} ${y}`;
            })
            .join(" ")}
          fill="none"
          stroke={wobble > 0.3 ? C.amber : C.mint}
          strokeWidth={2.5}
        />
      </svg>
      <div style={{ position: "absolute", left: NX + 70, top: NY + 54, opacity: prog(f, tData + 4, 12) }}>
        <Tag color={C.amber}>Gaps in → wobbly predictions out</Tag>
      </div>
      <div style={{ position: "absolute", left: 140, top: 200, opacity: prog(f, tTwin, 12) }}>
        <Eyebrow color={C.muted}>Machines from many vendors</Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

export const S09Limits: React.FC = () => {
  const f = useCurrentFrame();
  const tExp = cue(ID, "experienced") - 6;
  const tLet = cue(ID, "let") - 6;
  const tWatch = cue(ID, "tireless");
  const tPeople = cue(ID, "people");
  const split = prog(f, tLet, 20, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence durationInFrames={tExp + 10}>
        <GridBg />
        <AbsoluteFill style={{ paddingLeft: 140, paddingTop: 96 }}>
          <Words text="Not plug-and-play." at={2} size={58} weight={700} accent={["plug-and-play."]} accentColor={C.amber} />
        </AbsoluteFill>
        <Pipeline />
      </Sequence>
      <Sequence from={tExp}>
        <AbsoluteFill style={{ opacity: prog(f, tExp, 10) }}>
          {/* inspector footage narrows to the right half for the split */}
          <AbsoluteFill style={{ left: `${split * 50}%` }}>
            <Stock src="magnifier" dur={200} scale={[1.08, 1.16]} />
            <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(6,17,13,${0.8 - split * 0.5}) 0%, rgba(6,17,13,0.15) 70%)` }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 80, opacity: 1 - split }}>
            <Eyebrow style={{ marginBottom: 14 }}>People still matter</Eyebrow>
            <Words text="Experienced engineers" at={6} size={56} weight={700} />
            <Words text="matter more, not less." at={cue(ID, "matter") - tExp - 4} size={56} weight={700} accent={["more,"]} />
          </AbsoluteFill>
          {/* AI half */}
          <AbsoluteFill style={{ width: "50%", opacity: split }}>
            <GridBg size={36} />
            <svg viewBox="0 0 640 720" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
              <ellipse cx={320} cy={300} rx={90} ry={52} fill="none" stroke={C.mint} strokeWidth={2.5} />
              <circle cx={320 + Math.sin(f / 14) * 40} cy={300} r={22} fill={C.mint} />
              <circle cx={320 + Math.sin(f / 14) * 40} cy={300} r={9} fill={C.bg} />
              {Array.from({ length: 30 }).map((_, i) => (
                <rect key={i} x={140 + i * 12} y={420 - (20 + 18 * Math.abs(Math.sin(i / 2 + f / 9)))} width={7} height={20 + 18 * Math.abs(Math.sin(i / 2 + f / 9))} fill="rgba(124,240,176,0.5)" />
              ))}
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", opacity: prog(f, tWatch - 4, 12) }}>
              <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.16em", color: C.green }}>AI</div>
              <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: C.paper, marginTop: 6 }}>Tireless watching</div>
            </div>
          </AbsoluteFill>
          <div style={{ position: "absolute", left: "50%", right: 0, top: 470, textAlign: "center", opacity: prog(f, tPeople - 4, 12) }}>
            <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.16em", color: C.green }}>PEOPLE</div>
            <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: C.paper, marginTop: 6, textShadow: "0 2px 18px rgba(0,0,0,0.7)" }}>The thinking</div>
          </div>
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: C.green, opacity: split, transform: `scaleY(${split})` }} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
