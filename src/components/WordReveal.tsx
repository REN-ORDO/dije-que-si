"use client";

import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import { gsap, MQ } from "@/lib/motion";
import { IdeaPath } from "./illustrations/IdeaPath";
import { ClosingDoor } from "./illustrations/ClosingDoor";
import layout from "./illustrations/IdeaArtLayout.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Props = {
  id: string;
  kicker: string;
  /** Wrap phrases in *asterisks* to highlight them. */
  text: string;
  serif?: boolean;
  as?: "p" | "blockquote";
  /** Optional illustration beside (desktop) / below (mobile) the statement. */
  illustration?: "path" | "door";
  /** Giant outlined words sliding in the background. */
  marquee?: string[];
};

/** Total length of the scrubbed timeline, in arbitrary units (art uses fractions of it). */
const T = 10;

type Segment = { hl: boolean; words: string[] };

/** "a *b c*. d" → [{a}, {b c. (hl)}, {d}] — trailing punctuation stays with the phrase. */
function parse(text: string): Segment[] {
  const segs: Segment[] = [];
  let hl = false;
  for (const raw of text.split(" ")) {
    let w = raw;
    const opens = w.startsWith("*");
    if (opens) w = w.slice(1);
    const closes = /\*[.,;:!?…]*$/.test(w);
    if (closes) w = w.replace(/\*([.,;:!?…]*)$/, "$1");
    if (opens) hl = true;
    const last = segs[segs.length - 1];
    if (last && last.hl === hl) last.words.push(w);
    else segs.push({ hl, words: [w] });
    if (closes) hl = false;
  }
  return segs;
}

/** Large statement whose words light up as you scroll through it. */
export function WordReveal({ id, kicker, text, serif = false, as = "p", illustration, marquee }: Props) {
  const ref = useRef<HTMLElement>(null);
  const segments = parse(text);
  const Tag = as;

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia(root);
    mm.add({ any: "all", desktop: MQ.desktop, reduce: MQ.reduce }, (ctx) => {
      const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
      const ws = Array.from(root.querySelectorAll<HTMLElement>(".w"));
      const kick = root.querySelector(".reveal-kicker");
      const artRoot = root.querySelector("[data-art-root]");
      const unders = root.querySelectorAll<SVGPathElement>(".hl-under path");
      const rows = root.querySelectorAll<HTMLElement>(".marquee-row");
      if (reduce) {
        gsap.set(unders, { strokeDasharray: 1, strokeDashoffset: 0 });
        gsap.fromTo(
          [kick, root.querySelector(".reveal-text"), artRoot].filter(Boolean),
          { opacity: 0 },
          { opacity: 1, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: root, start: "top 75%", once: true } }
        );
        return;
      }
      gsap.fromTo(
        kick,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: root, start: "top 70%", toggleActions: "play none none reverse" },
        }
      );

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: desktop
          ? { trigger: root, start: "top top", end: "bottom bottom", scrub: 2 }
          : { trigger: root, start: "top 70%", end: "bottom 75%", scrub: 2 },
      });

      // Words light up one by one over the first ~78%.
      const n = Math.max(ws.length - 1, 1);
      const each = (T * 0.78) / n;
      ws.forEach((w, i) => {
        const isHl = w.classList.contains("hl");
        tl.fromTo(
          w,
          isHl ? { opacity: 0.1, y: 18, rotate: -3 } : { opacity: 0.13, y: 10 },
          {
            opacity: 1,
            y: 0,
            rotate: 0,
            duration: isHl ? 2 : 1.6,
            ease: isHl ? "back.out(1.8)" : "power2.out",
          },
          0.2 + i * each
        );
      });

      // Each highlighted phrase gets a hand-drawn underline once its last word lands.
      root.querySelectorAll<HTMLElement>(".hl-group").forEach((group) => {
        const last = Number(group.dataset.last ?? 0);
        const path = group.querySelector(".hl-under path");
        if (!path) return;
        tl.fromTo(
          path,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" },
          0.2 + last * each + 0.8
        );
      });

      // Background marquee drifts in opposite directions across the whole range.
      rows.forEach((row, i) => {
        tl.fromTo(row, { xPercent: i % 2 ? -30 : 0 }, { xPercent: i % 2 ? 0 : -30, duration: T, ease: "none" }, 0);
      });

      root.querySelectorAll<SVGElement>("[data-art]").forEach((el) => {
        const kind = el.dataset.art;
        const at = parseFloat(el.dataset.t ?? "0") * T;
        const dur = parseFloat(el.dataset.d ?? "0.12") * T;
        if (kind === "draw") {
          tl.fromTo(el, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: "none" }, at);
        } else if (kind === "pop") {
          tl.fromTo(
            el,
            { opacity: 0, scale: 0.55 },
            { opacity: 1, scale: 1, duration: Math.max(dur, 0.7), ease: "back.out(1.6)" },
            at
          );
        } else {
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: dur, ease: "sine.inOut" }, at);
        }
      });
      tl.set({}, {}, T); // pin the timeline length
    });
    return () => mm.revert();
  }, []);

  let wordIndex = -1;
  const totalWords = segments.reduce((a, s) => a + s.words.length, 0);

  return (
    <section
      ref={ref}
      id={id}
      className={`reveal-section${illustration ? ` ${layout.hasArt}` : ""}`}
      data-stop
      data-scrub
      data-section
      aria-label={kicker}
    >
      <div className="reveal-stage">
        {marquee && marquee.length > 0 && (
          <div className="marquee" aria-hidden="true">
            {[0, 1].map((r) => (
              <div key={r} className="marquee-row">
                {Array.from({ length: 4 }, (_, k) =>
                  (r ? [...marquee].reverse() : marquee).map((m, j) => (
                    <Fragment key={`${k}-${j}`}>
                      <span className={j === marquee.length - 1 && !r ? "is-accent" : undefined}>{m}</span>
                      <span className="dot">·</span>
                    </Fragment>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
        <p className="reveal-kicker">{kicker}</p>
        <Tag className={`reveal-text${serif ? " is-serif" : ""}`}>
          {segments.map((seg, si) => {
            const nodes = seg.words.map((w) => {
              wordIndex++;
              const i = wordIndex;
              return (
                <span key={i} className="w-wrap">
                  <span className={`w${seg.hl ? " hl" : ""}`} style={{ display: "inline-block" }}>
                    {w}
                  </span>
                  {i < totalWords - 1 ? " " : ""}
                </span>
              );
            });
            if (!seg.hl) return <Fragment key={si}>{nodes}</Fragment>;
            return (
              <span key={si} className="hl-group" data-last={wordIndex}>
                {nodes}
                <svg className="hl-under" viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true">
                  <path pathLength={1} d="M3 10 C40 4 80 14 120 8 S180 6 197 9" />
                </svg>
              </span>
            );
          })}
        </Tag>
        {illustration === "path" && <IdeaPath />}
        {illustration === "door" && <ClosingDoor />}
      </div>
    </section>
  );
}
