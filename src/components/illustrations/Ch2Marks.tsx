import s from "./Ch2.module.css";

const MARKS = [
  { x: 62, y: 292, r: -12 },
  { x: 498, y: 280, r: 10 },
  { x: 118, y: 546, r: 8 },
  { x: 452, y: 540, r: -10 },
];

/** Floating question marks drifting around the crowd of bubbles. */
export function Ch2Marks() {
  return (
    <svg
      className={`${s.layer} ${s.over}`}
      viewBox="0 0 560 700"
      fill="none"
      stroke="#AAA49C"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {MARKS.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.r}) scale(1.5)`}>
          <g data-a="q" className={s.pop}>
            <path d="M0 -9 C-1 -17 13 -18 13 -8 C13 -1 4 1 4 9" />
            <circle cx={4} cy={17} r={1.3} fill="#AAA49C" stroke="none" />
          </g>
        </g>
      ))}
    </svg>
  );
}
