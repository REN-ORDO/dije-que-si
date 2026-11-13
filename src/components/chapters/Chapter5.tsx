"use client";

import { ChapterLayout } from "@/components/ChapterLayout";
import { useRef } from "react";
import { RING_CIRCUMFERENCE } from "@/components/scenes/Phone";
import { Phone3D } from "@/components/scenes/Phone3D";
import { createPhoneRig } from "@/components/scenes/Phone3DRig";
import { chapter5 as c } from "@/content";
import { useScene } from "@/lib/useScene";

export function Chapter5() {
  // Plain object tweened by the timeline and read by the WebGL scene.
  const rig = useRef(createPhoneRig()).current;

  const ref = useScene<HTMLElement>(({ tl, q }) => {
    // ---- 3D phone (WebGL). Beat 1: enter from depth, rotating. ----
    tl.fromTo(
      rig,
      { rotY: -1.2, rotX: 0.35, rotZ: -0.12, y: -0.3, z: -3.2 },
      {
        rotY: -0.25,
        rotX: 0.08,
        rotZ: 0,
        y: 0,
        z: 0,
        duration: 0.45,
        ease: "power3.out",
      },
      0
    );
    tl.fromTo(rig, { enter: 0 }, { enter: 1, duration: 0.2, ease: "power2.out" }, 0.02);
    // Beat 2: slow turn so reflections sweep across the glass.
    tl.to(rig, { rotY: 0.2, rotX: 0.03, duration: 0.55, ease: "sine.inOut" }, 0.45);
    // Beat 3: coins drift out from behind the phone.
    tl.fromTo(
      rig,
      { coinSpread: 0 },
      { coinSpread: 1, duration: 0.4, ease: "power2.out" },
      0.3
    );

    // ---- CSS phone (fallback: no WebGL / reduced motion) ----
    const phone = q(".phone");
    const ring = q(".ring-progress");
    const cards = q(".float-card");

    tl.fromTo(
      phone,
      {
        rotationY: -70,
        rotationX: 25,
        rotationZ: -8,
        y: 180,
        z: -300,
        opacity: 0,
      },
      {
        rotationY: -14,
        rotationX: 6,
        rotationZ: 0,
        y: 0,
        z: 0,
        opacity: 1,
        duration: 0.45,
        ease: "power3.out",
      },
      0
    );
    tl.to(
      phone,
      { rotationY: 10, rotationX: 2, duration: 0.55, ease: "sine.inOut" },
      0.45
    );

    if (ring.length) {
      tl.fromTo(
        ring,
        { strokeDashoffset: RING_CIRCUMFERENCE },
        {
          strokeDashoffset: RING_CIRCUMFERENCE * 0.28,
          duration: 0.3,
          ease: "power2.out",
        },
        0.35
      );
    }

    // One tween per card: a staggered fromTo does not immediate-render its
    // later targets, which left the second card visible before its beat.
    cards.forEach((card, i) => {
      tl.fromTo(
        card,
        { opacity: 0, z: -200, y: 40, scale: 0.8 },
        {
          opacity: 1,
          z: 0,
          y: 0,
          scale: 1,
          duration: 0.22,
          ease: "back.out(1.6)",
        },
        0.55 + i * 0.12
      );
    });

    // Doodles: pop in with depth, then drift gently (parallax by depth).
    const draw = (
      sel: string,
      at: number,
      duration: number,
      stagger = 0
    ) => {
      q(sel).forEach((el, i) =>
        tl.fromTo(
          el,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          {
            strokeDasharray: 1,
            strokeDashoffset: 0,
            duration,
            ease: "power1.inOut",
          },
          at + i * stagger
        )
      );
    };

    q("[data-ch5-float]").forEach((el, i) => {
      const d = Number(el.dataset.depth ?? 1);
      const at = 0.5 + i * 0.08;
      tl.fromTo(
        el,
        { opacity: 0, z: (d - 0.9) * 140 - 260, y: 60 * d, scale: 0.7 },
        {
          opacity: 1,
          z: (d - 0.9) * 140,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "back.out(1.6)",
        },
        at
      );
      const paths = Array.from(
        el.querySelectorAll<SVGPathElement>("[data-ch5-draw]")
      );
      paths.forEach((path, j) =>
        tl.fromTo(
          path,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          {
            strokeDasharray: 1,
            strokeDashoffset: 0,
            duration: 0.18,
            ease: "power1.inOut",
          },
          at + 0.04 + j * 0.03
        )
      );
      const drift = el.querySelector<HTMLElement>("[data-ch5-drift]");
      if (drift) {
        const dir = i % 2 ? 1 : -1;
        tl.fromTo(
          drift,
          { y: 16 * d, rotation: -5 * dir },
          { y: -26 * d, rotation: 5 * dir, duration: 1, ease: "sine.inOut" },
          0
        );
      }
    });

    draw("[data-ch5-strike]", 0.64, 0.12);
    draw("[data-ch5-spark]", 0.72, 0.1);
    draw("[data-ch5-arrow]", 0.78, 0.12);
    draw("[data-ch5-underline]", 0.88, 0.1, 0.03);
    tl.set({}, {}, 1);
  });

  return (
    <ChapterLayout
      ref={ref}
      id={c.id}
      number={c.number}
      title={c.title}
      blocks={c.blocks}
      sceneAlt={c.sceneAlt}
      flipped
    >
      <Phone3D app={c.app} rig={rig} />
    </ChapterLayout>
  );
}
