// Builds the GO architecture diagrams: SVG (editable, scalable) and PNG at 2x for slides.
import fs from "node:fs";
import { chromium } from "/Users/k.e.oshada/Documents/Xception/frontend/node_modules/playwright/index.mjs";
import { Diagram, C } from "./kit.mjs";

const OUT = decodeURIComponent(new URL("../", import.meta.url).pathname);
const only = process.argv.slice(2);
const all = [];
const add = (fn) => all.push(fn);

// 1 ─ Overview: who uses GO, what it is made of, what it talks to.
add(() => {
  const d = new Diagram("01-system-overview", "Waypoint GO at a glance", "Five kinds of people, one web app, one backend that holds every rule, and a few outside services behind safe connectors.");
  d.frame(60, 170, 330, 800, "People", { icon: "users" });
  const ppl = [
    ["phone", "Store manager", ["orders, receipts, issues", "phone"]],
    ["monitor", "Dispatcher", ["plans the day, solves exceptions", "desktop"]],
    ["tablet", "Loader", ["loads in stop order", "dock tablet"]],
    ["phone", "Driver", ["delivers, works without signal", "phone"]],
    ["shield", "Admin", ["people, policies, settings", "desktop"]],
  ];
  ppl.forEach(([icon, name, sub], i) => d.node(118, 270 + i * 148, "person", icon, name, sub, { labels: "right" }));

  d.frame(470, 170, 930, 800, "Waypoint GO · runs on our server", { icon: "server", fill: C.tint });
  const web = d.node(610, 560, "core", "browser", "Web app", ["Next.js · four role screens", "installs, works offline"]);
  const be = d.node(950, 560, "core", "cpu", "Backend", ["Spring Boot · 13 modules", "every rule in one place"]);
  const mcp = d.node(950, 300, "core", "plug", "AI connector", ["MCP · read only"]);
  const db = d.node(620, 820, "data", "database", "Database", ["PostgreSQL 16", "one schema per module"]);
  const s3 = d.node(830, 820, "data", "bucket", "S3 bucket", ["voice notes, photos", "encrypted before upload"]);
  const ml = d.node(1040, 820, "core", "chart", "Prediction models", ["trained Datathon models", "lateness · demand"]);
  const sp = d.node(1250, 820, "core", "speaker", "Text to speech", ["Piper, on our server", "English · Sinhala · Tamil"]);

  d.arrow([[390, 560], web.l], { label: "HTTPS", at: [430, 550] });
  d.arrow([web.r, be.l], { label: "commands and reads", at: [780, 548] });
  d.arrow([mcp.b, be.t], { label: "acts as the person", at: [964, 470], anchor: "start" });
  d.arrow([be.b, [950, 720]], { head: false });
  d.arrow([[950, 720], [620, 720], db.t]);
  d.arrow([[830, 720], s3.t]);
  d.arrow([[950, 720], [1250, 720], sp.t]);
  d.arrow([[1040, 720], ml.t]);

  d.frame(1490, 170, 370, 800, "Outside services", { icon: "globe", dashed: true });
  const ai = d.node(1548, 300, "ext", "bot", "AI assistants", ["Claude, ChatGPT and others"], { labels: "right" });
  const outs = [
    ["warehouse", "Warehouse API", ["stock and product catalogue"]],
    ["mic", "Google Gemini", ["speech to text for voice notes"]],
    ["sparkles", "Language models", ["Groq, OpenRouter · chat help"]],
    ["bot", "Jev", ["sorts reports · via OpenRouter"]],
    ["bell", "Browser push", ["alerts on phones and desks"]],
  ].map(([icon, name, sub], i) => d.node(1548, 450 + i * 118, "ext", icon, name, sub, { labels: "right" }));
  d.arrow([ai.l, mcp.r], { label: "MCP · OAuth sign-in", at: [1230, 288] });
  d.arrow([be.r, [1440, 560]], { head: false, label: ["each behind a port", "and a circuit breaker"], at: [1200, 528] });
  d.arrow([[1440, 450], [1440, 922]], { head: false });
  outs.forEach((o) => d.arrow([[1440, o.cy], o.l]));
  d.legend();
  return d;
});


