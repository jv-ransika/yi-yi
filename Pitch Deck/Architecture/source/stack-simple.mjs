// Builds the simple tech stack slide: the core tools only, logo and name, nothing else.
import fs from "node:fs";
import { chromium } from "/Users/k.e.oshada/Documents/Xception/frontend/node_modules/playwright/index.mjs";
import { C } from "./kit.mjs";

const OUT = decodeURIComponent(new URL("../", import.meta.url).pathname);
const BRAND = JSON.parse(fs.readFileSync(new URL("./brands.json", import.meta.url), "utf8"));
const FONT = fs.readFileSync("/Users/k.e.oshada/Documents/Xception/frontend/node_modules/@fontsource-variable/google-sans-flex/files/google-sans-flex-latin-wght-normal.woff2").toString("base64");
const W = 1920, H = 1080;

// A colour logo file in brand-color/ (Devicon, MIT; Gemini from LobeHub icons, MIT), or a drawn mark.
const TYPESAFE = "M 12.756 2.928 L 12.756 7.067 L 16.486 9.487 L 16.487 18.652 L 8.244 24 L 3.732 21.073 L 3.732 16.82 L 0 14.399 L 0 5.35 L 0.355 5.118 L 8.244 0 Z M 5.94 20.65 L 8.242 22.144 L 14.275 18.227 L 11.975 16.735 Z M 9.022 10.332 L 9.022 14.4 L 5.29 16.822 L 5.29 19.216 L 11.197 15.383 L 11.197 8.921 Z M 12.756 15.384 L 14.928 16.794 L 14.928 10.332 L 12.756 8.922 Z M 2.21 13.976 L 4.511 15.47 L 6.812 13.976 L 4.512 12.485 Z M 1.559 6.193 L 1.559 12.544 L 3.731 11.134 L 3.731 7.066 L 7.464 4.643 L 7.464 2.36 L 1.56 6.193 Z M 5.291 11.132 L 7.463 12.542 L 7.463 10.332 L 5.292 8.921 L 5.292 11.132 Z M 5.94 7.487 L 8.244 8.981 L 10.544 7.488 L 8.244 5.994 Z M 9.024 4.643 L 11.196 6.054 L 11.196 3.774 L 9.024 2.359 Z";
const TOOLS = [
  ["springboot", "Spring Boot"], ["nextjs-original", "Next.js"], ["tailwindcss-original", "Tailwind CSS"], ["postgresql-original", "PostgreSQL"], ["fastapi-original", "FastAPI"],
  ["scikitlearn-original", "scikit-learn"], ["docker-original", "Docker"], ["cloudflare-original", "Cloudflare"], ["gemini-color", "Google Gemini"], ["typesafe", "Jev by TypeSafe"],
];
const file = (name) => `data:image/svg+xml;base64,${fs.readFileSync(new URL(`./brand-color/${name}.svg`, import.meta.url)).toString("base64")}`;

const out = [];
const COLS = 5, CARD = 220, GAP = 40;
const x0 = (W - (COLS * CARD + (COLS - 1) * GAP)) / 2, y0 = 345;
TOOLS.forEach(([logo, name], i) => {
  const inRow = Math.min(COLS, TOOLS.length - Math.floor(i / COLS) * COLS); // a short last row is centred
  const x = x0 + ((COLS - inRow) * (CARD + GAP)) / 2 + (i % COLS) * (CARD + GAP), y = y0 + Math.floor(i / COLS) * (CARD + 70);
  const s = logo === "scikitlearn-original" ? 124 : 96, cx = x + CARD / 2, cy = y + CARD / 2;
  out.push(`<rect x="${x}" y="${y}" width="${CARD}" height="${CARD}" rx="28" fill="${C.tint}" stroke="${C.frame}" stroke-width="1.2"/>`);
  if (logo === "springboot") out.push(`<path transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 24})" d="${BRAND.springboot}" fill="#6DB33F"/>`);
  else if (logo === "typesafe") {
    out.push(`<circle cx="${cx}" cy="${cy}" r="${s / 2 + 4}" fill="#E551BA"/>`);
    out.push(`<path transform="translate(${cx - (54 * 16.487) / 24 / 2} ${cy - 27}) scale(${54 / 24})" d="${TYPESAFE}" fill="#1E1E1E"/>`);
  } else out.push(`<image href="${file(logo)}" x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}"/>`);
  out.push(`<text x="${cx}" y="${y + CARD + 40}" font-size="22" font-weight="600" fill="${C.ink}" text-anchor="middle">${name}</text>`);
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><style>@font-face{font-family:GSF;src:url(data:font/woff2;base64,${FONT}) format("woff2");font-weight:100 1000}text{font-family:GSF,"Google Sans Flex",Helvetica,Arial,sans-serif}</style></defs>
<rect width="${W}" height="${H}" fill="${C.white}"/>
<text x="${W / 2}" y="225" font-size="56" font-weight="650" fill="${C.ink}" text-anchor="middle">Tech stack</text>
${out.join("\n")}
</svg>`;
fs.writeFileSync(`${OUT}07-tech-stack-simple.svg`, svg);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(150);
await page.screenshot({ path: `${OUT}07-tech-stack-simple.png` });
await browser.close();
console.log("built 07-tech-stack-simple");
