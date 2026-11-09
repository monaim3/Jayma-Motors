// Builds public/models/car.glb (home hero) from the Mercedes-Benz SLS AMG source.
// Usage: node scripts/optimize-sls.mjs
//
// Source: "2010 Mercedes SLS AMG" by Dave Love (https://sketchfab.com/Tyler_Dave),
// https://sketchfab.com/3d-models/2010-mercedes-sls-amg-fa3fd5eeea674f37bb03283f2c53d563
// licensed CC BY 4.0.
//
// The source is split by material (one mesh = every tyre, one mesh = all paint),
// but the hero animation needs real parts. This script re-cuts it into named,
// separately pivoted parts that car-scene.js knows how to animate:
//   BodyUnderside (chassis), Axles*, InteriorFloor/Pedal/Seats/Dash/Mid/Steering*,
//   Wheel{Front,Rear}{L,R}, BodyPanels*/BodyHood/BodyRoofPanel/BodyRearPanels/BodyDoor*,
//   BodyDoorLMirror* (showcase mirror), BodyWindshield, plus an empty "Engine"
//   marker at the front (car-scene reads the forward direction from it).
// Source axes: x = width, y = length (front +), z = height (up = negative);
// output: Y up, front = +Z. Damaged-glass and motion-blur rim meshes are dropped.
import { mkdir, stat } from "node:fs/promises";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRMaterialsClearcoat } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const SOURCE = "assets-src/mercedes-sls/scene.gltf";
const TARGET = "public/models/car.glb";
/** Linear RGB of the finished paint (≈ #6e0710, a deep candy red). */
// (The source's grey flake texture is folded in, so the effective colour is ~half this.)
const PAINT_COLOR = [0.25, 0.0015, 0.004, 1];

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(SOURCE);
const root = doc.getRoot();
const scene = root.getDefaultScene() ?? root.listScenes()[0];

const DROP = /^(DAMAGE_GLASS|Rim_Blurred)/;
const WHEEL = /^(Rim|Tyre|Brake_Disk)\./;
const side = (x) => (x < 0 ? "L" : "R");
const axle = (y) => (y > 0 ? "Front" : "Rear");
const within = (box, lo, hi) => box.min.every((v, k) => v >= lo[k]) && box.max.every((v, k) => v <= hi[k]);
// Absolute-x box test (symmetric parts such as seats).
const absBox = (box) => ({
  min: [Math.min(Math.abs(box.min[0]), Math.abs(box.max[0])) * (box.min[0] * box.max[0] < 0 ? 0 : 1), box.min[1], box.min[2]],
  max: [Math.max(Math.abs(box.min[0]), Math.abs(box.max[0])), box.max[1], box.max[2]],
});

/**
 * Painted shell and exterior trim stay one piece: the shell is a single welded
 * surface, so cutting it into panels leaves ragged edges in flight. car-scene
 * lowers it onto the chassis from above instead ("body marriage").
 */
const bodyRegion = () => "BodyPanels";

/** Part name for one connected piece of a primitive (null = drop, "split" = per triangle). */
function classify(mat, center, box, tris, isLargest) {
  if (DROP.test(mat)) return null;
  const [x, y] = center;
  if (WHEEL.test(mat)) return `Wheel${axle(y)}${side(x)}`;
  if (mat.startsWith("Brake_Caliper")) return `AxlesCaliper${axle(y)}${side(x)}`;
  if (mat.startsWith("Mechanics")) return isLargest ? "BodyUnderside" : "AxlesMechanics";

  // Side mirrors (housing, glass, indicator) -> showcase mirror on the left.
  if (Math.abs(x) > 0.8 && y > -0.2 && y < 0.12 && -box.max[2] > 0.85 && !mat.startsWith("INT_")) {
    if (mat.startsWith("Carpaint")) return `BodyDoor${side(x)}Mirror`;
    if (mat.startsWith("Mirror")) return `BodyDoor${side(x)}MirrorColor1`;
    return `BodyDoor${side(x)}MirrorColor2`;
  }
  if (mat.startsWith("Mirror")) return "InteriorDash"; // rear-view mirror

  if (mat.startsWith("Glass_Windows")) return "BodyWindshield";

  if (mat.startsWith("INT_")) {
    if (mat.startsWith("INT_Pedali")) return "InteriorPedal";
    if (mat.startsWith("INT_carpet")) return "InteriorFloor";
    if (mat.startsWith("INT_Carpaint") || mat.startsWith("INT_Guarnizioni")) return `BodyDoor${side(x)}Inner`;
    if (within(box, [0.22, -0.2, -0.9], [0.64, -0.02, -0.64])) return "InteriorSteeringCylinder";
    if (within(absBox(box), [0.12, -0.96, -1.12], [0.72, -0.05, -0.18])) return "InteriorSeats";
    return y > -0.25 ? "InteriorDash" : "InteriorMid";
  }

  return tris > 3000 ? "split" : bodyRegion(center);
}

