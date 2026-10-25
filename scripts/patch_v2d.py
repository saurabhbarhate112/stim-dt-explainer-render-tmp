import pathlib

R = pathlib.Path(__file__).resolve().parent.parent / "src"


def sub(path, old, new):
    p = R / path
    s = p.read_text(encoding="utf8")
    if old not in s:
        raise SystemExit(f"not found in {path}: {old[:70]!r}")
    p.write_text(s.replace(old, new), encoding="utf8")


P = "scenes/S06Process.tsx"
sub(P, """    pos: [follow * 0.6 - 0.7, 1.75 + lift * 0.2, 2.5],
    target: [follow * 0.6 + 0.1, 0.0, 0.05],
    fov: 33,""", """    pos: [lerp(follow - 0.75, -0.2, lift), lerp(0.55, 1.35, lift), lerp(1.05, 1.5, lift)],
    target: [lerp(follow + 0.15, -0.35, lift), 0.0, lerp(0.05, -0.05, lift)],
    fov: 32,""")
sub("three/Pcb.tsx", "ALL_PADS.filter((p) => p.w < 3).map((p) => [p.x, top + 0.07, p.z, p.w * 0.88, 0.14, p.d * 0.88])",
    "ALL_PADS.filter((p) => p.w < 3).map((p) => [p.x, top + 0.11, p.z, p.w * 0.86, 0.22, p.d * 0.86])")
sub("three/Pcb.tsx", 'pasteMat.color.set(pasteShine > 0.5 ? "#D9DEE1" : "#9EA4A7");', 'pasteMat.color.set(pasteShine > 0.5 ? "#D9DEE1" : "#B3B8BB");')
sub("three/Machines.tsx", """      <mesh position={[0.05, 0.035, 0]} rotation={[Math.PI / 2, frame * 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, len - 0.05, 18]} />""", """      <mesh position={[0.06, 0.045, 0]} rotation={[Math.PI / 2, frame * 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, len - 0.05, 18]} />""")
sub("three/Machines.tsx", 'new THREE.MeshStandardMaterial({ color: "#B4BBBE", metalness: 0.85, roughness: 0.4,',
    'new THREE.MeshStandardMaterial({ color: "#A3AAAE", metalness: 0.85, roughness: 0.38,')
print("ok")
