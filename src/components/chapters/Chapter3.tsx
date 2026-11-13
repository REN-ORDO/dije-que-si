"use client";

import { ChapterLayout } from "@/components/ChapterLayout";
import { Tokens } from "@/components/scenes/Tokens";
import { chapter3 as c } from "@/content";
import { useScene } from "@/lib/useScene";

export function Chapter3() {
  const ref = useScene<HTMLElement>(({ tl, q }) => {
    const sel = (n: string) => q(`[data-a="${n}"]`);
    const draw = (n: string) => q(`[data-draw="${n}"]`);

    const wrap = q(".tokens")[0];
    const composer = q(".composer")[0];
    const promptText = q("[class*='promptText']")[0];
    const skels = sel("skel");
    const shines = sel("shine");
    const cells = sel("cell");
    const pct = sel("pct")[0];
    const stamp = sel("stamp")[0];
    const editor = q(".editor")[0];
    const lines = q(".code-line");
    const zip = q(".zip")[0];
    const sent = q(".sent")[0];

    const flyer = sel("flyer");
    const flyerd = sel("flyerd");
    const people = sel("person");
    const pin = sel("pin");
    const headA = sel("headA");
    const headB = sel("headB");
    const plane = sel("plane");

    // ---- Doodles at the start: flyer draws on, people appear ----
    tl.fromTo(
      flyerd,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.06, stagger: 0.025, ease: "power2.inOut" },
      0
    );
    tl.fromTo(
      [...pin, ...people],
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.05, stagger: 0.03, ease: "back.out(1.6)" },
      0.06
    );

    // ---- Beat 1 (0 - 0.28): prompt, generation, battery drains, stall ----
    const len = Number(promptText?.dataset.len ?? 0) || 1;
    tl.fromTo(
      promptText,
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 0.05, ease: `steps(${len})` },
      0
    );
    // Skeleton lines "generate" one after another with a shimmer.
    tl.fromTo(
      skels,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.06, stagger: 0.035, ease: "power2.out" },
      0.05
    );
    tl.fromTo(
      shines,
      { x: "-100%" },
      { x: "100%", duration: 0.06, stagger: 0.035, ease: "sine.inOut" },
      0.07
    );
    // Cells blink out one by one, the last one stutters (low battery).
    cells.forEach((cell, i) => {
      const last = i === cells.length - 1;
      tl.to(
        cell,
        {
          keyframes: {
            opacity: last ? [1, 0.2, 1, 0.25, 1, 0] : [1, 0.3, 1, 0],
            easeEach: "sine.inOut",
          },
          duration: last ? 0.045 : 0.03,
        },
        0.03 + i * 0.01
      );
    });
    // Percentage counts down in sync with the cells.
    const proxy = { v: 100 };
    tl.to(
      proxy,
      {
        v: 0,
        duration: 0.14,
        ease: "none",
        onUpdate: () => {
          if (pct) pct.textContent = `${Math.round(proxy.v)}%`;
        },
      },
      0.04
    );
    // Generation stalls: skeletons freeze and go muted.
    tl.to(skels, { opacity: 0.35, duration: 0.04, ease: "power1.out" }, 0.18);
    // Gentle shake + stamp.
    tl.to(
      composer,
      {
        keyframes: { x: [0, -7, 7, -5, 5, -2, 0], easeEach: "sine.inOut" },
        duration: 0.06,
      },
      0.19
    );
    tl.fromTo(
      stamp,
      { opacity: 0, scale: 1.8, rotate: -14 },
      { opacity: 1, scale: 1, rotate: -6, duration: 0.05, ease: "back.out(1.6)" },
      0.2
    );
    // 0.25 - 0.3: the disappointment holds.

    // ---- Transition: composer leaves, editor arrives from the other side ----
    tl.to(flyer, { opacity: 0.5, duration: 0.1 }, 0.3);
    tl.to(
      composer,
      { x: -90, rotate: -6, y: 20, opacity: 0, duration: 0.08, ease: "power2.in" },
      0.3
    );
    tl.fromTo(
      draw("arrowA"),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.07, ease: "power2.inOut" },
      0.31
    );
    tl.fromTo(
      headA,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.02, ease: "power2.out" },
      0.38
    );
    tl.fromTo(
      editor,
      { opacity: 0, x: 80, scale: 0.96 },
      { opacity: 1, x: 0, scale: 1, duration: 0.09, ease: "power3.out" },
      0.34
    );

    // ---- Typing (0.4 - 0.56) ----
    const lens = lines.map((l) => Number(l.dataset.len ?? 0));
    const total = lens.reduce((a, b) => a + b, 0) || 1;
    const typeSpan = 0.16;
    let t = 0.4;
    lines.forEach((line, i) => {
      const l = lens[i];
      if (l === 0) {
        tl.set(line, { clipPath: "inset(0 0% 0 0)" }, t);
        return;
      }
      const dur = (typeSpan * l) / total;
      tl.fromTo(
        line,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: dur, ease: `steps(${l})` },
        t
      );
      t += dur;
    });

    // ---- Compress editor into the zip (0.56 - 0.66) ----
    tl.to(editor, { scaleY: 0.88, duration: 0.04, ease: "power2.inOut" }, 0.56);
    tl.to(
      editor,
      {
        x: () => wrap.offsetWidth * 0.12,
        y: () => wrap.offsetHeight * 0.22,
        scale: 0.2,
        opacity: 0,
        duration: 0.07,
        ease: "power2.inOut",
      },
      0.6
    );
    tl.fromTo(
      draw("arrowB"),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.07, ease: "power2.inOut" },
      0.6
    );
    tl.fromTo(
      headB,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.02, ease: "power2.out" },
      0.67
    );
    tl.fromTo(
      zip,
      { scale: 0.3, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.06, ease: "back.out(1.6)" },
      0.64
    );

    // ---- Zip holds still with a gentle float (0.66 - 0.8) ----
    tl.to(zip, { y: -7, duration: 0.07, ease: "sine.inOut" }, 0.7);
    tl.to(zip, { y: 0, duration: 0.07, ease: "sine.inOut" }, 0.77);

    // ---- Fly-off + paper-plane trail (0.8 - 0.94) ----
    tl.to(
      zip,
      {
        x: () => wrap.offsetWidth * -0.07,
        y: () => wrap.offsetHeight * -0.336,
        rotate: -22,
        scale: 0.4,
        opacity: 0,
        duration: 0.14,
        ease: "power2.inOut",
      },
      0.8
    );
    tl.fromTo(
      draw("trail"),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.14, ease: "power2.inOut" },
      0.8
    );
    tl.fromTo(
      plane,
      { scale: 0, opacity: 0, rotate: 18 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.06, ease: "back.out(1.6)" },
      0.9
    );

    // ---- Sent (0.92 - 1) ----
    tl.fromTo(
      sent,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.07, ease: "power2.out" },
      0.92
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
      <Tokens
        tokenLabel={c.tokenLabel}
        tokenEmpty={c.tokenEmpty}
        editorFile={c.editorFile}
        code={c.code}
        zipName={c.zipName}
        sentLabel={c.sentLabel}
      />
    </ChapterLayout>
  );
}
