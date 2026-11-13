import { ImageResponse } from "next/og";
import { hero, site } from "@/content";

export const alt = `${site.title} — ${site.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Loads a Google font subset containing only the glyphs we draw. */
async function loadFont(family: string, weight: number, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!src) return null;
    return await (await fetch(src[1])).arrayBuffer();
  } catch {
    return null;
  }
}

const SEAT_COLS = 9;

export default async function OpengraphImage() {
  const title = hero.title.join(" ");
  const subtitle = hero.subtitle;
  const [display, body] = await Promise.all([
    loadFont("Bricolage+Grotesque", 700, title),
    loadFont("Bricolage+Grotesque", 500, subtitle + site.author + site.authorLine),
  ]);

  const fonts = [
    display && { name: "Display", data: display, weight: 700 as const, style: "normal" as const },
    body && { name: "Display", data: body, weight: 500 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 700 | 500; style: "normal" }[];

  const words = hero.title;
  const accent = hero.accentIndex;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 72px",
          background: "#141416",
          color: "#F4F1EC",
          fontFamily: fonts.length ? "Display" : "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            right: -320,
            top: -420,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(124,131,255,0.45) 0%, rgba(124,131,255,0.12) 38%, rgba(124,131,255,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            left: -300,
            bottom: -420,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(124,131,255,0.22) 0%, rgba(124,131,255,0) 70%)",
          }}
        />

        {/* Dust */}
        {Array.from({ length: 46 }, (_, i) => {
          const x = (i * 263) % 1200;
          const y = (i * 151) % 630;
          const r = (i % 3) + 1.5;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: r,
                height: r,
                borderRadius: 9999,
                background: i % 7 === 0 ? "rgba(124,131,255,0.9)" : "rgba(244,241,236,0.35)",
              }}
            />
          );
        })}

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#AAA49C", letterSpacing: 2 }}>
          <span style={{ textTransform: "uppercase" }}>{site.author}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 9999, background: "#7C83FF" }} />
            Ingeniería de Sistemas
          </span>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: -10 }}>
          <div style={{ display: "flex", alignItems: "flex-end", fontSize: 210, fontWeight: 700, letterSpacing: -9, lineHeight: 0.9 }}>
            {words.map((w, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginRight: i < words.length - 1 ? 44 : 0,
                  color: i === accent ? "#7C83FF" : "#F4F1EC",
                }}
              >
                <span>{w}</span>
                {i === accent && (
                  <svg width="240" height="34" viewBox="0 0 240 34" style={{ marginTop: 8 }}>
                    <path
                      d="M6 22 C60 6 120 32 178 14 S226 16 234 8"
                      stroke="#7C83FF"
                      strokeWidth="9"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 500, color: "#AAA49C", marginTop: 28, maxWidth: 820, lineHeight: 1.2 }}>
            {subtitle}
          </div>
        </div>

        {/* Seats: one lit */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
            {Array.from({ length: SEAT_COLS }, (_, i) => {
              const me = i === 5;
              const c = me ? "#7C83FF" : "#34343A";
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 46, height: 36, borderRadius: 10, background: c, boxShadow: me ? "0 0 40px rgba(124,131,255,0.8)" : "none" }} />
                  <div style={{ width: 54, height: 14, borderRadius: 6, background: c }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#F4F1EC", letterSpacing: 1 }}>Yo estaba ahí.</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
