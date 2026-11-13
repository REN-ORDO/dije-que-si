import styles from "./Ch4Browser.module.css";

type Props = { screenshot: string | null; alt: string; url: string };

/** Minimal line-art browser window framing the DerbiPlay screenshot. Hook: [data-ch4-browser]. */
export function Ch4Browser({ screenshot, alt, url }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.frame} data-ch4-browser>
        <div className={styles.bar}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.pill}>{url}</span>
        </div>
        {screenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.shot}
            src={screenshot}
            alt={alt}
            width={1909}
            height={889}
            loading="lazy"
          />
        ) : (
          <div className={styles.empty} />
        )}
      </div>
    </div>
  );
}
