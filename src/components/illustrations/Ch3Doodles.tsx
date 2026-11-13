import s from "./Ch3Scene.module.css";
import { DashedPath } from "./Ch2Ch3DashedPath";

const PEOPLE = [206, 236, 264, 292];

/**
 * Doodles around the chapter 3 stages (viewBox 600x720 = the stage aspect):
 * event flyer + people dots, dashed arrows between stages, a paper-plane trail.
 */
export function Ch3Doodles() {
  return (
    <svg
      className={s.layer}
      viewBox="0 0 600 720"
      fill="none"
      stroke="#F4F1EC"
      strokeOpacity={0.85}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g data-a="flyer">
        <path
          data-a="flyerd"
          className={s.draw}
          pathLength={1}
          d="M22 30 C60 26 120 28 168 24 C172 50 170 78 166 100 C120 104 66 102 26 104 C20 80 24 54 22 30 Z"
        />
        <path
          data-a="flyerd"
          className={s.draw}
          pathLength={1}
          d="M40 46 C70 44 100 47 128 44"
        />
        <g stroke="#AAA49C" strokeOpacity={1}>
          <path
            data-a="flyerd"
            className={s.draw}
            pathLength={1}
            d="M40 62 C60 60 86 64 140 61"
          />
          <path
            data-a="flyerd"
            className={s.draw}
            pathLength={1}
            d="M40 77 C62 75 92 79 118 76"
          />
          <circle data-a="pin" className={s.pop} cx={94} cy={22} r={3.5} />
        </g>
        {PEOPLE.map((x, i) => {
          const y = 96 - (i % 2) * 4;
          return (
            <g key={x} data-a="person" className={s.pop} stroke="#AAA49C" strokeOpacity={1}>
              <circle cx={x} cy={y - 16} r={5} />
              <path d={`M${x - 9} ${y} C${x - 9} ${y - 10} ${x + 9} ${y - 10} ${x + 9} ${y}`} />
            </g>
          );
        })}
      </g>

      {/* meter -> editor */}
      <DashedPath d="M464 196 C524 182 566 196 556 222" name="arrowA" />
      <path
        data-a="headA"
        className={s.draw}
        pathLength={1}
        stroke="#AAA49C"
        strokeOpacity={1}
        d="M564.5 215.1 L556 222 L554.3 211.2"
      />

      {/* editor -> zip */}
      <DashedPath d="M66 558 C40 650 190 700 282 600" name="arrowB" />
      <path
        data-a="headB"
        className={s.draw}
        pathLength={1}
        stroke="#AAA49C"
        strokeOpacity={1}
        d="M271.5 603.3 L282 600 L279.6 610.8"
      />

      {/* paper-plane trail */}
      <DashedPath
        d="M374 468 C428 420 324 392 380 350 C416 322 372 304 352 284"
        name="trail"
      />
      <g transform="translate(326 300)">
        <g data-a="plane" className={s.pop}>
          <path
            d="M-28 -6 L26 -24 L6 20 L0 4 Z"
            stroke="#7C83FF"
            strokeOpacity={1}
            fill="rgb(124 131 255 / 0.16)"
          />
          <path d="M0 4 L26 -24" stroke="#7C83FF" strokeOpacity={1} />
        </g>
      </g>
    </svg>
  );
}
