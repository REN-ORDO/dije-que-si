"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { gsap, MQ } from "@/lib/motion";
import styles from "./HeroScene3D.module.css";

const INDIGO = 0x7c83ff;
const CAM_Z = 9;
const FOV = 35;

/* ---------- procedural textures ---------- */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function codeTexture() {
  const { c, g } = makeCanvas(512, 320);
  const bg = g.createLinearGradient(0, 0, 0, 320);
  bg.addColorStop(0, "#14141c");
  bg.addColorStop(1, "#0b0b10");
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 320);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const indents = [0, 1, 1, 2, 2, 1, 2, 3, 3, 2, 1, 1, 0, 0, 1, 2];
  const colors = ["#7c83ff", "#aaa49c", "#f4f1ec", "#5c63d6"];
  indents.forEach((ind, i) => {
    let x = 36 + ind * 30;
    const y = 34 + i * 17;
    const segs = 1 + Math.floor(rnd() * 3);
    for (let s = 0; s < segs; s++) {
      const w = 28 + rnd() * 90;
      g.globalAlpha = 0.55;
      g.fillStyle = colors[Math.floor(rnd() * colors.length)];
      g.beginPath();
      g.roundRect(x, y, w, 7, 3);
      g.fill();
      x += w + 10;
    }
  });
  g.globalAlpha = 1;
  return toTexture(c);
}

function keyboardTexture() {
  const { c, g } = makeCanvas(256, 160);
  g.fillStyle = "#17171c";
  g.fillRect(0, 0, 256, 160);
  g.fillStyle = "#2b2b33";
  for (let r = 0; r < 5; r++) {
    for (let k = 0; k < 14; k++) {
      g.beginPath();
      g.roundRect(8 + k * 17.3, 10 + r * 20, 14, 15, 2);
      g.fill();
    }
  }
  return toTexture(c);
}

function phoneTexture() {
  const { c, g } = makeCanvas(256, 512);
  const bg = g.createLinearGradient(0, 0, 256, 512);
  bg.addColorStop(0, "#2a2b66");
  bg.addColorStop(0.5, "#14141c");
  bg.addColorStop(1, "#0b0b10");
  g.fillStyle = bg;
  g.fillRect(0, 0, 256, 512);
  g.fillStyle = "#aaa49c";
  g.font = "500 22px system-ui, sans-serif";
  g.fillText("Saldo", 28, 110);
  g.fillStyle = "#f4f1ec";
  g.font = "700 50px system-ui, sans-serif";
  g.fillText("$12,480", 28, 170);
  g.fillStyle = INDIGO_CSS;
  g.globalAlpha = 0.9;
  [0.4, 0.62, 0.5, 0.8, 0.66].forEach((v, i) => {
    g.beginPath();
    g.roundRect(28 + i * 42, 400 - v * 160, 28, v * 160, 6);
    g.fill();
  });
  g.globalAlpha = 1;
  return toTexture(c);
}

const INDIGO_CSS = "#7c83ff";

function zipperTexture() {
  const { c, g } = makeCanvas(32, 256);
  g.fillStyle = "#1a1a1f";
  g.fillRect(0, 0, 32, 256);
  g.fillStyle = "#b9b9c4";
  for (let i = 0; i < 32; i++) {
    const left = i % 2 === 0;
    g.fillRect(left ? 2 : 17, i * 8 + 1, 13, 6);
  }
  return toTexture(c);
}

/* ---------- object builders ---------- */

type Mats = {
  titanium: THREE.MeshPhysicalMaterial;
  graphite: THREE.MeshPhysicalMaterial;
  indigo: THREE.MeshPhysicalMaterial;
  glow: THREE.MeshBasicMaterial;
  coin: THREE.MeshPhysicalMaterial;
};

const rbox = (w: number, h: number, d: number, r: number, m: THREE.Material) =>
  new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m);

function buildSeat(m: Mats) {
  const g = new THREE.Group();
  const pad = rbox(1, 0.1, 0.9, 0.04, m.titanium);
  g.add(pad);
  const back = new THREE.Group();
  back.position.set(0, 0.42, -0.42);
  back.rotation.x = -0.12;
  back.add(rbox(1, 0.7, 0.09, 0.04, m.titanium));
  const rim = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.75, 0.02), m.glow);
  rim.position.z = -0.055;
  back.add(rim);
  g.add(back);
  const legGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.62, 12);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(legGeo, m.graphite);
      leg.position.set(sx * 0.4, -0.36, sz * 0.34);
      g.add(leg);
    }
  }
  g.position.y = 0;
  const wrap = new THREE.Group();
  g.position.y = -0.05;
  wrap.add(g);
  return wrap;
}

