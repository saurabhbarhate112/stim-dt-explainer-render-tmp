import pathlib

R = pathlib.Path(__file__).resolve().parent.parent / "src"


def sub(path, old, new):
    p = R / path
    s = p.read_text(encoding="utf8")
    if old not in s:
        raise SystemExit(f"not found in {path}: {old[:60]!r}")
    p.write_text(s.replace(old, new), encoding="utf8")


# environment intensity on the stage
sub("three/Stage.tsx", "const Rig: React.FC<{ cam: Cam; exposure: number }> = ({ cam, exposure }) => {",
    "const Rig: React.FC<{ cam: Cam; exposure: number; envIntensity: number }> = ({ cam, exposure, envIntensity }) => {")
sub("three/Stage.tsx", """  useLayoutEffect(() => {
    scene.environment = env;
  }, [scene, env]);""", """  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = envIntensity;
  }, [scene, env, envIntensity]);""")
sub("three/Stage.tsx", "export const Stage: React.FC<{ cam: Cam; children: React.ReactNode; exposure?: number }> = ({ cam, children, exposure = 1.05 }) => {",
    "export const Stage: React.FC<{ cam: Cam; children: React.ReactNode; exposure?: number; envIntensity?: number }> = ({ cam, children, exposure = 1.0, envIntensity = 0.5 }) => {")
sub("three/Stage.tsx", "<Rig cam={cam} exposure={exposure} />", "<Rig cam={cam} exposure={exposure} envIntensity={envIntensity} />")

sub("three/board.ts", 'g.strokeStyle = "rgba(38,128,78,0.9)";', 'g.strokeStyle = "rgba(24,100,60,0.95)";')

# stencil frame
sub("three/Machines.tsx", """  return (
    <group position={[0, TOP + 0.004 + lift * 0.35, 0]} rotation={[0, 0, lift * 0.05]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat} castShadow>
        <planeGeometry args={[(BW + 20) * MM, (BD + 20) * MM]} />
      </mesh>
    </group>
  );""", """  const fw = (BW + 20) * MM;
  const fd = (BD + 20) * MM;
  return (
    <group position={[0, TOP + 0.004 + lift * 0.35, 0]} rotation={[0, 0, lift * 0.05]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat} castShadow>
        <planeGeometry args={[fw, fd]} />
      </mesh>
      {[
        [0, -fd / 2, fw + 0.24, 0.12],
        [0, fd / 2, fw + 0.24, 0.12],
        [-fw / 2, 0, 0.12, fd],
        [fw / 2, 0, 0.12, fd],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.03, z]} castShadow>
          <boxGeometry args={[w, 0.06, d]} />
          <meshStandardMaterial color="#9AA3A7" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );""")
sub("three/Machines.tsx", 'new THREE.MeshStandardMaterial({ color: "#CDD3D6", metalness: 0.9, roughness: 0.32,',
    'new THREE.MeshStandardMaterial({ color: "#B4BBBE", metalness: 0.85, roughness: 0.4,')

m = R / "three/Machines.tsx"
s = m.read_text(encoding="utf8")
a = s.index("/** Cut-away reflow oven")
b = s.index("/** AOI camera")
oven = '''/** Cut-away reflow oven: dark tunnel, top heater bank glowing per zone. */
export const OVEN_ZONES = 8;
export const OVEN_L = 9;
export const zoneX = (i: number) => -OVEN_L / 2 + (i + 0.5) * (OVEN_L / OVEN_ZONES);
export const ZONE_HEAT = [0.3, 0.38, 0.46, 0.5, 0.56, 1, 0.62, 0.1];

export const Oven: React.FC<{ glow: number }> = ({ glow }) => (
  <group>
    <mesh position={[0, 0.55, -1.7]}>
      <boxGeometry args={[OVEN_L, 1.5, 0.1]} />
      <meshStandardMaterial color="#2A302E" roughness={0.8} />
    </mesh>
    <mesh position={[0, -0.12, -0.6]} receiveShadow>
      <boxGeometry args={[OVEN_L, 0.06, 2.4]} />
      <meshStandardMaterial color="#3A413E" roughness={0.85} />
    </mesh>
    <mesh position={[0, 1.45, -0.6]} castShadow>
      <boxGeometry args={[OVEN_L + 0.2, 0.36, 2.5]} />
      <meshStandardMaterial color="#E7ECEA" roughness={0.45} metalness={0.2} />
    </mesh>
    <mesh position={[0, 1.27, 0.66]}>
      <boxGeometry args={[OVEN_L + 0.2, 0.04, 0.04]} />
      <meshStandardMaterial color="#0E9F55" emissive="#0E9F55" emissiveIntensity={0.4} />
    </mesh>
    {[-0.55, 0.55].map((z) => (
      <mesh key={z} position={[0, TOP - 0.03, z]}>
        <boxGeometry args={[OVEN_L + 4, 0.05, 0.06]} />
        <meshStandardMaterial color="#8C9497" metalness={0.9} roughness={0.3} />
      </mesh>
    ))}
    {Array.from({ length: OVEN_ZONES }).map((_, i) => {
      const x = zoneX(i);
      const heat = ZONE_HEAT[i];
      const col = new THREE.Color().setHSL(0.075 - heat * 0.055, 1, 0.42 + heat * 0.1);
      return (
        <group key={i}>
          <mesh position={[x, 1.24, -0.6]}>
            <boxGeometry args={[OVEN_L / OVEN_ZONES - 0.06, 0.05, 2.3]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={(0.5 + heat * 2.2) * glow} roughness={0.6} />
          </mesh>
          <mesh position={[x + OVEN_L / OVEN_ZONES / 2, 0.55, -1.0]}>
            <boxGeometry args={[0.03, 1.3, 1.3]} />
            <meshStandardMaterial color="#4A524F" roughness={0.6} />
          </mesh>
          <mesh position={[x, 0.75, -1.64]}>
            <planeGeometry args={[OVEN_L / OVEN_ZONES - 0.1, 0.9]} />
            <meshBasicMaterial color={col} transparent opacity={0.18 + heat * 0.35 * glow} />
          </mesh>
          <pointLight position={[x, 1.0, 0.1]} color={col} intensity={glow * (0.6 + heat * 3)} distance={2.2} />
        </group>
      );
    })}
  </group>
);

'''
m.write_text(s[:a] + oven + s[b:], encoding="utf8")

