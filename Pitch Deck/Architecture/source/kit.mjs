// A small kit for architecture diagrams in one visual language: icon tiles, frames, arrows, numbered steps.
import fs from "node:fs";

const FONT = fs.readFileSync("/Users/k.e.oshada/Documents/Xception/frontend/node_modules/@fontsource-variable/google-sans-flex/files/google-sans-flex-latin-wght-normal.woff2").toString("base64");

export const C = {
  ink: "#16252A", text2: "#5B6870", line: "#6A777F", frame: "#C9D3D2", teal: "#0E766D",
  surf: "#EDF2F1", outline: "#97A3A9", tint: "#F8FBFA", white: "#FFFFFF",
};

// Line icons on a 24 grid (Lucide style, ISC licence), stroked, never filled.
export const ICON = {
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  tablet: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M11 18h2"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  store: '<path d="M4 3h16l1.5 5H2.5z"/><path d="M2.5 8a3.2 3.2 0 0 0 6.4 0 3.2 3.2 0 0 0 6.2 0 3.2 3.2 0 0 0 6.4 0"/><path d="M4 11.5V21h16v-9.5"/><path d="M10 21v-5h4v5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  browser: '<rect x="2.5" y="3.5" width="19" height="17" rx="2"/><path d="M2.5 8.5h19M6 6h.01M9 6h.01"/>',
  cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M19 9h3M19 15h3M2 9h3M2 15h3"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/>',
  speaker: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  plug: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v4a6 6 0 0 1-12 0V8z"/>',
  bot: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8V4M9 4h6M8.5 13v2M15.5 13v2"/>',
  warehouse: '<path d="M2 21V8l10-5 10 5v13"/><path d="M6 21v-9h12v9M6 15h12M6 18h12"/>',
  sparkles: '<path d="m11 3 1.9 5.6L18.5 10.5l-5.6 1.9L11 18l-1.9-5.6L3.5 10.5l5.6-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  cloud: '<path d="M17.5 19H8a6 6 0 1 1 5.7-7.9A4.5 4.5 0 1 1 17.5 19z"/>',
  lock: '<rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  key: '<circle cx="7.5" cy="15.5" r="5"/><path d="m11 12 9.5-9.5M16 7l3 3M18.5 4.5l2 2"/>',
  server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6"/>',
  branch: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M6 8.5v7M18 8.5c0 5-6 4.5-10 8"/>',
  check: '<circle cx="12" cy="12" r="9.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  terminal: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="m7 10 3 2.5L7 15M12.5 15H17"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  refresh: '<path d="M20.5 12a8.5 8.5 0 0 1-14.6 5.9L3.5 15.5"/><path d="M3.5 12A8.5 8.5 0 0 1 18.1 6.1l2.4 2.4"/><path d="M20.5 3.5v5h-5M3.5 20.5v-5h5"/>',
  wifiOff: '<path d="M3 3l18 18"/><path d="M8.5 16.4a5 5 0 0 1 6.2-.6"/><path d="M5 12.9a10 10 0 0 1 4.6-2.6"/><path d="M19 12.9a10 10 0 0 0-2.6-1.8"/><path d="M2 8.8a15 15 0 0 1 3.7-2.4"/><path d="M22 8.8A15 15 0 0 0 10.5 5.1"/><path d="M12 20h.01"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  send: '<path d="M22 2 15 22l-4-9-9-4z"/><path d="M22 2 11 13"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.5 2"/>',
  truck: '<path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.6a1 1 0 0 0-.2-.6l-3.5-4.4a1 1 0 0 0-.8-.4H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
  route: '<circle cx="6" cy="19" r="2.5"/><path d="M8.5 19h8.5a3.5 3.5 0 0 0 0-7H7a3.5 3.5 0 0 1 0-7h8.5"/><circle cx="18" cy="5" r="2.5"/>',
  cart: '<circle cx="9" cy="20.5" r="1.3"/><circle cx="18" cy="20.5" r="1.3"/><path d="M2 2.5h3l2.6 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 7H6"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  bucket: '<path d="M4 6.5 6 20a2 2 0 0 0 2 1.7h8a2 2 0 0 0 2-1.7l2-13.5"/><ellipse cx="12" cy="6.5" rx="8" ry="2.8"/><path d="M5 11.5c2 1.3 12 1.3 14 0"/>',
  drive: '<path d="M22 12H2M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/><path d="M6 16h.01M10 16h.01"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5a14 14 0 0 1 0 19M12 2.5a14 14 0 0 0 0 19"/>',
  x: '<circle cx="12" cy="12" r="9.5"/><path d="m15 9-6 6M9 9l6 6"/>',
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const TILE = { core: [C.teal, "none", C.white], data: [C.ink, "none", C.white], ext: [C.white, C.outline, C.ink], person: [C.surf, "none", C.ink] };

export class Diagram {
  constructor(file, title, subtitle, { w = 1920, h = 1080 } = {}) {
    Object.assign(this, { file, title, subtitle, w, h });
    this.frames = []; this.arrows = []; this.nodes = []; this.top = [];
  }

  text(x, y, s, { size = 14, weight = 400, fill = C.text2, anchor = "start", halo = false, layer = "top" } = {}) {
    const h = halo ? ` paint-order="stroke" stroke="${C.white}" stroke-width="7" stroke-linejoin="round"` : "";
    this[layer].push(`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${h}>${esc(s)}</text>`);
  }

  glyph(icon, cx, cy, size, color, layer = "nodes") {
    const k = size / 24;
    this[layer].push(`<g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${k})" fill="none" stroke="${color}" stroke-width="${1.7}" stroke-linecap="round" stroke-linejoin="round">${ICON[icon]}</g>`);
  }

  tile(cx, cy, kind, icon, s = 64) {
    const [fill, stroke, glyph] = TILE[kind];
    const r = s * 0.2;
    this.nodes.push(`<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`);
    this.glyph(icon, cx, cy, s * 0.52, glyph);
  }

  /** An icon tile with its name and a few short lines, under it or to its right. Returns its anchor points. */
  node(cx, cy, kind, icon, name, sub = [], { labels = "below", badge = null, s = 64 } = {}) {
    this.tile(cx, cy, kind, icon, s);
    const half = s / 2;
    let bottom = cy + half;
    if (labels === "below") {
      this.text(cx, cy + half + 25, name, { size: 17, weight: 600, fill: C.ink, anchor: "middle", layer: "nodes" });
      sub.forEach((l, i) => this.text(cx, cy + half + 46 + i * 19, l, { size: 13.5, anchor: "middle", layer: "nodes" }));
      bottom = cy + half + 30 + sub.length * 19 + 8;
    } else {
      const total = 21 + sub.length * 19;
      const y0 = cy - total / 2 + 15;
      this.text(cx + half + 16, y0, name, { size: 17, weight: 600, fill: C.ink, layer: "nodes" });
      sub.forEach((l, i) => this.text(cx + half + 16, y0 + 21 + i * 19, l, { size: 13.5, layer: "nodes" }));
    }
    if (badge !== null) this.badge(cx - half - 4, cy - half - 4, badge);
    return { l: [cx - half, cy], r: [cx + half, cy], t: [cx, cy - half], b: [cx, bottom], tb: [cx, cy + half], cx, cy };
  }

  /** A small tile with one or two lines to its right, for lists inside a frame. */
  chip(cx, cy, kind, icon, name, sub = null) {
    this.tile(cx, cy, kind, icon, 40);
    if (sub) {
      this.text(cx + 32, cy - 3, name, { size: 15, weight: 600, fill: C.ink, layer: "nodes" });
      this.text(cx + 32, cy + 15, sub, { size: 12.5, layer: "nodes" });
    } else this.text(cx + 32, cy + 5, name, { size: 15, weight: 600, fill: C.ink, layer: "nodes" });
  }

  badge(x, y, n) {
    this.top.push(`<circle cx="${x}" cy="${y}" r="14" fill="${C.ink}" stroke="${C.white}" stroke-width="3"/>`);
    this.text(x, y + 5, String(n), { size: 14, weight: 700, fill: C.white, anchor: "middle" });
  }

  /** A group boundary with its name (and an icon) at the top left, like a cloud provider's region box. */
  frame(x, y, w, h, label, { icon = null, dashed = false, fill = "none", stroke = C.frame } = {}) {
    const d = dashed ? ' stroke-dasharray="7 6"' : "";
    this.frames.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="1.5"${d}/>`);
    let tx = x + 18;
    if (icon) {
      this.frames.push(`<path d="M${x} ${y + 34}V${y + 14}a14 14 0 0 1 14 -14H${x + 34}V${y + 34}z" fill="${C.ink}"/>`);
      this.glyph(icon, x + 17, y + 17, 20, C.white, "frames");
      tx = x + 46;
    }
    this.frames.push(`<text x="${tx}" y="${y + 23}" font-size="15" font-weight="600" fill="${C.ink}">${esc(label)}</text>`);
  }

  /** An orthogonal line through the given points; the label sits at `at`, or the middle of the longest leg. */
  arrow(pts, { dashed = false, label = null, at = null, both = false, head = true, color = C.line, width = 1.7, anchor = "middle", dy = -8 } = {}) {
    const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
    const dash = dashed ? ' stroke-dasharray="6 5"' : "";
    const m = `${head ? ' marker-end="url(#head)"' : ""}${both ? ' marker-start="url(#tail)"' : ""}`;
    this.arrows.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"${dash}${m} stroke-linejoin="round"/>`);
    if (label) {
      let p = at;
      if (!p) {
        let best = 0;
        for (let i = 1; i < pts.length; i++) {
          const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          if (len > best) { best = len; p = [(pts[i][0] + pts[i - 1][0]) / 2, (pts[i][1] + pts[i - 1][1]) / 2 + dy]; }
        }
      }
      [].concat(label).forEach((l, i) => this.text(p[0], p[1] + i * 17, l, { size: 13, fill: C.text2, anchor, halo: true }));
    }
  }

  dot(x, y) { this.arrows.push(`<circle cx="${x}" cy="${y}" r="4" fill="${C.line}"/>`); }

  legend(y = this.h - 42) {
    let x = 80;
    const item = (draw, label) => { draw(x); this.text(x + 34, y + 5, label, { size: 13.5, fill: C.text2 }); x += 34 + label.length * 7.1 + 34; };
    const sw = (kind, icon) => (x0) => this.tile(x0 + 12, y, kind, icon, 24);
    item(sw("core", "cpu"), "Part of GO");
    item(sw("data", "database"), "Keeps data");
    item(sw("ext", "globe"), "Outside service");
    item(sw("person", "user"), "Person");
    item((x0) => this.arrows.push(`<path d="M${x0} ${y}h26" stroke="${C.line}" stroke-width="1.7" marker-end="url(#head)"/>`), "Request or call");
    item((x0) => this.arrows.push(`<path d="M${x0} ${y}h26" stroke="${C.line}" stroke-width="1.7" stroke-dasharray="6 5" marker-end="url(#head)"/>`), "Event, in the background");
    item((x0) => this.badge(x0 + 12, y, 1), "Step in order");
    this.text(this.w - 80, y + 5, "Waypoint GO · Team Xception", { size: 13.5, weight: 600, fill: C.ink, anchor: "end" });
  }

  svg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}">
<defs>
<style>@font-face{font-family:GSF;src:url(data:font/woff2;base64,${FONT}) format("woff2");font-weight:100 1000}text{font-family:GSF,"Google Sans Flex",Helvetica,Arial,sans-serif}</style>
<marker id="head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0.8 L10 5 L0 9.2z" fill="${C.line}"/></marker>
<marker id="tail" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M10 0.8 L0 5 L10 9.2z" fill="${C.line}"/></marker>
</defs>
<rect width="${this.w}" height="${this.h}" fill="${C.white}"/>
<text x="80" y="92" font-size="36" font-weight="650" fill="${C.ink}">${esc(this.title)}</text>
<text x="80" y="128" font-size="18" fill="${C.text2}">${esc(this.subtitle)}</text>
${this.frames.join("\n")}
${this.arrows.join("\n")}
${this.nodes.join("\n")}
${this.top.join("\n")}
</svg>`;
  }
}
