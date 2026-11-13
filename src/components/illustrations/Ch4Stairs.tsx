import styles from "./Ch4Stairs.module.css";

type Props = { roles?: string[] };

const W = 440;
const H = 236;
const LEFT = 34;
const RIGHT = 6;
const BASE = 214;
const TOP = 34;

/** Splits long labels into two balanced lines. */
function splitLabel(s: string): string[] {
  if (s.length <= 14 || !s.includes(" ")) return [s];
  const mid = s.length / 2;
  let best = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) {
      best = i;
    }
  }
  return [s.slice(0, best), s.slice(best + 1)];
}

/**
 * Hand-drawn staircase, one step per role, with a small abstract figure that
 * climbs it. Timeline hooks: [data-ch4-step], [data-ch4-label],
 * [data-ch4-figure] (its `data-stops` lists the "x,y;x,y" resting points).
 */
export function Ch4Stairs({ roles = [] }: Props) {
  if (!roles.length) return null;
  const n = roles.length;
  const stepW = (W - LEFT - RIGHT) / n;
  const rise = (BASE - TOP) / n;
  const stops: [number, number][] = [[16, BASE]];

  const steps = roles.map((role, i) => {
    const x0 = LEFT + i * stepW;
    const x1 = x0 + stepW;
    const yPrev = BASE - i * rise;
    const yT = BASE - (i + 1) * rise;
    stops.push([x0 + stepW * 0.5, yT]);
    const d =
      `M${x0} ${yPrev} C${x0 + 1.6} ${yPrev - rise * 0.35} ${x0 - 1.2} ${yT + rise * 0.3} ${x0 + 0.5} ${yT} ` +
      `C${x0 + stepW * 0.3} ${yT - 1.8} ${x0 + stepW * 0.7} ${yT + 1.6} ${x1} ${yT - 0.4}`;
    return { role, x0, yT, d, last: i === n - 1 };
  });

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        className={styles.muted}
        d={`M6 ${BASE + 1} C100 ${BASE - 1} 300 ${BASE + 3} ${W - 6} ${BASE}`}
      />
      {steps.map((s) => (
        <path
          key={s.role}
          data-ch4-step
          pathLength={1}
          className={s.last ? styles.accent : styles.ink}
          d={s.d}
        />
      ))}
      {steps.map((s) => {
        const lines = splitLabel(s.role);
        return (
          <text
            key={s.role}
            data-ch4-label
            className={`${styles.label}${s.last ? ` ${styles.labelAccent}` : ""}`}
            x={s.x0 + 9}
            y={s.yT + 17}
          >
            {lines.map((l, k) => (
              <tspan key={k} x={s.x0 + 9} dy={k === 0 ? 0 : 13}>
                {l}
              </tspan>
            ))}
          </text>
        );
      })}
      <g
        data-ch4-figure
        data-stops={stops.map((p) => p.join(",")).join(";")}
        transform={`translate(${stops[0][0]} ${stops[0][1]})`}
        opacity={0}
      >
        <path
          className={styles.ink}
          d="M0 -31 C2.6 -31 4.6 -29 4.5 -26.5 C4.4 -24 2.4 -22.6 0 -22.6 C-2.4 -22.8 -4.4 -24.4 -4.4 -26.8 C-4.4 -29.2 -2.4 -31 0 -31 Z"
        />
        <path
          className={styles.ink}
          d="M0 -22 C0.5 -17 -0.4 -14 0 -10 M0 -10 L-4.5 0 M0 -10 L4.5 0 M0 -19 L-6 -13 M0 -19 L6 -14"
        />
      </g>
    </svg>
  );
}
