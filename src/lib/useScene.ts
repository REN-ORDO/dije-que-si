"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, MQ } from "./motion";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type SceneContext = {
  tl: gsap.core.Timeline;
  q: (selector: string) => HTMLElement[];
  root: HTMLElement;
  desktop: boolean;
  reduce: boolean;
};

/**
 * Wires a chapter: text reveals on enter (time based) and a scene timeline
 * scrubbed by scroll. On desktop the section is tall with a sticky stage;
 * on small screens the scene scrubs while it passes through the viewport.
 * With reduced motion the scene jumps to its final state and fades in.
 *
 * Build the timeline in normalized time (roughly 0 → 1).
 */
export function useScene<T extends HTMLElement>(
  build: (ctx: SceneContext) => void
) {
  const ref = useRef<T>(null);
  const buildRef = useRef(build);
  buildRef.current = build;

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);

    mm.add({ any: "all", desktop: MQ.desktop, reduce: MQ.reduce }, (ctx) => {
      const { desktop, reduce } = ctx.conditions as {
        desktop: boolean;
        reduce: boolean;
      };
      const q = (s: string) =>
        Array.from(root.querySelectorAll<HTMLElement>(s));
      const reveals = q("[data-reveal]");
      const scene = q("[data-scene]")[0] ?? root;

      if (reduce) {
        gsap.fromTo(
          [...reveals, scene],
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            stagger: 0.08,
            ease: "power1.out",
            scrollTrigger: { trigger: root, start: "top 75%", once: true },
          }
        );
      } else if (desktop) {
        gsap.fromTo(
          reveals,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.6,
            stagger: 0.16,
            ease: "expo.out",
            scrollTrigger: {
              trigger: root,
              start: "top 65%",
              toggleActions: "play none none reverse",
            },
          }
        );
      } else {
        reveals.forEach((el) =>
          gsap.fromTo(
            el,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.3,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 90%" },
            }
          )
        );
      }

      const tl = gsap.timeline({
        paused: reduce,
        defaults: { ease: "power2.inOut" },
        scrollTrigger: reduce
          ? undefined
          : desktop
            ? {
                trigger: root,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.6,
                invalidateOnRefresh: true,
              }
            : {
                trigger: scene,
                start: "top 85%",
                end: "bottom 30%",
                scrub: 1.6,
                invalidateOnRefresh: true,
              },
      });

      buildRef.current({ tl, q, root, desktop, reduce });

      const ghost = q(".ghost-num");
      if (ghost.length && !reduce) {
        tl.fromTo(
          ghost,
          { yPercent: 12 },
          { yPercent: -12, ease: "none", duration: tl.duration() || 1 },
          0
        );
      }

      if (reduce) tl.progress(1);
    });

    return () => mm.revert();
  }, []);

  return ref;
}
