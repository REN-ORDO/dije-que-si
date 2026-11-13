import styles from "./Ch5Doodles.module.css";

/**
 * Doodles around the phone (receipt, eye/sparkline, arrow, underline). The
 * coins are real 3D objects in the WebGL scene, so they are not drawn here.
 * Rendered as a fragment so every wrapper is a direct child of .phone-scene.
 * Hooks: [data-ch5-float] (+ data-depth, [data-ch5-drift], [data-ch5-draw]),
 * [data-ch5-strike], [data-ch5-spark], [data-ch5-arrow], [data-ch5-underline].
 */
export function Ch5Doodles() {
  return (
    <>
      <div
        className={`${styles.item} ${styles.receipt}`}
        data-ch5-float
        data-depth="0.9"
        aria-hidden="true"
      >
        <div className={styles.drift} data-ch5-drift>
          <svg viewBox="0 0 70 96" focusable="false">
            <path
              data-ch5-draw
              pathLength={1}
              d="M8 6 C25 4 45 8 62 6 L61 80 L55 87 L49 80 L42 88 L35 81 L28 88 L21 81 L14 87 L8 80 C9 55 7 30 8 6 Z"
            />
            <path
              data-ch5-draw
              pathLength={1}
              className={styles.muted}
              d="M16 20 H54 M16 30 H46 M16 40 H52 M16 50 H40 M16 60 H48"
            />
            <path
              data-ch5-draw
              pathLength={1}
              className={styles.muted}
              d="M30 6 L26 24 L34 38 M54 44 L44 58 L50 70"
            />
            <path
              data-ch5-strike
              pathLength={1}
              className={styles.thick}
              d="M-2 66 C20 54 44 52 74 30"
            />
          </svg>
        </div>
      </div>

      <div
        className={`${styles.item} ${styles.eye}`}
        data-ch5-float
        data-depth="1"
        aria-hidden="true"
      >
        <div className={styles.drift} data-ch5-drift>
          <svg viewBox="0 0 80 50" focusable="false">
            <path
              data-ch5-draw
              pathLength={1}
              d="M4 27 C20 7 60 7 76 27 C60 47 20 47 4 27 Z"
            />
            <path
              data-ch5-draw
              pathLength={1}
              className={styles.muted}
              d="M40 16 C47 16 52 21 52 27 C52 34 46 39 40 38 C33 38 28 33 28 27 C28 21 33 16 40 16 Z"
            />
            <path
              data-ch5-draw
              pathLength={1}
              className={styles.muted}
              d="M22 12 L19 6 M40 8 V1 M58 12 L61 6"
            />
            <path
              data-ch5-spark
              pathLength={1}
              d="M32 32 L37 28 L40 30 L48 22"
            />
          </svg>
        </div>
      </div>

      <div className={`${styles.item} ${styles.arrow}`} aria-hidden="true">
        <svg viewBox="0 0 120 90" focusable="false">
          <path
            data-ch5-arrow
            pathLength={1}
            className={styles.accent}
            d="M6 10 C30 3 82 12 100 66 M86 57 L100 70 L110 54"
          />
        </svg>
      </div>

      <div className={`${styles.item} ${styles.underline}`} aria-hidden="true">
        <svg viewBox="0 0 200 20" focusable="false">
          <path
            data-ch5-underline
            pathLength={1}
            className={styles.accent}
            d="M4 11 C40 5 90 15 130 8 S186 8 196 11"
          />
          <path
            data-ch5-underline
            pathLength={1}
            className={styles.accent}
            d="M30 17 C70 14 120 18 160 15"
          />
        </svg>
      </div>
    </>
  );
}
