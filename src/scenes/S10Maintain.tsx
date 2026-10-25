import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bg, Card, DrawPath, Eyebrow, Pop, Tag, Words } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_BACK, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

const ID = "maintain";

/** Side view of a placement head picking from a reel and placing on a board. */
const Head: React.FC<{ dropEvery: number }> = ({ dropEvery }) => {
  const f = useCurrentFrame();
  const CYCLE = 26;
  const k = Math.floor(f / CYCLE);
  const t = (f % CYCLE) / CYCLE;
  const drops = k % dropEvery === dropEvery - 1;
  const x = t < 0.5 ? lerp(130, 470, EASE_IN_OUT(t * 2)) : lerp(470, 130, EASE_IN_OUT((t - 0.5) * 2));
  const dip = (u: number) => Math.max(0, 1 - Math.abs(u) * 12);
  const z = 46 * Math.max(dip(t - 0.04), dip(t - 0.46));
  const carrying = t > 0.06 && t < 0.46;
  const lost = drops && t > 0.24 && t < 0.5;
  const fall = lost ? (t - 0.24) * 600 : 0;
  return (
    <svg viewBox="0 0 600 420" width={600} height={420}>
      <defs>
        <linearGradient id="headg" x1="0" x2="1">
          <stop offset="0" stopColor="#F4F6F5" />
          <stop offset="1" stopColor="#C9D1CD" />
        </linearGradient>
      </defs>
      <rect x={40} y={40} width={520} height={22} rx={6} fill="#8E979B" />
      <g transform={`translate(${x} 0)`}>
        <rect x={-46} y={62} width={92} height={86} rx={14} fill="url(#headg)" stroke="#AAB3AF" />
        <rect x={-40} y={70} width={80} height={10} rx={4} fill={C.green} />
        <rect x={-7} y={148 + z} width={14} height={56} rx={3} fill="#B9C1C4" />
        <rect x={-10} y={200 + z} width={20} height={9} rx={2} fill="#3B4446" />
        {carrying && !lost ? <rect x={-17} y={209 + z} width={34} height={13} rx={3} fill="#2B2420" /> : null}
      </g>
      {lost ? <rect x={x - 17 + fall * 0.25} y={220 + fall} width={34} height={13} rx={3} fill={C.red} transform={`rotate(${fall * 0.7} ${x} ${226 + fall})`} /> : null}
      {/* reel + tape */}
      <circle cx={130} cy={330} r={58} fill="#E9EDEB" stroke="#9AA3A7" strokeWidth={4} />
      <circle cx={130} cy={330} r={14} fill="#9AA3A7" />
      <rect x={80} y={262} width={110} height={12} rx={3} fill="#D7C9A6" />
      {/* board */}
      <rect x={380} y={262} width={200} height={16} rx={3} fill="#0B4F2E" />
      {Array.from({ length: Math.min(5, k) }).map((_, i) => (
        <rect key={i} x={396 + i * 36} y={250} width={22} height={12} rx={2} fill="#2B2420" />
      ))}
      <text x={130} y={410} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize={14} fill={C.muted}>
        PARTS REEL
      </text>
      <text x={480} y={310} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize={14} fill={C.muted}>
        BOARD
      </text>
    </svg>
  );
};

