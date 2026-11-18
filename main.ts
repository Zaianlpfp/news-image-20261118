// news-image-20261118 — "The World Today": one dense newspaper front page
// summing up Wednesday 18 November 2026. Drawn procedurally with a
// hand-built 5x7 bitmap font and a minimal PNG encoder, Node stdlib only.
// Deterministic: no clock, no randomness, no network. Two runs write
// byte-identical /output/entry.png (MAKEFUN_OUTPUT_DIR or ./out).
//
// Anchor: drand quicknet round 34053942.
// Stories verified against reports first published on 18 November 2026
// (Jagran Josh, Education Times, EIN Presswire live wire, AppiSToS,
// The Register AU, Motley Fool, Hindustan Times, Times of India,
// HuffPost, Gizmodo, Al Jazeera wire). Nothing dated before 18 Nov is
// presented as the day's news.

import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

const W = 1024;
const H = 1024;
const PAPER: [number, number, number] = [246, 241, 227];
const INK: [number, number, number] = [20, 20, 20];
const RED: [number, number, number] = [163, 22, 33];
const BLUE: [number, number, number] = [29, 78, 137];
const GREY: [number, number, number] = [96, 90, 78];
const RULE: [number, number, number] = [60, 55, 45];
const SEA: [number, number, number] = [203, 220, 233];
const LAND: [number, number, number] = [233, 221, 192];
const LANDLINE: [number, number, number] = [178, 163, 128];

// ---------------------------------------------------------------- font --
// 5x7 bitmap font, '#' = pixel on. Written from scratch for this entry.
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  a: ["00000", "00000", "01110", "00001", "01111", "10001", "01111"],
  b: ["10000", "10000", "11110", "10001", "10001", "10001", "11110"],
  c: ["00000", "00000", "01110", "10001", "10000", "10001", "01110"],
  d: ["00001", "00001", "01111", "10001", "10001", "10001", "01111"],
  e: ["00000", "00000", "01110", "10001", "11111", "10000", "01110"],
  f: ["00110", "01001", "01000", "11110", "01000", "01000", "01000"],
  g: ["00000", "01111", "10001", "10001", "01111", "00001", "01110"],
  h: ["10000", "10000", "11110", "10001", "10001", "10001", "10001"],
  i: ["00100", "00000", "01100", "00100", "00100", "00100", "01110"],
  j: ["00010", "00000", "00110", "00010", "00010", "10010", "01100"],
  k: ["10000", "10000", "10010", "10100", "11000", "10100", "10010"],
  l: ["01100", "00100", "00100", "00100", "00100", "00100", "01110"],
  m: ["00000", "00000", "11010", "10101", "10101", "10101", "10101"],
  n: ["00000", "00000", "11110", "10001", "10001", "10001", "10001"],
  o: ["00000", "00000", "01110", "10001", "10001", "10001", "01110"],
  p: ["00000", "11110", "10001", "10001", "11110", "10000", "10000"],
  q: ["00000", "00000", "01111", "10001", "10001", "01111", "00001"],
  r: ["00000", "00000", "10110", "11001", "10000", "10000", "10000"],
  s: ["00000", "00000", "01111", "10000", "01110", "00001", "11110"],
  t: ["01000", "01000", "11100", "01000", "01000", "01000", "00110"],
  u: ["00000", "00000", "10001", "10001", "10001", "10011", "01101"],
  v: ["00000", "00000", "10001", "10001", "10001", "01010", "00100"],
  w: ["00000", "00000", "10001", "10101", "10101", "10101", "01010"],
  x: ["00000", "00000", "10001", "01010", "00100", "01010", "10001"],
  y: ["00000", "00000", "10001", "10001", "01111", "00001", "01110"],
  z: ["00000", "00000", "11111", "00010", "00100", "01000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "—": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  '"': ["01010", "01010", "00000", "00000", "00000", "00000", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": ["00000", "00100", "00100", "01110", "00100", "00100", "00000"],
  "=": ["00000", "00000", "01110", "00000", "01110", "00000", "00000"],
  "*": ["00000", "10101", "01110", "11111", "01110", "10101", "00000"],
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
  "@": ["01110", "10001", "10111", "10101", "10110", "10000", "01110"],
  _: ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
  "•": ["00000", "00000", "01100", "01100", "00000", "00000", "00000"],
  "·": ["00000", "00000", "01100", "01100", "00000", "00000", "00000"],
};

