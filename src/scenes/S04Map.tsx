import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bg, Notice, Reveal } from "../components/ui";
import { cue } from "../timeline";
import { C, EASE_BACK, FONT, MONO, lerp, prog } from "../theme";

const ID = "map";

// shared street layout (unit square 0..100)
const STREETS = ["M0 22 L100 18", "M0 48 C30 44 60 52 100 46", "M0 76 L100 80", "M18 0 L22 100", "M46 0 C44 30 50 60 47 100", "M76 0 L80 100"];
const HWY = "M0 62 C20 58 35 66 55 60 C70 55 85 58 100 52";
const RIVER = "M64 0 C58 24 70 40 62 60 C56 76 68 90 64 100";

const PaperMap: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 18, EASE_BACK);
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 150,
        width: 440,
        height: 360,
        transform: `rotate(${lerp(-14, -4, p)}deg) translateY(${(1 - p) * 120}px)`,
        opacity: prog(f, at, 8),
        boxShadow: "0 30px 60px rgba(14,34,25,0.22)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <svg viewBox="0 0 100 82" width={440} height={360} preserveAspectRatio="none">
        <rect width="100" height="82" fill="#F1E7CB" />
        <path d={RIVER} stroke="#A9CBD9" strokeWidth={7} fill="none" />
        <rect x="26" y="26" width="16" height="16" fill="#CFE0B5" />
        {STREETS.map((d) => (
          <path key={d} d={d} stroke="#D9C79E" strokeWidth={2.2} fill="none" />
        ))}
        <path d={HWY} stroke="#E8A64A" strokeWidth={3.4} fill="none" />
        <text x="4" y="78" fontFamily="IBM Plex Mono" fontSize="3" fill="#9A8659">
          PRINTED EDITION
        </text>
      </svg>
      {/* folds */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0) 32%, rgba(0,0,0,0.08) 33.3%, rgba(255,255,255,0.25) 34%, rgba(0,0,0,0) 36%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.08) 66.6%, rgba(255,255,255,0.25) 67.3%, rgba(0,0,0,0) 69%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0) 48%, rgba(0,0,0,0.07) 50%, rgba(255,255,255,0.2) 51%, rgba(0,0,0,0) 53%)" }} />
    </div>
  );
};

const Phone: React.FC<{ at: number; jam: number }> = ({ at, jam }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 18, EASE_BACK);
  const segs = 8;
  return (
    <div
      style={{
        position: "absolute",
        left: 760,
        top: 70,
        width: 300,
        height: 590,
        borderRadius: 46,
        background: "#11181A",
        padding: 12,
        boxShadow: "0 40px 80px rgba(14,34,25,0.30)",
        transform: `translateY(${(1 - p) * 160}px) rotate(${lerp(8, 3, p)}deg)`,
        opacity: prog(f, at, 8),
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 36, overflow: "hidden", background: "#EEF1EE" }}>
        <svg viewBox="0 0 100 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <rect width="100" height="200" fill="#EEF1EE" />
          <g transform="translate(0 50) scale(1 1.2)">
            <path d={RIVER} stroke="#BFDDF0" strokeWidth={8} fill="none" />
            <rect x="26" y="26" width="16" height="16" fill="#D6EBCF" />
            {STREETS.map((d) => (
              <path key={d} d={d} stroke="#FFFFFF" strokeWidth={3} fill="none" />
            ))}
            {/* highway in traffic colours */}
            <path d={HWY} stroke="#FFFFFF" strokeWidth={5.5} fill="none" />
            {Array.from({ length: segs }).map((_, i) => {
              const v = Math.sin(f / 16 + i * 1.4);
              const isJam = i === 5 || i === 6;
              const col = isJam && jam > 0 ? C.red : v > 0.6 ? C.amber : "#2DB861";
              return (
                <path
                  key={i}
                  d={HWY}
                  stroke={col}
                  strokeWidth={isJam && jam > 0 ? 4.4 + Math.sin(f / 3) * 0.6 : 3.6}
                  fill="none"
                  pathLength={segs}
                  strokeDasharray={`0.98 ${segs}`}
                  strokeDashoffset={-i}
                />
              );
            })}
            {Array.from({ length: 6 }).map((_, i) => {
              const t = ((f * 0.006 + i / 6) % 1) * 100;
              return <circle key={i} cx={t} cy={60 - Math.sin(t / 15) * 3} r={1.3} fill="#1A2B23" />;
            })}
            <circle cx="12" cy="61" r="3.5" fill="rgba(47,123,239,0.25)" />
            <circle cx="12" cy="61" r="2" fill="#2F7BEF" stroke="#fff" strokeWidth="0.8" />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 14, top: 18, display: "flex", alignItems: "center", gap: 7, background: C.white, borderRadius: 20, padding: "6px 12px", boxShadow: C.shadowSm }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: C.red, opacity: 0.5 + 0.5 * Math.sin(f / 4) }} />
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.ink, letterSpacing: "0.1em" }}>LIVE</span>
        </div>
      </div>
    </div>
  );
};

export const S04Map: React.FC = () => {
  const f = useCurrentFrame();
  const tJam = cue(ID, "traffic") - 4;
  return (
    <AbsoluteFill>
      <Bg tint="#DCEBFF" />
      <PaperMap at={cue(ID, "paper") - 8} />
      <Phone at={cue(ID, "app") - 8} jam={prog(f, tJam, 6)} />
      <div style={{ position: "absolute", left: 640, top: 210 }}>
        <Notice at={tJam} icon="!" title="Traffic jam ahead" body="Slow-down on your route, right now" color={C.red} style={{ width: 400 }} />
      </div>
      <div style={{ position: "absolute", left: 130, top: 560, width: 440, textAlign: "center" }}>
        <Reveal at={cue(ID, "roads") - 6}>
          <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em" }}>Shows roads.</div>
        </Reveal>
      </div>
      <div style={{ position: "absolute", left: 600, top: 470, width: 230, textAlign: "right" }}>
        <Reveal at={cue(ID, "right") - 4} x={-20}>
          <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 800, color: C.green, letterSpacing: "-0.03em", lineHeight: 1 }}>Shows right now.</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
