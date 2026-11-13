import { Ch5Doodles } from "@/components/illustrations/Ch5Doodles";
import styles from "@/components/illustrations/Ch5Doodles.module.css";

export type PhoneApp = {
  name: string;
  tagline: string;
  remaining: string;
  screenshot: string | null;
  screenshotAlt: string;
  placeholderLabel: string;
  placeholderHint: string;
};

type Props = { app: PhoneApp };

const RADIUS = 45;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** CSS-3D iPhone. Fallback for the WebGL phone (no WebGL / reduced motion). */
export function PhoneDevice({ app }: Props) {
  return (
    <div className="phone">
      <div className="island" />
      <div className="phone-screen">
        {app.screenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app.screenshot}
            alt={app.screenshotAlt}
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        ) : (
          <div className="placeholder">
            <span className="placeholder-tag">{app.placeholderLabel}</span>
            <span className="placeholder-app">{app.name}</span>
            <svg className="placeholder-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r={RADIUS} stroke="#2c2c31" />
              <circle
                className="ring-progress"
                cx="50"
                cy="50"
                r={RADIUS}
                stroke="#7C83FF"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * 0.28}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="placeholder-remaining">{app.remaining}</span>
            <span className="placeholder-hint">{app.placeholderHint}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** CSS-only scene (phone + floating cards + doodles), no WebGL. */
export function Phone({ app }: Props) {
  return (
    <div className={`phone-scene ${styles.scene}`}>
      <Ch5Doodles />
      <PhoneDevice app={app} />
      <div className="float-card tagline">
        <small>{app.name}</small>
        {app.tagline}
      </div>
      <div className="float-card remaining">
        <small>{app.name}</small>
        {app.remaining}
      </div>
    </div>
  );
}
