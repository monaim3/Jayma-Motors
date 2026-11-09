// Development helper: bounding boxes and connected pieces of each mesh in the
// SLS source model, to plan how to split it into animatable parts.
// Usage: node scripts/analyze-sls.mjs
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read("assets-src/mercedes-sls/scene.gltf");
const root = doc.getRoot();

const fmt = (v) => v.map((n) => n.toFixed(2)).join(",");
const DETAIL = new RegExp(process.argv[2] ?? "^(Carpaint|Plastic|Mechanics|INT_Skin\\.|INT_Alcantara|INT_Carpaint|Chrome\\.)");

// World matrices (the Sketchfab wrapper nodes may rotate/scale).
for (const node of root.listNodes()) {
  const m = node.getMatrix();
  const identity = m.every((v, i) => Math.abs(v - (i % 5 === 0 ? 1 : 0)) < 1e-6);
  if (!identity) console.log("transform on", node.getName(), m.map((v) => +v.toFixed(3)).join(" "));
}

const all = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };

for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute("POSITION");
    const idx = prim.getIndices();
    const n = pos.getCount();
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    const p = [0, 0, 0];
    // Weld by rounded position, then union-find over triangles.
    const key = new Map();
    const id = new Int32Array(n);
    for (let i = 0; i < n; i++) {
      pos.getElement(i, p);
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], p[k]);
        max[k] = Math.max(max[k], p[k]);
        all.min[k] = Math.min(all.min[k], p[k]);
        all.max[k] = Math.max(all.max[k], p[k]);
      }
      const h = `${Math.round(p[0] * 1e4)},${Math.round(p[1] * 1e4)},${Math.round(p[2] * 1e4)}`;
      if (!key.has(h)) key.set(h, key.size);
      id[i] = key.get(h);
    }
    const parent = new Int32Array(key.size).map((_, i) => i);
    const find = (a) => {
      while (parent[a] !== a) a = parent[a] = parent[parent[a]];
      return a;
    };
    const tri = idx ? idx.getCount() / 3 : n / 3;
    const at = (t) => (idx ? idx.getScalar(t) : t);
    for (let t = 0; t < tri; t++) {
      const a = find(id[at(t * 3)]);
      const b = find(id[at(t * 3 + 1)]);
      const c = find(id[at(t * 3 + 2)]);
      parent[b] = a;
      parent[c] = a;
    }
    const comps = new Map();
    const boxes = new Map();
    for (let t = 0; t < tri; t++) {
      const r = find(id[at(t * 3)]);
      comps.set(r, (comps.get(r) ?? 0) + 1);
      if (!boxes.has(r)) boxes.set(r, { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] });
      const b = boxes.get(r);
      for (let v = 0; v < 3; v++) {
        pos.getElement(at(t * 3 + v), p);
        for (let k = 0; k < 3; k++) {
          b.min[k] = Math.min(b.min[k], p[k]);
          b.max[k] = Math.max(b.max[k], p[k]);
        }
      }
    }
    if (DETAIL.test(prim.getMaterial()?.getName() ?? "")) {
      const sorted = [...comps.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8);
      for (const [r, count] of sorted) {
        const b = boxes.get(r);
        console.log(`      piece ${String(count).padStart(6)}  min ${fmt(b.min)}  max ${fmt(b.max)}`);
      }
    }
    const big = [...comps.values()].sort((x, y) => y - x);
    console.log(
      `${prim.getMaterial()?.getName().padEnd(26)} tris ${String(tri).padStart(6)}  pieces ${String(comps.size).padStart(4)}  top ${big.slice(0, 5).join("/")}  min ${fmt(min)}  max ${fmt(max)}`,
    );
  }
}
console.log("\nWHOLE CAR min", fmt(all.min), "max", fmt(all.max));
