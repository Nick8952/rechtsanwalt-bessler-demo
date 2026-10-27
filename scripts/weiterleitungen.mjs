// Alte Adressen der bisherigen Website (data/weiterleitungen.json) → neue Seiten.
//  - GitHub Pages kennt keine serverseitigen Weiterleitungen. Deshalb schreibt dieses Skript vor jedem Build für jede alte
//    Adresse eine kleine statische Seite nach public/ (zum Beispiel public/konktakt.html), die per <meta http-equiv="refresh">
//    sofort auf die neue Adresse führt und für Suchmaschinen noindex ist. Diese Dateien sind erzeugt und nicht versioniert.
//  - Für den Produktivbetrieb (Vercel oder Kanzleidomain) stehen dieselben Zuordnungen als echte 308-Weiterleitungen in
//    vercel.json. Dieses Skript prüft, dass beide Listen übereinstimmen, und bricht sonst ab.
// Aufruf: npm run weiterleitungen   (läuft automatisch in npm run build)
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const WURZEL = path.resolve(import.meta.dirname, "..");
const liste = JSON.parse(await readFile(path.join(WURZEL, "data/weiterleitungen.json"), "utf8"));
const vercel = process.env.DEPLOY_TARGET === "vercel";
const basePath = vercel ? "" : (process.env.BASE_PATH ?? "/rechtsanwalt-bessler-demo").replace(/\/$/, "");
const fehler = [];

for (const w of liste) {
  if (!/^\/[A-Za-z0-9_.-]+\.html$/.test(w.alt)) fehler.push(`Alte Adresse ungültig (erwartet «/name.html»): ${w.alt}`);
  if (!/^\/([a-z0-9-]+\/)*$/.test(w.neu)) fehler.push(`Neue Adresse ungültig (erwartet «/seite/»): ${w.neu}`);
}
const vj = JSON.parse(await readFile(path.join(WURZEL, "vercel.json"), "utf8"));
const redirects = Array.isArray(vj.redirects) ? vj.redirects : [];
for (const w of liste) {
  const r = redirects.find((x) => x.source === w.alt);
  if (!r) fehler.push(`vercel.json: Weiterleitung für ${w.alt} fehlt (erwartet: {"source": "${w.alt}", "destination": "${w.neu}", "permanent": true})`);
  else if (r.destination !== w.neu || r.permanent !== true) fehler.push(`vercel.json: Weiterleitung für ${w.alt} zeigt auf «${r.destination}» (permanent=${r.permanent}), erwartet «${w.neu}» (permanent=true)`);
}
for (const r of redirects) if (!liste.some((w) => w.alt === r.source)) fehler.push(`vercel.json: Weiterleitung ${r.source} steht nicht in data/weiterleitungen.json`);
if (fehler.length) {
  console.error(`✗ Weiterleitungen:\n${fehler.map((f) => `  - ${f}`).join("\n")}`);
  process.exit(1);
}

await mkdir(path.join(WURZEL, "public"), { recursive: true });
for (const w of liste) {
  const ziel = `${basePath}${w.neu}`;
  const html = `<!doctype html>
<html lang="de-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="refresh" content="0; url=${ziel}">
<link rel="canonical" href="${ziel}">
<title>Seite umgezogen</title>
<style>body{font-family:system-ui,sans-serif;margin:3rem auto;max-width:40rem;padding:0 1rem;line-height:1.5}</style>
</head>
<body>
<p>Diese Seite hat eine neue Adresse: <a href="${ziel}">${ziel}</a></p>
</body>
</html>
`;
  await writeFile(path.join(WURZEL, "public", w.alt.slice(1)), html);
}
console.log(`✓ ${liste.length} Weiterleitungsseiten nach public/ geschrieben (Ziel unter «${basePath || "/"}»), vercel.json stimmt überein.`);
