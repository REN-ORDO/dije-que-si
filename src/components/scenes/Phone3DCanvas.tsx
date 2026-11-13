"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap, MQ } from "@/lib/motion";
import type { PhoneRig } from "./Phone3DRig";
import styles from "./Phone3D.module.css";

type Props = {
  rig: PhoneRig;
  screenshot: string | null;
  /** Called once the first frame (with the screen texture, if any) is drawn. */
  onReady: () => void;
  /** Called if WebGL setup fails; the caller keeps the CSS phone. */
  onError: () => void;
};

// Phone proportions (iPhone ~71.5 × 146.6 × 8 mm), in world units.
const W = 0.72;
const H = 1.47;
const D = 0.08;
const BODY_R = 0.115;
const BEVEL = 0.022;
const FLAT_W = W - BEVEL * 2;
const FLAT_H = H - BEVEL * 2;
const SCREEN_W = FLAT_W - 0.044;
const SCREEN_H = FLAT_H - 0.044;
const SCREEN_R = 0.078;
const IMG_ASPECT = 738 / 1600;

const FOV = 28;
const PHONE_HEIGHT_FRACTION = 0.74;
const PHONE_WIDTH_FRACTION = 0.6;

const COINS = [
  { x: -0.78, y: 0.5, z: -0.15, s: 1, indigo: true, phase: 0 },
  { x: 0.74, y: 0.66, z: 0.18, s: 0.8, indigo: false, phase: 1.7 },
  { x: 0.82, y: -0.3, z: -0.28, s: 1.15, indigo: true, phase: 3.1 },
  { x: -0.66, y: -0.62, z: 0.22, s: 0.75, indigo: false, phase: 4.4 },
];

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

/** ShapeGeometry with UVs normalized to the shape bounds (0 → 1). */
function planeFromShape(shape: THREE.Shape, w: number, h: number, seg = 10) {
  const g = new THREE.ShapeGeometry(shape, seg);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  }
  uv.needsUpdate = true;
  return g;
}

