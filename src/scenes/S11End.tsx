import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Stock } from "../components/frame";
import { Bg, Card, Eyebrow, Pop, Reveal, Words } from "../components/ui";
import { Pcb } from "../three/Pcb";
import { Stage, Studio } from "../three/Stage";
import { cue, scene } from "../timeline";
import { C, EASE_BACK, EASE_IN_OUT, FONT, MONO, lerp, prog } from "../theme";

/* ---------- limits ---------- */
export const S11Limits: React.FC = () => {
  const f = useCurrentFrame();
  const ID = "limits";
  const tNo = cue(ID, "no");
  const tOnly = cue(ID, "only");
  const tStill = cue(ID, "still") - 4;
  const tThe = cue(ID, "the") - 4;
  const gaps = [false, true, false, false, true, false, false, true];
  return (
    <AbsoluteFill>
      <Bg />
      {/* is it magic? no. */}
      <Sequence durationInFrames={tOnly - 2}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Words text="Is it magic?" at={0} size={110} />
          <div style={{ marginTop: 18, fontFamily: FONT, fontWeight: 800, fontSize: 150, color: C.red, letterSpacing: "-0.05em", transform: `scale(${lerp(2, 1, prog(f, tNo - 3, 10, EASE_BACK))})`, opacity: prog(f, tNo - 3, 3) }}>No.</div>
        </AbsoluteFill>
      </Sequence>
      {/* only as good as its data */}
      <Sequence from={tOnly - 4} durationInFrames={tStill - tOnly + 8}>
        <AbsoluteFill style={{ opacity: prog(f, tOnly - 4, 6) }}>
          <AbsoluteFill style={{ paddingLeft: 90, paddingTop: 110 }}>
            <Words text="Only as good as its data." at={2} size={62} mark={["data."]} />
          </AbsoluteFill>
          <svg viewBox="0 0 1280 720" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <rect x={90} y={330} width={1100} height={60} rx={30} fill={C.white} stroke={C.line} />
            {gaps.map((g, i) => {
              const x = 120 + ((i * 130 + (f - tOnly) * 6) % 1040);
              return g ? (
                <rect key={i} x={x} y={344} width={90} height={32} rx={10} fill="none" stroke={C.red} strokeWidth={3} strokeDasharray="7 6" />
              ) : (
                <rect key={i} x={x} y={344} width={90} height={32} rx={10} fill={C.green} />
              );
            })}
          </svg>
          <div style={{ position: "absolute", left: 90, top: 430, display: "flex", gap: 14 }}>
            <Pop at={18}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.red }}>Missing data → shaky predictions</div>
            </Pop>
          </div>
        </AbsoluteFill>
      </Sequence>
      {/* still needs great engineers */}
      <Sequence from={tStill} durationInFrames={tThe - tStill + 6}>
        <Stock src="magnifier" dur={tThe - tStill} scale={[1.08, 1.18]} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(243,246,242,0.92) 0%, rgba(243,246,242,0.6) 40%, rgba(243,246,242,0) 70%)" }} />
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 80 }}>
          <Words text="Still needs great engineers." at={2} size={64} accent={["engineers."]} style={{ maxWidth: 560 }} />
        </AbsoluteFill>
      </Sequence>
      {/* AI watches. People decide. */}
      <Sequence from={tThe}>
        <AbsoluteFill style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 40, opacity: prog(f, tThe, 6) }}>
          {[
            { at: cue(ID, "watches") - 8, k: "AI", t: "watches.", c: C.green, icon: "M8 30 C20 10 60 10 72 30 C60 50 20 50 8 30 Z M40 18 A12 12 0 1 1 39.9 18 Z" },
            { at: cue(ID, "people") - 6, k: "People", t: "decide.", c: C.ink, icon: "M40 10 A12 12 0 1 1 39.9 10 Z M14 62 C14 44 66 44 66 62 Z" },
          ].map((x) => (
            <Pop key={x.k} at={x.at - tThe}>
              <Card style={{ width: 420, height: 330, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, border: `3px solid ${x.c}` }}>
                <svg width={110} height={90} viewBox="0 0 80 66">
                  <path d={x.icon} fill="none" stroke={x.c} strokeWidth={4} strokeLinejoin="round" />
                </svg>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: C.ink, letterSpacing: "-0.04em", lineHeight: 1 }}>
                  <span style={{ color: x.c }}>{x.k}</span> {x.t}
                </div>
              </Card>
            </Pop>
          ))}
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

