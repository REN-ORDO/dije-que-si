import s from "./Ch2.module.css";
import { DashedPath } from "./Ch2Ch3DashedPath";

/** Head + shoulders line art, a dashed tether up to the bubble, and the thought cloud. */
export function Ch2Figure({ thought }: { thought: string }) {
  return (
    <>
      <svg
        className={s.layer}
        viewBox="0 0 560 700"
        fill="none"
        stroke="#F4F1EC"
        strokeOpacity={0.85}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <DashedPath d="M280 596 C286 520 274 440 281 346" name="tether" />

        <g data-a="fig">
          <path
            data-a="figd"
            className={s.draw}
            pathLength={1}
            d="M280 602 C293 601 303 611 302 624 C301 637 291 646 279 646 C266 646 257 636 258 623 C259 611 268 603 281 602"
          />
          <path
            data-a="figd"
            className={s.draw}
            pathLength={1}
            d="M214 700 C216 674 238 660 262 656 C270 654 272 650 270 645"
          />
          <path
            data-a="figd"
            className={s.draw}
            pathLength={1}
            d="M346 700 C344 674 322 660 298 656 C290 654 288 650 290 645"
          />
        </g>

        <g stroke="#AAA49C" strokeOpacity={1}>
          <circle data-a="trail" className={s.pop} cx={314} cy={640} r={3.5} />
          <circle data-a="trail" className={s.pop} cx={330} cy={649} r={5.5} />
          <path
            data-a="cloud"
            className={s.draw}
            pathLength={1}
            transform="translate(24 0)"
            d="M345 645 C330 640 328 612 352 608 C356 588 386 580 400 594 C412 578 448 578 458 598 C478 590 506 604 500 626 C520 636 514 664 492 666 C488 684 456 690 442 676 C428 692 394 690 388 672 C366 680 340 668 345 645 Z"
          />
        </g>
      </svg>
      <p className={s.thought} data-a="thought">
        {thought}
      </p>
    </>
  );
}