// 2 ─ Deployment: what runs where in production, and how code gets there.
add(() => {
  const d = new Diagram("02-deployment", "How GO runs in production", "One VPS behind Cloudflare and nginx; production and preview are the same stack with separate data; GitHub checks every change before it ships.");
  const users = d.node(130, 330, "person", "users", "People", ["phones, tablets,", "desktops"]);
  const cf = d.node(330, 330, "ext", "cloud", "Cloudflare", ["DNS · proxy", "Full (strict) TLS"]);
  d.arrow([users.r, cf.l], { label: "HTTPS" });

  d.frame(470, 170, 1030, 815, "VPS · Ubuntu 24.04 · Docker Compose", { icon: "server", fill: C.tint });
  const ng = d.node(580, 330, "core", "shieldCheck", "nginx", ["TLS · rate limits", "role addresses"]);
  d.arrow([cf.r, ng.l], { label: "proxied only", at: [455, 318] });

  d.frame(690, 215, 790, 595, "Production · waypointgo.live", { dashed: true, fill: C.white });
  const web = d.node(800, 330, "core", "browser", "Web app", ["Next.js"]);
  const be = d.node(1060, 330, "core", "cpu", "Backend", ["Spring Boot · Java 17"]);
  const db = d.node(1360, 330, "data", "database", "PostgreSQL 16", ["row-level security", "records, not files"]);
  const mcp = d.node(800, 600, "core", "plug", "MCP adapter", ["Node · read only"]);
  d.node(1060, 700, "core", "terminal", "init", ["migrate · import", "once, before start"]);
  const ml = d.node(1360, 530, "core", "chart", "Model service", ["FastAPI · LightGBM"]);
  const sp = d.node(1360, 700, "core", "speaker", "Text to speech", ["Piper · opt-in"]);
  d.arrow([ng.r, web.l]);
  d.arrow([web.r, be.l], { label: "/api" });
  d.arrow([web.b, mcp.t], { label: "/mcp", at: [812, 500], anchor: "start" });
  d.arrow([mcp.r, [1060, 600], be.b], { label: "fixed read-only calls", at: [946, 588] });
  d.arrow([be.r, db.l], { label: "one role per module", at: [1196, 318] });
  d.arrow([[1200, 330], [1200, 700]], { head: false });
  d.dot(1200, 330);
  d.arrow([[1200, 530], ml.l]);
  d.arrow([[1200, 700], sp.l]);

  d.frame(690, 835, 380, 130, "Preview · preview.waypointgo.live", { dashed: true, fill: C.white });
  d.chip(735, 910, "core", "layers", "Same services", "dev branch · own database");
  d.frame(1100, 835, 380, 130, "Monitoring", { dashed: true, fill: C.white });
  d.chip(1145, 910, "core", "activity", "Prometheus", "metrics · alerts");
  d.chip(1310, 910, "core", "search", "Loki · Grafana", "logs · dashboards");
  d.arrow([ng.b, [580, 910], [715, 910]], { label: ["preview", "addresses"], at: [592, 660], anchor: "start" });

  d.frame(60, 560, 370, 425, "GitHub", { icon: "branch" });
  const pr = d.node(112, 650, "ext", "branch", "Pull request", ["into dev, then main"], { labels: "right" });
  const ck = d.node(112, 775, "ext", "check", "Checks", ["unit, database, browser tests", "Task 2B validator"], { labels: "right" });
  const dp = d.node(112, 900, "ext", "terminal", "Deploy", ["SSH, forced command", "database dump first"], { labels: "right" });
  d.arrow([pr.b, ck.t]);
  d.arrow([ck.b, dp.t]);
  d.arrow([[430, 940], [470, 940]], { label: "deploy.sh", at: [450, 928] });

  d.frame(1560, 170, 300, 740, "Outside services", { icon: "globe", dashed: true });
  const outs = [
    ["warehouse", "Warehouse API", ["stock · catalogue"]],
    ["mic", "Google Gemini", ["speech to text"]],
    ["sparkles", "Language models", ["Groq · OpenRouter"]],
    ["bot", "Jev", ["via OpenRouter"]],
    ["bell", "Browser push", ["Web Push · VAPID"]],
    ["bucket", "S3 bucket", ["voice notes and photos", "encrypted before upload"]],
  ].map(([icon, name, sub], i) => d.node(1614, 290 + i * 115, "ext", icon, name, sub, { labels: "right" }));
  d.arrow([be.t, [1060, 250], [1530, 250], [1530, 865]], { head: false, label: "outbound, behind circuit breakers", at: [1290, 240] });
  outs.forEach((o) => d.arrow([[1530, o.cy], o.l]));
  d.legend();
  return d;
});

