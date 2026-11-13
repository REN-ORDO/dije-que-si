"use client";

import { gsap } from "@/lib/motion";
import { useScene } from "@/lib/useScene";
import { ChapterLayout } from "@/components/ChapterLayout";
import { Seats, ME_ORIGIN_PCT, ME_INDEX, SEAT_GRID } from "@/components/scenes/Seats";
import { Ch6Marks } from "@/components/illustrations/Ch6Marks";
import marksStyles from "@/components/illustrations/Ch6Marks.module.css";
import { chapter6 } from "@/content";

export function Chapter6() {
  const ref = useScene<HTMLElement>(({ tl, q }) => {
    const others = q(".seat:not(.is-me)");
    const litAll = q(".seat .seat-lit");
    const litMine = q(".is-me .seat-lit");
    const svg = q(".seats-svg");
    const overlay = q("[data-ch6-overlay]");
    const zoomers = [...svg, ...overlay];
    const glow = q(".me-glow");
    const label = q(".me-label");
    const circle = q("[data-ch6-circle]");
    const arrow = q("[data-ch6-arrow]");
    const sparks = q("[data-ch6-spark]");

    // Initial state equals the end of chapter 1.
    gsap.set(zoomers, { transformOrigin: ME_ORIGIN_PCT, scale: 1.5 });
    gsap.set(others, { opacity: 0.4 });
    gsap.set(litAll, { opacity: 0 });
    gsap.set(litMine, { opacity: 1 });
    gsap.set(glow, { opacity: 1 });
    gsap.set(label, { opacity: 1 });
    gsap.set([...circle, ...arrow], { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(sparks, { opacity: 0, scale: 0.2, transformOrigin: "50% 50%" });

    // Marker circle around my seat while the camera is still close.
    tl.to(circle, { strokeDashoffset: 0, duration: 0.14, ease: "power2.inOut" }, 0.04);

    // Camera pulls back; others return to presence.
    tl.to(zoomers, { scale: 1, duration: 0.3, ease: "power3.inOut" }, 0.22);
    tl.to(others, { opacity: 0.75, duration: 0.2, ease: "power2.out" }, 0.34);

    // "Now it's your turn": a wave from my seat lights everyone softly.
    // Stagger over the full grid (including my seat) so distances are right;
    // my own seat keeps its full glow.
    tl.to(
      litAll,
      {
        opacity: (i: number) => (i === ME_INDEX ? 1 : 0.4),
        duration: 0.14,
        ease: "power2.out",
        stagger: { amount: 0.26, grid: SEAT_GRID, from: ME_INDEX },
      },
      0.5
    );

    // Sparkles pop over some lit seats as the wave passes.
    tl.to(
      sparks,
      { opacity: 1, scale: 1, duration: 0.08, ease: "back.out(1.6)", stagger: 0.04 },
      0.66
    );
    // Arrow: your turn.
    tl.to(arrow, { strokeDashoffset: 0, duration: 0.14, ease: "power2.inOut" }, 0.84);
    tl.to({}, { duration: 0.01 }, 0.99);
  });

  return (
    <ChapterLayout
      ref={ref}
      id={chapter6.id}
      number={chapter6.number}
      title={chapter6.title}
      blocks={chapter6.blocks}
      sceneAlt={chapter6.sceneAlt}
      flipped
    >
      <div className={marksStyles.stack}>
        <Seats label={chapter6.seatLabel} />
        <Ch6Marks />
      </div>
    </ChapterLayout>
  );
}
