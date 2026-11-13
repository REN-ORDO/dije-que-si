"use client";

import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import { navItems } from "@/content";
import {
  MQ,
  ScrollTrigger,
  currentScroll,
  docTop,
  getStops,
  gsap,
  scrollToY,
  setLenis,
} from "@/lib/motion";

/**
 * Global chrome: smooth scroll, presentation keyboard controls,
 * progress bar and chapter index.
 */
export function Experience({ children }: { children: React.ReactNode }) {
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  // Smooth scroll + GSAP sync
  useEffect(() => {
    if (window.matchMedia(MQ.reduce).matches) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Progress + active chapter
  useEffect(() => {
    let tops: number[] = [];
    const measure = () => {
      tops = navItems.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? docTop(el) : Infinity;
      });
    };
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }
      const probe = y + window.innerHeight * 0.45;
      let idx = 0;
      tops.forEach((top, i) => {
        if (top <= probe) idx = i;
      });
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
    };
    measure();
    update();
    ScrollTrigger.addEventListener("refresh", measure);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Presentation controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;

      const forward =
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === "PageDown" ||
        (e.key === " " && !e.shiftKey);
      const back =
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "PageUp" ||
        (e.key === " " && e.shiftKey);

      if (e.key === " " && target.closest("button, a")) return;

      if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.().catch(() => {});
        return;
      }

      if (!forward && !back && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault();
      const stops = getStops();
      const y = currentScroll();
      let to: number | undefined;
      if (e.key === "Home") to = stops[0];
      else if (e.key === "End") to = stops[stops.length - 1];
      else if (forward) to = stops.find((s) => s > y + 4);
      else to = [...stops].reverse().find((s) => s < y - 4);
      if (to !== undefined) scrollToY(to);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) scrollToY(docTop(el));
  };

  return (
    <>
      <a className="skip-link" href={`#${navItems[1].id}`}>
        Saltar al contenido
      </a>
      <div className="progress" aria-hidden="true">
        <span ref={barRef} />
      </div>
      <nav className="rail" aria-label="Capítulos">
        <ol>
          {navItems.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => goTo(item.id)}
                aria-current={i === active ? "step" : undefined}
              >
                <span className="dot" aria-hidden="true" />
                <span className="label">{item.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mobile-chapter" aria-hidden="true">
        {String(active + 1).padStart(2, "0")} / {String(navItems.length).padStart(2, "0")}
      </div>
      {children}
      <div className="grain" aria-hidden="true" />
    </>
  );
}
