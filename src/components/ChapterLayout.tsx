import type { Ref } from "react";
import type { Block } from "@/content";

type Props = {
  ref?: Ref<HTMLElement>;
  id: string;
  number: string;
  title: string;
  blocks: Block[];
  sceneAlt: string;
  flipped?: boolean;
  children: React.ReactNode;
};

/** Shared chapter frame: editorial text column + animated scene. */
export function ChapterLayout({ ref, id, number, title, blocks, sceneAlt, flipped, children }: Props) {
  return (
    <section
      ref={ref}
      id={id}
      className={`chapter${flipped ? " is-flipped" : ""}`}
      aria-labelledby={`${id}-title`}
      data-stop
      data-scrub
      data-section
    >
      <div className="stage">
        <div className="ghost-num" aria-hidden="true">
          {number}
        </div>
        <div className="chapter-text">
          <p className="kicker" data-reveal>
            Capítulo {number}
          </p>
          <h2 id={`${id}-title`} className="chapter-title" data-reveal>
            {title}
          </h2>
          {blocks.map((b, i) =>
            b.type === "quote" ? (
              <blockquote key={i} className="quote" data-reveal>
                <p>
                  <span className="mark">“</span>
                  {b.text}
                  <span className="mark">”</span>
                </p>
              </blockquote>
            ) : (
              <p key={i} className="body" data-reveal>
                {b.text}
              </p>
            )
          )}
        </div>
        <div className="chapter-visual" data-scene role="img" aria-label={sceneAlt}>
          {children}
        </div>
      </div>
    </section>
  );
}
