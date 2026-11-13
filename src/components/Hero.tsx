"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { hero, site } from "@/content";
import { gsap, MQ } from "@/lib/motion";
import { ParticleField } from "./ParticleField";
import { SplitTitle, assembleTitle } from "./SplitTitle";
import dynamic from "next/dynamic";
import sceneStyles from "./HeroScene3D.module.css";

const HeroScene3D = dynamic(() => import("./HeroScene3D"), { ssr: false });

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add({ any: "all", reduce: MQ.reduce }, (ctx) => {
      const { reduce } = ctx.conditions as { reduce: boolean };
      const chars = root.querySelectorAll(".char");
      const fades = root.querySelectorAll("[data-hero-fade]");
      const title = root.querySelector<HTMLElement>(".hero-title")!;

      if (reduce) {
        gsap.set(chars, { opacity: 1 });
        gsap.fromTo(fades, { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.1 });
        return;
      }

      const intro = assembleTitle(title, { delay: 0.25 });
      intro.fromTo(
        fades,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "expo.out" },
        "-=0.9"
      );

      // Leaving the hero: the title drifts up and recedes.
      gsap.to(".hero-main", {
        yPercent: -18,
        scale: 0.94,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <header ref={ref} id={hero.id} className="hero" data-stop data-section>
      <div className={sceneStyles.dust} aria-hidden="true">
        <ParticleField />
      </div>
      <div className="hero-glow" aria-hidden="true" />
      <HeroScene3D />
      <div className="hero-top" data-hero-fade>
        <span>{site.author}</span>
        <span className="hidden sm:inline">{site.authorLine}</span>
      </div>
      <div className="hero-main">
        <SplitTitle words={hero.title} accentIndex={hero.accentIndex} />
        <p className="hero-subtitle" data-hero-fade>
          {hero.subtitle}
        </p>
      </div>
      <div className="hero-bottom" data-hero-fade>
        <div className="scroll-cue">
          <span className="line" aria-hidden="true" />
          <span>Desliza</span>
        </div>
        <div className="keys" aria-hidden="true">
          <kbd>←</kbd>
          <kbd>→</kbd>
          <kbd>Espacio</kbd>
          <span>{site.keyboardHint}</span>
          <span>·</span>
          <kbd>F</kbd>
        </div>
      </div>
    </header>
  );
}
