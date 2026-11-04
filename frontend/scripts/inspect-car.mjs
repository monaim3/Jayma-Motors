// Lists the node tree of the hero car model (development helper).
// Usage: node scripts/inspect-car.mjs [path-to-glb]
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";

const file = process.argv[2] ?? "assets-src/models/CarConcept.glb";
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(file);
const root = doc.getRoot();

function walk(node, depth = 0) {
  const mesh = node.getMesh();
  const mats = mesh ? [...new Set(mesh.listPrimitives().map((p) => p.getMaterial()?.getName() || "?"))].join(",") : "";
  const t = node
    .getTranslation()
    .map((v) => v.toFixed(2))
    .join(" ");
  console.log(`${"  ".repeat(depth)}${node.getName() || "(unnamed)"}${mesh ? ` [mesh: ${mats}]` : ""} @ ${t}`);
  node.listChildren().forEach((child) => walk(child, depth + 1));
}

for (const scene of root.listScenes()) scene.listChildren().forEach((n) => walk(n));

console.log(
  "\nMaterials:",
  root
    .listMaterials()
    .map((m) => m.getName() || "(unnamed)")
    .join(" | "),
);
const variants = doc
  .getRoot()
  .listExtensionsUsed()
  .find((e) => e.extensionName === "KHR_materials_variants");
if (variants)
  console.log(
    "Variants:",
    variants
      .listVariants()
      .map((v) => v.getName())
      .join(" | "),
  );
console.log(
  "Textures:",
  root
    .listTextures()
    .map((t) => `${t.getName() || t.getURI()} ${t.getSize()?.join("x")}`)
    .join(" | "),
);
