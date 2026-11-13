import styles from "./Ch4People.module.css";

const COLS = 16;
const ROWS = 6;
const CW = 20;
const CH = 24;
/** A few glyphs are drawn in accent (illustrative only). */
const ACCENT = new Set([9, 26, 41, 58, 77]);

const HEAD =
  "M10 3.4 C12.2 3.3 13.8 5 13.7 7.1 C13.6 9.2 11.9 10.6 9.9 10.5 C7.9 10.4 6.4 8.9 6.5 6.9 C6.6 4.9 8.1 3.5 10 3.4 Z";
const BODY = "M3.6 21.5 C3.4 15.5 6 12.8 10 12.9 C14 12.8 16.6 15.4 16.4 21.5";

/**
 * Grid of tiny person glyphs. Faint ghosts are always visible; the
 * [data-ch4-person] layers fill in with the counter. Density only, no exact count.
 */
export function Ch4People() {
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => i);
  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${COLS * CW} ${ROWS * CH}`}
      aria-hidden="true"
      focusable="false"
    >
      {cells.map((i) => {
        const x = (i % COLS) * CW;
        const y = Math.floor(i / COLS) * CH;
        const tone = ACCENT.has(i) ? styles.accent : styles.ink;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path className={styles.ghost} d={HEAD} />
            <path className={styles.ghost} d={BODY} />
            <g data-ch4-person className={styles.on}>
              <path className={tone} d={HEAD} />
              <path className={tone} d={BODY} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
