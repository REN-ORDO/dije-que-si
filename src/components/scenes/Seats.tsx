import { useId } from "react";

const ROWS = 5;
const COLS = 7;

/** Row 3, column 4 (1-based): the seat that belongs to "me". */
const ME_ROW = 2;
const ME_COL = 3;
export const ME_INDEX = ME_ROW * COLS + ME_COL;
export const SEAT_GRID: [number, number] = [ROWS, COLS];

const CENTER_X = 410;

function rowScale(r: number) {
  return 0.42 + (r * (1.04 - 0.42)) / (ROWS - 1);
}
function rowY(r: number) {
  return 120 + (r * (410 - 120)) / (ROWS - 1);
}
function seatX(r: number, c: number) {
  return CENTER_X + (c - (COLS - 1) / 2) * 96 * rowScale(r);
}

const ME_X = seatX(ME_ROW, ME_COL);
const ME_S = rowScale(ME_ROW);
const ME_Y = rowY(ME_ROW);
/** Visual centre of my seat, used as the zoom pivot. */
export const ME_ORIGIN = `${Math.round(ME_X)} ${Math.round(ME_Y - 40 * ME_S)}`;
/** Same pivot as a CSS percentage string of the 820x520 viewBox (for HTML-level scaling). */
export const ME_ORIGIN_PCT = `${((ME_X / 820) * 100).toFixed(2)}% ${(((ME_Y - 40 * ME_S) / 520) * 100).toFixed(2)}%`;
/** Visual centre of my seat in viewBox units. */
export const ME_CENTER = { x: ME_X, y: ME_Y - 40 * ME_S };
/** Visual centre and scale of any seat in viewBox units. */
export function seatCenter(r: number, c: number) {
  const s = rowScale(r);
  return { x: seatX(r, c), y: rowY(r) - 40 * s, s };
}

const BASE_FILL = { fill: "#3b3b42" };
const BACK_FILL = { fill: "#46464f" };

function SeatShapes({ lit }: { lit?: boolean }) {
  return (
    <g className={lit ? "seat-lit" : undefined}>
      <rect className={lit ? undefined : "seat-back"} style={lit ? undefined : BACK_FILL} x={-26} y={-78} width={52} height={48} rx={8} />
      <rect className={lit ? undefined : "seat-base"} style={lit ? undefined : BASE_FILL} x={-30} y={-30} width={60} height={16} rx={5} />
      <rect className={lit ? undefined : "seat-base"} style={lit ? undefined : BASE_FILL} x={-22} y={-14} width={6} height={14} rx={2} />
      <rect className={lit ? undefined : "seat-base"} style={lit ? undefined : BASE_FILL} x={16} y={-14} width={6} height={14} rx={2} />
    </g>
  );
}

function Seat({ r, c }: { r: number; c: number }) {
  const me = r === ME_ROW && c === ME_COL;
  const s = rowScale(r);
  return (
    <g transform={`translate(${seatX(r, c).toFixed(2)} ${rowY(r).toFixed(2)}) scale(${s.toFixed(3)})`}>
      <g className={me ? "seat is-me" : "seat"}>
        <SeatShapes />
        <SeatShapes lit />
      </g>
    </g>
  );
}

export function Seats({ label }: { label: string }) {
  const uid = useId().replace(/:/g, "");
  const glowId = `glow-${uid}`;
  const fogId = `fog-${uid}`;
  const rows = Array.from({ length: ROWS }, (_, r) => r);
  const cols = Array.from({ length: COLS }, (_, c) => c);
  const labelTop = ME_Y - 78 * ME_S - 8;

  return (
    <svg className="seats-svg" viewBox="0 0 820 520" aria-hidden="true">
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor="#7C83FF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7C83FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={fogId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141416" stopOpacity="0.7" />
          <stop offset="1" stopColor="#141416" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="cam">
        {rows.map((r) => (
          <g key={r}>
            {r === ME_ROW && (
              <circle
                className="me-glow"
                cx={ME_X}
                cy={ME_Y - 40 * ME_S}
                r={130}
                fill={`url(#${glowId})`}
                style={{ opacity: 0 }}
              />
            )}
            {cols.map((c) => (
              <Seat key={c} r={r} c={c} />
            ))}
            {r === 1 && (
              <rect x={-400} y={-200} width={1620} height={400} fill={`url(#${fogId})`} />
            )}
          </g>
        ))}
        <g className="me-label" style={{ opacity: 0 }}>
          <line
            x1={ME_X}
            y1={labelTop}
            x2={ME_X}
            y2={labelTop - 44}
            stroke="#7C83FF"
            strokeWidth={1.5}
          />
          <text className="seat-label" x={ME_X} y={labelTop - 56} textAnchor="middle">
            {label}
          </text>
        </g>
      </g>
    </svg>
  );
}
