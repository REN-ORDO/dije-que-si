"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed full-viewport WebGL layer behind the story content. Three.js is
 * loaded lazily after mount; if WebGL is unavailable nothing is rendered.
 */
export function Companion() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    import("./companionScene")
      .then(({ createCompanion }) => {
        if (cancelled) return;
        const companion = createCompanion(host);
        if (!companion) {
          host.style.display = "none";
          return;
        }
        dispose = companion.dispose;
      })
      .catch(() => {
        host.style.display = "none";
      });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return <div ref={hostRef} className="companion" aria-hidden="true" />;
}
