"use client";

import { gsap } from "@/lib/motion";
import { useScene } from "@/lib/useScene";
import { ChapterLayout } from "@/components/ChapterLayout";
import { Seats, ME_ORIGIN_PCT } from "@/components/scenes/Seats";
import { Ch1Fork } from "@/components/illustrations/Ch1Fork";
import forkStyles from "@/components/illustrations/Ch1Fork.module.css";
import { chapter1 } from "@/content";

export function Chapter1() {
  const ref = useScene<HTMLElement>(({ tl, q }) => {
    const seats = q(".seat");
    const others = q(".seat:not(.is-me)");
    const lit = q(".is-me .seat-lit");
    const svg = q(".seats-svg");
    const glow = q(".me-glow");
    const label = q(".me-label");
    const draw = (k: string) => q(`[data-ch1-draw="${k}"]`);
    const pop = (k: string) => q(`[data-ch1-pop="${k}"]`);
    const trunk = draw("trunk");
    const left = draw("left");
    const right = draw("right");
    const hat = pop("hat");
    const laptop = pop("laptop");
    const sun = pop("sun");
    const txtLeft = pop("lbl-left");
    const txtRight = pop("lbl-right");
    const txtNote = pop("note");

    // Zoom the <svg> itself (HTML-level) around my seat.
    gsap.set(svg, { transformOrigin: ME_ORIGIN_PCT });
    gsap.set([...trunk, ...left, ...right], { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set([...hat, ...laptop, ...sun], { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });
    gsap.set([...txtLeft, ...txtRight, ...txtNote], { opacity: 0, y: 8 });

    // Seats rise in from back to front.
    tl.from(
      seats,
      { y: 50, opacity: 0, duration: 0.12, ease: "power3.out", stagger: 0.006 },
      0
    );
    // Everyone else fades back.
    tl.to(others, { opacity: 0.4, duration: 0.12, ease: "power2.inOut" }, 0.2);
    // Camera pushes toward my seat.
    tl.to(svg, { scale: 1.5, duration: 0.26, ease: "power3.inOut" }, 0.24);
    // My seat lights up.
    tl.to(lit, { opacity: 1, duration: 0.14, ease: "power2.out" }, 0.44);
    tl.to(glow, { opacity: 1, duration: 0.18, ease: "power3.out" }, 0.44);
    tl.fromTo(
      label,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.1, ease: "back.out(1.7)" },
      0.56
    );

    // Fork in the road: the path draws, two branches split off.
    tl.to(trunk, { strokeDashoffset: 0, duration: 0.08, ease: "power2.out" }, 0.62);
    tl.to(left, { strokeDashoffset: 0, duration: 0.1, ease: "power2.inOut" }, 0.7);
    tl.to(hat, { opacity: 1, scale: 1, duration: 0.07, ease: "back.out(1.6)" }, 0.78);
    tl.to(txtLeft, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.8);
    tl.to(right, { strokeDashoffset: 0, duration: 0.1, ease: "power2.inOut" }, 0.76);
    tl.to(laptop, { opacity: 1, scale: 1, duration: 0.07, ease: "back.out(1.6)" }, 0.86);
    tl.to(txtRight, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.88);
    tl.to(sun, { opacity: 1, scale: 1, duration: 0.07, ease: "back.out(1.6)" }, 0.92);
    tl.to(txtNote, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.94);
    // Keep the timeline length stable.
    tl.to({}, { duration: 0.01 }, 0.99);
  });

  return (
    <ChapterLayout
      ref={ref}
      id={chapter1.id}
      number={chapter1.number}
      title={chapter1.title}
      blocks={chapter1.blocks}
      sceneAlt={chapter1.sceneAlt}
    >
      <div className={forkStyles.stack}>
        <Seats label={chapter1.seatLabel} />
        <Ch1Fork {...chapter1.fork} />
      </div>
    </ChapterLayout>
  );
}
