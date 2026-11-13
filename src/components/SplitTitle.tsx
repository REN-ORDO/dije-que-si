import { gsap } from "@/lib/motion";

type Props = {
  words: string[];
  accentIndex: number;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
};

/** Renders a title split into masked characters for letter-by-letter motion. */
export function SplitTitle({ words, accentIndex, as = "h1", id, className = "" }: Props) {
  const Tag = as;
  return (
    <Tag id={id} className={`hero-title ${className}`} aria-label={words.join(" ")}>
      {words.map((word, wi) => (
        <span
          key={wi}
          aria-hidden="true"
          className={`split-word${wi === accentIndex ? " is-accent" : ""}`}
        >
          {Array.from(word).map((ch, ci) => (
            <span key={ci} className="char-mask">
              <span className="char">{ch}</span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

/**
 * Letter-by-letter assembly. The accent word lands last, changes color on
 * arrival and settles with a small bounce.
 */
export function assembleTitle(root: HTMLElement, opts: { delay?: number } = {}) {
  const plain = root.querySelectorAll<HTMLElement>(".split-word:not(.is-accent) .char");
  const accent = root.querySelectorAll<HTMLElement>(".split-word.is-accent .char");
  const tl = gsap.timeline({ delay: opts.delay ?? 0 });

  tl.fromTo(
    plain,
    { yPercent: 115, rotate: 10, opacity: 0 },
    {
      yPercent: 0,
      rotate: 0,
      opacity: 1,
      duration: 1.5,
      stagger: 0.08,
      ease: "expo.out",
    }
  );
  tl.fromTo(
    accent,
    { yPercent: 120, scale: 0.6, opacity: 0, color: "#f4f1ec" },
    {
      yPercent: 0,
      scale: 1,
      opacity: 1,
      color: "#7c83ff",
      duration: 1.2,
      stagger: 0.07,
      ease: "back.out(3.2)",
    },
    "-=0.55"
  );
  tl.to(
    accent,
    {
      keyframes: { y: [0, -18, 0, -5, 0], easeEach: "sine.inOut" },
      duration: 0.75,
      stagger: 0.05,
    },
    "-=0.25"
  );
  return tl;
}