function buildLaptop(m: Mats) {
  const g = new THREE.Group();
  g.add(rbox(1.4, 0.06, 0.95, 0.03, m.titanium));
  const keys = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.5),
    new THREE.MeshBasicMaterial({ map: keyboardTexture(), toneMapped: false, color: 0x888888 })
  );
  keys.rotation.x = -Math.PI / 2;
  keys.position.set(0, 0.032, -0.1);
  g.add(keys);
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.03, -0.47);
  hinge.rotation.x = -0.26;
  const lid = rbox(1.4, 0.92, 0.05, 0.03, m.titanium);
  lid.position.y = 0.46;
  hinge.add(lid);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.28, 0.8),
    new THREE.MeshBasicMaterial({ map: codeTexture(), toneMapped: false, color: 0xbbbbbb })
  );
  screen.position.set(0, 0.46, 0.027);
  hinge.add(screen);
  g.add(hinge);
  g.position.y = -0.3;
  const wrap = new THREE.Group();
  wrap.add(g);
  return wrap;
}

function braceGeometry(sign: 1 | -1) {
  const pts = [
    [0.2, 0.9], [0.0, 0.8], [-0.02, 0.5], [-0.04, 0.18], [-0.22, 0.0],
    [-0.04, -0.18], [-0.02, -0.5], [0.0, -0.8], [0.2, -0.9],
  ].map(([x, y]) => new THREE.Vector3(x * sign, y, 0));
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  return new THREE.TubeGeometry(curve, 72, 0.07, 12, false);
}

function buildBraces(m: Mats) {
  const g = new THREE.Group();
  const l = new THREE.Mesh(braceGeometry(1), m.indigo);
  l.position.x = -0.55;
  const r = new THREE.Mesh(braceGeometry(-1), m.indigo);
  r.position.x = 0.55;
  g.add(l, r);
  return g;
}

function buildZip(m: Mats) {
  const g = new THREE.Group();
  g.add(rbox(1.1, 0.78, 0.12, 0.05, m.titanium));
  const stripe = new THREE.Mesh(
    new THREE.PlaneGeometry(0.1, 0.6),
    new THREE.MeshBasicMaterial({ map: zipperTexture(), toneMapped: false, color: 0xaaaaaa })
  );
  stripe.position.set(0, 0.08, 0.062);
  g.add(stripe);
  const tab = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 12, 24), m.indigo);
  tab.position.set(0, -0.26, 0.07);
  g.add(tab);
  return g;
}

function buildPhone(m: Mats) {
  const g = new THREE.Group();
  g.add(rbox(0.5, 1.0, 0.07, 0.07, m.graphite));
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.44, 0.94),
    new THREE.MeshBasicMaterial({ map: phoneTexture(), toneMapped: false, color: 0xcccccc })
  );
  screen.position.z = 0.037;
  g.add(screen);
  return g;
}

function buildCoin(m: Mats, tinted = false) {
  const prof = [
    [0, -0.03], [0.22, -0.03], [0.235, -0.04], [0.34, -0.04], [0.38, -0.02],
    [0.38, 0.02], [0.34, 0.04], [0.235, 0.04], [0.22, 0.03], [0, 0.03],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(prof, 48);
  const mesh = new THREE.Mesh(geo, tinted ? m.indigo : m.coin);
  mesh.rotation.x = Math.PI / 2;
  const g = new THREE.Group();
  g.add(mesh);
  return g;
}

function buildTorus(m: Mats) {
  return new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.075, 24, 64), m.indigo);
}

function buildSphere(m: Mats, r: number) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), m.indigo);
}

/* ---------- layout ---------- */

type Place = [nx: number, ny: number, z: number, size: number];
type Spec = {
  build: (m: Mats) => THREE.Object3D;
  desk?: Place;
  mob?: Place;
  rot: [number, number, number];
  spin: number;
  amp: number;
  speed: number;
};

