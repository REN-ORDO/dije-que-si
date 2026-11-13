import type { ReactNode } from "react";
import s from "@/components/illustrations/Ch3Scene.module.css";
import { Ch3Doodles } from "@/components/illustrations/Ch3Doodles";

type Props = {
  tokenLabel: string;
  tokenEmpty: string;
  editorFile: string;
  code: string[];
  zipName: string;
  sentLabel: string;
};

const CELLS = 12;

// Tags / ">" / ".class" | "strings" | CSS property names (before ":")
const TOKEN = /(<\/?[a-zA-Z][\w-]*|>|\.[a-zA-Z][\w-]*)|("[^"]*")|([a-z-]+)(?=\s*:)/g;

function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of line.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(line.slice(last, start));
    const cls = m[1] ? "tok-tag" : m[2] ? "tok-str" : "tok-prop";
    out.push(
      <span key={key++} className={cls}>
        {m[0]}
      </span>
    );
    last = start + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** The landing idea, taken from the h1 of the sample code (no invented copy). */
function promptFrom(code: string[]): string {
  for (const line of code) {
    const m = line.match(/>([^<]+)</);
    if (m) return m[1].trim();
  }
  return "";
}

/** Layered scene: prompt composer + token battery -> code editor -> zip -> sent. */
export function Tokens({
  tokenLabel,
  tokenEmpty,
  editorFile,
  code,
  zipName,
  sentLabel,
}: Props) {
  const prompt = promptFrom(code);
  return (
    <div className={`tokens ${s.root}`} aria-hidden="true">
      <Ch3Doodles />

      <div className={`composer ${s.composer}`}>
        <div className={s.promptRow}>
          <span className={s.promptMark}>&gt;</span>
          <span className={s.promptText} data-len={prompt.length}>
            {prompt}
          </span>
          <span className={s.cursor} />
        </div>
        <div className={s.skels}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={s.skel} data-a="skel">
              <span className={s.shine} data-a="shine" />
            </div>
          ))}
        </div>
        <div className={s.footHead}>
          <span>{tokenLabel}</span>
          <span className={s.pct} data-a="pct">
            100%
          </span>
        </div>
        <div className={s.cells}>
          {Array.from({ length: CELLS }, (_, i) => (
            <i key={i} className={s.cell} data-a="cell" />
          ))}
        </div>
        <span className={s.stamp} data-a="stamp">
          {tokenEmpty}
        </span>
      </div>

      <div className="editor">
        <div className="editor-bar">
          <i />
          <i />
          <i />
          <span>{editorFile}</span>
        </div>
        <pre>
          {code.map((line, i) => (
            <span key={i} className="code-line" data-len={line.length}>
              {highlight(line)}
            </span>
          ))}
        </pre>
      </div>

      <div className="zip">
        <div className="zip-file" />
        <span className="zip-name">{zipName}</span>
      </div>

      <div className="sent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M7.5 12.5l3 3 6-6.5" />
        </svg>
        <span>{sentLabel}</span>
      </div>
    </div>
  );
}
