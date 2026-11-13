import { useId } from "react";

type Props = {
  d: string;
  /** Value of the data-draw attribute on the mask path (animation target). */
  name: string;
  stroke?: string;
  dash?: string;
};

/**
 * Dashed hand-drawn line that can "draw on": a dashed path revealed through a
 * mask whose solid stroke animates stroke-dashoffset 1 -> 0 (target
 * `[data-draw="<name>"]`). A plain dasharray can't be used for the reveal
 * because the dash pattern itself occupies stroke-dasharray.
 */
export function DashedPath({ d, name, stroke = "#AAA49C", dash = "4 8" }: Props) {
  const id = `dp${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <>
      <mask
        id={id}
        maskUnits="userSpaceOnUse"
        x={-2000}
        y={-2000}
        width={6000}
        height={6000}
      >
        <path
          d={d}
          data-draw={name}
          pathLength={1}
          fill="none"
          stroke="#fff"
          strokeWidth={8}
          strokeLinecap="round"
          style={{ strokeDasharray: 1 }}
        />
      </mask>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeOpacity={1}
        strokeDasharray={dash}
        mask={`url(#${id})`}
      />
    </>
  );
}