/** Beveled coin profile, revolved around Y. */
function coinGeometry(r: number, h: number, b: number) {
  const pts = [
    new THREE.Vector2(0, -h / 2),
    new THREE.Vector2(r - b, -h / 2),
    new THREE.Vector2(r - b * 0.3, -h / 2 + b * 0.3),
    new THREE.Vector2(r, -h / 2 + b),
    new THREE.Vector2(r, h / 2 - b),
    new THREE.Vector2(r - b * 0.3, h / 2 - b * 0.3),
    new THREE.Vector2(r - b, h / 2),
    new THREE.Vector2(0, h / 2),
  ];
  return new THREE.LatheGeometry(pts, 48);
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.75)");
  g.addColorStop(0.45, "rgba(0,0,0,0.32)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Cover-crop the screenshot into the screen rect, anchored to the top. */
function coverCrop(tex: THREE.Texture) {
  const screenAspect = SCREEN_W / SCREEN_H;
  tex.repeat.set(1, 1);
  tex.offset.set(0, 0);
  if (IMG_ASPECT > screenAspect) {
    tex.repeat.x = screenAspect / IMG_ASPECT;
    tex.offset.x = (1 - tex.repeat.x) / 2;
  } else {
    tex.repeat.y = IMG_ASPECT / screenAspect;
    tex.offset.y = 1 - tex.repeat.y;
  }
}

export default function Phone3DCanvas({ rig, screenshot, onReady, onError }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const cbRef = useRef({ onReady, onError });
  cbRef.current = { onReady, onError };

  useEffect(() => {
    const host = hostRef.current;
    const scene3d = host?.parentElement;
    if (!host || !scene3d) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      cbRef.current.onError();
      return;
    }

    let disposed = false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.className = styles.canvas;
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
    camera.position.set(0, 0, 5);

    // Studio lighting: environment for reflections + key, fill and indigo rim.
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
    const rim = new THREE.DirectionalLight(0x7c83ff, 4.5);
    rim.position.set(-3, 1.5, -3);
    const rim2 = new THREE.DirectionalLight(0x7c83ff, 2);
    rim2.position.set(3, -1, -2.5);
    const fill = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(key, rim, rim2, fill);

    // ---------- Phone ----------
    const phone = new THREE.Group();
    scene.add(phone);

    const titanium = new THREE.MeshPhysicalMaterial({
      color: 0x3b3b42,
      metalness: 0.82,
      roughness: 0.35,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1.1,
    });
    const bodyGeo = new THREE.ExtrudeGeometry(
      roundedRect(FLAT_W, FLAT_H, BODY_R - BEVEL),
      {
        depth: D - BEVEL * 2,
        bevelEnabled: true,
        bevelThickness: BEVEL,
        bevelSize: BEVEL,
        bevelSegments: 5,
        curveSegments: 14,
      }
    );
    bodyGeo.center();
    phone.add(new THREE.Mesh(bodyGeo, titanium));

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x050506,
      metalness: 0,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    });
    const glassW = FLAT_W + 0.006;
    const glassH = FLAT_H + 0.006;
    const glass = new THREE.Mesh(
      planeFromShape(roundedRect(glassW, glassH, BODY_R - BEVEL + 0.003), glassW, glassH),
      glassMat
    );
    glass.position.z = D / 2 + 0.0008;
    phone.add(glass);

    const screenShape = roundedRect(SCREEN_W, SCREEN_H, SCREEN_R);
    const screenGeo = planeFromShape(screenShape, SCREEN_W, SCREEN_H, 12);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0f0f11, toneMapped: false });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = D / 2 + 0.0016;
    phone.add(screen);

    // Additive glare layer: env reflections sweep across the screen as it turns.
    const glareMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.12,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glare = new THREE.Mesh(screenGeo, glareMat);
    glare.position.z = D / 2 + 0.0026;
    phone.add(glare);

    const islandW = SCREEN_W * 0.31;
    const islandH = 0.056;
    const islandGeo = new THREE.ShapeGeometry(roundedRect(islandW, islandH, islandH / 2), 8);
    const islandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(0, SCREEN_H / 2 - 0.036 - islandH / 2, D / 2 + 0.0022);
    phone.add(island);

    // Side buttons.
    const btnGeo = new THREE.BoxGeometry(0.014, 1, 0.032);
    const buttons: [number, number, number][] = [
      [-1, 0.42, 0.06],
      [-1, 0.29, 0.11],
      [-1, 0.15, 0.11],
      [1, 0.26, 0.17],
    ];
    buttons.forEach(([side, y, len]) => {
      const b = new THREE.Mesh(btnGeo, titanium);
      b.scale.y = len;
      b.position.set(side * (W / 2 + 0.002), y, 0);
      phone.add(b);
    });

    // Back camera bump.
    const bumpGeo = new THREE.ExtrudeGeometry(roundedRect(0.3, 0.31, 0.075), {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 3,
      curveSegments: 10,
    });
    const bump = new THREE.Mesh(bumpGeo, titanium);
    bump.rotation.y = Math.PI;
    bump.position.set(-W / 2 + 0.2, H / 2 - 0.205, -D / 2 + 0.002);
    phone.add(bump);
    const lensGeo = new THREE.CylinderGeometry(0.052, 0.056, 0.02, 32);
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x08080b,
      metalness: 0.3,
      roughness: 0.08,
      clearcoat: 1,
    });
    [
      [-0.065, 0.068],
      [-0.065, -0.068],
      [0.075, 0],
    ].forEach(([dx, dy]) => {
      const l = new THREE.Mesh(lensGeo, lensMat);
      l.rotation.x = Math.PI / 2;
      l.position.set(-W / 2 + 0.2 - dx, H / 2 - 0.205 + dy, -D / 2 - 0.024);
      phone.add(l);
    });

    // ---------- Coins ----------
    const coinGeo = coinGeometry(0.11, 0.026, 0.008);
    const ringGeo = new THREE.TorusGeometry(0.075, 0.0045, 8, 40);
    const indigoMat = new THREE.MeshPhysicalMaterial({
      color: 0x7c83ff,
      metalness: 0.7,
      roughness: 0.28,
      clearcoat: 0.8,
      envMapIntensity: 1.2,
    });
    const coins = COINS.map((c) => {
      const g = new THREE.Group();
      const mat = c.indigo ? indigoMat : titanium;
      g.add(new THREE.Mesh(coinGeo, mat));
      [1, -1].forEach((dir) => {
        const ring = new THREE.Mesh(ringGeo, mat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = dir * 0.013;
        g.add(ring);
      });
      g.rotation.set(1.2 + c.phase * 0.2, c.phase, 0.3);
      g.scale.setScalar(c.s);
      g.visible = false;
      scene.add(g);
      return { g, c, x: c.x, y: c.y };
    });

    // Soft contact shadow under the phone (no shadow maps).
    const shadowTex = shadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    const shadowGeo = new THREE.PlaneGeometry(1.3, 0.42);
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -H / 2 - 0.16;
    scene.add(shadow);

    // ---------- Screen texture ----------
    let screenTex: THREE.Texture | null = null;
    let needsRender = true;
    let readySent = false;
    const sendReady = () => {
      if (readySent || disposed) return;
      readySent = true;
      cbRef.current.onReady();
    };
    if (screenshot) {
      new THREE.TextureLoader().load(
        screenshot,
        (tex) => {
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          coverCrop(tex);
          screenTex = tex;
          screenMat.map = tex;
          screenMat.color.set(0xffffff);
          screenMat.needsUpdate = true;
          needsRender = true;
        },
        undefined,
        () => {
          needsRender = true;
          sendReady();
        }
      );
    }

    // ---------- Layout ----------
    let halfW = 1;
    const resize = () => {
      const w = scene3d.clientWidth;
      const h = scene3d.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      const distH = H / PHONE_HEIGHT_FRACTION / 2 / tan;
      const distW = W / PHONE_WIDTH_FRACTION / 2 / (tan * aspect);
      const dist = Math.max(distH, distW);
      camera.position.z = dist;
      camera.updateProjectionMatrix();
      halfW = dist * tan * aspect;
      const halfH = dist * tan;
      // Keep coins inside the visible frame at any aspect ratio.
      coins.forEach((k) => {
        const mx = Math.max(halfW - 0.14, W / 2 + 0.05);
        k.x = Math.sign(k.c.x) * Math.min(Math.abs(k.c.x), mx);
        k.y = Math.sign(k.c.y) * Math.min(Math.abs(k.c.y), halfH - 0.14);
      });
      needsRender = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(scene3d);

    // ---------- Pointer parallax (desktop, fine pointer) ----------
    const parallax = window.matchMedia(`${MQ.desktop} and (pointer: fine)`);
    const target = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      if (!parallax.matches) return;
      const r = scene3d.getBoundingClientRect();
      target.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      target.y = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    scene3d.addEventListener("pointermove", onMove);
    scene3d.addEventListener("pointerleave", onLeave);

    // ---------- Render loop (only while visible) ----------
    const last = { rotX: NaN, rotY: NaN, rotZ: NaN, y: NaN, z: NaN, enter: NaN, coinSpread: NaN };
    const keys = Object.keys(last) as (keyof PhoneRig)[];

    const tick = (time: number) => {
      let changed = needsRender;
      for (const k of keys) {
        if (last[k] !== rig[k]) {
          last[k] = rig[k];
          changed = true;
        }
      }
      const dx = target.x - smooth.x;
      const dy = target.y - smooth.y;
      const easing = Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005;
      if (easing) {
        smooth.x += dx * 0.06;
        smooth.y += dy * 0.06;
      }
      const idle = rig.coinSpread > 0.01 && rig.enter > 0.01;
      if (!changed && !easing && !idle) return;
      needsRender = false;

      const float = idle ? Math.sin(time * 0.9) * 0.012 * rig.coinSpread : 0;
      phone.rotation.set(
        rig.rotX + smooth.y * 0.07,
        rig.rotY + smooth.x * 0.14,
        rig.rotZ
      );
      phone.position.set(0, rig.y + float, rig.z);

      const s = rig.coinSpread;
      coins.forEach(({ g, c, x, y }) => {
        g.visible = s > 0.005;
        if (!g.visible) return;
        const bob = Math.sin(time * 1.1 + c.phase) * 0.035;
        // Coins start tucked behind the phone and drift outwards.
        g.position.set(x * s, (y + bob) * s + rig.y, c.z * s - 0.35 * (1 - s) + rig.z);
        g.rotation.y = c.phase + time * 0.35;
        g.rotation.x = 1.2 + c.phase * 0.2 + Math.sin(time * 0.6 + c.phase) * 0.15;
        g.scale.setScalar(c.s * (0.4 + 0.6 * s));
      });

      // Shadow tightens and darkens as the phone settles.
      const lift = Math.max(0, -rig.z) * 0.12 + Math.abs(rig.y);
      shadowMat.opacity = THREE.MathUtils.clamp(0.85 - lift, 0, 0.85) * rig.enter;
      shadow.scale.setScalar(1 + lift * 0.6);
      canvas.style.opacity = String(rig.enter);

      renderer.render(scene, camera);
      if (!screenshot || screenTex) sendReady();
    };

    let running = false;
    const start = () => {
      if (running || disposed) return;
      running = true;
      needsRender = true;
      gsap.ticker.add(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      gsap.ticker.remove(tick);
    };
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "100px 0px" }
    );
    io.observe(scene3d);

    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      cbRef.current.onError();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      scene3d.removeEventListener("pointermove", onMove);
      scene3d.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      const geos = new Set<THREE.BufferGeometry>();
      const mats = new Set<THREE.Material>();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          geos.add(m.geometry);
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => mats.add(x));
        }
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      screenTex?.dispose();
      shadowTex.dispose();
      envRT.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [rig, screenshot]);

  return <div ref={hostRef} className={styles.host} aria-hidden="true" />;
}
