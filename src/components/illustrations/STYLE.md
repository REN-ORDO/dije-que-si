# Illustration style guide

All illustrations are code-drawn inline SVG line art. They must look like one hand drew them.

- Stroke only. 1.75px strokes, `stroke-linecap="round"`, `stroke-linejoin="round"`, `vector-effect="non-scaling-stroke"` where the SVG scales.
- Colors: ink `#F4F1EC` (opacity 0.85) for main lines, muted `#AAA49C` for secondary lines, accent `#7C83FF` for exactly ONE highlighted element per illustration. Fills only as subtle accents: `#1E1E21` (surface) or `rgb(124 131 255 / 0.16)`.
- Slightly hand-drawn: prefer curves with gentle irregularity over perfect geometry (a cubic with a small offset, not a perfect circle). No clip-art, no emojis, no logos, no photos of people. Simple abstract figures are fine.
- Labels: few words, only from `src/content.ts`, `font-family: var(--font-mono)`, small, letter-spacing 0.08em, uppercase optional.
- Draw-on motion: give paths `pathLength="1"` and animate `strokeDasharray: 1` + `strokeDashoffset: 1 → 0` in the chapter timeline. Pop-ins use `back.out(1.6)`; drifting uses `sine.inOut`. Never linear for motion.
- Animate only transform, opacity and stroke-dashoffset. Every illustration is `aria-hidden="true"` (the chapter has `sceneAlt`).
- Pacing: scenes now scrub across 400vh on desktop. Spread beats out; don't cram everything in the first half. Reduced motion jumps the timeline to its end, so the final frame must look complete.
- Styling goes in a CSS module next to the component (`*.module.css`). Never edit `src/app/globals.css`.
- Be responsive: the scene must work at 375px wide (stacked layout) and at 1920×1080 (visual column ≈ 45vw × 78vh).