const SPECS: Spec[] = [
  { build: buildSeat, desk: [0.8, 0.14, 0, 0.95], mob: [0.05, 0.52, 0, 0.9], rot: [0.18, -0.7, 0.04], spin: 0.1, amp: 0.1, speed: 0.7 },
  { build: buildLaptop, desk: [0.64, -0.56, -0.5, 0.92], mob: [0.08, -0.56, -0.5, 0.9], rot: [0.38, -0.5, 0], spin: 0.06, amp: 0.09, speed: 0.6 },
  { build: buildBraces, desk: [0.96, 0.52, -1.2, 0.72], mob: [-0.6, 0.46, -1, 0.7], rot: [0.1, 0.35, 0.05], spin: 0.12, amp: 0.08, speed: 0.8 },
  { build: buildZip, desk: [0.9, -0.22, -1.5, 0.85], rot: [-0.2, 0.5, 0.25], spin: 0.08, amp: 0.1, speed: 0.55 },
  { build: buildPhone, desk: [0.22, -0.74, -1, 0.85], mob: [-0.6, -0.5, -1, 0.72], rot: [0.2, 0.45, -0.18], spin: 0.1, amp: 0.1, speed: 0.75 },
  { build: (m) => buildCoin(m), desk: [0.98, -0.64, 0.5, 0.6], mob: [0.62, -0.42, 0, 0.5], rot: [0.5, 0, 0.3], spin: 0.5, amp: 0.1, speed: 0.9 },
  { build: (m) => buildCoin(m), desk: [0.42, 0.7, -1, 0.45], mob: [0.62, 0.62, -1, 0.42], rot: [0.9, 0.3, 0], spin: 0.6, amp: 0.08, speed: 1.0 },
  { build: (m) => buildCoin(m, true), desk: [0.76, -0.86, -0.5, 0.5], rot: [0.4, 0, -0.4], spin: 0.55, amp: 0.1, speed: 0.85 },
  { build: (m) => buildCoin(m), desk: [-0.9, -0.82, -1, 0.5], rot: [0.7, 0.2, 0.2], spin: 0.4, amp: 0.08, speed: 0.8 },
  { build: buildTorus, desk: [0.66, 0.74, -1.2, 0.72], rot: [1.0, 0.4, 0], spin: 0.25, amp: 0.1, speed: 0.65 },
  { build: (m) => buildSphere(m, 0.2), desk: [0.5, -0.32, 1.5, 0.7], rot: [0, 0, 0], spin: 0, amp: 0.14, speed: 0.9 },
  { build: (m) => buildSphere(m, 0.22), desk: [-0.93, 0.66, -1.5, 0.7], rot: [0, 0, 0], spin: 0, amp: 0.12, speed: 0.7 },
];