// -------------------------------------------------------------- canvas --
const px = new Uint8Array(W * H * 3);
function fill(c: [number, number, number]): void {
  for (let i = 0; i < W * H; i++) {
    px[i * 3] = c[0];
    px[i * 3 + 1] = c[1];
    px[i * 3 + 2] = c[2];
  }
}
function setPix(x: number, y: number, c: [number, number, number]): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}
function fillRect(x: number, y: number, w: number, h: number, c: [number, number, number]): void {
  for (let yy = y; yy < y + h; yy++)
    for (let xx = x; xx < x + w; xx++) setPix(xx, yy, c);
}
function hline(x: number, y: number, w: number, c: [number, number, number], t = 1): void {
  fillRect(x, y, w, t, c);
}
function vline(x: number, y: number, h: number, c: [number, number, number], t = 1): void {
  fillRect(x, y, t, h, c);
}
function rect(x: number, y: number, w: number, h: number, c: [number, number, number], t = 1): void {
  hline(x, y, w, c, t);
  hline(x, y + h - t, w, c, t);
  vline(x, y, h, c, t);
  vline(x + w - t, y, h, c, t);
}
function disc(cx: number, cy: number, r: number, c: [number, number, number]): void {
  for (let yy = cy - r; yy <= cy + r; yy++)
    for (let xx = cx - r; xx <= cx + r; xx++) {
      const dx = xx - cx;
      const dy = yy - cy;
      if (dx * dx + dy * dy <= r * r) setPix(xx, yy, c);
    }
}
// Even-odd scanline polygon fill.
function poly(pts: [number, number][], c: [number, number, number]): void {
  let minY = H;
  let maxY = 0;
  for (const [, y] of pts) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  for (let y = minY; y <= maxY; y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(Math.round(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1)));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = xs[k]; x <= xs[k + 1]; x++) setPix(x, y, c);
    }
  }
}

