// news-image-20261118 rev2 — "Wednesday 18 November 2026: The Day in World News"
// Program (Node 22, standard library only): copies the entry image to the
// output directory. The image was built in-session for this revision: three
// image-model lead illustrations composited into a serif newspaper front
// page — 50 stories across 7 regions, a UTC timeline strip, source tags on
// every lead and secondary, a pinned world map, 35 one-line briefs, a source
// line and a date check. All facts first published on Wednesday
// 18 November 2026.
// Deterministic: a copy writes the same bytes on every run. The source is
// checked before copying (must exist and be non-empty) and the copy is
// checked back against the source size, so a missing or truncated entry.png
// fails loudly instead of producing a broken output.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const source = new URL("./entry.png", import.meta.url);
if (!existsSync(source)) {
  throw new Error(`entry.png not found next to main.ts: ${source.pathname}`);
}
const sourceSize = statSync(source).size;
if (sourceSize === 0) {
  throw new Error("entry.png is empty (0 bytes); refusing to copy a blank image");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "entry.png");
copyFileSync(source, dest);
if (statSync(dest).size !== sourceSize) {
  throw new Error(
    `copied entry.png is ${statSync(dest).size} bytes, expected ${sourceSize} bytes`,
  );
}