type Item = {
  obj: THREE.Object3D;
  spec: Spec;
  place: Place;
  base: THREE.Vector3;
  dir: THREE.Vector2;
  phase: number;
  st: { e: number };
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Three.js props of the journey, floating behind the hero title. */
export default function HeroScene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const mm = gsap.matchMedia(host);
    mm.add({ any: "all", reduce: MQ.reduce, desktop: MQ.desktop }, (ctx) => {
      const { reduce, desktop } = ctx.conditions as { reduce: boolean; desktop: boolean };

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
      } catch {
        return; // No WebGL: the 2D particle field remains.
      }
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.55;

      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
      camera.position.set(0, 0, CAM_Z);

      const key = new THREE.DirectionalLight(0xfff1e4, 2.4);
      key.position.set(3, 4, 5);
      const rim = new THREE.DirectionalLight(INDIGO, 3.2);
      rim.position.set(-4, 2, -3);
      const glowPt = new THREE.PointLight(INDIGO, 18, 14, 2);
      glowPt.position.set(3.5, 0.5, 1);
      scene.add(key, rim, glowPt);

      const mats: Mats = {
        titanium: new THREE.MeshPhysicalMaterial({ color: 0x2b2b31, metalness: 0.85, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
        graphite: new THREE.MeshPhysicalMaterial({ color: 0x1b1b20, metalness: 0.7, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
        indigo: new THREE.MeshPhysicalMaterial({ color: INDIGO, emissive: 0x3a40c0, emissiveIntensity: 0.45, metalness: 0.35, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.12 }),
        glow: new THREE.MeshBasicMaterial({ color: INDIGO, toneMapped: false }),
        coin: new THREE.MeshPhysicalMaterial({ color: 0x4a4a52, metalness: 0.9, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
      };

      const items: Item[] = SPECS.flatMap((spec) => {
        const place = desktop ? spec.desk : spec.mob;
        if (!place) return [];
        const obj = spec.build(mats);
        const holder = new THREE.Group();
        holder.add(obj);
        holder.visible = false;
        scene.add(holder);
        return [{
          obj: holder,
          spec,
          place,
          base: new THREE.Vector3(),
          dir: new THREE.Vector2(place[0], place[1]).normalize(),
          phase: Math.random() * Math.PI * 2,
          st: { e: reduce ? 1 : 0 },
        }];
      });

      // Every material, once, for the global scroll fade.
      const allMats = new Set<THREE.Material>();
      scene.traverse((o) => {
        const mat = (o as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((x) => allMats.add(x));
        else if (mat) allMats.add(mat);
      });

      const u = desktop ? 1 : 0.55;
      const tanHalf = Math.tan((FOV * Math.PI) / 360);
      let fade = 1;
      let appliedFade = -1;
      const scroll = { s: 0 };

      const layout = () => {
        const w = canvas.clientWidth || 1;
        const h = canvas.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        for (const it of items) {
          const dist = CAM_Z - it.place[2];
          const vh = 2 * tanHalf * dist;
          const vw = vh * camera.aspect;
          it.base.set((it.place[0] * vw) / 2, (it.place[1] * vh) / 2, it.place[2]);
        }
      };

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

      const applyFade = () => {
        if (Math.abs(fade - appliedFade) < 0.002) return;
        appliedFade = fade;
        const transparent = fade < 0.999;
        allMats.forEach((m) => {
          if (m.transparent !== transparent) {
            m.transparent = transparent;
            m.needsUpdate = true;
          }
          m.opacity = fade;
        });
      };

      const frame = (now: number) => {
        const t = now / 1000;
        const s = scroll.s;
        fade = 1 - clamp01((s - 0.1) / 0.6);
        applyFade();

        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;
        camera.position.x = pointer.x * 0.7;
        camera.position.y = -pointer.y * 0.4;
        camera.lookAt(0, 0, 0);

        for (const it of items) {
          const { spec, base, dir, place, st } = it;
          const e = st.e;
          it.obj.visible = e > 0.002 && fade > 0.003;
          if (!it.obj.visible) continue;
          const bob = Math.sin(t * spec.speed + it.phase) * spec.amp;
          it.obj.position.set(
            base.x + dir.x * s * 3.6 * u,
            base.y + bob + dir.y * s * 2.4 * u,
            base.z + s * 5.5 - (1 - e) * 7
          );
          it.obj.rotation.set(
            spec.rot[0] + Math.sin(t * 0.4 + it.phase) * 0.08 + s * 0.8,
            spec.rot[1] + t * spec.spin + (1 - e) * 1.2 + s * 1.2,
            spec.rot[2] + Math.cos(t * 0.35 + it.phase) * 0.06
          );
          it.obj.scale.setScalar(Math.max(0.0001, e) * place[3] * u * (1 + s * 0.2));
        }
        renderer.render(scene, camera);
      };

      layout();

      // Pointer parallax (desktop, motion allowed).
      const onMove = (e: PointerEvent) => {
        pointer.tx = e.clientX / window.innerWidth - 0.5;
        pointer.ty = e.clientY / window.innerHeight - 0.5;
      };

      let raf = 0;
      let inView = true;
      let tabVisible = !document.hidden;
      let running = false;
      const tick = (now: number) => {
        frame(now);
        raf = requestAnimationFrame(tick);
      };
      const sync = () => {
        const should = inView && tabVisible && !reduce;
        if (should && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!should && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      };

      const ro = new ResizeObserver(() => {
        layout();
        if (reduce) frame(performance.now());
      });
      ro.observe(host);

      const onContextLost = (e: Event) => e.preventDefault();
      canvas.addEventListener("webglcontextlost", onContextLost);

      let io: IntersectionObserver | undefined;
      let onVis: (() => void) | undefined;
      let tl: gsap.core.Timeline | undefined;

      if (reduce) {
        frame(performance.now()); // one static frame
      } else {
        io = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          sync();
        });
        io.observe(host);
        onVis = () => {
          tabVisible = !document.hidden;
          sync();
        };
        document.addEventListener("visibilitychange", onVis);
        if (desktop) window.addEventListener("pointermove", onMove, { passive: true });

        // Entrance after the title assembles: fly in from depth, staggered.
        tl = gsap.timeline({ delay: 1.2 });
        items.forEach((it, i) => {
          tl!.to(it.st, { e: 1, duration: 1.1, ease: "back.out(1.6)" }, i * 0.09);
        });

        // Leaving the hero: drift apart, come forward, fade.
        gsap.to(scroll, {
          s: 1,
          ease: "none",
          scrollTrigger: { trigger: host, start: "top top", end: "bottom top", scrub: true },
        });
        sync();
      }

      return () => {
        running = false;
        cancelAnimationFrame(raf);
        tl?.kill();
        io?.disconnect();
        ro.disconnect();
        if (onVis) document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("webglcontextlost", onContextLost);
        scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          mesh.geometry?.dispose();
        });
        allMats.forEach((m) => {
          (m as THREE.MeshBasicMaterial).map?.dispose();
          m.dispose();
        });
        envRT.dispose();
        pmrem.dispose();
        renderer.dispose();
      };
    });

    return () => mm.revert();
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