/* ---------- payoff ---------- */
const ICONS: Record<string, string[]> = {
  defects: ["M40 8 L68 20 V44 C68 62 54 72 40 78 C26 72 12 62 12 44 V20 Z", "M27 42 L37 52 L55 32"],
  scrap: ["M14 22 H66 L60 74 H20 Z", "M8 22 H72", "M32 14 H48", "M32 36 V60 M48 36 V60"],
  surprises: ["M40 12 A28 28 0 1 1 39.9 12 Z", "M40 24 V42 L52 50"],
  builds: ["M10 60 H26 L34 40 L44 68 L52 50 H70", "M24 20 H56 V36 H24 Z"],
};
const TILES = [
  { k: "defects", w: "fewer", t: "Fewer defects", c: C.green, bg: "#E3F7EC" },
  { k: "scrap", w: "less", t: "Less scrap", c: "#2F7BEF", bg: "#E5EEFF" },
  { k: "surprises", w: "fewer", n: 2, t: "Fewer surprises", c: C.amber, bg: "#FFF1DE" },
  { k: "builds", w: "smoother", t: "Smoother first builds", c: "#8B5CF6", bg: "#F0EAFF" },
];

export const S12Payoff: React.FC = () => {
  const f = useCurrentFrame();
  const ID = "payoff";
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 80 }}>
        <Eyebrow>What it adds up to</Eyebrow>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 70, right: 70, top: 150, display: "flex", gap: 22 }}>
        {TILES.map((t) => {
          const at = cue(ID, t.w, t.n ?? 1) - 6;
          const p = prog(f, at, 14, EASE_BACK);
          return (
            <div
              key={t.k}
              style={{
                flex: 1,
                height: 380,
                borderRadius: 28,
                background: t.bg,
                padding: "34px 26px",
                display: "flex",
                flexDirection: "column",
                transform: `translateY(${(1 - p) * 80}px) scale(${lerp(0.85, 1, p)})`,
                opacity: prog(f, at, 5),
                boxShadow: C.shadowSm,
              }}
            >
              <div style={{ width: 110, height: 110, borderRadius: 30, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: C.shadowSm }}>
                <svg width={80} height={86} viewBox="0 0 80 86">
                  {ICONS[t.k].map((d, j) => (
                    <path key={j} d={d} fill="none" stroke={t.c} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="400" strokeDashoffset={400 * (1 - prog(f, at + 4 + j * 4, 16))} />
                  ))}
                </svg>
              </div>
              <div style={{ marginTop: "auto", fontFamily: FONT, fontWeight: 800, fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.035em", color: C.ink }}>{t.t}</div>
              <div style={{ marginTop: 14, height: 6, borderRadius: 6, width: `${prog(f, at + 6, 16) * 100}%`, background: t.c }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- CTA + end card ---------- */
export const S13Cta: React.FC = () => {
  const f = useCurrentFrame();
  const ID = "cta";
  const sc = scene(ID);
  const endAt = sc.lead + sc.voDur + 6;
  const end = prog(f, endAt, 20, EASE_IN_OUT);
  const a = 0.6 + f * 0.007;
  const cam = { pos: [Math.sin(a) * 4.2, 2.3, Math.cos(a) * 4.2] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 34 };
  return (
    <AbsoluteFill>
      <Bg tint="#CFF5DE" />
      <AbsoluteFill style={{ opacity: 0.12 }}>
        <Stock src="pcb_macro" dur={sc.dur} scale={[1.1, 1.2]} style={{ filter: "blur(6px) saturate(0.8)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ left: 380, opacity: 1 - end }}>
        <Stage cam={cam}>
          <Studio floorY={-0.07} />
          <Pcb position={[0, lerp(-0.3, 0, prog(f, 0, 30)), 0]} />
        </Stage>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 80, opacity: 1 - end }}>
        <Words text="Building a new board?" at={2} size={66} />
        <div style={{ marginTop: 18 }}>
          <Words text="Talk to STIM's engineers" at={cue(ID, "talk") - 4} size={44} weight={700} color={C.ink2} accent={["STIM's"]} />
          <Words text="before your first panel is built." at={cue(ID, "before") - 4} size={44} weight={700} color={C.ink2} mark={["first"]} />
        </div>
        <Reveal at={cue(ID, "built") - 2} style={{ marginTop: 34 }}>
          <div style={{ display: "inline-block", padding: "16px 30px", borderRadius: 14, background: C.green, color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 26, boxShadow: "0 18px 36px rgba(14,159,85,0.3)" }}>Request a quote ↗</div>
        </Reveal>
      </AbsoluteFill>
      {/* end card */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: end, background: `rgba(255,255,255,${0.75 * end})` }}>
        <Img src={staticFile("img/stim-logo.svg")} style={{ height: 120, transform: `scale(${lerp(0.9, 1, end)})` }} />
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: "0.22em", color: C.muted, marginTop: 26, textTransform: "uppercase" }}>Precision in every connection · Toronto, Canada</div>
        <div style={{ display: "flex", gap: 16, marginTop: 38, opacity: prog(f, endAt + 14, 14) }}>
          <div style={{ padding: "16px 30px", borderRadius: 14, background: C.green, color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 24 }}>Request a quote ↗</div>
          <Card style={{ padding: "16px 30px", borderRadius: 14, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: C.ink, boxShadow: C.shadowSm }}>stimcanada.com</Card>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 18, color: C.muted, marginTop: 26, opacity: prog(f, endAt + 28, 14) }}>Read the full article on the STIM blog</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
