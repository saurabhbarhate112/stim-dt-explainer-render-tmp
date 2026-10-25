// prints scene starts using the same rules as src/timeline.ts (keep in sync)
import vo from "../src/vo.json" with { type: "json" };
import fs from "node:fs";
const src = fs.readFileSync(new URL("../src/timeline.ts", import.meta.url), "utf8");
const OV = +src.match(/OVERLAP = (\d+)/)[1];
const D = [...src.matchAll(/\{ id: "(\w+)", lead: (\d+), tail: (\d+) \}/g)].map((m) => [m[1], +m[2], +m[3]]);
let c = 0;
for (const [id, l, t] of D) {
  const v = vo.find((x) => x.id === id);
  const d = l + Math.ceil(v.duration * 30) + t;
  console.log(id.padEnd(9), "from", String(c).padStart(5), "dur", String(d).padStart(4), "vo@", c + l, `(${((c + l) / 30).toFixed(2)}s)`);
  c += d - OV;
}
console.log("TOTAL", c + OV, ((c + OV) / 30).toFixed(2) + "s");
