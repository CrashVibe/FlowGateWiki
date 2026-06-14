import { source } from "@/lib/source";

const FONT_FACE_URL_RE = /src:\s*url\(([^)]+)\)\s*format\('woff2'\)/;

/**
 * Fetch a Google Fonts subset (woff2) containing only the glyphs needed for
 * `text`. Used for CJK fonts, which are too large to bundle in full.
 * Returns null if the family has no glyphs for `text` (no @font-face emitted).
 */
export const fetchGoogleFontSubset = async (family: string, text: string): Promise<ArrayBuffer | null> => {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&text=${encodeURIComponent(text)}`;
  const css = await fetch(cssUrl, {
    headers: {
      // Modern UA so Google serves woff2 (vs. legacy ttf/woff).
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  }).then((res) => res.text());

  const match = css.match(FONT_FACE_URL_RE);
  const fontUrl = match?.[1];
  if (!fontUrl) {
    return null;
  }

  const fontResponse = await fetch(fontUrl);
  return fontResponse.arrayBuffer();
};

let cjkFontPromise: Promise<ArrayBuffer | null> | null = null;

/**
 * One Noto Sans SC subset covering every CJK character used across all docs
 * page titles/descriptions, fetched once and reused for every OG image.
 * Registering different font bytes under the same family name across
 * requests corrupts `@takumi-rs/wasm`'s glyph cache in workerd, so all pages
 * must share identical font bytes.
 */
export const getSharedCjkFont = (): Promise<ArrayBuffer | null> => {
  if (!cjkFontPromise) {
    const chars = new Set<string>();
    for (const page of source.getPages()) {
      for (const ch of `${page.data.title}${page.data.description ?? ""}`) {
        if ((ch.codePointAt(0) ?? 0) > 127) {
          chars.add(ch);
        }
      }
    }
    cjkFontPromise = fetchGoogleFontSubset("Noto Sans SC", [...chars].join(""));
  }
  return cjkFontPromise;
};
