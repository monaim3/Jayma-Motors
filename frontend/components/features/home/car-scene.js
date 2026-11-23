import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { HERO_BUILD_END } from "@/lib/home-content";

/**
 * Scroll-assembled 3D car for the home hero (Step 5 §6.1.1).
 *
 * Model: "2010 Mercedes SLS AMG" by Dave Love (sketchfab.com/Tyler_Dave),
 * https://sketchfab.com/3d-models/2010-mercedes-sls-amg-fa3fd5eeea674f37bb03283f2c53d563,
 * CC BY 4.0 — re-cut into animatable parts by scripts/optimize-sls.mjs.
 *
 * Opening: a clean showcase — a few hero parts (wheels, steering wheel, mirror,
 * seats) float apart and turn slowly. Nothing else is visible yet.
 *
 * Timeline (progress 0 → 1), one window per hero caption:
 *   0.00–0.17 diagnosis   chassis rises in; engine, axles, floor fly in
 *   0.17–0.33 engine      seats, dashboard, steering wheel; wheels with brake discs
 *   0.33–0.50 body        panels, doors, hood, roof, rear; mirror
 *   0.50–0.67 paint       glass fits; primer grey turns into Carmine red
 *   0.67–0.83 wheels      laser alignment lines, wheels roll
 *   0.83–1.00 ready       head/tail lights on, camera settles
 *
 * These windows are fractions of the build, which uses the first HERO_BUILD_END
 * of the hero's scroll. After that the finished car drives forward out of frame.
 */

const MODEL_URL = "/models/car.glb";

const clamp = (v) => Math.min(1, Math.max(0, v));
const window01 = (p, start, end) => clamp((p - start) / (end - start));
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Deterministic pseudo-random so the layout is identical on every load. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Showcase parts floating at the start. `slot` is a screen offset (in NDC
 * units) from where the finished car will be; `turn` the display angle;
 * `size` scales that part relative to the other showcase parts.
 */
const SHOWCASE = [
  { name: "WheelFrontL", slot: [-0.06, 0.46], turn: [0.25, 0.7, 0.1], start: 0.2, end: 0.31 },
  { name: "InteriorSteeringCylinder", slot: [0.34, 0.4], turn: [0.6, -0.5, 0.3], start: 0.18, end: 0.29 },
  { name: "ShowcaseMirror", slot: [-0.36, 0.1], turn: [0.1, 0.9, -0.2], start: 0.42, end: 0.5, size: 0.9 },
  { name: "WheelFrontR", slot: [0.44, -0.02], turn: [-0.2, -0.8, 0.15], start: 0.22, end: 0.33 },
  { name: "WheelRearL", slot: [-0.3, -0.36], turn: [0.3, 0.5, -0.1], start: 0.21, end: 0.32 },
  { name: "ShowcaseSeats", slot: [0.2, -0.34], turn: [0.15, 0.9, 0.05], start: 0.17, end: 0.28, size: 0.5 },
];

/** Everything else: hidden at first, then appears and flies in during its window. */
const GROUPS = [
  {
    match: /^(Engine|Axles|InteriorFloor$|InteriorFloormats|InteriorCage|InteriorPedal)/,
    start: 0.06,
    end: 0.17,
    distance: 1.5,
  },
  {
    match: /^(InteriorSeats|InteriorDash|InteriorSteering|InteriorMid|InteriorPillar)/,
    start: 0.17,
    end: 0.3,
    distance: 1.8,
  },
  { match: /^Wheel/, start: 0.22, end: 0.33, distance: 1.6, sideways: true },
  // The one-piece body shell is lowered onto the chassis, as on a factory line.
  { match: /^BodyPanels$/, start: 0.33, end: 0.48, distance: 2.6, fromAbove: true },
  {
    match: /^(BodyPanels|BodyPillars|BodyRoofPanel|BodyRearPanels|BodyHood|BodyDoor)/,
    start: 0.33,
    end: 0.48,
    distance: 2.1,
  },
  { match: /^BodyWindshield/, start: 0.5, end: 0.6, distance: 1.8 },
];