export const S10Maintain: React.FC = () => {
  const f = useCurrentFrame();
  const tNozzle = cue(ID, "nozzle");
  const tNotices = cue(ID, "notices");
  const tBooks = cue(ID, "books");
  const tTwenty = cue(ID, "twenty");
  const tNo = cue(ID, "no");
  const tTwo = cue(ID, "two");
  const part2 = prog(f, tBooks - 8, 14, EASE_IN_OUT);
  const trend = prog(f, tNotices - 6, 22, EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <Bg />
      {/* part 1: the nozzle starts to drop parts */}
      <AbsoluteFill style={{ opacity: 1 - part2, transform: `translateX(${part2 * -80}px)` }}>
        <AbsoluteFill style={{ paddingLeft: 70, paddingTop: 66 }}>
          <Words text="Fixed before it breaks." at={2} size={54} mark={["before"]} />
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 40, top: 170, opacity: prog(f, 4, 10) }}>
          <Head dropEvery={f > tNozzle ? 3 : 999} />
        </div>
        <div style={{ position: "absolute", left: 720, top: 180 }}>
          <Pop at={tNozzle + 6}>
            <Card style={{ width: 470, padding: "22px 26px" }}>
              <Eyebrow color={C.muted}>Nozzle 3 · dropped parts per shift</Eyebrow>
              <svg width={420} height={190} viewBox="0 0 420 190" style={{ marginTop: 10 }}>
                {[0.14, 0.18, 0.24, 0.33, 0.46, 0.62].map((v, i) => {
                  const p = prog(f, tNozzle + 10 + i * 6, 10);
                  return <rect key={i} x={14 + i * 68} y={170 - v * 230 * p} width={46} height={v * 230 * p} rx={6} fill={i > 2 ? C.amber : "rgba(14,159,85,0.45)"} />;
                })}
                <DrawPath d="M37 138 L105 129 L173 115 L241 94 L309 64 L377 27" p={trend} stroke={C.red} width={4} />
              </svg>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <div style={{ opacity: prog(f, cue(ID, "extra") - 4, 8) * (1 - prog(f, tNotices - 6, 8)) }}>
                  <Tag color={C.muted}>Easy for people to miss</Tag>
                </div>
              </div>
              <div style={{ position: "absolute", right: 22, top: 20 }}>
                <Pop at={tNotices - 2}>
                  <Tag color={C.amber} solid>
                    Twin: wear trend
                  </Tag>
                </Pop>
              </div>
            </Card>
          </Pop>
        </div>
      </AbsoluteFill>

      {/* part 2: planned fix vs 2 a.m. breakdown */}
      <AbsoluteFill style={{ opacity: part2, transform: `translateX(${(1 - part2) * 80}px)` }}>
        <div style={{ position: "absolute", left: 90, top: 130 }}>
          <Card style={{ width: 520, padding: 26 }}>
            <Eyebrow>Today · line 2 schedule</Eyebrow>
            {["16:00", "17:00", "18:00", "19:00"].map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, height: 70, borderTop: `1px solid ${C.line}`, marginTop: i ? 0 : 14 }}>
                <span style={{ fontFamily: MONO, fontSize: 16, color: C.muted, width: 60 }}>{t}</span>
                {t === "18:00" ? (
                  <div
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: 12,
                      background: C.green,
                      color: C.white,
                      fontFamily: FONT,
                      fontWeight: 800,
                      fontSize: 20,
                      transform: `scale(${lerp(0.6, 1, prog(f, tBooks + 4, 14, EASE_BACK))})`,
                      opacity: prog(f, tBooks + 4, 5),
                    }}
                  >
                    Nozzle swap · planned break
                    <span style={{ marginLeft: 10, background: "rgba(255,255,255,0.25)", borderRadius: 8, padding: "2px 8px", opacity: prog(f, tTwenty - 2, 6) }}>20 min</span>
                  </div>
                ) : (
                  <div style={{ flex: 1, height: 12, borderRadius: 6, background: "rgba(14,159,85,0.15)" }} />
                )}
              </div>
            ))}
          </Card>
        </div>
        <div style={{ position: "absolute", left: 680, top: 160, opacity: prog(f, tNo - 6, 10), transform: `translateY(${(1 - prog(f, tNo - 6, 14)) * 40}px)` }}>
          <div style={{ width: 500, height: 330, borderRadius: 24, background: "linear-gradient(160deg, #1B2A4A, #0E1626)", boxShadow: C.shadow, padding: 30, position: "relative", overflow: "hidden" }}>
            <svg width={60} height={60} viewBox="0 0 60 60" style={{ position: "absolute", right: 30, top: 26 }}>
              <path d="M40 8 A24 24 0 1 0 52 40 A18 18 0 1 1 40 8 Z" fill="#F3E7B4" />
            </svg>
            <div style={{ fontFamily: MONO, fontSize: 16, color: "#9FB3D9", letterSpacing: "0.14em" }}>WITHOUT A TWIN</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, color: C.white, letterSpacing: "-0.04em", marginTop: 10 }}>02:00</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: "#FF8A8D" }}>Surprise breakdown · line down</div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 560, height: 12, borderRadius: 12, background: C.red, transform: `rotate(-14deg) scaleX(${prog(f, tTwo, 10)})` }} />
            </div>
          </div>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Pop at={cue(ID, "morning") + 2}>
              <Tag color={C.green} solid size={20}>
                Avoided
              </Tag>
            </Pop>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
