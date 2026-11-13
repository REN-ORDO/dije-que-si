import s from "./Ch2.module.css";

const C = 46; // center of the 92px "mine" bubble
const LENGTHS = [14, 8, 12, 9, 15, 8, 13, 10, 14, 9];

const rays = LENGTHS.map((len, i) => {
  const a = ((i * 36 + 18) * Math.PI) / 180;
  const r0 = 58;
  const r1 = r0 + len;
  return {
    x1: (C + Math.cos(a) * r0).toFixed(2),
    y1: (C + Math.sin(a) * r0).toFixed(2),
    x2: (C + Math.cos(a) * r1).toFixed(2),
    y2: (C + Math.sin(a) * r1).toFixed(2),
  };
});

const SPARKS = [
  { deg: -50, r: 84, size: 6 },
  { deg: 200, r: 88, size: 5 },
  { deg: 62, r: 82, size: 4 },
];

const sparks = SPARKS.map(({ deg, r, size }) => {
  const a = (deg * Math.PI) / 180;
  return {
    x: (C + Math.cos(a) * r).toFixed(2),
    y: (C + Math.sin(a) * r).toFixed(2),
    size,
  };
});

/** Accent rays + sparkles radiating from the bubble ("ganas de aprender"). Lives inside .bubble.mine. */
export function Ch2Rays() {
  return (
    <svg
      className={s.rays}
      data-a="rays"
      viewBox="0 0 92 92"
      fill="none"
      stroke="#7C83FF"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {rays.map((r, i) => (
        <line
          key={i}
          data-a="ray"
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {sparks.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <g data-a="spark" className={s.pop}>
            <path
              d={`M0 ${-p.size} L0 ${p.size} M${-p.size} 0 L${p.size} 0`}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </g>
      ))}
    </svg>
  );
}