const FALLBACK_GROUP = { start: 0.35, end: 0.48, distance: 2 };

/** Multi-mesh parts gathered into one showcase object each. */
const SHOWCASE_ASSEMBLIES = {
  ShowcaseMirror: ["BodyDoorLMirror", "BodyDoorLMirrorColor1", "BodyDoorLMirrorColor2"],
  ShowcaseSeats: ["InteriorSeats"],
};
const PAINT_MATERIALS = /^(INT_)?Carpaint/;
const LIGHT_MATERIALS = /^(Lights_Front|Lights_Rear|EXT_Microluci)/;
const PRIMER = new THREE.Color("#3a3a3f");
/**
 * three.js swaps the whole paint shader when clearcoat crosses 0, so it never
 * goes fully to 0 — otherwise the switch would stall the frame where painting starts.
 */
const CLEARCOAT_MIN = 0.001;
/** Environment reflection strength on the body paint (keeps the red deep). */
const PAINT_ENV = 0.35;
/** How quickly the car catches up with the scroll position (per second). */
const SMOOTHING = 7;
/** Phones: free space below the text on a typical tall phone (fallback when not measured). */
const PHONE_FREE_AREA = { top: 0.42, bottom: 0.92 };
/** The car's visual centre sits a little below the camera's aim point. */
const PHONE_CENTRE_BIAS = 0.06;

