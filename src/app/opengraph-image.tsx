import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pull just the glyphs we need from Google Fonts so the OG image uses the brand typefaces.
async function loadGoogleFont(family: string, weight: number, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!src) return null;
    const res = await fetch(src[1]);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

// Brand palette (CSS variables aren't available inside ImageResponse).
const c = { bg: "#FFFFFF", text: "#061B31", muted: "#64748D", accent: "#1C257D", highlight: "#F59E0B" };

const stats = [
  ["30+", "partner colleges"],
  ["50+", "industry partners"],
  ["10K+", "students mentored"],
] as const;

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), `public${site.logo}`));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const headingText = `${site.name}${site.tagline}${stats.map((s) => s[0]).join("")}`;
  const bodyText = `${site.description}${stats.map((s) => s[1]).join("")}techcityskills.com`;
  const [interSemibold, inter] = await Promise.all([
    loadGoogleFont("Inter", 600, headingText),
    loadGoogleFont("Inter", 500, bodyText),
  ]);

  const fonts = [
    interSemibold && { name: "Inter", data: interSemibold, weight: 600 as const, style: "normal" as const },
    inter && { name: "Inter", data: inter, weight: 500 as const, style: "normal" as const },
  ].filter((f) => !!f);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: c.bg,
          borderBottom: `16px solid ${c.accent}`,
          color: c.text,
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={logoSrc} width={290} height={70} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              maxWidth: 980,
            }}
          >
            {site.tagline}
          </div>
          <div style={{ fontSize: 28, color: c.muted, maxWidth: 900, lineHeight: 1.4 }}>
            {site.description}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 48 }}>
            {stats.map(([n, label]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", borderLeft: `6px solid ${c.highlight}`, paddingLeft: 18 }}>
                <div style={{ fontSize: 40, fontWeight: 600, color: c.text, letterSpacing: "-0.02em" }}>{n}</div>
                <div style={{ fontSize: 20, color: c.muted }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 22, color: c.muted }}>techcityskills.com</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
