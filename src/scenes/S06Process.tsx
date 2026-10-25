import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bg, Card, DrawPath, Pop, Words } from "../components/ui";
import { MM, PARTS } from "../three/board";
import { AoiHead, OVEN_ZONES, Oven, PlaceHead, Squeegee, Stencil, TOP, zoneX } from "../three/Machines";
import { Pcb } from "../three/Pcb";
import { Cam, Stage, Studio, camPath, project } from "../three/Stage";
import { cue } from "../timeline";
import { C, EASE_BACK, EASE_IN_OUT, FONT, MONO, clamp01, lerp, prog } from "../theme";

/** Step badge + what the machine reports to the twin. */
const StepCard: React.FC<{ at: number; n: number; title: string; data: string; children?: React.ReactNode }> = ({ at, n, title, data, children }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 16, EASE_BACK);
  return (
    <div style={{ position: "absolute", left: 60, top: 70, opacity: prog(f, at, 6), transform: `translateX(${(1 - p) * -60}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 54, height: 54, borderRadius: 16, background: C.ink, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 26 }}>
          {n}
          <span style={{ fontSize: 14, opacity: 0.6 }}>/4</span>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, letterSpacing: "-0.03em", color: C.ink }}>{title}</div>
      </div>
      <Card style={{ marginTop: 16, padding: "14px 18px", width: 330, borderRadius: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", color: C.green }}>SENDS TO THE TWIN</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 21, color: C.ink, marginTop: 4 }}>{data}</div>
        {children ? <div style={{ marginTop: 10 }}>{children}</div> : null}
      </Card>
    </div>
  );
};

/* ---------- 1. stencil printing ---------- */
export const SPrint: React.FC = () => {
  const f = useCurrentFrame();
  const ID = "print";
  const tPrinter = cue(ID, "printer");
  const sweep = prog(f, 6, tPrinter + 40, (x) => x);
  const sx = lerp(-2.4, 1.6, sweep);
  const lift = prog(f, tPrinter + 50, 24, EASE_IN_OUT);
  const follow = Math.min(sx, 1.0);
  const cam: Cam = {
    pos: [lerp(follow - 0.75, 0.2, lift), lerp(0.55, 0.75, lift), lerp(1.05, 1.15, lift)],
    target: [lerp(follow + 0.15, 0.75, lift), 0.0, lerp(0.05, 0.1, lift)],
    fov: 32,
  };
  return (
    <AbsoluteFill>
      <Bg />
      <Stage cam={cam} exposure={1.0}>
        <Studio floorY={-0.06} />
        <Pcb lift={() => -1} paste pasteX={sx - 0.02} />
        <Stencil lift={lift} />
        {lift < 0.5 ? <Squeegee x={sx} frame={f} /> : null}
      </Stage>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - prog(f, tPrinter - 10, 8) }}>
        <div style={{ background: "rgba(255,255,255,0.88)", padding: "18px 36px", borderRadius: 24, boxShadow: C.shadow }}>
          <Words text="What does it watch?" at={2} size={76} mark={["watch?"]} />
        </div>
      </AbsoluteFill>
      <StepCard at={tPrinter - 6} n={1} title="Paste printer" data="Paste height, every deposit">
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 34 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ flex: 1, borderRadius: 2, background: C.green, opacity: prog(f, tPrinter + i * 2, 6), height: `${70 + 18 * Math.sin(i * 1.7 + f / 10)}%` }} />
          ))}
        </div>
      </StepCard>
    </AbsoluteFill>
  );
};

/* ---------- 2. pick and place ---------- */
const U3 = PARTS.find((p) => p.ref === "U3")!;
const NEAR = PARTS.filter((p) => (p.kind === "r" || p.kind === "c") && Math.hypot(p.x - U3.x, p.z - U3.z) < 9).slice(0, 2);
const ORDER = [NEAR[0], U3, NEAR[1]].filter(Boolean);

export const SPlace: React.FC = () => {
  const f = useCurrentFrame();
  const ID = "place";
  const step = 30;
  const t0 = 4;
  const k = Math.min(ORDER.length - 1, Math.max(0, Math.floor((f - t0) / step)));
  const local = (f - t0 - k * step) / step; // 0..1 within this placement
  const travel = clamp01(local / 0.3);
  const down = local < 0.3 ? 0 : local < 0.55 ? EASE_IN_OUT((local - 0.3) / 0.25) : local < 0.65 ? 1 : 1 - EASE_IN_OUT(clamp01((local - 0.65) / 0.3));
  const cur = ORDER[k];
  const prev = ORDER[Math.max(0, k - 1)];
  const hx = lerp(k === 0 ? cur.x - 14 : prev.x, cur.x, EASE_IN_OUT(travel)) * MM;
  const hz = lerp(k === 0 ? cur.z - 6 : prev.z, cur.z, EASE_IN_OUT(travel)) * MM;
  const released = local >= 0.6;
  const liftMm = (ref: string) => {
    const i = ORDER.findIndex((p) => p.ref === ref);
    if (i < 0) return 0;
    if (i < k || (i === k && released)) return 0;
    if (i > k) return -1;
    return 13 * (1 - down) + 0.001; // carried by the nozzle
  };
  const cam: Cam = camPath(f, [
    [0, { pos: [2.1, 1.75, 2.45], target: [0.6, 0.42, 0.2], fov: 34 }],
    [100, { pos: [1.85, 1.6, 2.25], target: [0.66, 0.4, 0.24], fov: 33 }],
  ]);
  const log = [
    { t: t0 + step * 0.6, txt: `${ORDER[0]?.ref ?? "R"} placed`, ok: true },
    { t: t0 + step * 1.6, txt: "U3 placed", ok: true },
    { t: cue(ID, "misses") - 2, txt: "C9 missed → logged", ok: false },
  ];
  return (
    <AbsoluteFill>
      <Bg />
      <Stage cam={cam} exposure={1.0}>
        <Studio floorY={-0.06} />
        <Pcb lift={liftMm} paste pasteShine={0} />
        <PlaceHead x={hx} z={hz} down={down} tipY={TOP + cur.h * MM} />
      </Stage>
      <StepCard at={2} n={2} title="Placement" data="Every part it misses">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {log.map((l) => (
            <div key={l.txt} style={{ opacity: prog(f, l.t, 6), fontFamily: MONO, fontSize: 14, color: l.ok ? C.ink : C.amber, display: "flex", gap: 8 }}>
              <span>{l.ok ? "✓" : "✕"}</span>
              {l.txt}
            </div>
          ))}
        </div>
      </StepCard>
    </AbsoluteFill>
  );
};

/* ---------- 3. reflow ---------- */
export const SReflow: React.FC = () => {
  const f = useCurrentFrame();
  const ID = "reflow";
  const bx = interpolate(f, [0, 110], [-3.2, 2.6]);
  const shine = clamp01((bx - 0.6) / 0.8);
  const cx = bx * 0.45;
  const cam: Cam = { pos: [cx + 0.4, 0.95, 2.9], target: [cx, 0.35, -0.5], fov: 42 };
  // reflow profile: preheat → soak → reflow peak → cooling
  const prof = "M0 150 C40 120 60 92 90 88 L170 80 C200 76 215 30 235 22 C250 20 260 40 280 70 L320 130";
  const t = clamp01((bx + 3.2) / 5.8);
  return (
    <AbsoluteFill>
      <Bg tint="#FFE3C7" />
      <Stage cam={cam} exposure={1.0}>
        <Studio floorY={-0.4} shadow={0.12} keyIntensity={1.2} />
        <Oven glow={prog(f, 0, 12)} />
        <Pcb position={[bx, 0, 0]} scale={0.5} paste pasteShine={shine} />
      </Stage>
      {Array.from({ length: OVEN_ZONES }).map((_, i) => {
        const z = project(cam, [zoneX(i), 0.95, -1.6]);
        if (z.x < -40 || z.x > 1320) return null;
        return (
          <div
            key={i}
            style={{ position: "absolute", left: z.x, top: z.y - 34, transform: "translateX(-50%)", fontFamily: MONO, fontWeight: 600, fontSize: 15, color: C.ink, background: C.white, padding: "3px 8px", borderRadius: 6, boxShadow: C.shadowSm, opacity: prog(f, cue(ID, "zone") - 10 + i, 6) }}
          >
            Z{i + 1}
          </div>
        );
      })}
      <StepCard at={cue(ID, "oven") - 4} n={3} title="Reflow oven" data="Heat in every zone" />
      <div style={{ position: "absolute", right: 60, top: 70 }}>
        <Pop at={cue(ID, "heat") - 6}>
          <Card style={{ padding: "16px 18px 10px", width: 380 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", color: C.amber }}>REFLOW PROFILE · °C</div>
            <svg width={340} height={170} viewBox="0 0 330 165" style={{ marginTop: 6 }}>
              <DrawPath d={prof} p={1} stroke="rgba(240,140,0,0.25)" width={10} />
              <DrawPath d={prof} p={t} stroke={C.amber} width={4} />
              {["PREHEAT", "SOAK", "REFLOW", "COOL"].map((l, i) => (
                <text key={l} x={[20, 115, 205, 285][i]} y={162} fontFamily="IBM Plex Mono" fontSize={10} fill={C.muted} textAnchor="middle">
                  {l}
                </text>
              ))}
            </svg>
          </Card>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 4. AOI ---------- */
const CHECK = ["U1", "U2", "U3", "U4", "U5", "U6", "Y1", "L1"].map((r) => PARTS.find((p) => p.ref === r)!).filter(Boolean);

export const SAoi: React.FC = () => {
  const f = useCurrentFrame();
  const ID = "aoi";
  const ax = interpolate(f, [0, 105], [-0.9, 1.9]);
  const cam: Cam = { pos: [0.2, 2.6, 2.3], target: [0.1, 0, 0.1], fov: 38 };
  return (
    <AbsoluteFill>
      <Bg />
      <Stage cam={cam} exposure={1.0}>
        <Studio floorY={-0.06} />
        <Pcb />
        <AoiHead x={ax} z={0} />
      </Stage>
      {CHECK.map((p) => {
        const w = p.x * MM;
        if (w > ax + 0.1) return null;
        const s = project(cam, [w, 0.05, p.z * MM]);
        const pp = prog(f, interpolate(w, [-0.9, 1.9], [0, 105]) - 2, 8, EASE_BACK);
        const half = Math.max(p.w, p.d) * MM * 140 + 14;
        return (
          <div key={p.ref} style={{ position: "absolute", left: s.x - half, top: s.y - half, width: half * 2, height: half * 2, border: `3px solid ${C.green}`, borderRadius: 8, transform: `scale(${lerp(1.4, 1, pp)})`, opacity: pp }}>
            <div style={{ position: "absolute", top: -26, left: -3, background: C.green, color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 13, padding: "2px 8px", borderRadius: 6 }}>✓ {p.ref}</div>
          </div>
        );
      })}
      <StepCard at={cue(ID, "camera") - 4} n={4} title="AOI camera" data="Every single solder joint" />
    </AbsoluteFill>
  );
};
