import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DrawPath, Eyebrow, GridBg, Tag } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

const ID = "maintain";

/** Side view of a pick-and-place head cycling between feeder and board. */
const Head: React.FC = () => {
  const f = useCurrentFrame();
  const CYCLE = 34;
  const k = Math.floor(f / CYCLE);
  const t = (f % CYCLE) / CYCLE;
  const drops = k % 4 === 3; // every few cycles a part is lost
  // x path: feeder (120) -> board (420) -> back
  const x = t < 0.5 ? lerp(120, 420, EASE_IN_OUT(t * 2)) : lerp(420, 120, EASE_IN_OUT((t - 0.5) * 2));
  const dip = (u: number) => Math.max(0, 1 - Math.abs(u) * 14);
  const z = 40 * Math.max(dip(t - 0.04), dip(t - 0.46));
  const carrying = t > 0.06 && t < 0.46;
  const lost = drops && t > 0.22;
  const fall = lost ? (t - 0.22) * 520 : 0;
  return (
    <svg viewBox="0 0 560 380" width={640} height={434}>
      {/* gantry */}
      <rect x={40} y={40} width={480} height={18} rx={3} fill="#5E6A65" />
      <g transform={`translate(${x} 0)`}>
        <rect x={-34} y={58} width={68} height={70} rx={6} fill="#AEB8B3" />
        <rect x={-6} y={128 + z} width={12} height={46} fill="#D9DFDB" />
        <rect x={-9} y={170 + z} width={18} height={8} rx={2} fill="#3B4446" />
        {carrying && !lost ? <rect x={-14} y={178 + z} width={28} height={10} rx={2} fill="#2B2420" /> : null}
      </g>
      {lost ? <rect x={x - 14 + fall * 0.2} y={188 + fall} width={28} height={10} rx={2} fill={C.red} transform={`rotate(${fall * 0.6} ${x} ${193 + fall})`} /> : null}
      {/* feeder */}
      <rect x={70} y={230} width={100} height={26} rx={3} fill="#2A3133" />
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={78 + i * 18} y={222} width={12} height={8} fill="#2B2420" />
      ))}
      <text x={120} y={282} textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize={12}>
        FEEDER
      </text>
      {/* board */}
      <rect x={330} y={232} width={190} height={14} rx={2} fill="#0E5A35" />
      {Array.from({ length: Math.min(6, Math.floor(f / CYCLE)) }).map((_, i) => (
        <rect key={i} x={346 + i * 28} y={222} width={18} height={10} rx={2} fill="#2B2420" />
      ))}
      <text x={425} y={282} textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize={12}>
        BOARD
      </text>
      <text x={280} y={360} textAnchor="middle" fill={C.paper} fontFamily={MONO} fontSize={13} letterSpacing={2}>
        PLACEMENT NOZZLE
      </text>
    </svg>
  );
};

const SHIFTS = [0.18, 0.22, 0.26, 0.33, 0.42, 0.55];

const TL = { x0: 170, x1: 1150 };
const tx = (h: number) => TL.x0 + (h / 24) * (TL.x1 - TL.x0); // h = hours after 06:00

