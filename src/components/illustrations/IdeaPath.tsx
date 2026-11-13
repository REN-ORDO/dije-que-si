import styles from "./IdeaArtLayout.module.css";

const ROAD =
  "M64 468 C132 500 250 452 238 372 C228 300 100 318 160 240 C215 168 372 262 384 170 C392 112 470 118 530 74";

/**
 * A winding dotted road that draws on from a muted "?" to an accent star.
 * Elements carry data-art / data-t / data-d (fractions of the scroll timeline)
 * which WordReveal turns into a scrubbed timeline.
 */
export function IdeaPath() {
  return (
    <div className={styles.art} data-art-root aria-hidden="true">
      <svg viewBox="0 0 600 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <mask id="ideaRoadMask" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="520">
            <path
              d={ROAD}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={22}
              strokeLinecap="round"
              data-art="draw"
              data-t="0.12"
              data-d="0.78"
            />
          </mask>
        </defs>

        {/* start: a small muted question mark */}
        <g className={styles.pop} data-art="pop" data-t="0.02">
          <path className={styles.muted} d="M42 400 C40 378 80 376 79 400 C78 417 61 417 60 436" />
          <circle className={styles.muted} cx="60" cy="451" r="1.6" />
        </g>

        {/* the road itself, revealed by the mask */}
        <path
          d={ROAD}
          fill="none"
          stroke="#aaa49c"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeDasharray="0.1 10"
          mask="url(#ideaRoadMask)"
        />

        {/* milestones */}
        <g className={styles.pop} data-art="pop" data-t="0.33">
          <circle className={styles.surface} cx="238" cy="372" r="9" />
          <circle className={styles.muted} cx="238" cy="372" r="9" />
          <path className={styles.muted} d="M234 372 L237 375.5 L243 368" />
        </g>
        <g className={styles.pop} data-art="pop" data-t="0.5">
          <circle className={styles.surface} cx="160" cy="240" r="9" />
          <circle className={styles.muted} cx="160" cy="240" r="9" />
          <path className={styles.muted} d="M156 240 L159 243.5 L165 236" />
        </g>
        <g className={styles.pop} data-art="pop" data-t="0.76">
          <circle className={styles.surface} cx="384" cy="170" r="9" />
          <circle className={styles.muted} cx="384" cy="170" r="9" />
          <path className={styles.muted} d="M380 170 L383 173.5 L389 166" />
        </g>

        {/* end: the one accent element, a hand-drawn star with small rays */}
        <g className={styles.pop} data-art="pop" data-t="0.88" data-d="0.1">
          <path
            className={`${styles.accent} ${styles.soft}`}
            d="M530 43 L537 61 L555 62 L540.5 73.5 L546 91 L530 81 L514 92 L519.5 73.5 L505 62 L523.5 61 Z"
          />
          <path className={styles.accent} d="M564 40 L574 32 M570 62 L584 62 M500 36 L492 27" />
        </g>
      </svg>
    </div>
  );
}