P = "scenes/S06Process.tsx"
sub(P, """  const sweep = prog(f, tPrinter - 22, 70, EASE_IN_OUT);
  const sx = lerp(-2.6, 2.6, sweep);
  const lift = prog(f, tPrinter + 52, 22, EASE_IN_OUT);
  const cam: Cam = camPath(f, [
    [0, { pos: [-1.6, 1.15, 1.9], target: [-0.6, 0, 0], fov: 32 }],
    [tPrinter + 70, { pos: [0.4, 1.0, 1.6], target: [0.3, 0, 0], fov: 32 }],
  ]);""", """  const sweep = prog(f, 6, tPrinter + 40, (x) => x);
  const sx = lerp(-2.4, 1.6, sweep);
  const lift = prog(f, tPrinter + 50, 24, EASE_IN_OUT);
  const follow = Math.min(sx, 1.0);
  const cam: Cam = {
    pos: [follow * 0.75 - 0.5 - lift * 0.3, 0.95 + lift * 0.4, 1.75 + lift * 0.3],
    target: [follow * 0.75 + 0.1, 0.05, 0.05],
    fov: 34,
  };""")
sub(P, """    [0, { pos: [1.55, 0.95, 1.35], target: [0.62, 0.05, 0.22], fov: 30 }],
    [100, { pos: [1.25, 0.85, 1.2], target: [0.7, 0.05, 0.28], fov: 28 }],""", """    [0, { pos: [1.95, 1.35, 2.05], target: [0.62, 0.32, 0.22], fov: 32 }],
    [100, { pos: [1.7, 1.2, 1.85], target: [0.68, 0.3, 0.26], fov: 31 }],""")
sub(P, "  const cam: Cam = { pos: [bx * 0.35 + 0.3, 1.25, 3.5], target: [bx * 0.35, 0.35, -0.3], fov: 40 };",
    "  const cx = bx * 0.45;\n  const cam: Cam = { pos: [cx + 0.4, 0.95, 2.9], target: [cx, 0.35, -0.5], fov: 42 };")
sub(P, '      <StepCard at={cue(ID, "oven") - 4} n={3} title="Reflow oven" data="Heat in every zone" />', '''      {Array.from({ length: OVEN_ZONES }).map((_, i) => {
        const z = project(cam, [zoneX(i), 1.2, 0.65]);
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
      <StepCard at={cue(ID, "oven") - 4} n={3} title="Reflow oven" data="Heat in every zone" />''')
sub(P, 'import { AoiHead, Oven, PlaceHead, Squeegee, Stencil, TOP } from "../three/Machines";',
    'import { AoiHead, OVEN_ZONES, Oven, PlaceHead, Squeegee, Stencil, TOP, zoneX } from "../three/Machines";')
sub(P, "const ax = interpolate(f, [0, 105], [-1.9, 1.9]);", "const ax = interpolate(f, [0, 105], [-0.9, 1.9]);")
sub(P, "const pp = prog(f, interpolate(w, [-1.9, 1.9], [0, 105]) - 2, 8, EASE_BACK);", "const pp = prog(f, interpolate(w, [-0.9, 1.9], [0, 105]) - 2, 8, EASE_BACK);")
sub(P, "<Studio floorY={-0.4} shadow={0.12} />", "<Studio floorY={-0.4} shadow={0.12} keyIntensity={1.2} />")
print("patched")
