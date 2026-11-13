import styles from "./IdeaArtLayout.module.css";

const TRAIL = "M70 490 C150 458 232 492 330 438";

/** An open door with soft accent light spilling out and a path leading to it. */
export function ClosingDoor() {
  return (
    <div className={styles.art} data-art-root aria-hidden="true">
      <svg viewBox="0 0 600 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="closingDoorGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7c83ff" stopOpacity="0.34" />
            <stop offset="1" stopColor="#7c83ff" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="closingDoorSpill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7c83ff" stopOpacity="0.3" />
            <stop offset="1" stopColor="#7c83ff" stopOpacity="0" />
          </linearGradient>
          <mask id="closingTrailMask" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="520">
            <path
              d={TRAIL}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={22}
              strokeLinecap="round"
              data-art="draw"
              data-t="0.3"
              data-d="0.3"
            />
          </mask>
        </defs>

        {/* light: opening glow, floor spill and a few rays (the accent element) */}
        <g data-art="fade" data-t="0.62" data-d="0.3">
          <path d="M300 130 L421 132 L423 400 L300 400 Z" fill="url(#closingDoorGlow)" />
          <path d="M300 400 L423 401 L545 502 L188 502 Z" fill="url(#closingDoorSpill)" />
          <path
            className={styles.accent}
            d="M440 176 L520 152 M444 250 L548 250 M440 324 L524 350"
            strokeOpacity="0.55"
          />
        </g>

        {/* ground */}
        <path
          className={styles.muted}
          d="M60 401 C200 407 400 397 548 403"
          pathLength={1}
          data-art="draw"
          data-t="0"
          data-d="0.18"
        />

        {/* frame */}
        <path className={styles.ink} d="M299 128 C297 220 302 320 299 400" pathLength={1} data-art="draw" data-t="0.08" data-d="0.14" />
        <path className={styles.ink} d="M299 128 C340 122 382 127 422 130" pathLength={1} data-art="draw" data-t="0.16" data-d="0.12" />
        <path className={styles.ink} d="M422 130 C425 220 420 320 423 401" pathLength={1} data-art="draw" data-t="0.22" data-d="0.14" />

        {/* the open door panel, swung toward us */}
        <path
          className={`${styles.ink} ${styles.surface}`}
          d="M299 128 L244 150 C242 240 247 330 245 384 L299 400"
          pathLength={1}
          data-art="draw"
          data-t="0.34"
          data-d="0.2"
        />
        <g data-art="fade" data-t="0.5" data-d="0.12">
          <path className={styles.muted} d="M262 182 C261 230 263 290 262 338" />
          <circle className={styles.muted} cx="254" cy="272" r="3" />
        </g>

        {/* steps */}
        <path className={styles.muted} d="M280 413 C330 415 382 412 442 414" pathLength={1} data-art="draw" data-t="0.4" data-d="0.14" />
        <path className={styles.muted} d="M260 428 C330 431 402 427 464 430" pathLength={1} data-art="draw" data-t="0.46" data-d="0.14" />

        {/* dotted path leading to the door */}
        <path
          d={TRAIL}
          fill="none"
          stroke="#aaa49c"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeDasharray="0.1 10"
          mask="url(#closingTrailMask)"
        />
      </svg>
    </div>
  );
}