// ---- Collect triangles per part / material, in output (Y-up) coordinates ----
const parts = new Map(); // part -> Map(material -> { pos: [], nrm: [], uv0: [], uv1: [] })
const bucket = (part, material) => {
  if (!parts.has(part)) parts.set(part, new Map());
  const byMat = parts.get(part);
  if (!byMat.has(material)) byMat.set(material, { pos: [], nrm: [], uv0: [], uv1: [] });
  return byMat.get(material);
};

for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const m = node.getWorldMatrix();
  const toWorld = (p) => [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
  ];
  const rotate = (n) => [
    m[0] * n[0] + m[4] * n[1] + m[8] * n[2],
    m[1] * n[0] + m[5] * n[1] + m[9] * n[2],
    m[2] * n[0] + m[6] * n[1] + m[10] * n[2],
  ];

  for (const prim of mesh.listPrimitives()) {
    const material = prim.getMaterial();
    const matName = material?.getName() ?? "";
    const pos = prim.getAttribute("POSITION");
    const nrm = prim.getAttribute("NORMAL");
    const uv0 = prim.getAttribute("TEXCOORD_0");
    const uv1 = prim.getAttribute("TEXCOORD_1");
    const idx = prim.getIndices();
    const n = pos.getCount();
    const triCount = idx ? idx.getCount() / 3 : n / 3;
    const at = (t) => (idx ? idx.getScalar(t) : t);
    const p = [0, 0, 0];

    // Connected pieces (welded by position).
    const key = new Map();
    const vid = new Int32Array(n);
    const P = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos.getElement(i, p);
      P.set(p, i * 3);
      const h = `${Math.round(p[0] * 1e4)},${Math.round(p[1] * 1e4)},${Math.round(p[2] * 1e4)}`;
      if (!key.has(h)) key.set(h, key.size);
      vid[i] = key.get(h);
    }
    const parent = Int32Array.from({ length: key.size }, (_, i) => i);
    const find = (a) => {
      while (parent[a] !== a) a = parent[a] = parent[parent[a]];
      return a;
    };
    for (let t = 0; t < triCount; t++) {
      const a = find(vid[at(t * 3)]);
      parent[find(vid[at(t * 3 + 1)])] = a;
      parent[find(vid[at(t * 3 + 2)])] = a;
    }
    const pieces = new Map();
    for (let t = 0; t < triCount; t++) {
      const r = find(vid[at(t * 3)]);
      if (!pieces.has(r)) pieces.set(r, { tris: [], min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] });
      const piece = pieces.get(r);
      piece.tris.push(t);
      for (let v = 0; v < 3; v++) {
        const i = at(t * 3 + v);
        for (let k = 0; k < 3; k++) {
          piece.min[k] = Math.min(piece.min[k], P[i * 3 + k]);
          piece.max[k] = Math.max(piece.max[k], P[i * 3 + k]);
        }
      }
    }
    const largest = Math.max(...[...pieces.values()].map((piece) => piece.tris.length));

    const emit = (part, t) => {
      const b = bucket(part, material);
      for (let v = 0; v < 3; v++) {
        const i = at(t * 3 + v);
        b.pos.push(...toWorld([P[i * 3], P[i * 3 + 1], P[i * 3 + 2]]));
        if (nrm) b.nrm.push(...rotate(nrm.getElement(i, [0, 0, 0])));
        if (uv0) b.uv0.push(...uv0.getElement(i, [0, 0]));
        if (uv1) b.uv1.push(...uv1.getElement(i, [0, 0]));
      }
    };

    for (const piece of pieces.values()) {
      const center = piece.min.map((v, k) => (v + piece.max[k]) / 2);
      const part = classify(matName, center, piece, piece.tris.length, piece.tris.length === largest);
      if (!part) continue;
      for (const t of piece.tris) {
        if (part !== "split") {
          emit(part, t);
          continue;
        }
        const c = [0, 1, 2].map((k) => (P[at(t * 3) * 3 + k] + P[at(t * 3 + 1) * 3 + k] + P[at(t * 3 + 2) * 3 + k]) / 3);
        emit(bodyRegion(c), t);
      }
    }
  }
}

