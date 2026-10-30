// Gemeinsame Browser-Hilfe für die QA-Skripte (puppeteer-core, vorhandenes Chrome).
import puppeteer from "puppeteer-core";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Immer aus dem Projektstamm arbeiten, egal von wo das Skript gestartet wird
process.chdir(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));
// Chrome for Testing im Projektordner (gitignoriert): npx @puppeteer/browsers install chrome@<Version aus node_modules/puppeteer-core/lib/puppeteer/revisions.js>
// Es passt genau zur installierten puppeteer-core-Version; das System-Chrome aktualisiert sich selbst und läuft Puppeteer voraus.
function chromeForTesting() {
  try {
    return readdirSync("chrome").flatMap((v) => [
      path.join("chrome", v, "chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
      path.join("chrome", v, "chrome-mac-x64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
      path.join("chrome", v, "chrome-linux64", "chrome"),
      path.join("chrome", v, "chrome-win64", "chrome.exe"),
    ]).filter((p) => existsSync(p)).sort().reverse();
  } catch { return []; }
}
const KANDIDATEN = [
  process.env.CHROME_PATH,
  ...chromeForTesting(),
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
export const BASE = process.env.BASE ?? "http://localhost:4321/rechtsanwalt-bessler-demo";
export const EIGENE_ORIGINS = new Set([new URL(BASE).origin]);
export async function browserStarten() {
  const pfad = KANDIDATEN.find((p) => existsSync(p));
  if (!pfad) throw new Error("Kein Chrome gefunden. CHROME_PATH setzen.");
  return puppeteer.launch({ executablePath: pfad, headless: true, args: ["--hide-scrollbars", ...(process.env.CI ? ["--no-sandbox"] : [])] });
}
/** Sammelt alle Anfragen an fremde Hosts (die Website darf keine auslösen). */
export function externeAnfragen(page) {
  const liste = [];
  page.on("request", (r) => {
    try { const u = new URL(r.url()); if (!EIGENE_ORIGINS.has(u.origin) && u.protocol.startsWith("http")) liste.push(u.host + u.pathname.slice(0, 40)); } catch {}
  });
  return liste;
}
export const warten = (ms) => new Promise((r) => setTimeout(r, ms));
/** Alle Publikationen aus den lokalen Inhalten. */
export function publikationen() {
  return readdirSync("data/publikationen").filter((d) => d.endsWith(".json") && d !== "pruefsummen.json").map((d) => JSON.parse(readFileSync(path.join("data/publikationen", d), "utf8")).slug);
}
/** Alle Seiten der Website: feste Seiten plus eine je Publikation. */
export function alleSeiten() {
  return ["/", "/person/", "/rechtsgebiete/", "/coaching/", "/publikationen/", ...publikationen().map((s) => `/publikationen/${s}/`), "/kontakt/", "/links/", "/impressum/", "/datenschutz/"];
}
