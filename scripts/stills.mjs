// Render a handful of stills from one bundle: node scripts/stills.mjs 60 120 300 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "DigitalTwinExplainer", chromiumOptions: { gl: "angle" } });
console.log("duration", composition.durationInFrames, (composition.durationInFrames / 30).toFixed(1) + "s");
for (const frame of frames) {
  await renderStill({ serveUrl, composition, frame, output: `out/f${String(frame).padStart(5, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 85, chromiumOptions: { gl: "angle" } });
  console.log("still", frame);
}