// ---- Replace the scene with one pivoted node per part ----
for (const child of scene.listChildren()) child.dispose();
const buffer = root.listBuffers()[0];
const accessor = (type, array) => doc.createAccessor().setType(type).setArray(array).setBuffer(buffer);

for (const [partName, byMat] of parts) {
  // Pivot at the part's bounding-box centre so it turns/scales around itself.
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const b of byMat.values())
    for (let i = 0; i < b.pos.length; i += 3)
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], b.pos[i + k]);
        max[k] = Math.max(max[k], b.pos[i + k]);
      }
  const pivot = min.map((v, k) => (v + max[k]) / 2);

  const mesh = doc.createMesh(partName);
  for (const [material, b] of byMat) {
    const local = Float32Array.from(b.pos, (v, i) => v - pivot[i % 3]);
    const prim = doc.createPrimitive().setMaterial(material).setAttribute("POSITION", accessor("VEC3", local));
    if (b.nrm.length) prim.setAttribute("NORMAL", accessor("VEC3", Float32Array.from(b.nrm)));
    if (b.uv0.length) prim.setAttribute("TEXCOORD_0", accessor("VEC2", Float32Array.from(b.uv0)));
    if (b.uv1.length) prim.setAttribute("TEXCOORD_1", accessor("VEC2", Float32Array.from(b.uv1)));
    mesh.addPrimitive(prim);
  }
  scene.addChild(doc.createNode(partName).setMesh(mesh).setTranslation(pivot));
}

// Forward marker (front of the car is +Z).
const front = Math.max(...[...parts.get("BodyPanels").values()].flatMap((b) => b.pos.filter((_, i) => i % 3 === 2)));
scene.addChild(doc.createNode("Engine").setTranslation([0, 0.5, front - 0.6]));

// Final paint (the source is silver with a grey flake texture): deep metallic
// red with clear coat, matching the brand. car-scene fades primer grey into it.
const clearcoat = doc.createExtension(KHRMaterialsClearcoat);
for (const material of root.listMaterials()) {
  if (/^(INT_)?Carpaint/.test(material.getName())) {
    material
      .setBaseColorFactor(PAINT_COLOR)
      // Low metalness + smooth base: rough metallic paint scatters the white studio
      // light into a pink haze; this keeps the colour deep with crisp reflections.
      .setMetallicFactor(0.2)
      .setRoughnessFactor(0.22)
      .setExtension("KHR_materials_clearcoat", clearcoat.createClearcoat().setClearcoatFactor(1).setClearcoatRoughnessFactor(0.05));
  }
}

// Lights glow on cue: use each lamp's own texture as its emissive map.
for (const material of root.listMaterials()) {
  if (/^(Lights_Front|Lights_Rear|EXT_Microluci)/.test(material.getName())) {
    material.setEmissiveTexture(material.getBaseColorTexture()).setEmissiveFactor([1, 1, 1]);
  }
}

await doc.transform(
  prune(),
  dedup(),
  // Parts were rebuilt triangle by triangle; merge shared vertices back.
  weld(),
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 82 }),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);

await mkdir("public/models", { recursive: true });
await io.write(TARGET, doc);

const summary = [...parts.entries()].map(([name, byMat]) => {
  const tris = [...byMat.values()].reduce((sum, b) => sum + b.pos.length / 9, 0);
  return `${name}(${tris})`;
});
console.log(summary.join("  "));
const paint = root.listMaterials().find((m) => m.getName().startsWith("Carpaint"));
console.log("Carpaint baseColorFactor", paint?.getBaseColorFactor().map((v) => v.toFixed(3)).join(","));
console.log(`Wrote ${TARGET} (${((await stat(TARGET)).size / 1024 / 1024).toFixed(2)} MB)`);
