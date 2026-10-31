// Builds the tech stack slide: four layers, each with what it means for the business and the tools in it.
// Logos are Simple Icons (CC0) path data in brands.json, drawn in one ink colour; a tool without one uses a line icon.
import fs from "node:fs";
import { chromium } from "/Users/k.e.oshada/Documents/Xception/frontend/node_modules/playwright/index.mjs";
import { C, ICON } from "./kit.mjs";

const OUT = decodeURIComponent(new URL("../", import.meta.url).pathname);
const BRAND = JSON.parse(fs.readFileSync(new URL("./brands.json", import.meta.url), "utf8"));
const FONT = fs.readFileSync("/Users/k.e.oshada/Documents/Xception/frontend/node_modules/@fontsource-variable/google-sans-flex/files/google-sans-flex-latin-wght-normal.woff2").toString("base64");
const W = 1920, H = 1080;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const out = [];
const text = (x, y, s, { size = 14, weight = 400, fill = C.text2, anchor = "start", spacing = 0 } = {}) =>
  out.push(`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ""}>${esc(s)}</text>`);
const wrap = (s, max) => s.split(" ").reduce((lines, w) => {
  const last = lines[lines.length - 1];
  if (last && (last + " " + w).length <= max) lines[lines.length - 1] = last + " " + w; else lines.push(w);
  return lines;
}, []);

// [brand slug or "icon:<lucide name>", name, what it does for us]
const LAYERS = [
  ["browser", "Apps people use", "One web app for all four roles, on a phone, tablet or laptop, and it keeps working with no signal.", [
    ["nextdotjs", "Next.js", "web app framework"],
    ["react", "React", "every screen"],
    ["typescript", "TypeScript", "safer code"],
    ["tailwindcss", "Tailwind CSS", "one look, every role"],
    ["leaflet", "Leaflet", "live maps"],
    ["pwa", "Progressive web app", "installs, works offline"],
  ]],
  ["layers", "Business core and data", "Every action is checked, versioned and on record. Each person sees only their own stores and trips.", [
    ["openjdk", "Java 17", "business rules"],
    ["springboot", "Spring Boot", "13 modules, one service"],
    ["postgresql", "PostgreSQL", "rows by permission"],
    ["cloudflare", "Cloudflare R2", "encrypted photos, voice"],
    ["icon:clipboard", "Audit log", "who, what and when"],
    ["icon:shieldCheck", "Access policies", "change rights, no release"],
  ]],
  ["sparkles", "Intelligence", "Predicts, listens and speaks in three languages. AI suggests, and a person decides.", [
    ["python", "Python", "model service"],
    ["fastapi", "FastAPI", "serves predictions"],
    ["icon:chart", "LightGBM", "our Datathon models"],
    ["icon:speaker", "Piper", "speaks Sinhala, Tamil"],
    ["googlegemini", "Google Gemini", "voice notes to text"],
    ["openrouter", "OpenRouter", "language models, Jev"],
    ["modelcontextprotocol", "MCP", "your own AI assistant"],
  ]],
  ["server", "Runs on", "One server for about USD 58 a month, with automatic checks before every release.", [
    ["ubuntu", "Ubuntu", "one server"],
    ["docker", "Docker", "same build everywhere"],
    ["nginx", "nginx", "the front door"],
    ["cloudflare", "Cloudflare", "security and speed"],
    ["githubactions", "GitHub Actions", "checks every change"],
    ["prometheus", "Prometheus", "metrics and alerts"],
    ["grafana", "Grafana", "dashboards"],
  ]],
];

// Header: what this is, then three numbers a business reader cares about.
text(80, 72, "TECH STACK", { size: 15, weight: 700, fill: C.teal, spacing: 2.5 });
text(80, 124, "Built on proven, open technology", { size: 46, weight: 650, fill: C.ink });
text(80, 162, "Tools large companies already run and local engineers already know, at a small running cost.", { size: 19 });
const STATS = [["USD 58", "a month to run, estimated"], ["0", "licence fees, core stack"], ["1 app", "every role, every device"]];
STATS.forEach(([v, l], i) => {
  const x = 1180 + i * 235;
  if (i) out.push(`<path d="M${x - 24} 82v76" stroke="${C.frame}" stroke-width="1.5"/>`);
  text(x, 122, v, { size: 40, weight: 650, fill: C.teal });
  text(x, 152, l, { size: 14.5 });
});

// The four layers.
const Y0 = 212, RH = 178, GAP = 16, SLOT = 176, X0 = 612;
LAYERS.forEach(([icon, name, value, tools], r) => {
  const y = Y0 + r * (RH + GAP), mid = y + RH / 2;
  out.push(`<rect x="80" y="${y}" width="1760" height="${RH}" rx="20" fill="${C.tint}" stroke="${C.frame}" stroke-width="1.2"/>`);
  out.push(`<rect x="114" y="${mid - 32}" width="64" height="64" rx="13" fill="${C.teal}"/>`);
  out.push(`<g transform="translate(${146 - 17} ${mid - 17}) scale(${34 / 24})" fill="none" stroke="${C.white}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON[icon]}</g>`);
  const lines = wrap(value, 42);
  const top = mid - (30 + lines.length * 21) / 2 + 20;
  text(204, top, name, { size: 23, weight: 650, fill: C.ink });
  lines.forEach((l, i) => text(204, top + 30 + i * 21, l, { size: 15.5 }));
  out.push(`<path d="M582 ${y + 26}V${y + RH - 26}" stroke="${C.frame}" stroke-width="1.5"/>`);
  tools.forEach(([logo, tool, role], i) => {
    const cx = X0 + SLOT / 2 + i * SLOT, cy = y + 64, s = 48;
    if (logo.startsWith("icon:")) {
      out.push(`<g transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 24})" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[logo.slice(5)]}</g>`);
    } else {
      out.push(`<path transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 24})" d="${BRAND[logo]}" fill="${C.ink}"/>`);
    }
    text(cx, y + 126, tool, { size: 16, weight: 600, fill: C.ink, anchor: "middle" });
    text(cx, y + 148, role, { size: 13.5, anchor: "middle" });
  });
});

text(80, 1036, "Waypoint GO · Team Xception", { size: 13.5, weight: 600, fill: C.ink });
text(W - 80, 1036, "Logos are trademarks of their owners and name the tools GO is built with.", { size: 12.5, anchor: "end" });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><style>@font-face{font-family:GSF;src:url(data:font/woff2;base64,${FONT}) format("woff2");font-weight:100 1000}text{font-family:GSF,"Google Sans Flex",Helvetica,Arial,sans-serif}</style></defs>
<rect width="${W}" height="${H}" fill="${C.white}"/>
${out.join("\n")}
</svg>`;
fs.writeFileSync(`${OUT}07-tech-stack.svg`, svg);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(150);
await page.screenshot({ path: `${OUT}07-tech-stack.png` });
await browser.close();
console.log("built 07-tech-stack");
