"use client";

import { ChapterLayout } from "@/components/ChapterLayout";
import { Timeline } from "@/components/scenes/Timeline";
import { chapter4 as c } from "@/content";
import { useScene } from "@/lib/useScene";

export function Chapter4() {
  const ref = useScene<HTMLElement>(({ tl, q }) => {
    const nodes = q(".tl-node");
    const dots = q(".tl-dot-on");
    const labels = q(".tl-node > div");
    const num = q(".tl-num")[0];
    const suffix = q(".tl-suffix")[0];
    const stat = q(".tl-stat")[0];
    const steps = q("[data-ch4-step]");
    const stepLabels = q("[data-ch4-label]");
    const fig = q("[data-ch4-figure]")[0];
    const browser = q("[data-ch4-browser]")[0];
    const people = q("[data-ch4-person]");
    const n = nodes.length;
    const draw = 0.3;

    // Milestone timeline.
    tl.fromTo(
      q(".tl-fill.h"),
      { scaleX: 0 },
      { scaleX: 1, duration: draw, ease: "power1.inOut" },
      0
    );
    tl.fromTo(
      q(".tl-fill.v"),
      { scaleY: 0 },
      { scaleY: 1, duration: draw, ease: "power1.inOut" },
      0
    );
    nodes.forEach((_, i) => {
      const at = n > 1 ? draw * Math.pow(i / (n - 1), 0.9) : 0;
      tl.fromTo(
        dots[i],
        { opacity: 0, scale: 0.3 },
        { opacity: 1, scale: 1, duration: 0.08, ease: "back.out(2)" },
        at
      );
      tl.fromTo(
        labels[i],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.1, ease: "power2.out" },
        at + 0.02
      );
    });

    // Staircase + climbing figure.
    const stepAt = (i: number) => 0.18 + i * 0.1;
    steps.forEach((s, i) => {
      tl.fromTo(
        s,
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDasharray: 1, strokeDashoffset: 0, duration: 0.09, ease: "power1.inOut" },
        stepAt(i)
      );
      tl.fromTo(
        stepLabels[i],
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" },
        stepAt(i) + 0.05
      );
    });
    if (fig) {
      const stops = (fig.dataset.stops ?? "")
        .split(";")
        .map((p) => p.split(",").map(Number));
      tl.fromTo(
        fig,
        { x: stops[0][0], y: stops[0][1], opacity: 0 },
        { opacity: 1, duration: 0.06, ease: "power2.out" },
        0.14
      );
      for (let i = 0; i < stops.length - 1; i++) {
        const t = stepAt(i) + 0.08;
        const d = 0.1;
        const apex = Math.min(stops[i][1], stops[i + 1][1]) - 14;
        tl.to(fig, { x: stops[i + 1][0], duration: d, ease: "power1.inOut" }, t);
        tl.to(
          fig,
          {
            keyframes: [
              { y: apex, duration: d * 0.5, ease: "sine.out" },
              { y: stops[i + 1][1], duration: d * 0.5, ease: "sine.in" },
            ],
          },
          t
        );
      }
    }

    // DerbiPlay proof slides in as its milestone lights up.
    if (browser) {
      tl.fromTo(
        browser,
        { opacity: 0, y: 50, z: -160, rotationX: 14, rotationY: -8 },
        {
          opacity: 1,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          duration: 0.2,
          ease: "power3.out",
        },
        draw + 0.02
      );
    }

    // Counter + people grid, in sync.
    const statAt = 0.58;
    const countDur = 0.37;
    tl.fromTo(
      stat,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" },
      statAt
    );
    const order = people
      .map((_, i) => i)
      .sort((a, b) => ((a * 37) % 101) - ((b * 37) % 101));
    const proxy = { v: 0 };
    tl.to(
      proxy,
      {
        v: c.stat.value,
        duration: countDur,
        ease: "power2.out",
        onUpdate: () => {
          num.textContent = Math.round(proxy.v).toLocaleString("es-CO");
          const k = (proxy.v / c.stat.value) * people.length;
          order.forEach((idx, j) => {
            people[idx].style.opacity = String(Math.max(0, Math.min(1, k - j)));
          });
        },
      },
      statAt
    );
    tl.fromTo(
      suffix,
      { scale: 1, transformOrigin: "50% 80%" },
      { scale: 1.25, duration: 0.04, ease: "power2.out" },
      statAt + countDur
    );
    tl.to(
      suffix,
      { scale: 1, duration: 0.05, ease: "back.out(2)" },
      statAt + countDur + 0.04
    );
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
    >
      <Timeline
        milestones={c.milestones}
        roles={c.roles}
        stat={c.stat}
        screenshot={c.screenshot}
        screenshotAlt={c.screenshotAlt}
        screenshotUrl={c.screenshotUrl}
      />
    </ChapterLayout>
  );
}
