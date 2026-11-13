import { closing, idea } from "@/content";
import { Experience } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { WordReveal } from "@/components/WordReveal";
import { Final } from "@/components/Final";
import { Chapter1 } from "@/components/chapters/Chapter1";
import { Chapter2 } from "@/components/chapters/Chapter2";
import { Chapter3 } from "@/components/chapters/Chapter3";
import { Chapter4 } from "@/components/chapters/Chapter4";
import { Chapter5 } from "@/components/chapters/Chapter5";
import { Chapter6 } from "@/components/chapters/Chapter6";

export default function Page() {
  return (
    <Experience>
      <Hero />
      <main>
        <WordReveal id={idea.id} kicker={idea.kicker} text={idea.text} illustration="path" marquee={idea.marquee} />
        <Chapter1 />
        <Chapter2 />
        <Chapter3 />
        <Chapter4 />
        <Chapter5 />
        <Chapter6 />
        <WordReveal id={closing.id} kicker={closing.kicker} text={closing.quote} serif as="blockquote" illustration="door" />
        <Final />
      </main>
    </Experience>
  );
}
