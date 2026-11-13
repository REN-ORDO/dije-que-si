"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { closing, site } from "@/content";
import { gsap, MQ } from "@/lib/motion";
import { SplitTitle, assembleTitle } from "./SplitTitle";
import deco from "./illustrations/ClosingFinal.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Full-screen closing title: the "Dije que sí" assembles one last time. */
export function Final() {
  const ref = useRef<HTMLElement>(null);

  // Position the underline and sparkles relative to the accent word, in px.
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const main = root.querySelector<HTMLElement>(".final-main");
    const word = root.querySelector<HTMLElement>(".split-word.is-accent");
    const line = root.querySelector<SVGSVGElement>("[data-final-underline]");
    const sparks = root.querySelectorAll<SVGSVGElement>("[data-final-spark]");
    if (!main || !word || !line) return;
    const place = () => {
      const m = main.getBoundingClientRect();
      const r = word.getBoundingClientRect();
      if (!r.width) return;
      const h = Math.max(14, r.height * 0.2);
      const w = r.width * 0.92;
      const path = line.querySelector("path")!;
      line.setAttribute("viewBox", `0 0 ${w} ${h}`);
      path.setAttribute(
        "d",
        `M${w * 0.02} ${h * 0.6} C${w * 0.25} ${h * 0.15} ${w * 0.5} ${h * 0.95} ${w * 0.74} ${h * 0.4} S${w * 0.95} ${h * 0.55} ${w * 0.985} ${h * 0.2}`
      );
      path.setAttribute("stroke-width", String(Math.max(3, r.height * 0.045)));
      Object.assign(line.style, {
        left: `${r.left - m.left + r.width * 0.02}px`,
        top: `${r.bottom - m.top - h * 0.1}px`,
        width: `${w}px`,
        height: `${h}px`,
      });
      const s = Math.max(22, r.height * 0.2);
      const at = [
        [r.right - m.left - s * 0.1, r.top - m.top - s * 0.5, s],
        [r.right - m.left + s * 0.5, r.top - m.top + s * 0.9, s * 0.55],
      ];
      sparks.forEach((el, i) => {
        const [x, y, size] = at[i] ?? at[0];
        Object.assign(el.style, { left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px` });
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(main);
    document.fonts?.ready.then(place);
    return () => ro.disconnect();
  }, []);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add({ any: "all", reduce: MQ.reduce }, (ctx) => {
      const { reduce } = ctx.conditions as { reduce: boolean };
      const title = root.querySelector<HTMLElement>(".hero-title")!;
      const fades = root.querySelectorAll("[data-final-fade]");
      const decos = root.querySelectorAll("[data-final-deco]");
      const underline = root.querySelector("[data-final-underline] path");
      const sparks = root.querySelectorAll("[data-final-spark]");
      if (reduce) {
        gsap.fromTo([title, ...fades, ...decos], { opacity: 0 }, {
          opacity: 1, duration: 0.8, stagger: 0.1,
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        });
        return;
      }
      const tl = assembleTitle(title);
      const landed = tl.duration();
      // After the letters land: the accent underline draws, then sparkles pop in.
      tl.fromTo(
        underline,
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" },
        landed - 0.1
      );
      tl.fromTo(
        sparks,
        { opacity: 0, scale: 0.3, rotation: -25 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1, stagger: 0.25, ease: "back.out(1.6)" },
        landed + 0.9
      );
      tl.to(sparks, { rotation: 14, duration: 3, stagger: 0.3, ease: "sine.inOut" }, ">-0.2");
      tl.fromTo(fades, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "expo.out" }, "-=0.8");
      // "Este soy yo": the photo pops in, then the arrow draws toward it.
      const me = root.querySelector("[data-final-me]");
      if (me) {
        tl.fromTo(
          me.querySelector(".final-me-photo"),
          { opacity: 0, scale: 0.6, rotate: -8 },
          { opacity: 1, scale: 1, rotate: 0, duration: 1.1, ease: "back.out(1.7)" },
          landed + 1.2
        );
        tl.fromTo(
          me.querySelectorAll(".final-me-arrow path"),
          { strokeDasharray: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.8, stagger: 0.35, ease: "power2.inOut" },
          landed + 1.7
        );
        tl.fromTo(
          me.querySelector(".final-me-label"),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" },
          landed + 1.9
        );
      }
      // The closing should land briskly: play the whole intro faster.
      tl.timeScale(1.5);
      tl.pause(0);
      gsap.set(title.querySelectorAll(".char"), { opacity: 0 });
      const st = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          // Start as the section settles in; the intro runs briskly (timeScale).
          start: "top 40%",
          onEnter: () => tl.restart(),
          onLeaveBack: () => tl.pause(0),
        },
      });
      return () => st.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="final" data-stop aria-label="Final">
      <div className="hero-glow" aria-hidden="true" style={{ left: "-25vmax", right: "auto", top: "auto", bottom: "-35vmax" }} />
      <div className="final-main" style={{ position: "relative" }}>
        <div className={deco.deco} aria-hidden="true">
          <svg className={deco.underline} data-final-deco data-final-underline preserveAspectRatio="none">
            <path pathLength={1} d="M0 0" />
          </svg>
          <svg className={deco.sparkle} data-final-deco data-final-spark viewBox="-20 -20 40 40">
            <path d="M0 -17 C2 -6 5 -3 17 0 C5 3 2 6 0 17 C-2 6 -5 3 -17 0 C-5 -3 -2 -6 0 -17 Z" />
          </svg>
          <svg className={deco.sparkle} data-final-deco data-final-spark viewBox="-20 -20 40 40">
            <path d="M0 -17 C2 -6 5 -3 17 0 C5 3 2 6 0 17 C-2 6 -5 3 -17 0 C-5 -3 -2 -6 0 -17 Z" />
          </svg>
        </div>
        <SplitTitle as="h2" words={closing.finalTitle} accentIndex={closing.finalAccentIndex} />
        <div className="final-row">
          <p className="final-line" data-final-fade>
            {closing.finalLine}
          </p>
          {site.photo && (
            <figure className="final-me" data-final-me>
              <div className="final-me-photo">
                <span className="final-me-orbit" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={site.photo} alt={site.photoAlt} width={720} height={720} loading="lazy" />
              </div>
              <figcaption className="final-me-label">
                <svg className="final-me-arrow" viewBox="0 0 90 60" aria-hidden="true">
                  <path pathLength={1} d="M84 52 C70 54 40 50 26 30 C20 21 18 14 17 6" />
                  <path pathLength={1} d="M8 15 L17 5 L26 14" />
                </svg>
                {closing.photoLabel}
              </figcaption>
            </figure>
          )}
        </div>
      </div>
      <footer className="final-foot" data-final-fade>
        <strong>{site.author}</strong>
        <span>{site.authorLine}</span>
      </footer>
    </section>
  );
}
