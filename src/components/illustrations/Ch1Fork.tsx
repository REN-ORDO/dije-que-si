import styles from "./Ch1Fork.module.css";

type Props = { left: string; right: string; note: string };

const cx = (...c: string[]) => c.join(" ");

/**
 * "Fork in the road" doodle: a path splits into a chef hat branch and a
 * laptop branch (the accent one), with a tiny sun hinting at remote freedom.
 * Animated from Chapter1 via data-ch1-* hooks.
 */
export function Ch1Fork({ left, right, note }: Props) {
  return (
    <svg className={styles.fork} viewBox="0 0 820 190" aria-hidden="true">
      {/* trunk + left branch */}
      <path data-ch1-draw="trunk" pathLength={1} className={cx(styles.line, styles.muted)} d="M410 188 C406 170 413 150 410 126" />
      <path data-ch1-draw="left" pathLength={1} className={cx(styles.line, styles.muted)} d="M410 126 C382 100 322 108 266 86 C256 82 252 82 248 83" />
      {/* chef hat */}
      <g data-ch1-pop="hat">
        <path
          className={cx(styles.line, styles.muted)}
          d="M217 80 L217 63 C203 62 202 42 219 43 C223 28 248 28 252 42 C268 42 268 62 253 63 L253 80 Z"
        />
        <path className={cx(styles.line, styles.muted)} d="M217 72 C228 74 242 71 253 72" />
      </g>
      <text data-ch1-pop="lbl-left" className={styles.label} x={235} y={124} textAnchor="middle">
        {left}
      </text>

      {/* right (accent) branch */}
      <path data-ch1-draw="right" pathLength={1} className={cx(styles.line, styles.accent)} d="M410 126 C440 100 502 108 556 86 C566 82 570 82 574 83" />
      {/* laptop */}
      <g data-ch1-pop="laptop">
        <path
          className={cx(styles.line, styles.accent, styles.fill)}
          d="M576 84 L576 52 C576 48 579 46 583 46 L621 46 C625 46 628 48 628 52 L628 84"
        />
        <path className={cx(styles.line, styles.accent)} d="M562 88 C590 93 622 91 644 87 L628 84 L576 84" />
        <path className={cx(styles.line, styles.accent)} d="M594 59 L586 67 L594 75 M611 59 L619 67 L611 75" />
      </g>
      <text data-ch1-pop="lbl-right" className={cx(styles.label, styles.labelAccent)} x={602} y={124} textAnchor="middle">
        {right}
      </text>

      {/* remote / freedom: sun + note */}
      <g data-ch1-pop="sun">
        <path className={cx(styles.line, styles.muted)} d="M692 40 C692 31 700 28 706 33 C712 38 710 48 702 50 C695 52 691 47 692 40 Z" />
        <path
          className={cx(styles.line, styles.muted)}
          d="M701 18 L701 12 M722 28 L727 24 M730 41 L737 41 M722 54 L727 58 M701 64 L701 70 M680 54 L675 58 M672 41 L665 41 M680 28 L675 24"
        />
      </g>
      <text data-ch1-pop="note" className={styles.note} x={602} y={162} textAnchor="middle">
        {note}
      </text>
    </svg>
  );
}
