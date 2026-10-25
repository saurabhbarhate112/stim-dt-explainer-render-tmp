import pathlib

R = pathlib.Path(__file__).resolve().parent.parent / "src"


def sub(path, old, new):
    p = R / path
    s = p.read_text(encoding="utf8")
    if old not in s:
        raise SystemExit(f"not found in {path}: {old[:70]!r}")
    p.write_text(s.replace(old, new), encoding="utf8")


P = "scenes/S06Process.tsx"
sub(P, """    pos: [follow * 0.75 - 0.5 - lift * 0.3, 0.95 + lift * 0.4, 1.75 + lift * 0.3],
    target: [follow * 0.75 + 0.1, 0.05, 0.05],
    fov: 34,""", """    pos: [follow * 0.6 - 0.7, 1.75 + lift * 0.2, 2.5],
    target: [follow * 0.6 + 0.1, 0.0, 0.05],
    fov: 33,""")
sub(P, """    [0, { pos: [1.95, 1.35, 2.05], target: [0.62, 0.32, 0.22], fov: 32 }],
    [100, { pos: [1.7, 1.2, 1.85], target: [0.68, 0.3, 0.26], fov: 31 }],""", """    [0, { pos: [2.1, 1.75, 2.45], target: [0.6, 0.42, 0.2], fov: 34 }],
    [100, { pos: [1.85, 1.6, 2.25], target: [0.66, 0.4, 0.24], fov: 33 }],""")
sub(P, "const z = project(cam, [zoneX(i), 1.2, 0.65]);", "const z = project(cam, [zoneX(i), 0.95, -1.6]);")
sub("three/Machines.tsx", """      <mesh position={[-0.08, 0.16, 0]} rotation={[0, 0, 0.75]} castShadow>
        <boxGeometry args={[0.012, 0.36, len]} />""", """      <mesh position={[-0.06, 0.12, 0]} rotation={[0, 0, 0.75]} castShadow>
        <boxGeometry args={[0.01, 0.26, len]} />""")
sub("three/Machines.tsx", """      <mesh position={[-0.22, 0.32, 0]} castShadow>
        <boxGeometry args={[0.14, 0.1, len + 0.1]} />
        <meshStandardMaterial color="#3A4541" metalness={0.6} roughness={0.4} />""", """      <mesh position={[-0.17, 0.24, 0]} castShadow>
        <boxGeometry args={[0.1, 0.07, len + 0.1]} />
        <meshStandardMaterial color="#6F7A76" metalness={0.7} roughness={0.35} />""")
print("ok")
