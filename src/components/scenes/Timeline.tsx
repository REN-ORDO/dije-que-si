import { Ch4Browser } from "@/components/illustrations/Ch4Browser";
import { Ch4People } from "@/components/illustrations/Ch4People";
import { Ch4Stairs } from "@/components/illustrations/Ch4Stairs";
import styles from "@/components/illustrations/Ch4Scene.module.css";

type Props = {
  milestones: { label: string; note: string }[];
  roles: string[];
  stat: { value: number; suffix: string; label: string };
  screenshot: string | null;
  screenshotAlt: string;
  screenshotUrl: string;
};

/**
 * Chapter 4 scene: milestone timeline (horizontal on desktop, vertical on
 * mobile), role staircase, DerbiPlay browser proof, people grid and counter.
 */
export function Timeline({
  milestones,
  roles,
  stat,
  screenshot,
  screenshotAlt,
  screenshotUrl,
}: Props) {
  return (
    <div className={styles.scene}>
      <div className="tl" aria-hidden="true">
        <div className="tl-nodes">
          <span className="tl-track h">
            <span className="tl-fill h" />
          </span>
          <span className="tl-track v">
            <span className="tl-fill v" />
          </span>
          {milestones.map((m) => (
            <div key={m.label} className="tl-node">
              <span className="tl-dot">
                <span className="tl-dot-on" />
              </span>
              <div>
                <div className="tl-label">{m.label}</div>
                <div className="tl-note">{m.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.mid}>
        <div aria-hidden="true">
          <Ch4Stairs roles={roles ?? []} />
        </div>
        <Ch4Browser
          screenshot={screenshot}
          alt={screenshotAlt}
          url={screenshotUrl}
        />
      </div>
      <div className={styles.bottom} aria-hidden="true">
        <Ch4People />
        <div className="tl-stat">
          <div>
            <span className="tl-num">0</span>
            <span className="tl-suffix">{stat.suffix}</span>
          </div>
          <p>{stat.label}</p>
        </div>
      </div>
    </div>
  );
}
