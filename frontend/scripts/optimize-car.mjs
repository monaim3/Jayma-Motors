// Builds public/models/car.glb from the source model for the home hero.
// Usage: node scripts/optimize-car.mjs
//
// Source: "Car Concept" by Eric Chadwick, Darmstadt Graphics Group GmbH (2024),
// Khronos glTF-Sample-Assets, CC BY 4.0. The licence excludes Khronos logos,
// so the licence plate and steering-wheel emblem are removed.
import { mkdir } from "node:fs/promises";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRMaterialsVariants } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, textureCompress } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const SOURCE = "assets-src/models/CarConcept.glb";
const TARGET = "public/models/car.glb";
const REMOVE_NODES = new Set(["License Plate", "InteriorSteeringEmblem"]);

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "meshopt.encoder": MeshoptEncoder,
});

const doc = await io.read(SOURCE);
const root = doc.getRoot();

for (const node of root.listNodes()) {
  if (REMOVE_NODES.has(node.getName())) node.dispose();
}

// Keep only the default "Carmine Candy" paint; the other variants are unused.
root
  .listExtensionsUsed()
  .filter((extension) => extension.extensionName === KHRMaterialsVariants.EXTENSION_NAME)
  .forEach((extension) => extension.dispose());

await doc.transform(
  dedup(),
  prune(),
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 82 }),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);

await mkdir("public/models", { recursive: true });
await io.write(TARGET, doc);

const { size } = await import("node:fs/promises").then((fs) => fs.stat(TARGET));
console.log(`Wrote ${TARGET} (${(size / 1024 / 1024).toFixed(2)} MB)`);