// 3 ─ Modules: one backend, split by business area, joined by events.
add(() => {
  const d = new Diagram("03-backend-modules", "Inside the backend", "One app split by business area. Each module owns its own schema and talks to others in three ways only: events, published reads, ports.");
  d.frame(80, 152, 1760, 135, "Outside the backend", { icon: "globe", dashed: true });
  const wapi = d.node(230, 230, "ext", "warehouse", "Warehouse API", ["stock · catalogue"], { labels: "right" });
  const msv = d.node(880, 230, "ext", "chart", "Model service", ["Datathon models"], { labels: "right" });
  const llm = d.node(1130, 230, "ext", "sparkles", "Language models", ["Groq · OpenRouter"], { labels: "right" });
  const jev = d.node(1380, 230, "ext", "bot", "Jev", ["via OpenRouter"], { labels: "right" });
  const gem = d.node(1620, 230, "ext", "mic", "Google Gemini", ["speech to text"], { labels: "right" });

  d.frame(80, 320, 1760, 680, "Backend", { icon: "cpu", fill: C.tint });
  d.frame(470, 350, 470, 190, "Read by every module, through contracts", { dashed: true, fill: C.white });
  d.node(590, 440, "core", "book", "Reference data", ["outlets, vehicles, calendar"]);
  d.node(820, 440, "core", "users", "Identity and access", ["people, policies, scope"]);
  const intel = d.node(1190, 440, "core", "chart", "Intelligence", ["predictions, AI checks"]);
  const msg = d.node(1620, 440, "core", "chat", "Messaging", ["trip chat, voice notes"]);
  d.arrow([intel.t, [1190, 330], [880, 330], msv.tb]);
  d.arrow([[1130, 330], llm.tb]);
  d.arrow([[1190, 330], [1380, 330], jev.tb]);
  d.arrow([msg.t, gem.tb]);

  d.frame(370, 575, 1190, 185, "The delivery day", { dashed: true, fill: C.white });
  const row = [
    ["warehouse", "Warehouse", ["stock, catalogue cache"]],
    ["cart", "Ordering", ["orders, cutoff"]],
    ["route", "Planning", ["allocate, defer, publish"]],
    ["box", "Loading", ["dock checks, shortfalls"]],
    ["truck", "Execution", ["stops, proof, fuel"]],
    ["clipboard", "Receipt", ["store confirms or disputes"]],
  ].map(([icon, name, sub], i) => d.node(230 + i * 240, 660, "core", icon, name, sub));
  d.arrow([row[0].t, wapi.tb], { both: true, label: "StockPort", at: [242, 470], anchor: "start" });
  d.arrow([row[0].r, row[1].l], { both: true, label: "reserve stock" });
  ["orders closed", "plan published", "trip released", "delivered"].forEach((l, i) => d.arrow([row[i + 1].r, row[i + 2].l], { label: l }));
  d.arrow([row[2].t, [710, 560], [1190, 560], intel.b], { label: "predict lateness, demand", at: [950, 552] });

  // The event bus: everything that is a consequence travels here.
  const busY = 800;
  d.arrow([[150, busY], [1780, busY]], { head: false, width: 3 });
  row.forEach((n) => { d.arrow([n.b, [n.cx, busY]], { dashed: true, head: false }); d.dot(n.cx, busY); });
  d.arrow([msg.b, [1620, busY]], { dashed: true, head: false }); d.dot(1620, busY);
  d.text(1110, 826, "Domain events through the outbox · at least once · each module reacts in its own transaction", { size: 13.5, weight: 600, fill: C.ink });
  [["alert", "Issues", ["problems to a resolution"]], ["bell", "Notification", ["in-app and push"]], ["refresh", "Sync", ["replays offline actions"]]]
    .forEach(([icon, name, sub], i) => { const n = d.node(350 + i * 240, 892, "core", icon, name, sub); d.arrow([[n.cx, busY], n.t], { dashed: true }); d.dot(n.cx, busY); });

  d.frame(1110, 845, 710, 135, "Platform · shared by every module", { fill: C.white });
  [["inbox", "Command bus"], ["send", "Outbox relay"], ["clock", "Scheduler"], ["file", "Audit log"]]
    .forEach(([icon, name], i) => d.chip(1150 + i * 172, 925, "core", icon, name));
  d.legend();
  return d;
});

