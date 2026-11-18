// news-image-20261118 round 2 — "Wednesday 18 November 2026: The Day in World News"
// Program (Node 22, standard library only): copies the entry image to the
// output directory. The image was built in-session for this revision: three
// image-model lead illustrations composited into a serif newspaper front
// page — 45 stories, 12 illustrated secondaries, a pinned world map, 30
// one-line briefs, a source line and a date check. All facts first published
// on Wednesday 18 November 2026.
// Deterministic: a copy writes the same bytes on every run.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
copyFileSync(new URL("./entry.png", import.meta.url), join(outDir, "entry.png"));
