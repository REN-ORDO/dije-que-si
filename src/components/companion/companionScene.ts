import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ScrollTrigger, gsap, MQ } from "@/lib/motion";
import { SECTION_IDS, emptySample, sampleSection, type Sample, type SectionId } from "./tracker";

/*
 * The global "3D companion": one fixed, full-viewport WebGL layer that shows a
 * small stylized object per story beat. Every object is designed inside a
 * ~2-unit box and placed at a DOM-derived pixel anchor each frame.
 *
 *   idea         glowing "?"
 *   capitulo-1   one classroom seat, rim lights indigo
 *   capitulo-2   others' knowledge orbiting a tiny sphere that grows indigo
 *   capitulo-3   ZIP slab tilts, then flies off with a trail
 *   capitulo-4   steps build one by one, top one indigo, particle burst
 *   capitulo-6   the seat returns, more seats light up in a wave
 *   cierre       all seats lit, indigo glow, slow orbit
 */

const INDIGO = 0x7c83ff;
const FOV = 30;
const CAM_Z = 10;
const DESIGN = 2; // world size each object is modeled to fill

// ---------- math ----------
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (a: number, b: number, x: number) => clamp01((x - a) / (b - a));
const smooth = (a: number, b: number, x: number) => {
  const t = range(a, b, x);
  return t * t * (3 - 2 * t);
};
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Frame-rate independent exponential approach. */
const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * dt));

// ---------- geometry helpers ----------
function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function slab(w: number, h: number, r: number, d: number, bevel = 0.025) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, Math.max(0.01, r - bevel)), {
    depth: d,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 6,
  });
  g.center();
  return g;
}

/** mergeGeometries needs matching index usage and attributes. */
function merge(parts: THREE.BufferGeometry[]) {
  const flat = parts.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    if (n !== g) g.dispose();
    return n;
  });
  const out = mergeGeometries(flat, false)!;
  flat.forEach((g) => g.dispose());
  return out;
}

function seatGeometry() {
  const pan = slab(0.92, 0.84, 0.14, 0.06);
  pan.rotateX(-Math.PI / 2);
  const back = slab(0.92, 0.66, 0.16, 0.05);
  back.rotateX(-0.14);
  back.translate(0, 0.52, -0.42);
  const parts: THREE.BufferGeometry[] = [pan, back];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = new THREE.CylinderGeometry(0.028, 0.022, 0.62, 8);
      leg.translate(sx * 0.36, -0.33, sz * 0.32);
      parts.push(leg);
    }
    const post = new THREE.CylinderGeometry(0.024, 0.024, 0.5, 8);
    post.translate(sx * 0.34, 0.22, -0.43);
    parts.push(post);
  }
  const g = merge(parts);
  g.translate(0, -0.1, 0);
  return g;
}

/** Glowing outline on the front of the backrest. */
function seatRimGeometry() {
  const pts = roundedRect(0.84, 0.58, 0.13)
    .getPoints(6)
    .map((p) => new THREE.Vector3(p.x, p.y, 0));
  const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal");
  const g = new THREE.TubeGeometry(curve, 96, 0.018, 6, true);
  g.translate(0, 0, 0.056);
  g.rotateX(-0.14);
  g.translate(0, 0.52 - 0.1, -0.42);
  return g;
}

function questionGeometry() {
  const pts = [
    [-0.42, 0.42],
    [-0.3, 0.68],
    [0, 0.8],
    [0.32, 0.7],
    [0.42, 0.45],
    [0.3, 0.22],
    [0.06, 0.08],
    [0, -0.1],
    [0, -0.22],
  ].map(([x, y]) => new THREE.Vector3(x, y, 0));
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const R = 0.1;
  const tube = new THREE.TubeGeometry(curve, 72, R, 14, false);
  const capA = new THREE.SphereGeometry(R, 14, 10);
  capA.translate(pts[0].x, pts[0].y, 0);
  const capB = new THREE.SphereGeometry(R, 14, 10);
  capB.translate(0, -0.22, 0);
  const dot = new THREE.SphereGeometry(0.125, 20, 14);
  dot.translate(0, -0.52, 0);
  const g = merge([tube, capA, capB, dot]);
  g.translate(0, -0.1, 0);
  return g;
}

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function radialTexture(inner: string, outer: string) {
  return canvasTexture(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });
}