// 4 ─ One write, end to end.
add(() => {
  const d = new Diagram("04-one-action", "One action, end to end", "Every change takes this one path, whether it was sent live or replayed later from a phone's offline queue.");
  const a = [
    ["person", "phone", "Person acts", ["e.g. a driver marks", "a stop delivered"]],
    ["data", "list", "Saved on the device", ["offline queue", "command id + version"]],
    ["core", "browser", "Web app", ["same-origin /api"]],
    ["core", "inbox", "Command bus", ["one door for", "every write"]],
    ["core", "layers", "Module handler", ["checks the rules", "in pure domain code"]],
    ["data", "database", "PostgreSQL", ["one transaction"]],
    ["core", "send", "Outbox relay", ["delivers each event", "at least once"]],
  ].map(([k, i, n, s], j) => d.node(150 + j * 240, 320, k, i, n, s, { badge: j + 1 }));
  ["saved first", "sent when online", "POST /api/commands", "all three pass", "", "after commit"].forEach((l, i) => d.arrow([a[i].r, a[i + 1].l], { label: l || null }));

  d.frame(745, 450, 255, 200, "Three checks", { fill: C.tint });
  d.chip(785, 505, "core", "key", "Signed in?", "session on the server");
  d.chip(785, 555, "core", "shieldCheck", "Allowed?", "policy AND scope");
  d.chip(785, 605, "core", "refresh", "Done before?", "same id, same answer");
  d.arrow([a[3].b, [870, 450]], { head: false, dashed: true });

  d.frame(1225, 450, 255, 200, "Written together", { fill: C.tint });
  d.chip(1265, 505, "data", "database", "The change", "only if version matches");
  d.chip(1265, 555, "data", "send", "The event", "in the outbox");
  d.chip(1265, 605, "data", "file", "Audit row", "who, what, why");
  d.arrow([a[5].b, [1350, 450]], { head: false, dashed: true });

  const b = [
    ["core", "layers", "Other modules", ["each reacts once,", "in its own transaction"]],
    ["core", "bell", "Notification", ["in-app and push"]],
    ["person", "monitor", "Others see it", ["dispatcher and store", "within seconds"]],
  ].map(([k, i, n, s], j) => d.node(1590 - j * 240, 790, k, i, n, s, { badge: 8 + j }));
  d.arrow([a[6].b, b[0].t], { dashed: true });
  d.arrow([b[0].l, b[1].r], { dashed: true });
  d.arrow([b[1].l, b[2].r], { dashed: true });

  d.frame(80, 690, 640, 280, "When it is refused, the person is told why", { icon: "alert" });
  d.chip(130, 765, "ext", "lock", "Not allowed", "403 · the attempt is recorded in the audit log");
  d.chip(130, 840, "ext", "alert", "Breaks a rule", "a clear answer naming every rule that failed");
  d.chip(130, 915, "ext", "x", "Someone changed it first", "409 · never a silent overwrite, never merged");
  d.arrow([[870, 650], [870, 830], [720, 830]], { dashed: true, label: "refused", at: [880, 760], anchor: "start" });
  d.legend();
  return d;
});

