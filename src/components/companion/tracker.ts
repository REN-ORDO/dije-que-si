/**
 * Reads the story layout from the DOM so the 3D companion can sit next to
 * (never on top of) each section's text, and knows how far each section's
 * scene has progressed.
 */

export const SECTION_IDS = [
  "idea",
  "capitulo-1",
  "capitulo-2",
  "capitulo-3",
  "capitulo-4",
  "capitulo-6",
  "cierre",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** One measurement of a section, in viewport pixels. */
export type Sample = {
  /** Presence 0 → 1: how much the section owns the viewport. */
  w: number;
  /** Scene progress 0 → 1 (mirrors the chapter's own scrub range). */
  p: number;
  /** Anchor for the companion's center, viewport px. */
  x: number;
  y: number;
  /** Target on-screen size of the companion, px. */
  size: number;
};

export const emptySample = (): Sample => ({ w: 0, p: 0, x: 0, y: 0, size: 0 });

/** Poses used with reduced motion: one readable still per section. */
const STATIC_P: Record<SectionId, number> = {
  idea: 0.5,
  "capitulo-1": 1,
  "capitulo-2": 1,
  "capitulo-3": 0.45,
  "capitulo-4": 0.7,
  "capitulo-6": 1,
  cierre: 1,
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

type Mode = { vw: number; vh: number; desktop: boolean; reduce: boolean };

/**
 * Desktop: the object docks in the outer top corner of the visual column
 * (the side away from the text), small and behind the 2D scene.
 * Mobile: it rides in the gap between the text and the visual, right aligned,
 * scrolling with the content like an inline accent.
 */
export function sampleSection(el: HTMLElement, id: SectionId, mode: Mode, out: Sample) {
  const { vw, vh, desktop, reduce } = mode;
  const r = el.getBoundingClientRect();
  const overlap = Math.min(r.bottom, vh) - Math.max(r.top, 0);
  const f = clamp01(overlap / Math.max(1, Math.min(vh, r.height)));
  out.w = smoothstep(0.12, 0.85, f);
  if (out.w <= 0) return;

  const reveal = id === "idea" || id === "cierre";
  const text = el.querySelector(reveal ? ".reveal-text" : ".chapter-text");
  const vis = el.querySelector(reveal ? "[data-art-root]" : ".chapter-visual");
  if (!text || !vis) {
    out.w = 0;
    return;
  }
  const v = vis.getBoundingClientRect();

  if (desktop) {
    const size = clamp(vh * 0.23, 130, 260);
    out.size = size;
    out.p = clamp01(-r.top / Math.max(1, r.height - vh));
    // Chapters: prefer the empty band under (or over) the text column, so
    // the 2D scene keeps its space. Measured relative to the stage, which is
    // sticky, so the spot does not drift while the chapter is pinned.
    if (!reveal) {
      const t = text.getBoundingClientRect();
      const stage = (el.querySelector(".stage") ?? el).getBoundingClientRect();
      const below = stage.bottom - t.bottom;
      const above = t.top - stage.top;
      const need = size * 1.3;
      if (below >= need || above >= need) {
        out.x = t.right - size * 0.75;
        out.y = below >= need ? t.bottom + Math.min(below * 0.5, size * 1.1) : t.top - Math.min(above * 0.5, size * 1.1);
        return finish(out, id, reduce);
      }
    }
    // Fallback (and the word-reveal statements): the outer top corner of the
    // visual column, away from the text.
    const flipped = el.classList.contains("is-flipped");
    out.x = flipped ? v.left + size * 0.5 : v.right - size * 0.5;
    out.y = Math.max(v.top + size * 0.55, size * 0.75);
  } else {
    const t = text.getBoundingClientRect();
    // Highlighted words overflow their line box; use the lowest glyph.
    const words = reveal ? text.querySelectorAll(".w") : null;
    const lastWord = words && words.length ? words[words.length - 1] : null;
    const textBottom = Math.max(t.bottom, lastWord ? lastWord.getBoundingClientRect().bottom : 0);
    const size = clamp(vw * 0.21, 72, 128);
    const gutter = Math.max(16, t.left);
    out.size = size;
    out.x = vw - gutter - size * 0.42;
    // never ride up into the last line of text
    out.y = Math.max((textBottom + v.top) / 2, textBottom + size * 0.5 + 8);
    out.p = clamp01((vh * 0.85 - v.top) / (vh * 0.55 + v.height));
  }
  finish(out, id, reduce);
}

function finish(out: Sample, id: SectionId, reduce: boolean) {
  if (reduce) out.p = STATIC_P[id];
}
