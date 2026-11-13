import { ME_CENTER, seatCenter } from "@/components/scenes/Seats";
import styles from "./Ch6Marks.module.css";

/** [row, col] of lit seats that get a sparkle. */
const SPARKLE_SEATS: [number, number][] = [
  [1, 2],
  [2, 5],
  [3, 1],
  [3, 5],
  [4, 3],
  [1, 5],
];

const cx = (...c: string[]) => c.join(" ");

/**
 * Overlay for chapter 6, same viewBox as the seats: a marker circle around my
 * seat, sparkles over some seats and an arrow toward the others ("your turn").
 * It is scaled in sync with the seats <svg> by Chapter6.
 */
export function Ch6Marks() {
  const { x, y } = ME_CENTER;
  return (
    <svg className={styles.overlay} data-ch6-overlay viewBox="0 0 820 520" aria-hidden="true">
      {/* marker circle with a slight overshoot, like it was drawn by hand */}
      <path
        data-ch6-circle
        pathLength={1}
        className={cx(styles.line, styles.accent)}
        d={`M${x - 14} ${y - 54} C${x + 30} ${y - 62} ${x + 52} ${y - 28} ${x + 48} ${y + 8} C${x + 44} ${y + 48} ${x + 10} ${y + 58} ${x - 14} ${y + 52} C${x - 50} ${y + 44} ${x - 58} ${y - 4} ${x - 48} ${y - 30} C${x - 40} ${y - 50} ${x - 6} ${y - 62} ${x + 30} ${y - 58}`}
      />
      {SPARKLE_SEATS.map(([r, c]) => {
        const p = seatCenter(r, c);
        const k = 0.7 + p.s * 0.5;
        return (
          <g key={`${r}-${c}`} transform={`translate(${p.x.toFixed(1)} ${(p.y - 26 * p.s).toFixed(1)}) scale(${k.toFixed(2)})`}>
            <g data-ch6-spark>
              <path className={styles.line} d="M0 -12 C1 -4 4 -1 12 0 C4 1 1 4 0 12 C-1 4 -4 1 -12 0 C-4 -1 -1 -4 0 -12 Z" />
              <path className={styles.line} d="M13 -13 L13 -7 M10 -10 L16 -10" />
            </g>
          </g>
        );
      })}
      {/* arrow from my seat toward the others */}
      <path
        data-ch6-arrow
        pathLength={1}
        className={styles.line}
        d={`M${x + 42} ${y - 48} C${x + 74} ${y - 112} ${x + 150} ${y - 122} ${x + 204} ${y - 84} M${x + 204} ${y - 84} L${x + 196} ${y - 100} M${x + 204} ${y - 84} L${x + 186} ${y - 86}`}
      />
    </svg>
  );
}
