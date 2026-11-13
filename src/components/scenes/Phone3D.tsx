"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Ch5Doodles } from "@/components/illustrations/Ch5Doodles";
import doodleStyles from "@/components/illustrations/Ch5Doodles.module.css";
import { MQ } from "@/lib/motion";
import { PhoneDevice, type PhoneApp } from "./Phone";
import type { PhoneRig } from "./Phone3DRig";
import styles from "./Phone3D.module.css";

const Phone3DCanvas = dynamic(() => import("./Phone3DCanvas"), { ssr: false });

type Props = {
  app: PhoneApp;
  rig: PhoneRig;
};

function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    const ok = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Chapter 5 scene: a WebGL iPhone driven by `rig` (tweened by the chapter
 * timeline), HTML floating cards and doodles. The CSS phone is always rendered
 * first (SSR, no-WebGL, reduced motion) and only hidden once the 3D phone has
 * drawn its first frame, so there is never an empty stage.
 */
export function Phone3D({ app, rig }: Props) {
  const [mode, setMode] = useState<"css" | "loading" | "ready">("css");

  useEffect(() => {
    const reduce = window.matchMedia(MQ.reduce).matches;
    if (!reduce && canUseWebGL()) setMode("loading");
  }, []);

  const onReady = useCallback(() => setMode("ready"), []);
  const onError = useCallback(() => setMode("css"), []);

  return (
    <div
      className={`phone-scene ${doodleStyles.scene} ${styles.scene}`}
      data-3d={mode}
    >
      <Ch5Doodles />
      <PhoneDevice app={app} />
      {mode !== "css" && (
        <Phone3DCanvas
          rig={rig}
          screenshot={app.screenshot}
          onReady={onReady}
          onError={onError}
        />
      )}
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