// -------------------------------------------------------------- text ----
function charW(scale: number): number {
  return 6 * scale;
}
function textW(s: string, scale: number): number {
  return s.length * charW(scale) - scale;
}
function drawGlyph(x: number, y: number, ch: string, scale: number, c: [number, number, number], bold: boolean): void {
  const g = FONT[ch] || FONT[" "];
  for (let r = 0; r < 7; r++) {
    for (let col = 0; col < 5; col++) {
      if (g[r][col] === "1") {
        fillRect(x + col * scale, y + r * scale, scale, scale, c);
        if (bold && scale >= 2) fillRect(x + col * scale + 1, y + r * scale, scale, scale, c);
        if (bold && scale === 1) setPix(x + col + 1, y + r, c);
      }
    }
  }
}
function drawText(x: number, y: number, s: string, scale: number, c: [number, number, number], bold = false): number {
  let cx = x;
  for (const ch of s) {
    drawGlyph(cx, y, ch, scale, c, bold);
    cx += charW(scale);
  }
  return cx;
}
function drawCentered(y: number, s: string, scale: number, c: [number, number, number], bold = false): void {
  drawText(Math.round((W - textW(s, scale)) / 2), y, s, scale, c, bold);
}
// Word-wrap to maxW px at scale; returns lines (no hyphenation).
function wrap(s: string, maxW: number, scale: number): string[] {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur === "" ? w : cur + " " + w;
    if (textW(t, scale) <= maxW || cur === "") {
      cur = t;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}
function drawWrapped(x: number, y: number, s: string, scale: number, maxW: number, lh: number, c: [number, number, number], bold = false, maxLines = 99): number {
  const lines = wrap(s, maxW, scale).slice(0, maxLines);
  for (let i = 0; i < lines.length; i++) drawText(x, y + i * lh, lines[i], scale, c, bold);
  return y + lines.length * lh;
}

// -------------------------------------------------------------- stories --
interface Story {
  head: string;
  deck: string;
}
const COL1: Story[] = [
  { head: "UKRAINE HITS CRIMEA BRIDGE", deck: "Second straight day of strikes on the span; Russia hits bridges in Kyiv." },
  { head: "UN COUNTS UKRAINE'S DEAD", deck: "At least 372 civilians killed in October, UN monitors report." },
  { head: "LATVIA BACKS NEW CABINET", deck: "Parliament approves the Kulbergs government in a confidence vote." },
  { head: "BRITAIN SANCTIONS SETTLERS", deck: "Eight firms hit over illegal West Bank settlements." },
  { head: "TAIWAN FLIGHT ROW", deck: "US presses UN agency over restrictions; China hits back." },
  { head: "PLOTTER SENTENCED", deck: "Asif Merchant gets 27.5 years over a plot against US officials." },
  { head: "GREECE MARKS POLYTECHNIC", deck: "Athens police report on the November 17 anniversary events." },
  { head: "FCC NOMINEE FIGHT", deck: "Republicans scramble to add a third Trump nominee to the FCC." },
];
const COL2: Story[] = [
  { head: "IRAN DRONES HIT US RADAR", deck: "Drones strike a US military radar site in Bahrain." },
  { head: "KUWAIT INTERCEPTS DRONES", deck: "Army reports interceptions as Bahrain gives the all-clear." },
  { head: "GAZA CEASEFIRE WARNING", deck: "Board of Peace: the truce could collapse without action." },
  { head: "GAZA FAMILIES GO WITHOUT", deck: "WFP: one hot meal every two days as cooking gas runs short." },
  { head: "TANKER ATTACK CONDEMNED", deck: "India condemns strike on LPG carrier MT Tara Gas; 21 crew evacuated." },
  { head: "CYCLONE AKVAN GATHERS", deck: "Bay of Bengal storm set to turn severe by Thursday." },
  { head: "INDIA BACK AT THE ITU", deck: "Re-elected to the telecom council for 2027-2030." },
  { head: "PAKISTAN BLAST KILLS FIVE", deck: "Suicide car bombing at a checkpoint injures 13." },
];
const COL3: Story[] = [
  { head: "NVIDIA BEATS - $115.8BN", deck: "Revenue tops forecasts; Q4 guide $130bn in the first report under interim chief Kress." },
  { head: "ANTHROPIC PRICES ITS IPO", deck: "Claude maker expected to set $70-$78 a share today; trading starts Thursday as ANT." },
  { head: "FED MINUTES DUE TODAY", deck: "Record of the October meeting out at 2pm ET as markets watch." },
  { head: "AMAZON BETS $7BN ON INDIA", deck: "Renewable-energy investment planned by 2030." },
  { head: "COPILOT, 'THE NEW OS'", deck: "Microsoft pitches Copilot as the new OS for work at Ignite." },
  { head: "SPACEX CATCHES A STARSHIP", deck: "Returning spacecraft caught; what comes next." },
  { head: "NSA NETWORK GOES DOWN", deck: "Classified internal system hit by an outage." },
  { head: "DEEP-SEA ROCKS TEEM WITH LIFE", deck: "Scientists find mining-target rocks full of life." },
];

// -------------------------------------------------------------- the map --
// Schematic world map, equirectangular lon -170..190, lat 75..-55.
const MAP_X = 672;
const MAP_Y = 142;
const MAP_W = 320;
const MAP_H = 146;
function mx(lon: number): number {
  return Math.round(MAP_X + ((lon + 170) / 360) * MAP_W);
}
function my(lat: number): number {
  return Math.round(MAP_Y + ((75 - lat) / 130) * MAP_H);
}
function lonLatPoly(pts: [number, number][]): [number, number][] {
  return pts.map(([lon, lat]) => [mx(lon), my(lat)] as [number, number]);
}
const CONTINENTS: [number, number][][] = [
  // North America
  [[-168, 66], [-140, 70], [-120, 72], [-95, 70], [-80, 73], [-60, 60], [-55, 47], [-70, 42], [-75, 35], [-80, 26], [-90, 20], [-105, 20], [-115, 30], [-125, 40], [-145, 60], [-165, 60]],
  // Greenland
  [[-58, 76], [-40, 76], [-30, 70], [-45, 64], [-58, 68]],
  // South America
  [[-78, 8], [-60, 5], [-50, -5], [-40, -10], [-35, -25], [-45, -40], [-60, -52], [-70, -50], [-75, -35], [-80, -15]],
  // Africa
  [[-17, 15], [-10, 30], [10, 37], [30, 32], [43, 12], [50, 10], [48, -5], [40, -20], [32, -29], [20, -35], [12, -18], [8, 4], [-8, 5]],
  // Europe
  [[-10, 36], [0, 50], [10, 58], [20, 60], [30, 60], [40, 55], [30, 45], [20, 40], [10, 38], [0, 43]],
  // Asia
  [[40, 55], [60, 70], [90, 75], [120, 72], [150, 70], [180, 66], [170, 60], [160, 45], [150, 35], [140, 35], [130, 33], [120, 25], [110, 20], [105, 10], [100, 8], [95, 15], [85, 20], [75, 25], [65, 25], [55, 30], [45, 40]],
  // Australia
  [[113, -12], [130, -12], [142, -11], [150, -22], [154, -28], [150, -37], [140, -38], [130, -32], [120, -34], [113, -22]],
];
const DOTS: { lon: number; lat: number; label: string; lx: number; ly: number }[] = [
  { lon: 121, lat: 14.6, label: "MANILA", lx: 8, ly: -4 },
  { lon: 30.5, lat: 50.5, label: "KYIV", lx: 7, ly: -4 },
  { lon: 50.6, lat: 26.2, label: "BAHRAIN", lx: 7, ly: -10 },
  { lon: -0.1, lat: 51.5, label: "LONDON", lx: -44, ly: -4 },
  { lon: 77.2, lat: 28.6, label: "", lx: 0, ly: 0 },
  { lon: 114.1, lat: 22.5, label: "", lx: 0, ly: 0 },
];
function drawMap(): void {
  fillRect(MAP_X - 8, MAP_Y - 8, MAP_W + 16, MAP_H + 16, SEA);
  rect(MAP_X - 8, MAP_Y - 8, MAP_W + 16, MAP_H + 16, RULE, 1);
  for (const c of CONTINENTS) {
    poly(lonLatPoly(c), LAND);
    const pts = lonLatPoly(c);
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
      for (let s = 0; s <= steps; s++) {
        setPix(Math.round(x1 + ((x2 - x1) * s) / steps), Math.round(y1 + ((y2 - y1) * s) / steps), LANDLINE);
      }
    }
  }
  // Island dots: Indonesia / Philippines / Japan.
  for (const [lon, lat] of [[105, -2], [114, -3], [122, -8], [139, 36], [141, 42]] as [number, number][]) {
    disc(mx(lon), my(lat), 2, LAND);
  }
  for (const d of DOTS) {
    const x = mx(d.lon);
    const y = my(d.lat);
    disc(x, y, 4, RED);
    disc(x, y, 2, [255, 255, 255]);
    drawText(x + d.lx, y + d.ly, d.label, 1, INK, true);
  }
}

