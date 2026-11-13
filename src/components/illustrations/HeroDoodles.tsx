import styles from "./HeroDoodles.module.css";

type Kind = "braces" | "cursor" | "sparkle" | "question";

const DOODLES: {
  kind: Kind;
  left: string;
  top: string;
  w: number;
  h: number;
  depth: number;
  o: number;
  small?: boolean;
}[] = [
  { kind: "braces", left: "72%", top: "13%", w: 110, h: 66, depth: 1, o: 0.4 },
  { kind: "question", left: "56%", top: "9%", w: 34, h: 50, depth: 0.5, o: 0.32, small: true },
  { kind: "sparkle", left: "90%", top: "42%", w: 44, h: 44, depth: 1.4, o: 0.6 },
  { kind: "cursor", left: "80%", top: "72%", w: 52, h: 60, depth: 0.8, o: 0.38 },
  { kind: "sparkle", left: "4%", top: "20%", w: 26, h: 26, depth: 0.6, o: 0.4, small: true },
  { kind: "braces", left: "42%", top: "84%", w: 70, h: 42, depth: 1.2, o: 0.28, small: true },
];

function Shape({ kind }: { kind: Kind }) {
  switch (kind) {
    case "braces":
      return (
        <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
          <path className={styles.line} d="M30 5 C17 8 26 24 18 30 C26 36 17 52 30 55" />
          <path className={styles.line} d="M70 5 C83 8 74 24 82 30 C74 36 83 52 70 55" />
        </svg>
      );
    case "cursor":
      return (
        <svg viewBox="0 0 60 70" preserveAspectRatio="xMidYMid meet">
          <path className={styles.line} d="M14 8 C13 22 14 36 14 52 L26 41 L34 60 L42 56 L33 38 L50 38 Z" />
        </svg>
      );
    case "sparkle":
      return (
        <svg viewBox="-20 -20 40 40" preserveAspectRatio="xMidYMid meet">
          <path
            className={styles.accent}
            d="M0 -17 C2 -6 5 -3 17 0 C5 3 2 6 0 17 C-2 6 -5 3 -17 0 C-5 -3 -2 -6 0 -17 Z"
          />
        </svg>
      );
    case "question":
      return (
        <svg viewBox="0 0 40 60" preserveAspectRatio="xMidYMid meet">
          <path className={styles.line} d="M7 16 C5 -2 36 -2 34 17 C33 30 21 31 20 42" />
          <circle className={styles.line} cx="20" cy="54" r="1.4" />
        </svg>
      );
  }
}

/** Faint floating line doodles behind the hero title. Motion lives in Hero. */
export function HeroDoodles() {
  return (
    <div className={styles.layer} aria-hidden="true">
      {DOODLES.map((d, i) => (
        <span
          key={i}
          data-doodle
          data-depth={d.depth}
          data-o={d.o}
          className={`${styles.doodle}${d.small ? ` ${styles.hideSmall}` : ""}`}
          style={{ left: d.left, top: d.top, width: d.w, height: d.h }}
        >
          <span data-drift className={styles.drift}>
            <Shape kind={d.kind} />
          </span>
        </span>
      ))}
    </div>
  );
}
