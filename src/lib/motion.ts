"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/** Media queries shared by CSS (globals.css) and JS. Keep them in sync. */
export const MQ = {
  desktop: "(min-width: 900px) and (min-height: 560px)",
  reduce: "(prefers-reduced-motion: reduce)",
};

let lenis: Lenis | null = null;
export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};
export const getLenis = () => lenis;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Smoothly scroll to a Y position. Duration scales with distance. */
export function scrollToY(y: number) {
  const current = lenis ? lenis.targetScroll : window.scrollY;
  const dist = Math.abs(y - current);
  const vh = window.innerHeight;
  if (lenis) {
    const duration = Math.min(4, Math.max(1.4, (dist / vh) * 0.9));
    lenis.scrollTo(y, { duration, easing: easeInOutCubic });
  } else {
    window.scrollTo({ top: y, behavior: "auto" });
  }
}

/** Absolute top of an element in document coordinates. */
export const docTop = (el: Element) =>
  el.getBoundingClientRect().top + window.scrollY;

/**
 * Presentation stops: the top of every [data-stop] element and, for tall
 * scrubbed sections, the point where their scene animation completes.
 */
export function getStops(): number[] {
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  const stops: number[] = [];
  document.querySelectorAll<HTMLElement>("[data-stop]").forEach((el) => {
    const top = docTop(el);
    stops.push(top);
    if (el.hasAttribute("data-scrub") && el.offsetHeight > vh * 1.3) {
      stops.push(top + el.offsetHeight - vh);
    }
  });
  return Array.from(
    new Set(stops.map((s) => Math.round(Math.min(Math.max(s, 0), max))))
  ).sort((a, b) => a - b);
}

export function currentScroll() {
  return lenis ? lenis.targetScroll : window.scrollY;
}