// 5 ─ Offline first.
add(() => {
  const d = new Diagram("05-offline-first", "Works without signal", "Saved on the device first, sent when there is signal, and the server stays the authority. A conflict goes to a person; nothing is merged.");
  d.frame(80, 175, 690, 555, "On the driver's phone", { icon: "phone", fill: C.tint });
  const scr = d.node(210, 330, "person", "phone", "Driver", ["taps, signs,", "photographs"], { badge: 1 });
  const q = d.node(500, 330, "data", "list", "Saved here first", ["offline queue", "survives a reload"], { badge: 2 });
  const sh = d.node(210, 590, "core", "browser", "App shell", ["service worker", "opens with no signal"]);
  const tr = d.node(500, 590, "data", "database", "Today's trip", ["stops, orders, proof", "kept on the device"]);
  d.arrow([scr.r, q.l], { label: "every action" });
  d.arrow([scr.b, sh.t], { dashed: true, both: true, head: true, label: "loads offline", at: [222, 470], anchor: "start" });
  d.arrow([tr.l, sh.r], { dashed: true, label: "reads from" });

  d.node(865, 560, "ext", "wifiOff", "No signal", ["the queue waits,", "the driver keeps going"]);

  d.frame(960, 175, 880, 555, "On our server", { icon: "server", fill: C.tint });
  const sy = d.node(1090, 330, "core", "refresh", "Sync", ["replays in order,", "once each"], { badge: 3 });
  const bus = d.node(1370, 330, "core", "inbox", "Same checks", ["as a live action"], { badge: 4 });
  const db = d.node(1660, 330, "data", "database", "Saved", ["the server is", "the authority"], { badge: 5 });
  const cf = d.node(1370, 600, "core", "alert", "Conflict held", ["never merged,", "never overwritten"], { badge: 6 });
  const ds = d.node(1660, 600, "person", "monitor", "Dispatcher decides", ["both versions", "side by side"]);
  d.arrow([[532, 315], [1058, 315]], { label: "back in coverage · retries with backoff and jitter", at: [795, 303] });
  d.arrow([[1058, 345], [532, 345]], { dashed: true, label: "confirmed, leaves the queue", at: [795, 370] });
  d.arrow([sy.r, bus.l]);
  d.arrow([bus.r, db.l], { label: "accepted" });
  d.arrow([bus.b, cf.t], { label: ["changed by someone", "else meanwhile"], at: [1382, 455], anchor: "start" });
  d.arrow([cf.r, ds.l]);

  d.frame(80, 775, 1760, 200, "How much each role works offline", { icon: "wifiOff" });
  [["phone", "Driver", ["fully offline", "a whole trip without signal"]], ["tablet", "Loader", ["resilient", "survives drops on the dock"]],
    ["phone", "Store manager", ["resilient", "receipts saved, sent later"]], ["monitor", "Dispatcher", ["online only", "plans need live data"]]]
    .forEach(([icon, name, sub], i) => d.node(150 + i * 440, 885, "person", icon, name, sub, { labels: "right" }));
  d.legend();
  return d;
});

// 6 ─ Access: policy decides actions, scope decides rows, the database enforces it.
add(() => {
  const d = new Diagram("06-access-control", "Who can do what", "Policy decides the action, scope decides the rows, and the database enforces it. Changes apply on the next request; every denial is recorded.");
  const p = d.node(150, 330, "person", "user", "Person", ["signs in once"]);
  const se = d.node(410, 330, "core", "key", "Session", ["opaque cookie,", "kept on the server"]);
  d.frame(600, 215, 460, 245, "Effective access = policy AND scope", { dashed: true, fill: C.tint });
  const po = d.node(690, 330, "core", "shieldCheck", "Policy", ["may this person", "do this action?"]);
  const sc = d.node(970, 330, "core", "pin", "Scope", ["for which depots", "and stores?"]);
  const rl = d.node(1250, 330, "data", "lock", "Row-level security", ["the database filters", "every row itself"]);
  const da = d.node(1530, 330, "data", "database", "Their rows only", ["nothing else", "is ever read"]);
  d.arrow([p.r, se.l], { label: "sign in" });
  d.arrow([se.r, po.l], { label: "every request" });
  d.arrow([po.r, sc.l], { label: "allowed" });
  d.arrow([sc.r, rl.l], { label: "in SQL" });
  d.arrow([rl.r, da.l]);
  const au = d.node(1250, 620, "data", "file", "Audit log", ["allowed and denied:", "who, what, when"]);
  d.arrow([sc.b, [970, 620], au.l], { dashed: true, label: "denied · 403, recorded", at: [1100, 608] });

  const ai = d.node(150, 620, "ext", "bot", "AI assistant", ["Claude, ChatGPT"]);
  const mc = d.node(410, 620, "core", "plug", "AI connector", ["acts as the person,", "read only"]);
  d.arrow([ai.r, mc.l], { label: "OAuth" });
  d.arrow([mc.t, se.b]);

  const ad = d.node(150, 860, "person", "shield", "Admin", ["writes the rules"]);
  const ed = d.node(410, 860, "core", "edit", "Policy editor", ["shows who gains or loses,", "needs a reason"]);
  const nv = d.node(690, 860, "data", "layers", "New version", ["old ones kept, cache", "cleared, next request"]);
  d.arrow([ad.r, ed.l]);
  d.arrow([ed.r, nv.l], { label: "save" });
  d.arrow([nv.t, po.b], { label: "in force at once", at: [702, 560], anchor: "start" });
  d.legend();
  return d;
});

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
for (const fn of all) {
  const d = fn();
  if (only.length && !only.some((o) => d.file.startsWith(o))) continue;
  const svg = d.svg();
  fs.writeFileSync(`${OUT}${d.file}.svg`, svg);
  await page.setViewportSize({ width: d.w, height: d.h });
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}${d.file}.png` });
  console.log("built", d.file);
}
await browser.close();
