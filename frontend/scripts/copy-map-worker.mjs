/**
 * MapLibre loads its web worker from a separate file next to its module,
 * which the Next bundler does not emit. Copy it to public/ so the map can
 * load it from /vendor (see WorkshopMap3D). Runs on every install, so the
 * worker always matches the installed maplibre-gl version.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const dist = dirname(require.resolve("maplibre-gl/package.json"));
const target = join(import.meta.dirname, "..", "public", "vendor");

mkdirSync(target, { recursive: true });
copyFileSync(join(dist, "dist", "maplibre-gl-worker.mjs"), join(target, "maplibre-gl-worker.mjs"));
console.log("Copied maplibre-gl worker to public/vendor");
