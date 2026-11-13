"use client";

import { ChapterLayout } from "@/components/ChapterLayout";
import { Bubbles } from "@/components/scenes/Bubbles";
import { chapter2 as c } from "@/content";
import { useScene } from "@/lib/useScene";

export function Chapter2() {
  const ref = useScene<HTMLElement>(({ tl, q }) => {
    const others = q(".bubble.other");
    const mine = q(".bubble.mine")[0];
    const fill = q(".mine-fill")[0];
    const labelA = q(".mine-label.a")[0];
    const labelB = q(".mine-label.b")[0];

    const sel = (n: string) => q(`[data-a="${n}"]`);
    const figd = sel("figd");
    const fig = sel("fig");
    const trail = sel("trail");
    const cloud = sel("cloud");
    const thought = sel("thought");
    const marks = sel("q");
    const rays = sel("rays");
    const ray = sel("ray");
    const spark = sel("spark");
    const tether = q(`[data-draw="tether"]`);

    // Figure draws on first, then the dashed tether up to the small bubble.
    tl.fromTo(
      figd,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.14, stagger: 0.04, ease: "power2.inOut" },
      0
    );
    tl.fromTo(
      tether,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.16, ease: "power2.inOut" },
      0.14
    );

    // Others pop in, staggered.
    tl.fromTo(
      others,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.14,
        stagger: 0.045,
        ease: "back.out(1.6)",
      },
      0.04
    );

    // Thought: trail dots, cloud draws on, text fades in while others crowd.
    tl.fromTo(
      trail,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.05, stagger: 0.04, ease: "back.out(1.6)" },
      0.2
    );
    tl.fromTo(
      cloud,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.2, ease: "power2.inOut" },
      0.28
    );
    tl.fromTo(
      thought,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" },
      0.42
    );

    // Question marks appear and drift.
    tl.fromTo(
      marks,
      { opacity: 0, scale: 0.6 },
      { opacity: 0.9, scale: 1, duration: 0.08, stagger: 0.05, ease: "back.out(1.6)" },
      0.3
    );
    tl.fromTo(
      marks,
      { y: 10 },
      { y: -16, duration: 0.3, stagger: 0.03, ease: "sine.inOut" },
      0.3
    );

    // Mine feels small: shrinks and wiggles.
    tl.to(mine, { scale: 0.72, duration: 0.12, ease: "power2.out" }, 0.34);
    tl.to(
      mine,
      {
        keyframes: { x: [0, -5, 5, -3, 3, 0], easeEach: "sine.inOut" },
        duration: 0.14,
      },
      0.4
    );

    // Questions fade as the bubble starts to grow.
    tl.to(
      marks,
      { opacity: 0, scale: 0.8, duration: 0.1, stagger: 0.02, ease: "power1.out" },
      0.58
    );
    tl.to([cloud, ...trail, ...thought], { opacity: 0.55, duration: 0.2 }, 0.6);

    // Fills with indigo and grows, pushing the rest outward.
    tl.to(fill, { opacity: 1, duration: 0.12, ease: "power2.out" }, 0.58);
    tl.to(mine, { scale: 2.5, duration: 0.32, ease: "power3.inOut" }, 0.58);
    tl.to(
      others,
      {
        x: (_i: number, el: Element) =>
          parseFloat((el as HTMLElement).dataset.dx ?? "0") * 120,
        y: (_i: number, el: Element) =>
          parseFloat((el as HTMLElement).dataset.dy ?? "0") * 120,
        scale: 0.8,
        opacity: 0.3,
        duration: 0.32,
        ease: "power3.inOut",
      },
      0.58
    );
    tl.to(fig, { y: -5, duration: 0.3, ease: "sine.inOut" }, 0.6);

    // Rays + sparkles radiate: "ganas de aprender".
    tl.fromTo(
      ray,
      { opacity: 0 },
      { opacity: 1, duration: 0.05, stagger: 0.012, ease: "power1.out" },
      0.7
    );
    tl.fromTo(
      rays,
      { scale: 0.88, rotate: -14 },
      { scale: 1, rotate: 10, duration: 0.3, ease: "sine.inOut" },
      0.7
    );
    tl.fromTo(
      spark,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.07, stagger: 0.05, ease: "back.out(1.6)" },
      0.8
    );

    // Label crossfade near the end.
    tl.to(labelA, { opacity: 0, duration: 0.08, ease: "power1.out" }, 0.78);
    tl.to(labelB, { opacity: 1, duration: 0.1, ease: "power1.out" }, 0.84);

    // Keep timeline length at ~1.
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
      <Bubbles
        others={c.others}
        mine={c.mine}
        mineGrown={c.mineGrown}
        thought={c.thought}
      />
    </ChapterLayout>
  );
}
