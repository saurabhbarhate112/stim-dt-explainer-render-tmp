import pathlib

R = pathlib.Path(__file__).resolve().parent.parent / "src"


def sub(path, old, new, count=1):
    p = R / path
    s = p.read_text(encoding="utf8")
    if s.count(old) < 1:
        raise SystemExit(f"not found in {path}: {old[:70]!r}")
    p.write_text(s.replace(old, new), encoding="utf8")


P = "scenes/S08Predict.tsx"
sub(P, "<Pop at={tWeak - 4} out={tWipes + 20}>", "<Pop at={tWeak - 4 - off} out={tWipes + 20 - off}>")
sub(P, '<Pop at={cue(ID, "three") - 4}>', '<Pop at={cue(ID, "three") - 4 - off}>')
sub(P, '<Notice at={tRaises - 4} icon="!"', '<Notice at={tRaises - 4 - off} icon="!"')
sub(P, '<Notice at={tWipes - 4} icon="✓"', '<Notice at={tWipes - 4 - off} icon="✓"')
sub("scenes/S05Ai.tsx", "<Pop at={tAbout + 4}>", "<Pop at={tAbout + 4 - off}>")
sub("scenes/S01Hook.tsx", "<Pop at={tFail - 6}>", "<Pop at={tFail - 6 - tThey}>")
print("ok")