export class CarScene {
  /**
   * @param getTarget - returns the current scroll progress (0–1); read every frame,
   *   so scrolling never has to go through React.
   * @param getFreeArea - phones: returns { top, bottom } (fractions of the canvas
   *   height) of the space left free by the text and the bottom bar; the car is
   *   framed inside it, so short screens don't put parts behind the text.
   */
  constructor(canvas, { onReady, getTarget, getFreeArea, lowPower = false } = {}) {
    this.canvas = canvas;
    this.onReady = onReady;
    this.getTarget = getTarget;
    this.getFreeArea = getFreeArea;
    this.freeArea = PHONE_FREE_AREA;
    this.lowPower = lowPower;
    this.target = 0;
    this.progress = 0;
    this.parts = [];
    this.showcase = [];
    this.paints = [];
    this.lights = [];
    this.wheels = [];
    this.disposed = false;
    this.running = false;
    this.startTime = performance.now();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !lowPower,
      alpha: true,
      powerPreference: "high-performance",
    });
    // The canvas covers the whole hero, so pixel density is the main GPU cost.
    // Phones: their 2–3× screens look blurry below 2× and the canvas is small, so
    // allow 2×. Large screens stay at 1.5×; weak devices (≤4 cores) at most 1.5×.
    const phone = window.matchMedia("(max-width: 767px)").matches;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, phone && !lowPower ? 2 : 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envTexture;
    this.scene.environmentIntensity = 0.9;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

    // Brand-red rim light from behind + soft key light.
    const rim = new THREE.DirectionalLight("#ff4040", 2.2);
    rim.position.set(-4, 2.5, -5);
    this.scene.add(rim);
    const key = new THREE.DirectionalLight("#ffffff", 1.4);
    key.position.set(3, 6, 4);
    this.scene.add(key);

    this.addFloor();
    this.laserMaterial = new THREE.MeshBasicMaterial({
      color: "#38bdf8",
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.lasers = new THREE.Group();
    this.scene.add(this.lasers);

    this.resize();
    this.load();
  }

  /** Radial-gradient texture used for the contact shadow and floor glow. */
  static radialTexture(stops) {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }

  addFloor() {
    // Soft contact shadow + faint pool of light, both fading into the page background.
    this.floorGroup = new THREE.Group();
    this.scene.add(this.floorGroup);

    this.shadowMaterial = new THREE.MeshBasicMaterial({
      map: CarScene.radialTexture([
        [0, "rgba(0,0,0,0.85)"],
        [0.55, "rgba(0,0,0,0.35)"],
        [1, "rgba(0,0,0,0)"],
      ]),
      transparent: true,
      depthWrite: false,
    });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.shadowMaterial);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.002;
    this.floorGroup.add(this.shadow);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({
        map: CarScene.radialTexture([
          [0, "rgba(255,255,255,0.10)"],
          [0.5, "rgba(255,255,255,0.04)"],
          [1, "rgba(255,255,255,0)"],
        ]),
        transparent: true,
        depthWrite: false,
      }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.001;
    this.floorGroup.add(glow);

    this.ringMaterial = new THREE.MeshBasicMaterial({ color: "#c42927", transparent: true, opacity: 0.35 });
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.85, 2.87, 128), this.ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.003;
    this.floorGroup.add(ring);
  }

  async load() {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(MODEL_URL);
    if (this.disposed) return;

    const model = gltf.scene;
    this.model = model;
    this.scene.add(model);

    // Centre the car on the floor.
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -box.min.y, -center.z);
    model.updateMatrixWorld(true);
    this.modelBase = model.position.clone();

    const size = box.getSize(new THREE.Vector3());
    this.shadow.scale.set(size.x * 1.25, size.z * 1.15, 1);

    // Forward direction: from the car centre towards the engine.
    const engine = model.getObjectByName("Engine");
    const enginePos = engine ? engine.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, 0, 1);
    this.forward = new THREE.Vector3(enginePos.x, 0, enginePos.z).normalize();
    this.side = new THREE.Vector3().crossVectors(this.forward, new THREE.Vector3(0, 1, 0)).normalize();

    this.flattenHierarchy(model);
    this.measureWheels(model);
    this.collectParts(model);
    this.collectMaterials(model);
    this.clipBelowFloor(model);
    this.buildLasers(size);
    this.layoutShowcase();
    this.createDriveCar();
    await this.warmUp();
    if (this.disposed) return;

    this.update(true);
    this.onReady?.();
  }

  /**
   * Compile every shader and upload every texture now, while the canvas is still
   * hidden. Otherwise each group of parts (and the paint's clearcoat) is prepared
   * the first time it appears mid-scroll, which freezes the animation for a moment.
   */
  async warmUp() {
    this.scene.traverse((object) => {
      object.visible = true;
    });
    for (const item of this.paints) {
      if ("clearcoat" in item.material) item.material.clearcoat = Math.max(item.clearcoat, CLEARCOAT_MIN);
    }
    this.updateCamera(0.5);
    try {
      await this.renderer.compileAsync(this.scene, this.camera);
    } catch {
      // Older drivers without parallel compile: the render below compiles synchronously.
    }
    this.renderer.render(this.scene, this.camera);
    this.driveCar.visible = false;
    this.driveShadow.visible = false;
  }

  /**
   * The chassis (BodyUnderside) is the parent of every part. Re-parent parts to
   * the model root (keeping their world position) so the chassis can move on
   * its own, and gather the mirror and seats into single showcase objects.
   */
  flattenHierarchy(model) {
    const chassis = model.getObjectByName("BodyUnderside");
    this.chassis = chassis;

    for (const [name, partNames] of Object.entries(SHOWCASE_ASSEMBLIES)) {
      const parts = partNames.map((partName) => model.getObjectByName(partName)).filter(Boolean);
      if (parts.length === 0) continue;
      // A pivot at the assembly's centre, so it turns around itself while floating.
      const assembly = new THREE.Group();
      assembly.name = name;
      const bounds = new THREE.Box3();
      parts.forEach((part) => bounds.expandByObject(part));
      assembly.position.copy(model.worldToLocal(bounds.getCenter(new THREE.Vector3())));
      model.add(assembly);
      assembly.updateMatrixWorld(true);
      parts.forEach((part) => assembly.attach(part));
    }

    if (chassis) [...chassis.children].forEach((child) => model.attach(child));
    this.chassisBase = chassis?.position.clone();
  }

  /**
   * Wheel radius and roll direction, so the wheels turn the right way and at the
   * right speed when the car drives off (rolling without slipping).
   */
  measureWheels(model) {
    const wheel = model.getObjectByName("WheelFrontL");
    if (!wheel) return;
    const size = new THREE.Box3().setFromObject(wheel).getSize(new THREE.Vector3());
    this.wheelRadius = Math.max(size.y / 2, 0.1);

    // A wheel rolling forward spins around (up × forward).
    const axle = new THREE.Vector3(1, 0, 0).applyQuaternion(wheel.getWorldQuaternion(new THREE.Quaternion()));
    const rollAxis = new THREE.Vector3(0, 1, 0).cross(this.forward);
    this.rollSign = Math.sign(axle.dot(rollAxis)) || 1;
  }

  collectParts(model) {
    const random = seeded(20120001);
    const carCenter = new THREE.Vector3(0, 0.5, 0);

    for (const node of [...model.children]) {
      if (node === this.chassis) continue;

      const showcaseItem = SHOWCASE.find((item) => item.name === node.name);
      // Parts not listed in a group (trim, gaskets, unnamed pieces) arrive with the body.
      const group = showcaseItem ? null : (GROUPS.find((g) => g.match.test(node.name)) ?? FALLBACK_GROUP);

      const base = {
        node,
        basePosition: node.position.clone(),
        baseQuaternion: node.quaternion.clone(),
        baseScale: node.scale.clone(),
      };

      if (/^Wheel/.test(node.name)) this.wheels.push(node);

      if (showcaseItem) {
        const turn = new THREE.Quaternion().setFromEuler(new THREE.Euler(...showcaseItem.turn));
        this.showcase.push({
          ...base,
          item: showcaseItem,
          startQuaternion: node.quaternion.clone().premultiply(turn),
          slotPosition: node.position.clone(),
          phase: random() * Math.PI * 2,
        });
        continue;
      }

      const worldPos = node.getWorldPosition(new THREE.Vector3());
      const bounds = new THREE.Box3().setFromObject(node);
      const partCenter = bounds.isEmpty() ? worldPos : bounds.getCenter(new THREE.Vector3());

      let direction = partCenter.clone().sub(carCenter);
      if (group.sideways) direction = this.side.clone().multiplyScalar(Math.sign(direction.dot(this.side)) || 1);
      direction.y = Math.max(direction.y, 0) * 0.5 + 0.25 + random() * 0.35;
      if (group.fromAbove) direction.set(0, 1, 0);
      direction.normalize();

      // Parts are direct children of the model, so world offsets equal local offsets.
      const offset = direction.multiplyScalar(group.distance * (group.fromAbove ? 1 : 0.75 + random() * 0.5));
      // The lowered body stays level and full size; flying parts tumble and grow in.
      const spin = group.fromAbove
        ? new THREE.Euler(0, 0, 0)
        : new THREE.Euler((random() - 0.5) * 1.4, (random() - 0.5) * 1.4, (random() - 0.5) * 1.4);
      const span = group.end - group.start;
      const delay = group.fromAbove ? 0 : random() * span * 0.45;

      this.parts.push({
        ...base,
        offset,
        startQuaternion: node.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(spin)),
        start: group.start + delay,
        end: group.fromAbove ? group.end : Math.min(group.end, group.start + delay + span * 0.6),
        minScale: group.fromAbove ? 1 : 0.4,
      });
    }
  }

  /** Places the showcase parts on screen, around where the finished car will stand. */
  layoutShowcase() {
    if (!this.model || this.showcase.length === 0) return;

    this.updateCamera(0);
    this.camera.updateMatrixWorld(true);

    const anchor = new THREE.Vector3(0, 0.6, 0).project(this.camera);
    const toCamera = this.camera.position.length();
    const portrait = this.camera.aspect < 1;
    const spreadX = portrait ? 1.7 : 1;
    // Desktop: keep the top parts clear of the fixed header.
    // Phones: squeeze the floating parts into the free space on short screens.
    const freeHeight = this.freeArea.bottom - this.freeArea.top;
    const spreadY = portrait ? 0.55 * Math.min(1, Math.max(0.55, freeHeight / 0.5)) : 0.78;
    const depth = toCamera * (portrait ? 0.62 : 0.7);

    for (const part of this.showcase) {
      const [x, y] = part.item.slot;
      const ndc = new THREE.Vector3(anchor.x + x * spreadX * 0.62, anchor.y + y * spreadY, 0.5);
      const world = ndc.unproject(this.camera);
      const direction = world.sub(this.camera.position).normalize();
      const slot = this.camera.position.clone().addScaledVector(direction, depth);
      part.slotPosition = this.model.worldToLocal(slot);
    }
    this.showcaseScale = portrait ? 1.1 : 1.45;
    this.needsRender = true;
  }

  collectMaterials(model) {
    const seen = new Set();
    model.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (seen.has(material)) continue;
        seen.add(material);
        if (PAINT_MATERIALS.test(material.name)) {
          // The studio environment is bright on every side; at full strength its
          // reflection washes the red into pink. Dim it on the paint only.
          // (three.js only honours envMapIntensity when the material has its own envMap;
          // otherwise scene.environmentIntensity applies.)
          material.envMap = this.envTexture;
          material.envMapIntensity = PAINT_ENV;
          this.paints.push({
            material,
            color: material.color.clone(),
            clearcoat: material.clearcoat ?? 0,
            roughness: material.roughness,
            metalness: material.metalness,
          });
        } else if (LIGHT_MATERIALS.test(material.name)) {
          this.lights.push({ material, intensity: material.emissiveIntensity || 1 });
        }
      }
    });
  }

  /** Hide anything below the floor, so the car can rise "through" it on the lift. */
  clipBelowFloor(model) {
    this.renderer.localClippingEnabled = true;
    const planes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.005)];
    model.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) material.clippingPlanes = planes;
    });
  }

  buildLasers(size) {
    const length = Math.max(size.x, size.z) * 1.12;
    const width = Math.min(size.x, size.z);
    const geometry = new THREE.PlaneGeometry(0.015, length);
    const angle = Math.atan2(this.forward.x, this.forward.z);
    for (const offset of [-width / 2 - 0.08, width / 2 + 0.08]) {
      const line = new THREE.Mesh(geometry, this.laserMaterial);
      line.rotation.x = -Math.PI / 2;
      line.rotation.z = angle;
      line.position.copy(this.side.clone().multiplyScalar(offset));
      line.position.y = 0.004;
      this.lasers.add(line);
    }
  }

  setProgress(value) {
    this.target = clamp(value);
  }

  resize() {
    const { clientWidth: width, clientHeight: height } = this.canvas;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // The canvas fills the whole hero; shift the car beside the text (desktop)
    // or below it (phones) instead of rendering it in the middle.
    if (width >= 1024) this.camera.setViewOffset(width, height, -width * 0.2, -height * 0.06, width, height);
    else {
      // Centre the car in the free space below the text (short phones need a bigger shift).
      this.freeArea = this.getFreeArea?.() ?? PHONE_FREE_AREA;
      const centre = (this.freeArea.top + this.freeArea.bottom) / 2;
      const shift = Math.max(0.11, centre - 0.5 - PHONE_CENTRE_BIAS);
      this.camera.setViewOffset(width, height, 0, -height * shift, width, height);
    }
    this.camera.updateProjectionMatrix();
    this.layoutShowcase();
    this.needsRender = true;
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastTick = performance.now();
    const tick = () => {
      if (!this.running) return;
      this.frame = requestAnimationFrame(tick);
      if (this.getTarget) this.target = clamp(this.getTarget());
      this.update();
    };
    tick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  update(force = false) {
    // Ease towards the scroll position so motion glides between scroll steps
    // (time-based, so it feels the same at 60 Hz and 120 Hz, and after a dropped frame).
    const now = performance.now();
    const dt = Math.min(0.1, (now - (this.lastTick ?? now)) / 1000);
    this.lastTick = now;
    const delta = this.target - this.progress;
    const moving = Math.abs(delta) > 0.0002;
    if (moving) this.progress += delta * (1 - Math.exp(-SMOOTHING * dt));
    else this.progress = this.target;

    // `p` runs the build (0 → 1); after HERO_BUILD_END the finished car drives off.
    const p = clamp(this.progress / HERO_BUILD_END);
    const drive = window01(this.progress, HERO_BUILD_END + 0.02, 1);
    // The showcase parts keep floating while they are still apart.
    const floating = this.showcase.some((part) => p < part.item.end);
    if (!moving && !force && !this.needsRender && !floating) return;
    this.needsRender = false;

    const time = (performance.now() - this.startTime) / 1000;

    // Chassis: rises from below and grows into place.
    if (this.chassis) {
      const t = easeOutCubic(window01(p, 0.02, 0.14));
      this.chassis.visible = t > 0;
      this.chassis.position.copy(this.chassisBase);
      this.chassis.position.y -= (1 - t) * 0.6;
      this.chassis.scale.setScalar(THREE.MathUtils.lerp(0.75, 1, t));
    }
    this.shadowMaterial.opacity = window01(p, 0.02, 0.2);
    this.ringMaterial.opacity = 0.15 + 0.2 * window01(p, 0.02, 0.2);

    // Showcase parts: float and turn, then fly to their place.
    for (const part of this.showcase) {
      const t = easeInOut(window01(p, part.item.start, part.item.end));
      const float = 1 - t;
      const bob = Math.sin(time * 1.1 + part.phase) * 0.06 * float;
      const sway = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        Math.sin(time * 0.45 + part.phase) * 0.45 * float,
      );

      part.node.position.lerpVectors(part.slotPosition, part.basePosition, t);
      part.node.position.y += bob;
      part.node.quaternion.slerpQuaternions(part.startQuaternion, part.baseQuaternion, t).premultiply(sway);
      const showcaseScale = (this.showcaseScale ?? 1.4) * (part.item.size ?? 1);
      part.node.scale.copy(part.baseScale).multiplyScalar(THREE.MathUtils.lerp(showcaseScale, 1, t));
    }

    // Other parts: appear at their window and fly in.
    for (const part of this.parts) {
      const raw = window01(p, part.start, part.end);
      const t = easeOutCubic(raw);
      part.node.visible = p >= part.start - 0.005;
      part.node.position.copy(part.basePosition).addScaledVector(part.offset, 1 - t);
      part.node.quaternion.slerpQuaternions(part.startQuaternion, part.baseQuaternion, t);
      part.node.scale
        .copy(part.baseScale)
        .multiplyScalar(THREE.MathUtils.lerp(part.minScale, 1, easeOutCubic(clamp(raw * 2))));
    }

    // Paint: primer grey → metallic red.
    const paint = easeInOut(window01(p, 0.5, 0.66));
    for (const item of this.paints) {
      item.material.color.copy(PRIMER).lerp(item.color, paint);
      if ("clearcoat" in item.material) item.material.clearcoat = Math.max(item.clearcoat * paint, CLEARCOAT_MIN);
      item.material.roughness = THREE.MathUtils.lerp(0.75, item.roughness, paint);
      item.material.metalness = THREE.MathUtils.lerp(0.1, item.metalness, paint);
    }

    // Alignment: lasers flash while the wheels roll one turn on their axles.
    const align = window01(p, 0.67, 0.83);
    this.laserMaterial.opacity = Math.sin(Math.PI * align) * 0.9;
    const rollSign = this.rollSign ?? 1;
    const alignRoll = easeInOut(align) * Math.PI * 2;
    for (const wheel of this.wheels) wheel.rotateX(alignRoll * rollSign);

    this.updateDriveOff(drive, alignRoll * rollSign);

    // Ready: lights on.
    const lights = window01(p, 0.84, 0.96);
    for (const light of this.lights) light.material.emissiveIntensity = light.intensity * (0.15 + 0.85 * lights);

    this.updateCamera(p);
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Drive-off (after the build): a copy of the finished car accelerates forward
   * out of the frame while the original rises back into place on a "lift"
   * through the floor, so the stage never stands empty. The camera holds still.
   */
  updateDriveOff(drive, alignRoll) {
    if (!this.model) return;

    // Gentle pull-away that builds speed, so the drive-off reads clearly.
    const distance = 17 * drive ** 1.8;
    if (this.driveCar) {
      this.driveCar.visible = drive > 0;
      this.driveShadow.visible = drive > 0;
      this.driveCar.position.copy(this.modelBase).addScaledVector(this.forward, distance);
      this.driveShadow.position.set(this.forward.x * distance, 0.002, this.forward.z * distance);
      // Wheels roll without slipping: angle = distance / radius.
      const roll = alignRoll + (distance / (this.wheelRadius ?? 0.35)) * (this.rollSign ?? 1);
      for (const { node, quaternion } of this.driveWheels)
        node.quaternion
          .copy(quaternion)
          .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), roll));
    }

    // The original sinks out of sight as the copy takes its place, then rises back up.
    // The rise starts only once the copy is more than a car-length away (≈ drive 0.5),
    // so the two cars never overlap.
    const lift = drive > 0 ? easeOutCubic(window01(drive, 0.55, 0.95)) : 1;
    this.model.position.copy(this.modelBase);
    this.model.position.y -= (1 - lift) * 1.5;
    this.shadowMaterial.opacity *= lift;
  }

  /** Copy of the finished car (shares geometry and materials, so it is cheap). */
  createDriveCar() {
    this.driveCar = this.model.clone(true);
    this.driveCar.position.copy(this.modelBase);
    this.scene.add(this.driveCar);

    this.driveWheels = this.wheels
      .map((wheel) => this.driveCar.getObjectByName(wheel.name))
      .filter(Boolean)
      .map((node) => {
        // Undo the alignment roll baked into the copied wheels; it is reapplied each frame.
        const original =
          this.showcase.find((part) => part.node.name === node.name) ??
          this.parts.find((part) => part.node.name === node.name);
        return { node, quaternion: (original?.baseQuaternion ?? node.quaternion).clone() };
      });

    this.driveShadow = this.shadow.clone();
    this.driveShadow.material = this.shadowMaterial.clone();
    this.driveShadow.material.opacity = 1;
    this.scene.add(this.driveShadow);
  }

  updateCamera(p) {
    if (!this.forward) {
      this.camera.position.set(6, 2.5, 6);
      this.camera.lookAt(0, 0.5, 0);
      return;
    }
    // Slow orbit from a high front-quarter view to a low hero angle.
    const angle = THREE.MathUtils.lerp(-0.95, -0.45, easeInOut(p));
    // Keep the whole car in frame on narrow (portrait) screens.
    const minDistance = 8.6 / Math.max(this.camera.aspect, 0.35);
    // Start wide so the showcase and flying parts fit, then close in on the finished car.
    const zoom = easeInOut(window01(p, 0, 0.55));
    const distance = Math.max(
      THREE.MathUtils.lerp(12.5, 7.8, zoom),
      this.camera.aspect < 1 ? minDistance * THREE.MathUtils.lerp(1.25, 1, zoom) : 0,
    );
    const height = THREE.MathUtils.lerp(3.2, 1.6, easeInOut(p)) * (distance / 8);

    const position = this.forward
      .clone()
      .multiplyScalar(Math.cos(angle) * distance)
      .addScaledVector(this.side, Math.sin(angle) * distance);
    position.y = height;
    this.camera.position.copy(position);
    this.camera.lookAt(0, 0.55, 0);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      const materials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
      for (const material of materials) {
        for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
        material.dispose();
      }
    });
    this.envTexture.dispose();
    this.renderer.dispose();
  }
}
