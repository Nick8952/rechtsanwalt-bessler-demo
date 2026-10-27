// Erzeugt aus den Originalen in assets/originale/ die Web-Varianten in public/bilder/ und schreibt das Bildverzeichnis
// data/bilder.json (Masse, Varianten, Alternativtext, Bildnachweis). Ausserdem das Vorschaubild für geteilte Links und die
// App-Icons. Aufruf: npm run bilder   (idempotent: public/bilder wird neu aufgebaut)
//
// Zuordnung id → Originaldatei samt Nachweis: scripts/bilder-liste.json. Herkunft jeder Datei: assets/originale/HERKUNFT.md
// Es wird nie hochskaliert: Breiten über der Originalbreite werden auf die Originalbreite gekappt. Dateinamen tragen einen
// Inhalts-Hash, damit Browser nach Bildwechseln nichts Altes zeigen.
import sharp from "sharp";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const WURZEL = path.resolve(import.meta.dirname, "..");
const QUELLE = path.join(WURZEL, "assets/originale");
const ZIEL = path.join(WURZEL, "public/bilder");
const BILDER = JSON.parse(await readFile(path.join(WURZEL, "scripts/bilder-liste.json"), "utf8"));
const PAPIER = "#f7f6f2";
const GRUEN = "#1f5c47";

// Erst alle Quellen prüfen, in einen temporären Ordner rendern und zum Schluss atomar austauschen (kein halber Bestand bei Fehlern).
for (const [id, cfg] of Object.entries(BILDER)) {
  const meta = await sharp(path.join(QUELLE, cfg.datei)).metadata().catch(() => null);
  if (!meta?.width || !meta?.height) throw new Error(`Bild «${id}»: ${cfg.datei} fehlt oder ist nicht lesbar.`);
  if (typeof cfg.alt !== "string") throw new Error(`Bild «${id}»: Alternativtext fehlt (leer "" nur für rein dekorative Bilder).`);
  if (!cfg.nachweis?.urheber || !cfg.nachweis?.quelle || !cfg.nachweis?.lizenz) throw new Error(`Bild «${id}»: Bildnachweis (urheber, quelle, lizenz) ist unvollständig.`);
}
const TEMP = `${ZIEL}.neu`;
await rm(TEMP, { recursive: true, force: true });
await mkdir(TEMP, { recursive: true });

async function schreiben(id, pipe, format) {
  const fertig = format === "avif" ? pipe.avif({ quality: 52, effort: 6 }) : format === "jpg" ? pipe.jpeg({ quality: 84, mozjpeg: true }) : pipe.webp({ quality: 74 });
  const { data, info } = await fertig.toBuffer({ resolveWithObject: true });
  const endung = format === "avif" ? "avif" : format === "jpg" ? "jpg" : "webp";
  const hash = createHash("sha1").update(data).digest("hex").slice(0, 8);
  const dateiname = `${id}-${info.width}-${hash}.${endung}`;
  await writeFile(path.join(TEMP, dateiname), data);
  return { breite: info.width, hoehe: info.height, url: `/bilder/${dateiname}`, bytes: data.length };
}

const verzeichnis = {};
for (const [id, cfg] of Object.entries(BILDER)) {
  const pfad = path.join(QUELLE, cfg.datei);
  const meta = await sharp(pfad).metadata();
  const basis = sharp(pfad).rotate();
  const ratio = meta.width / meta.height;
  const breiten = [...new Set(cfg.breiten.map((b) => Math.min(b, meta.width)))].sort((a, b) => a - b);
  const avif = [];
  const webp = [];
  for (const b of breiten) {
    const h = Math.round(b / ratio);
    const puffer = await basis.clone().resize({ width: b, height: h, fit: "cover", withoutEnlargement: true }).png().toBuffer();
    avif.push(await schreiben(id, sharp(puffer), "avif"));
    webp.push(await schreiben(id, sharp(puffer), "webp"));
  }
  const groesste = webp[webp.length - 1];
  verzeichnis[id] = {
    id, art: cfg.art, original: `assets/originale/${cfg.datei}`, breite: groesste.breite, hoehe: groesste.hoehe, alt: cfg.alt, legende: cfg.legende ?? null,
    nachweis: cfg.nachweis, abgerufen: cfg.abgerufen, bearbeitung: cfg.bearbeitung ?? null,
    quellen: { avif: avif.map(({ breite, url }) => ({ breite, url })), webp: webp.map(({ breite, url }) => ({ breite, url })) },
    bytes: { avif: avif.map((v) => v.bytes), webp: webp.map((v) => v.bytes) },
  };
}