export const S08Maintain: React.FC = () => {
  const f = useCurrentFrame();
  const tNozzle = cue(ID, "nozzle");
  const tEasy = cue(ID, "easy");
  const tCatches = cue(ID, "catches");
  const tBooks = cue(ID, "books");
  const tSix = cue(ID, "six");
  const tTwenty = cue(ID, "twenty");
  const tThree = cue(ID, "three");
  const tTwo = cue(ID, "two");

  const part1Out = prog(f, tBooks - 12, 14);
  const part2In = prog(f, tBooks - 6, 16);
  const trend = prog(f, tCatches - 4, 18, EASE_IN_OUT);
  const play = prog(f, tBooks, tTwo + 30 - tBooks, (x) => x);

  return (
    <AbsoluteFill>
      <GridBg />
      {/* part 1: nozzle + rejects per shift */}
      <AbsoluteFill style={{ opacity: 1 - part1Out }}>
        <div style={{ position: "absolute", left: 50, top: 130, opacity: prog(f, 2, 16), transform: `translateX(${(1 - prog(f, 2, 22)) * -40}px)` }}>
          <Head />
        </div>
        <div style={{ position: "absolute", left: 720, top: 160, width: 460, opacity: prog(f, 8, 16) }}>
          <Eyebrow>Rejects per shift</Eyebrow>
          <svg width={460} height={300} viewBox="0 0 460 300" style={{ marginTop: 12 }}>
            <line x1={0} x2={460} y1={260} y2={260} stroke={C.lineStrong} />
            {SHIFTS.map((v, i) => {
              const p = prog(f, tNozzle + i * 8, 14);
              const h = v * 300 * p;
              return (
                <g key={i}>
                  <rect x={20 + i * 74} y={260 - h} width={44} height={h} rx={3} fill={i > 2 ? C.amber : "rgba(124,240,176,0.55)"} />
                  <text x={42 + i * 74} y={284} textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize={12}>
                    S{i + 1}
                  </text>
                </g>
              );
            })}
            <DrawPath d="M42 205 L116 193 L190 181 L264 160 L338 133 L412 94" p={trend} stroke={C.amber} width={2.5} dash={trend > 0 ? undefined : "0 9999"} />
          </svg>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <div style={{ opacity: prog(f, tEasy - 4, 12) * (1 - prog(f, tCatches - 6, 10)) }}>
              <Tag color={C.muted}>A few extra a shift · easy to miss</Tag>
            </div>
          </div>
          <div style={{ position: "absolute", top: 8, right: 0, opacity: prog(f, tCatches, 12) }}>
            <Tag color={C.amber} solid>
              Twin: nozzle wear trend
            </Tag>
          </div>
        </div>
      </AbsoluteFill>

      {/* part 2: 24 h timeline (blog fig. 5) */}
      <AbsoluteFill style={{ opacity: part2In }}>
        <div style={{ position: "absolute", left: TL.x0, top: 104 }}>
          <div style={{ fontFamily: FONT, fontSize: 38, fontWeight: 700, color: C.paper, letterSpacing: "-0.02em" }}>
            Fix it on <span style={{ color: C.green }}>your</span> schedule, not the machine's.
          </div>
        </div>
        <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          {["06:00", "10:00", "14:00", "18:00", "22:00", "02:00", "06:00"].map((l, i) => (
            <g key={i}>
              <line x1={tx(i * 4)} x2={tx(i * 4)} y1={244} y2={540} stroke={C.line} />
              <text x={tx(i * 4)} y={234} textAnchor="middle" fill={C.muted} fontFamily={MONO} fontSize={12}>
                {l}
              </text>
            </g>
          ))}
          {/* lane 1: run to failure */}
          <text x={TL.x0} y={276} fill={C.paper} fontFamily={FONT} fontSize={18} fontWeight={600}>
            Run to failure
          </text>
          <rect x={tx(0)} y={290} width={(tx(20) - tx(0)) * Math.min(1, play / 0.83)} height={34} rx={3} fill="rgba(124,240,176,0.35)" />
          <rect x={tx(20)} y={290} width={(tx(23) - tx(20)) * prog(f, tThree - 6, 16)} height={34} rx={3} fill={C.red} />
          <rect x={tx(23)} y={290} width={(tx(24) - tx(23)) * prog(f, tThree + 10, 10)} height={34} rx={3} fill="rgba(124,240,176,0.35)" />
          {/* lane 2: with a twin */}
          <text x={TL.x0} y={390} fill={C.paper} fontFamily={FONT} fontSize={18} fontWeight={600}>
            With a twin
          </text>
          <rect x={tx(0)} y={410} width={(tx(24) - tx(0)) * Math.min(1, play * 1.05)} height={34} rx={3} fill="rgba(124,240,176,0.35)" />
          <rect x={tx(12)} y={406} width={tx(12.34) - tx(12)} height={42} rx={2} fill={C.amber} opacity={prog(f, tSix - 4, 10)} />
          {/* playhead */}
          <line x1={lerp(tx(0), tx(24), play)} x2={lerp(tx(0), tx(24), play)} y1={250} y2={460} stroke={C.paper} strokeWidth={1.5} opacity={0.6 * (1 - prog(f, tTwo + 24, 10))} />
        </svg>
        <div style={{ position: "absolute", left: tx(12) - 70, top: 456, opacity: prog(f, tSix, 12) }}>
          <Tag color={C.amber}>18:00 planned break</Tag>
        </div>
        <div style={{ position: "absolute", left: tx(12) - 70, top: 492, opacity: prog(f, tTwenty - 4, 12) }}>
          <Tag color={C.mint} solid>
            Nozzle swap · 20 min
          </Tag>
        </div>
        <div style={{ position: "absolute", left: tx(20) - 120, top: 334, opacity: prog(f, tThree - 2, 12) }}>
          <Tag color={C.red} solid>
            02:00 · line down ~3 h
          </Tag>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