// -------------------------------------------------------------- layout ---
function drawColumn(x: number, yTop: number, stories: Story[]): void {
  const colW = 314;
  let y = yTop;
  for (let i = 0; i < stories.length; i++) {
    const s = stories[i];
    y = drawWrapped(x, y, s.head, 2, colW, 16, INK, true, 2);
    y = drawWrapped(x, y + 2, s.deck, 1, colW, 10, GREY, false, 2) + 8;
    if (i < stories.length - 1) {
      hline(x, y, colW, [205, 198, 180], 1);
      y += 9;
    }
  }
}

function build(): void {
  fill(PAPER);
  // Masthead.
  drawCentered(14, "THE WORLD TODAY", 7, INK, true);
  hline(24, 74, 976, INK, 3);
  hline(24, 79, 976, INK, 1);
  drawText(24, 88, "No. 323", 1, GREY);
  drawCentered(86, "WEDNESDAY 18 NOVEMBER 2026", 3, RED, true);
  drawText(1024 - 24 - textW("ONE DAY - ONE PAGE", 1), 88, "ONE DAY - ONE PAGE", 1, GREY);
  hline(24, 112, 976, INK, 2);

  // Lead story, left.
  drawText(24, 124, "LEAD STORY - ASIA-PACIFIC", 1, RED, true);
  drawText(24, 142, "TRUMP LANDS", 6, INK, true);
  drawText(24, 188, "IN MANILA", 6, INK, true);
  let y = 238;
  y = drawWrapped(24, y, "Quad talks open ahead of a China visit as leaders gather for APEC week.", 2, 624, 17, INK, false, 2);
  y = drawWrapped(24, y + 6, "Modi urges peace and stability at the ASEAN-India summit in Manila.", 1, 624, 11, GREY, false, 1) + 4;
  drawText(24, y, "AT RIGHT: THE DAY'S MAP -", 1, RED, true);
  drawText(24, y + 11, "where the news happened.", 1, GREY);

  // Map panel, right.
  drawText(664, 124, "THE DAY ON THE MAP", 1, RED, true);
  drawMap();
  drawText(664, 294, "Schematic - not to scale.", 1, GREY);

  // Section headers.
  hline(24, 314, 976, INK, 2);
  drawText(24, 324, "WAR & DIPLOMACY", 2, RED, true);
  drawText(354, 324, "MIDDLE EAST & ASIA", 2, RED, true);
  drawText(684, 324, "MARKETS & TECH", 2, RED, true);
  hline(24, 344, 976, RULE, 1);

  // Columns.
  drawColumn(24, 356, COL1);
  drawColumn(354, 356, COL2);
  drawColumn(684, 356, COL3);

  // Also-today strip.
  hline(24, 892, 976, INK, 2);
  drawText(24, 902, "ALSO TODAY", 2, RED, true);
  const also =
    "Hezbollah wary of Syria's new president, Knesset briefing says  •  GTA 6's Vice City court revealed by the Miami Heat  •  Kigali climate pact nears 90% ratification  •  JetBlue turbulence injures five on a Puerto Rico-Florida flight  •  Modi: world needs peace, stability and predictability  •  Earthshot Prize: PFAS-Free France wins the waste-free world award  •  Anwar arrives in Shenzhen for APEC week  •  Manipur shutdown ends after the killing of four Naga civilians  •  Russia's brown bears hit a historic 300,000  •  Haiti-US fans gather in Cincinnati despite ICE fears  •  Trump says a report of an Iran bomb plot is taken very seriously.";
  drawWrapped(24, 926, also, 1, 976, 12, INK, false, 4);

  // Footer.
  hline(24, 984, 976, RULE, 1);
  drawCentered(992, "Compiled from reports first published on Wednesday 18 November 2026 - make.fun picture of the day", 1, GREY);
}

// -------------------------------------------------------------- png ------
const CRC_TABLE: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}
function encodePNG(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// -------------------------------------------------------------- main -----
function main(): void {
  build();
  const png = encodePNG();
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "out";
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "entry.png");
  fs.writeFileSync(outPath, png);
  console.log("wrote " + outPath + " " + png.length + " bytes " + W + "x" + H);
}

main();
