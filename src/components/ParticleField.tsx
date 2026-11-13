"use client";

import { useEffect, useRef } from "react";
import { MQ } from "@/lib/motion";

type P = { x: number; y: number; bx: number; by: number; ox: number; oy: number; r: number; a: number; c: string; ph: number };

/** Quiet dust field that parts around the cursor. Pauses off-screen. */
export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia(MQ.reduce).matches;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, t = 0;
    let particles: P[] = [];
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const seed = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(170, Math.round((w * h) / 9000));
      particles = Array.from({ length: count }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const accent = Math.random() < 0.12;
        return {
          x, y, bx: x, by: y, ox: 0, oy: 0,
          r: Math.random() * 1.4 + 0.5,
          a: Math.random() * 0.45 + 0.12,
          c: accent ? "124,131,255" : "244,241,236",
          ph: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      const R = 150;
      for (const p of particles) {
        const driftX = Math.sin(t * 0.0004 + p.ph) * 14;
        const driftY = Math.cos(t * 0.0003 + p.ph) * 10;
        const dx = p.bx + driftX - mouse.x;
        const dy = p.by + driftY - mouse.y;
        const d = Math.hypot(dx, dy);
        let tx = 0, ty = 0;
        if (d < R && d > 0.01) {
          const f = (1 - d / R) ** 2 * 60;
          tx = (dx / d) * f;
          ty = (dy / d) * f;
        }
        p.ox += (tx - p.ox) * 0.08;
        p.oy += (ty - p.oy) * 0.08;
        p.x = p.bx + driftX + p.ox;
        p.y = p.by + driftY + p.oy;
        const near = d < R ? 1 - d / R : 0;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${Math.min(1, p.a + near * 0.5)})`;
        ctx.arc(p.x, p.y, p.r + near * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      t = now;
      draw();
      if (visible) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.tx = -9999;
      mouse.ty = -9999;
    };

    seed();
    if (reduce) {
      draw();
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const ro = new ResizeObserver(seed);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