// Vorschaubild für geteilte Links (Open Graph, 1200 × 630): Papiergrund der Website, darauf das unveränderte Portrait in seiner
// Originalgrösse (652 × 316, nie hochskaliert) und die grüne Linie der Gestaltung. Keine Texte, die eine Schrift bräuchten.
{
  const portrait = await sharp(path.join(QUELLE, BILDER.portrait.datei)).rotate().toBuffer();
  const pm = await sharp(portrait).metadata();
  const linie = await sharp({ create: { width: pm.width, height: 4, channels: 3, background: GRUEN } }).png().toBuffer();
  const top = Math.round((630 - pm.height - 28) / 2);
  const og = sharp({ create: { width: 1200, height: 630, channels: 3, background: PAPIER } }).composite([
    { input: portrait, left: Math.round((1200 - pm.width) / 2), top },
    { input: linie, left: Math.round((1200 - pm.width) / 2), top: top + pm.height + 24 },
  ]);
  const { breite, hoehe, url, bytes } = await schreiben("og-bessler", og, "jpg");
  verzeichnis["og-bessler"] = {
    id: "og-bessler", art: "foto", original: "erzeugt aus assets/originale/p002_1_00.jpg (Portrait, unverändert) auf dem Papiergrund der Website", breite, hoehe,
    alt: "Michael Bessler in seiner Kanzlei in Zürich", legende: null,
    nachweis: { urheber: "Fotografin oder Fotograf auf der bisherigen Website nicht genannt", titel: "Vorschaubild für geteilte Links", quelle: "https://www.rechtsanwaltbessler.ch/images/p002_1_00.jpg; Montage von scripts/bilder-optimieren.mjs", lizenz: "Nutzung in der Demo vorbehaltlich Freigabe durch Michael Bessler" },
    abgerufen: BILDER.portrait.abgerufen, bearbeitung: "Montage: Portrait unverändert auf Papiergrund mit grüner Linie",
    quellen: { avif: [], webp: [{ breite, url }] }, bytes: { avif: [], webp: [bytes] },
  };
}

// App-Icons aus einer einfachen Marke: grünes Quadrat mit einem serifenlosen Grossbuchstaben B (kein Logo der Kanzlei vorhanden).
{
  const svg = (groesse) => `<svg xmlns="http://www.w3.org/2000/svg" width="${groesse}" height="${groesse}" viewBox="0 0 64 64"><rect width="64" height="64" fill="${GRUEN}"/><text x="32" y="46" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="40" fill="${PAPIER}">B</text></svg>`;
  await writeFile(path.join(WURZEL, "app/apple-icon.png"), await sharp(Buffer.from(svg(180))).png().toBuffer());
  await writeFile(path.join(WURZEL, "app/icon.png"), await sharp(Buffer.from(svg(64))).png().toBuffer());
}

const ALT = `${ZIEL}.alt`;
await rm(ALT, { recursive: true, force: true });
let hatteAlt = false;
try { await rename(ZIEL, ALT); hatteAlt = true; } catch { /* noch kein Bestand */ }
try {
  await rename(TEMP, ZIEL);
} catch (err) {
  if (hatteAlt) await rename(ALT, ZIEL);
  throw err;
}
await rm(ALT, { recursive: true, force: true });
await mkdir(path.join(WURZEL, "data"), { recursive: true });
await writeFile(path.join(WURZEL, "data/bilder.json"), JSON.stringify(verzeichnis, null, 2) + "\n");
const summe = Object.values(verzeichnis).reduce((s, b) => s + [...b.bytes.avif, ...b.bytes.webp].reduce((a, c) => a + c, 0), 0);
console.log(`${Object.keys(verzeichnis).length} Bilder → data/bilder.json, ${(await readdir(ZIEL)).length} Dateien in public/bilder (${Math.round(summe / 1024)} KB)`);
for (const b of Object.values(verzeichnis)) console.log(`  ${b.id.padEnd(18)} ${b.breite}×${b.hoehe}  avif ${b.bytes.avif.map((x) => Math.round(x / 1024) + "KB").join("/") || "-"}  webp ${b.bytes.webp.map((x) => Math.round(x / 1024) + "KB").join("/")}`);
