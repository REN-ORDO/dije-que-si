import s from "@/components/illustrations/Ch2.module.css";
import { Ch2Figure } from "@/components/illustrations/Ch2Figure";
import { Ch2Marks } from "@/components/illustrations/Ch2Marks";
import { Ch2Rays } from "@/components/illustrations/Ch2Rays";

type Slot = { x: number; y: number; d: number };

/** Offsets (% of the square) from the center, and diameters (% of the square). */
const SLOTS: Slot[] = [
  { x: -27, y: -24, d: 30 },
  { x: 25, y: -27, d: 34 },
  { x: 29, y: 21, d: 27 },
  { x: -26, y: 25, d: 25 },
  { x: 1, y: -40, d: 18 },
  { x: -2, y: 40, d: 19 },
];

type Props = {
  others: string[];
  mine: string;
  mineGrown: string;
  thought: string;
};

/**
 * Scene: bubbles of what others knew around a small "mine" bubble, with a
 * figure + thought cloud underneath and question marks drifting around.
 */
export function Bubbles({ others, mine, mineGrown, thought }: Props) {
  return (
    <div className={s.scene} aria-hidden="true">
      <Ch2Figure thought={thought} />
      <div className="bubbles">
        {others.slice(0, SLOTS.length).map((label, i) => {
          const { x, y, d } = SLOTS[i];
          const len = Math.hypot(x, y) || 1;
          return (
            <div
              key={i}
              className="bubble other"
              data-dx={(x / len).toFixed(3)}
              data-dy={(y / len).toFixed(3)}
              style={{
                left: `${50 + x - d / 2}%`,
                top: `${50 + y - d / 2}%`,
                width: `${d}%`,
                height: `${d}%`,
              }}
            >
              {label}
            </div>
          );
        })}
        <div className="bubble mine">
          <span className="mine-ring" />
          <span className="mine-fill" />
          <span className="mine-label a">{mine}</span>
          <span className="mine-label b">{mineGrown}</span>
          <Ch2Rays />
        </div>
      </div>
      <Ch2Marks />
    </div>
  );
}