/** Deterministic pseudo random, so the burst looks the same every visit. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------- public API ----------

export type Companion = { dispose: () => void };

/**
 * Mounts the companion into `host` (a fixed full-viewport element).
 * Returns null if WebGL is unavailable; the caller then renders nothing.
 */
export function createCompanion(host: HTMLElement): Companion | null {
  const sections = SECTION_IDS.map((id) => ({ id, el: document.getElementById(id) })).filter(
    (s): s is { id: SectionId; el: HTMLElement } => !!s.el
  );
  if (!sections.length) return null;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  if (!renderer.getContext()) {
    renderer.dispose();
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  camera.position.set(0, 0, CAM_Z);

  // Same studio as the phone and hero: room reflections, key, indigo rims.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.04);
  scene.environment = envRT.texture;
  room.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
  });
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2.5, 3, 4);
  const rim = new THREE.DirectionalLight(INDIGO, 4.5);
  rim.position.set(-3, 1.5, -3);
  const rim2 = new THREE.DirectionalLight(INDIGO, 2);
  rim2.position.set(3, -1, -2.5);
  scene.add(key, rim, rim2, new THREE.AmbientLight(0xffffff, 0.15));

  // ---------- shared materials ----------
  const titanium = new THREE.MeshPhysicalMaterial({
    color: 0x3b3b42,
    metalness: 0.82,
    roughness: 0.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.1,
  });
  const indigo = new THREE.MeshPhysicalMaterial({
    color: INDIGO,
    emissive: 0x3a3fb0,
    emissiveIntensity: 0.9,
    metalness: 0.35,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
  const rimMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });

  const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  const tmpM = new THREE.Matrix4();
  const tmpQ = new THREE.Quaternion();
  const tmpE = new THREE.Euler();
  const tmpV = new THREE.Vector3();
  const tmpS = new THREE.Vector3();
  const tmpC = new THREE.Color();
  const dimRim = new THREE.Color(0x34343c);
  const litRim = new THREE.Color(0x8088ff);
  const setInstance = (
    mesh: THREE.InstancedMesh,
    i: number,
    x: number,
    y: number,
    z: number,
    s: number,
    rx = 0,
    ry = 0,
    rz = 0,
    sx = 1,
    sy = 1,
    sz = 1
  ) => {
    if (s <= 0.0001) {
      mesh.setMatrixAt(i, zero);
      return;
    }
    tmpQ.setFromEuler(tmpE.set(rx, ry, rz));
    tmpM.compose(tmpV.set(x, y, z), tmpQ, tmpS.set(s * sx, s * sy, s * sz));
    mesh.setMatrixAt(i, tmpM);
  };

  // ---------- glow (shared) ----------
  const glowTex = radialTexture("rgba(124,131,255,0.85)", "rgba(124,131,255,0)");
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      opacity: 0,
    })
  );
  glow.renderOrder = -1;
  scene.add(glow);

  // ---------- idea: "?" ----------
  const qGroup = new THREE.Group();
  const qMesh = new THREE.Mesh(questionGeometry(), indigo);
  qGroup.add(qMesh);
  scene.add(qGroup);

  // ---------- seats (ch1, ch6, cierre) ----------
  const SEATS = 5;
  const seatGroup = new THREE.Group();
  const seatInner = new THREE.Group();
  seatGroup.add(seatInner);
  const seatBody = new THREE.InstancedMesh(seatGeometry(), titanium, SEATS);
  const seatRim = new THREE.InstancedMesh(seatRimGeometry(), rimMat, SEATS);
  for (let i = 0; i < SEATS; i++) seatRim.setColorAt(i, dimRim);
  seatInner.add(seatBody, seatRim);
  scene.add(seatGroup);
  // Row layout: front center (me), then two flanking, two behind.
  const SEAT_POS = [
    [0, 0, 0],
    [-1.08, 0, -0.25],
    [1.08, 0, -0.25],
    [-0.56, 0.3, -1.45],
    [0.56, 0.3, -1.45],
  ];
  const SEAT_ORDER = [0, 1, 2, 3, 4];

  // ---------- ch2: orbit ----------
  const orbitGroup = new THREE.Group();
  const coreMat = indigo.clone();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 24), coreMat);
  const SATS = 9;
  const sats = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 20, 14), titanium, SATS);
  orbitGroup.add(core, sats);
  scene.add(orbitGroup);
  const coreDim = new THREE.Color(0x4a4a52);
  const coreLit = new THREE.Color(INDIGO);
  const emDim = new THREE.Color(0x000000);
  const emLit = new THREE.Color(0x3a3fb0);

  // ---------- ch3: ZIP ----------
  const zipGroup = new THREE.Group();
  const zipFly = new THREE.Group();
  const zipBody = new THREE.Group();
  zipFly.add(zipBody);
  zipGroup.add(zipFly);
  zipBody.add(new THREE.Mesh(slab(1.0, 1.26, 0.1, 0.1, 0.03), titanium));
  const TEETH = 12;
  const teeth = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 0.035, 0.03), indigo, TEETH + 1);
  zipBody.add(teeth);
  const labelTex = canvasTexture(256, 112, (ctx) => {
    ctx.fillStyle = "#c9ccff";
    ctx.font = "700 72px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ZIP", 128, 60);
  });
  labelTex.anisotropy = 4;
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 0.245),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, toneMapped: false, depthWrite: false })
  );
  label.position.set(0, -0.3, 0.082);
  zipBody.add(label);
  const trailTex = canvasTexture(256, 64, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, "rgba(124,131,255,0)");
    g.addColorStop(1, "rgba(124,131,255,0.9)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 64);
    // soften the long edges
    ctx.globalCompositeOperation = "destination-in";
    const v = ctx.createLinearGradient(0, 0, 0, 64);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(0.5, "rgba(0,0,0,1)");
    v.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, 256, 64);
  });
  const trailGeo = new THREE.PlaneGeometry(1, 1);
  trailGeo.translate(-0.5, 0, 0);
  const trail = new THREE.Mesh(
    trailGeo,
    new THREE.MeshBasicMaterial({
      map: trailTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      opacity: 0,
    })
  );
  zipGroup.add(trail);
  scene.add(zipGroup);

  // ---------- ch4: steps + burst ----------
  const blocksGroup = new THREE.Group();
  const blockGeo = slab(0.6, 0.6, 0.09, 0.16, 0.03);
  blockGeo.rotateX(-Math.PI / 2);
  const BLOCKS = 5;
  const blocks = new THREE.InstancedMesh(blockGeo, titanium, BLOCKS - 1);
  const topBlock = new THREE.Mesh(blockGeo, indigo);
  blocksGroup.add(blocks, topBlock);
  const blockPos = (i: number) => [-0.56 + i * 0.28, -0.44 + i * 0.22] as const;
  const PARTS = 140;
  const partDirs = new Float32Array(PARTS * 3);
  const rand = rng(7);
  for (let i = 0; i < PARTS; i++) {
    const u = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const len = 0.35 + rand() * 0.65;
    partDirs[i * 3] = Math.cos(a) * s * len;
    partDirs[i * 3 + 1] = Math.abs(u) * len * 0.9 + 0.1;
    partDirs[i * 3 + 2] = Math.sin(a) * s * len;
  }
  const partGeo = new THREE.BufferGeometry();
  const partPos = new Float32Array(PARTS * 3);
  partGeo.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
  const dotTex = radialTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)");
  const partMat = new THREE.PointsMaterial({
    color: 0xa5aaff,
    map: dotTex,
    size: 0.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(partGeo, partMat);
  particles.frustumCulled = false;
  blocksGroup.add(particles);
  scene.add(blocksGroup);

  // ---------- state ----------
  type Live = Sample & { seen: boolean; tw: number; tp: number; tx: number; ty: number; ts: number };
  const live: Record<SectionId, Live> = Object.fromEntries(
    SECTION_IDS.map((id) => [id, { ...emptySample(), seen: false, tw: 0, tp: 0, tx: 0, ty: 0, ts: 0 }])
  ) as Record<SectionId, Live>;
  const sample = emptySample();
  const mode = { vw: 1, vh: 1, desktop: true, reduce: false };
  let upp = 1; // world units per CSS pixel at z = 0

  const resize = () => {
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    mode.vw = w;
    mode.vh = h;
    mode.desktop = window.matchMedia(MQ.desktop).matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mode.desktop ? 1.75 : 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    upp = (2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / h;
    // ~4px particles regardless of viewport
    partMat.size = (4.5 * 2 * CAM_Z) / h;
    wake();
  };

  /** Place a group at a pixel anchor with a pixel size. */
  const place = (obj: THREE.Object3D, x: number, y: number, sizePx: number, vis: number) => {
    obj.position.set((x - mode.vw / 2) * upp, -(y - mode.vh / 2) * upp, 0);
    obj.scale.setScalar(Math.max(0.0001, ((sizePx * upp) / DESIGN) * vis));
    obj.visible = vis > 0.002;
  };

  type Blend = { w: number; x: number; y: number; size: number };
  const blend = (ids: SectionId[], out: Blend) => {
    let w = 0;
    let x = 0;
    let y = 0;
    let s = 0;
    for (const id of ids) {
      const l = live[id];
      w += l.w;
      x += l.x * l.w;
      y += l.y * l.w;
      s += l.size * l.w;
    }
    out.w = Math.min(1, w);
    if (w > 0.0001) {
      out.x = x / w;
      out.y = y / w;
      out.size = s / w;
    }
    return out;
  };
  const bQ: Blend = { w: 0, x: 0, y: 0, size: 0 };
  const bSeat: Blend = { w: 0, x: 0, y: 0, size: 0 };
  const bOrbit: Blend = { w: 0, x: 0, y: 0, size: 0 };
  const bZip: Blend = { w: 0, x: 0, y: 0, size: 0 };
  const bBlocks: Blend = { w: 0, x: 0, y: 0, size: 0 };

  /** Presence → scale. Springy overshoot with motion, plain fade without. */
  const visOf = (w: number) => (w <= 0.002 ? 0 : mode.reduce ? 1 : outBack(w));
  const onScreen = (b: Blend) => b.w > 0.002 && b.y > -b.size && b.y < mode.vh + b.size && b.x > -b.size && b.x < mode.vw + b.size;

  // ---------- loop ----------
  let raf = 0;
  let running = false;
  let last = 0;
  let time = 0;
  let lastInput = performance.now();
  let frameCount = 0;
  let cleared = true;
  let pageVisible = document.visibilityState === "visible";
  let lost = false;

  function wake() {
    lastInput = performance.now();
    if (running || !pageVisible || lost) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function frame(now: number) {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    frameCount++;
    if (!mode.reduce) time += dt;

    // 1. measure + damp every section
    let settled = true;
    const posLambda = mode.desktop ? 10 : 40;
    for (const { id, el } of sections) {
      const l = live[id];
      sample.w = 0;
      const r = el.getBoundingClientRect();
      if (r.bottom > -mode.vh * 0.25 && r.top < mode.vh * 1.25) sampleSection(el, id, mode, sample);
      l.tw = sample.w;
      if (sample.w > 0) {
        l.tp = sample.p;
        l.tx = sample.x;
        l.ty = sample.y;
        l.ts = sample.size;
        if (!l.seen) {
          l.x = l.tx;
          l.y = l.ty;
          l.size = l.ts;
          l.p = l.tp;
          l.seen = true;
        }
      }
      l.w = damp(l.w, l.tw, mode.reduce ? 6 : 5, dt);
      l.p = damp(l.p, l.tp, 6, dt);
      l.x = damp(l.x, l.tx, posLambda, dt);
      l.y = damp(l.y, l.ty, posLambda, dt);
      l.size = damp(l.size, l.ts, 8, dt);
      if (l.w < 0.001 && l.tw === 0) {
        l.w = 0;
        l.seen = false;
      }
      if (
        Math.abs(l.w - l.tw) > 0.001 ||
        Math.abs(l.p - l.tp) > 0.001 ||
        Math.abs(l.x - l.tx) > 0.3 ||
        Math.abs(l.y - l.ty) > 0.3 ||
        Math.abs(l.size - l.ts) > 0.3
      )
        settled = false;
    }

    // 2. pose every object
    const t = time;
    let glowX = 0;
    let glowY = 0;
    let glowS = 0;
    let glowA = 0;
    let glowW = 0;
    const addGlow = (b: Blend, amount: number, scale = 2.6) => {
      if (b.w <= 0.002) return;
      glowX += b.x * b.w;
      glowY += b.y * b.w;
      glowS += b.size * scale * b.w;
      glowA += amount * b.w;
      glowW += b.w;
    };

    // idea: "?"
    {
      const b = blend(["idea"], bQ);
      const p = live.idea.p;
      place(qGroup, b.x, b.y, b.size, visOf(b.w));
      qMesh.rotation.set(0.12 + (1 - b.w) * 0.9, -0.5 + t * 0.35 + p * 1.4, Math.sin(t * 0.5) * 0.08);
      qMesh.position.y = Math.sin(t * 0.9) * 0.05;
      addGlow(b, 0.55);
    }

    // seats
    {
      const b = blend(["capitulo-1", "capitulo-6", "cierre"], bSeat);
      const w1 = live["capitulo-1"].w;
      const w6 = live["capitulo-6"].w;
      const wc = live.cierre.w;
      place(seatGroup, b.x, b.y, b.size, visOf(b.w));
      if (w1 >= w6 + wc) {
        // ch1: a single seat turns toward us and its rim lights up
        const p = live["capitulo-1"].p;
        const turn = outCubic(range(0, 0.6, p));
        seatInner.scale.setScalar(1.15);
        seatInner.position.set(0, 0, 0);
        seatInner.rotation.set(0.22, lerp(-2.4, -0.5, turn) + Math.sin(t * 0.4) * 0.05, 0);
        setInstance(seatBody, 0, 0, Math.sin(t * 0.8) * 0.03, 0, 1);
        setInstance(seatRim, 0, 0, Math.sin(t * 0.8) * 0.03, 0, 1);
        seatRim.setColorAt(0, tmpC.copy(dimRim).lerp(litRim, smooth(0.3, 0.65, p)));
        for (let i = 1; i < SEATS; i++) {
          setInstance(seatBody, i, 0, 0, 0, 0);
          setInstance(seatRim, i, 0, 0, 0, 0);
        }
        addGlow(b, 0.5 * smooth(0.3, 0.65, p));
      } else {
        // ch6 → cierre: the seat returns, the others join and light in a wave
        const p = live["capitulo-6"].tw > 0 || wc < 0.5 ? live["capitulo-6"].p : 1;
        const orbit = wc / Math.max(0.0001, w6 + wc);
        const ret = outCubic(range(0, 0.25, p));
        seatInner.scale.setScalar(lerp(1.1, 0.78, smooth(0.15, 0.45, p)));
        seatInner.position.set(0, lerp(0, -0.1, smooth(0.15, 0.45, p)), 0);
        seatInner.rotation.set(0.32, lerp(-1.3, -0.35, ret) + orbit * t * 0.18 + Math.sin(t * 0.35) * 0.05, 0);
        for (let i = 0; i < SEATS; i++) {
          const [x, y, z] = SEAT_POS[i];
          const k = SEAT_ORDER[i];
          const appear = i === 0 ? 1 : outBack(range(0.18 + k * 0.05, 0.36 + k * 0.05, p));
          const bob = Math.sin(t * 0.8 + i) * 0.025;
          setInstance(seatBody, i, x, y + bob, z, appear);
          setInstance(seatRim, i, x, y + bob, z, appear);
          const lit = Math.max(i === 0 ? smooth(0, 0.12, p) : 0, smooth(0.45 + k * 0.08, 0.55 + k * 0.08, p), orbit);
          seatRim.setColorAt(i, tmpC.copy(dimRim).lerp(litRim, lit));
        }
        addGlow(b, lerp(0.45, 1, orbit), lerp(2.6, 3.4, orbit));
      }
      seatBody.instanceMatrix.needsUpdate = true;
      seatRim.instanceMatrix.needsUpdate = true;
      if (seatRim.instanceColor) seatRim.instanceColor.needsUpdate = true;
    }

    // ch2: orbit
    {
      const b = blend(["capitulo-2"], bOrbit);
      const p = live["capitulo-2"].p;
      place(orbitGroup, b.x, b.y, b.size, visOf(b.w));
      const grow = smooth(0.08, 0.9, p);
      orbitGroup.rotation.set(0.38, t * 0.1, -0.12);
      core.scale.setScalar(lerp(0.55, 2.3, grow));
      coreMat.color.copy(coreDim).lerp(coreLit, grow);
      coreMat.emissive.copy(emDim).lerp(emLit, grow);
      for (let i = 0; i < SATS; i++) {
        const ring = i % 3;
        const r = 0.68 + ring * 0.17 + grow * 0.18;
        const a = t * (0.5 - ring * 0.1) + i * 2.1 + p * 2.4;
        const tilt = (ring - 1) * 0.55;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        setInstance(sats, i, x, z * Math.sin(tilt), z * Math.cos(tilt), lerp(1, 0.75, grow));
      }
      sats.instanceMatrix.needsUpdate = true;
      addGlow(b, 0.15 + grow * 0.6, 1.4 + grow * 1.6);
    }

    // ch3: ZIP
    {
      const b = blend(["capitulo-3"], bZip);
      const p = live["capitulo-3"].p;
      place(zipGroup, b.x, b.y, b.size, visOf(b.w));
      const pt = inOutCubic(range(0, 0.72, p));
      const fly = range(0.72, 0.96, p);
      const fe = Math.pow(fly, 2.4);
      zipBody.rotation.set(lerp(0.35, -0.12, pt), lerp(-0.95, 0.3, pt) + Math.sin(t * 0.6) * 0.04, lerp(0.08, -0.05, pt) - fe * 0.5);
      zipBody.position.y = Math.sin(t * 0.9) * 0.04;
      // fly outward + up (toward the outer edge of the visual column)
      const flipped = mode.desktop && (document.getElementById("capitulo-3")?.classList.contains("is-flipped") ?? false);
      const dx = flipped ? -1 : 1;
      const dirX = dx * 0.78;
      const dirY = 0.62;
      const dist = fe * 4.2;
      zipFly.position.set(dirX * dist, dirY * dist, 0);
      zipFly.scale.setScalar(lerp(1, 0.45, fe));
      // zipper pull slides down while it tilts
      for (let i = 0; i < TEETH; i++) {
        setInstance(teeth, i, i % 2 ? 0.032 : -0.032, 0.56 - i * 0.046, 0.094, 1);
      }
      setInstance(teeth, TEETH, 0, 0.56 - smooth(0.05, 0.6, p) * 0.5, 0.11, 1, 0, 0, 0, 1.3, 3.6, 1.2);
      teeth.instanceMatrix.needsUpdate = true;
      const trailA = Math.sin(Math.PI * fly) * 0.9;
      const tm = trail.material as THREE.MeshBasicMaterial;
      tm.opacity = trailA;
      trail.visible = trailA > 0.01;
      trail.position.copy(zipFly.position);
      trail.rotation.z = Math.atan2(dirY, dirX);
      trail.scale.set(Math.max(0.01, dist * 0.95), 0.7 * lerp(1, 0.6, fe), 1);
      addGlow(b, 0.35 * (1 - fe), 2.2);
    }

    // ch4: steps + burst
    {
      const b = blend(["capitulo-4"], bBlocks);
      const p = live["capitulo-4"].p;
      place(blocksGroup, b.x, b.y, b.size, visOf(b.w));
      blocksGroup.rotation.set(0.36, -0.62 + p * 0.45 + Math.sin(t * 0.3) * 0.06, 0);
      for (let i = 0; i < BLOCKS; i++) {
        const [x, y] = blockPos(i);
        const a = range(0.04 + i * 0.13, 0.17 + i * 0.13, p);
        const drop = (1 - outCubic(a)) * 0.9;
        const s = a <= 0 ? 0 : outBack(a);
        if (i < BLOCKS - 1) setInstance(blocks, i, x, y + drop, 0, s);
        else {
          topBlock.position.set(x, y + drop + Math.sin(t * 1.1) * 0.02 * s, 0);
          topBlock.scale.setScalar(Math.max(0.0001, s));
          topBlock.visible = s > 0.001;
        }
      }
      blocks.instanceMatrix.needsUpdate = true;
      const burst = range(0.76, 0.98, p);
      const [tx, ty] = blockPos(BLOCKS - 1);
      partMat.opacity = Math.pow(Math.sin(Math.PI * burst), 0.7) * 0.95;
      particles.visible = partMat.opacity > 0.01;
      if (particles.visible) {
        const spread = 0.2 + outCubic(burst) * 1.7;
        for (let i = 0; i < PARTS; i++) {
          partPos[i * 3] = tx + partDirs[i * 3] * spread;
          partPos[i * 3 + 1] = ty + 0.12 + partDirs[i * 3 + 1] * spread - burst * burst * 0.3;
          partPos[i * 3 + 2] = partDirs[i * 3 + 2] * spread;
        }
        partGeo.attributes.position.needsUpdate = true;
      }
      addGlow(b, 0.3 + partMat.opacity * 0.5, 2.4);
    }

    // shared glow sits behind whichever object is present
    if (glowW > 0.002) {
      const gm = glow.material as THREE.SpriteMaterial;
      gm.opacity = (glowA / glowW) * Math.min(1, glowW) * 0.55;
      glow.position.set((glowX / glowW - mode.vw / 2) * upp, -(glowY / glowW - mode.vh / 2) * upp, -1.5);
      glow.scale.setScalar(Math.max(0.0001, (glowS / glowW) * upp));
      glow.visible = gm.opacity > 0.005;
    } else glow.visible = false;

    // 3. render only when something is on screen
    const visible = [bQ, bSeat, bOrbit, bZip, bBlocks].some(onScreen);
    const idleFor = now - lastInput;
    const idle = settled && idleFor > 1500;
    if (mode.reduce) host.style.opacity = String(Math.min(1, glowW));
    if (visible) {
      // throttle the ambient float to ~30fps when nothing is scrolling
      if (!idle || frameCount % 2 === 0) renderer.render(scene, camera);
      cleared = false;
    } else if (!cleared) {
      renderer.clear();
      cleared = true;
    }

    // 4. keep going only while something changes
    const done =
      !pageVisible ||
      lost ||
      (!visible && settled) ||
      (mode.reduce && settled) ||
      (idle && idleFor > 12000);
    if (done) {
      running = false;
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  // ---------- wiring ----------
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const onScroll = () => wake();
  window.addEventListener("scroll", onScroll, { passive: true });
  const onVis = () => {
    pageVisible = document.visibilityState === "visible";
    if (pageVisible) wake();
  };
  document.addEventListener("visibilitychange", onVis);
  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
    host.style.display = "none";
  };
  canvas.addEventListener("webglcontextlost", onLost);

  // Section triggers wake the loop (Lenis drives ScrollTrigger.update) and
  // re-measure after layout refreshes. `any: "all"` keeps one branch always on.
  const mm = gsap.matchMedia();
  mm.add({ any: "all", desktop: MQ.desktop, reduce: MQ.reduce }, (ctx) => {
    const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
    mode.desktop = desktop;
    mode.reduce = reduce;
    host.style.opacity = reduce ? "0" : "";
    sections.forEach(({ el }) =>
      ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onUpdate: wake, onToggle: wake })
    );
    const onRefresh = () => wake();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    resize();
    return () => ScrollTrigger.removeEventListener("refresh", onRefresh);
  });

  resize();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      running = false;
      mm.revert();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      const geos = new Set<THREE.BufferGeometry>();
      const mats = new Set<THREE.Material>();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) geos.add(m.geometry);
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => mats.add(x));
        if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      [glowTex, labelTex, trailTex, dotTex].forEach((t) => t.dispose());
      envRT.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
