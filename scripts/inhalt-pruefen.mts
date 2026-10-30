// Prüft die lokalen Inhalte über das Schema hinaus (das Schema selbst prüft lib/content/local.ts beim Laden):
//  - Schweizer Schreibweise (kein «ß»), keine Gedankenstriche, keine geraden Anführungszeichen (Website-Texte; Publikationen bleiben wörtlich)
//  - keine unbelegten Behauptungen (Erfolgsquoten, Fachanwaltstitel, Garantien, Honorare, Erreichbarkeitsgarantien, Notfallnummern,
//    kostenlose Erstberatung, feste Antwortzeiten, Bewertungen) in den frei formulierten Texten
//  - Kontaktangaben in freien Texten stimmen mit data/kanzlei.json überein (eine Wahrheit, keine zweite)
//  - alle Linkziele erlaubt, interne Ziele und Sprungmarken vorhanden; ein Wortlaut je Absicht («Kontakt aufnehmen»)
//  - Einstieg: Titel kurz, Text höchstens 20 Wörter
//  - Bilder: Alternativtext vorhanden, Bildnachweis vollständig, jedes Bild wird verwendet
//  - Publikationen: Wortlaut mit den Rohdaten identisch (Prüfsumme), Sprungmarken eindeutig, Quelle und Abrufdatum vorhanden
//  - Weiterleitungen: jede alte Adresse zeigt auf eine bestehende Seite
//  - Quellen: jede Seite mit Belegen; mit --live zusätzlich: alles vom Anwalt freigegeben?
// Aufruf: npm run inhalt:pruefen   ·   vor dem Go-Live: npm run inhalt:pruefen -- --live
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { inhaltsquelle, inhaltsquelleName } from "../lib/content";
import { pfade } from "../lib/content/modell";
import { publikationsDigest } from "../lib/content/pruefsummen";
import { blockText } from "../lib/content/text";
import { istErlaubtesLinkziel } from "../lib/assets";
import { offeneFreigaben } from "../lib/content/freigabe";

const live = process.argv.includes("--live");
const fehler: string[] = [];
const hinweise: string[] = [];
// Prüft die Quelle, die auch der Build verwendet (lokal oder CONTENT_SOURCE=sanity); Bildprüfungen gelten nur lokal.
const q = await inhaltsquelle();
const lokal = inhaltsquelleName === "lokal";
const [k, t, start, person, rechtsgebiete, rgSeite, coaching, publikationen, pubSeite, links, kontakt, impressum, datenschutz] = await Promise.all([
  q.getKanzlei(), q.getTexte(), q.getStartseite(), q.getPerson(), q.getRechtsgebiete(), q.getRechtsgebieteSeite(), q.getCoachingSeite(), q.getPublikationen(), q.getPublikationenSeite(), q.getLinkSeite(), q.getKontaktSeite(),
  q.getRechtSeite("impressum"), q.getRechtSeite("datenschutz"),
]);
// Publikationen werden getrennt geprüft (Wortlaut der Quelle, keine Schreibweise-Regeln)
const alles = { k, t, start, person, rechtsgebiete, rgSeite, coaching, pubSeite, links, kontakt, impressum, datenschutz, publikationenMeta: publikationen.map(({ bloecke, ...rest }) => { void bloecke; return rest; }) };

// ── alle Zeichenketten und Links einsammeln ────────────────────────────────
type Fund = { pfad: string; text: string };
const texte: Fund[] = [];
const linksListe: { pfad: string; ziel: string; text?: string }[] = [];
function gehen(wert: unknown, pfad: string) {
  if (typeof wert === "string") { texte.push({ pfad, text: wert }); return; }
  if (Array.isArray(wert)) { wert.forEach((v, i) => gehen(v, `${pfad}[${i}]`)); return; }
  if (wert && typeof wert === "object") {
    const o = wert as Record<string, unknown>;
    if (typeof o.ziel === "string") linksListe.push({ pfad, ziel: o.ziel, text: typeof o.text === "string" ? o.text : undefined });
    if (typeof o.link === "string") linksListe.push({ pfad, ziel: o.link, text: typeof o.text === "string" ? o.text : undefined });
    if (typeof o.url === "string" && typeof o.erreichbar === "boolean") linksListe.push({ pfad, ziel: o.url, text: typeof o.titel === "string" ? o.titel : undefined });
    for (const [kk, v] of Object.entries(o)) {
      if (["quellen", "nachweis", "url", "herkunft", "karteUrl", "coachingUrl", "website", "quelleUrl", "quellenvermerkOriginal", "titelOriginal"].includes(kk)) continue;
      gehen(v, `${pfad}.${kk}`);
    }
  }
}
for (const [name, wert] of Object.entries(alles)) gehen(wert, name);

// ── Schreibweise (Website-Texte) ───────────────────────────────────────────
for (const { pfad, text } of texte) {
  if (text.includes("ß")) fehler.push(`${pfad}: «ß» gefunden (Schweizer Schreibweise verlangt «ss»): ${text.slice(0, 60)}`);
  if (/[—–]/.test(text)) fehler.push(`${pfad}: Gedankenstrich gefunden (Satz umstellen oder Bindestrich verwenden): ${text.slice(0, 60)}`);
  if (/(^|\s)"[^"]+"/.test(text)) fehler.push(`${pfad}: gerade Anführungszeichen (stattdessen «…»): ${text.slice(0, 60)}`);
  if (/\s{2,}/.test(text.trim())) fehler.push(`${pfad}: doppelte Leerzeichen: ${text.slice(0, 60)}`);
}

// ── Unbelegte Behauptungen ─────────────────────────────────────────────────
// Geprüft werden frei formulierte Texte über Kanzlei und Angebot. Ausgenommen: Rechtsseiten, Formular- und Einwilligungstexte, die wörtlich
// übernommenen Lebenslaufzeilen und die vier Fragen der bisherigen Einleitung (Quelle: bisherige Website).
const VERBOTEN: [RegExp, string][] = [
  [/kostenlos|kostenfrei|gratis|unentgeltlich(?!e Rechtspflege)|unverbindliche[sn]? Erstgespräch|kostenlose[sn]? Erstberatung/i, "kostenlose Erstberatung oder Gratisangebot"],
  [/garantie|garantiert|Erfolg(s)?quote|gewonnen|\d+ ?% /i, "Garantie oder Erfolgsquote"],
  [/Fachanwalt|Fachanwältin|zertifizierte[rn]? Anwalt|Spezialist/i, "Fachanwaltstitel oder Spezialisierung ohne Quelle"],
  [/Notfall|24 ?Stunden|rund um die Uhr|jederzeit|immer erreichbar|(7|sieben) Tage|365 Tage|am Wochenende|Pikettnummer/i, "Erreichbarkeitsgarantie oder Notfallnummer"],
  [/innert \d+|innerhalb von \d+|Antwort(zeit)? (innert|innerhalb)|melden uns (innert|innerhalb)|Rückruf/i, "feste Antwortzeit"],
  [/Honorar|Stundenansatz|\bCHF\b|Franken|\bEuro\b|\bEUR\b|Pauschale|Gebühr(en)?\b|\bTarif|Preis(e|liste|n)?\b|\bKosten\b|Rechnung/i, "Honorar- oder Kostenangabe"],
  [/Bewertung|Sterne\b|\b[1-5][.,]\d\b|Mandanten sagen|Referenzen|Rezensionen|Erfahrungsberichte/i, "Bewertungen oder Mandantenstimmen"],
  [/\bführende[rn]?\b|beste[rn]? Anwalt|Nr\. ?1|renommiert|erfahrenste|erstklassig|exzellent|hervorragend|einzigartig|unschlagbar|\btop\b/i, "Superlativ"],
  [/Psychotherapie|Therapie|Heilung|heilt\b|medizinisch|Diagnose/i, "psychotherapeutische oder medizinische Leistung (Coaching ist keine)"],
  [/\bTeam\b|Mitarbeitende|Mitarbeiter(in|innen)?\b|Kollegium|Sekretariat|unsere Anwälte|Kanzleipartner|Partner(in|innen)?\b/i, "Kanzleiteam (Quellen nennen nur Michael Bessler)"],
  [/Öffnungszeiten|Bürozeiten|Sprechstunde|\b(Mo|Di|Mi|Do|Fr)\s?(-|bis)\s?(Di|Mi|Do|Fr|Sa)\b|\b\d{1,2}[:.]\d{2}\s?(Uhr|bis\s\d)|\b(montags|dienstags|mittwochs|donnerstags|freitags)\b/i, "Öffnungszeiten (nirgends belegt)"],
];
// Selbsttest der Sperrliste bei jedem Lauf: Umgehungen müssen anschlagen, belegte Formulierungen nicht (sonst bricht die Prüfung ab).
{
  const mussTreffen = ["Erstberatung kostenfrei", "Gebühren nach Aufwand", "Tarif auf Anfrage", "immer erreichbar", "7 Tage die Woche", "erstklassige Vertretung", "unser Kollegium", "montags geöffnet", "Wir melden uns innert 24 Stunden", "4.9 Sterne", "ab 250 Euro"];
  const darfNicht = ["unentgeltliche Rechtspflege", "Partnerschaft, Familie, Beruf", "weiterführende Links", "Rechtsauskunft, Rechtsberatung, Rechtsvertretung und Strafverteidigung", "Verein Pikett Strafverteidigung", "Mietgericht", "Preisgabe von Daten"];
  for (const t of mussTreffen) if (!VERBOTEN.some(([m]) => m.test(t))) fehler.push(`Sperrliste-Selbsttest: «${t}» müsste als unbelegte Behauptung erkannt werden`);
  for (const t of darfNicht) if (VERBOTEN.some(([m]) => m.test(t))) fehler.push(`Sperrliste-Selbsttest: «${t}» darf nicht anschlagen (Muster zu breit)`);
}
for (const { pfad, text } of texte) {
  if (/^(impressum|datenschutz|t\.einwilligung|t\.formular|person\.gruppen|start\.einleitung\.fragen)/.test(pfad)) continue;
  for (const [muster, was] of VERBOTEN) if (muster.test(text)) fehler.push(`${pfad}: unbelegte Behauptung (${was}): «${text.slice(0, 80)}»`);
}

// ── Kontaktangaben: eine Wahrheit ──────────────────────────────────────────
{
  const telefonAnzeige = k.telefon.replace(/^\+41\s?/, "0");
  for (const { pfad, text } of texte) {
    if (/^(k\.|t\.)/.test(pfad)) continue;
    for (const m of text.matchAll(/\b0\d{2} \d{3} \d{2} \d{2}\b|\+41 \d{2} \d{3} \d{2} \d{2}/g)) if (m[0] !== telefonAnzeige && m[0] !== k.telefon) fehler.push(`${pfad}: Telefonnummer «${m[0]}» weicht von kanzlei.telefon ab`);
    for (const m of text.matchAll(/[\w.+-]+@rechtsanwaltbessler[\w.-]*/g)) if (m[0].replace(/\.$/, "") !== k.email) fehler.push(`${pfad}: E-Mail «${m[0]}» weicht von kanzlei.email ab`);
    for (const m of text.matchAll(/Neugasse\s*\d+[a-z]?/g)) if (m[0] !== k.adresse.strasse) fehler.push(`${pfad}: Adresse «${m[0]}» weicht von kanzlei.adresse ab`);
  }
}

// ── Links ──────────────────────────────────────────────────────────────────
const seiten = new Set<string>([pfade.start, pfade.person, pfade.rechtsgebiete, pfade.coaching, pfade.publikationen, pfade.kontakt, pfade.links, pfade.impressum, pfade.datenschutz, ...publikationen.map((p) => pfade.publikation(p.slug))]);
const anker: Record<string, Set<string>> = {
  [pfade.impressum]: new Set([...impressum.bloecke.flatMap((b) => (b.art === "titel" ? [b.anker] : [])), "bildnachweis"]),
  [pfade.datenschutz]: new Set(datenschutz.bloecke.flatMap((b) => (b.art === "titel" ? [b.anker] : []))),
  [pfade.rechtsgebiete]: new Set(rechtsgebiete.map((r) => `gebiet-${r.slug}`)),
  [pfade.links]: new Set(links.gruppen.map((g) => `links-${g.kennung}`)),
};
for (const l of linksListe) {
  if (!istErlaubtesLinkziel(l.ziel)) { fehler.push(`${l.pfad}: Linkziel nicht erlaubt: ${l.ziel}`); continue; }
  if (!l.ziel.startsWith("/")) continue;
  const [seite, marke] = l.ziel.split("#");
  if (!seiten.has(seite)) fehler.push(`${l.pfad}: interne Seite gibt es nicht: ${l.ziel}`);
  else if (marke && !anker[seite]?.has(marke)) fehler.push(`${l.pfad}: Sprungmarke gibt es nicht: ${l.ziel}`);
}
// Ein Wortlaut je Absicht: jeder Link auf die Kontaktseite heisst gleich wie der Knopf im Einstieg
{
  const kontaktText = start.hero.knopf.text;
  for (const l of linksListe) if (l.ziel === pfade.kontakt && l.text && l.text !== kontaktText && !/^Kontakt$/.test(l.text)) fehler.push(`${l.pfad}: Kontaktlink heisst «${l.text}», der Knopf im Einstieg «${kontaktText}»`);
}

// ── Einstieg ───────────────────────────────────────────────────────────────
const woerter = start.hero.text.trim().split(/\s+/).length;
if (woerter > 20) fehler.push(`start.hero.text: ${woerter} Wörter (höchstens 20, damit der Einstieg auf einen Blick lesbar bleibt)`);
if (start.hero.titel.length > 70) fehler.push(`start.hero.titel: ${start.hero.titel.length} Zeichen (höchstens 70, sonst bricht der Titel auf mehr als zwei Zeilen)`);

// ── Rechtsgebiete: nur die drei belegten, oder mit ausdrücklicher Bestätigung des Anwalts ──
const BELEGTE_GEBIETE = new Set(["strafrecht", "mietrecht", "migrationsrecht"]);
for (const r of rechtsgebiete) {
  if (!BELEGTE_GEBIETE.has(r.slug) && !r.herkunft.some((h) => h.art === "eigene-quelle")) fehler.push(`Rechtsgebiet «${r.slug}»: nicht auf der bisherigen Website belegt; nur mit einer Quelle der Art «eigene-quelle» (Bestätigung des Anwalts) zulässig`);
}

// ── Publikationen: Wortlaut (Prüfsumme der Originalfassung), Sprungmarken, Quelle ──
// data/publikationen/pruefsummen.json enthält je Werk die SHA-256 der kanonischen Form (Titel, Publikationshinweis, Untertitel, Blöcke),
// berechnet bei der Übernahme von der bisherigen Website. Weicht die geladene Fassung ab (lokal oder aus Sanity), ist der Wortlaut verändert.
const pruefsummen = JSON.parse(readFileSync("data/publikationen/pruefsummen.json", "utf8")) as Record<string, { sha256: string; woerter: number }>;
// Die Prüfsumme läuft über die kanonische Form (lib/content/text.ts, kanonisch): auch Blockart, Titelstufe, Listenstil, Auszeichnung und
// Linkziele sind gesichert. Sie ist eine Integritätsprüfung gegen Versehen, keine manipulationssichere Signatur (Text und Prüfsumme liegen
// im selben Repository). Neu berechnen nach freigegebener Änderung: npm run pruefsummen -- --schreiben <slug>.
const textDigest = (p: (typeof publikationen)[number]) => publikationsDigest(p);
for (const p of publikationen) {
  const soll = pruefsummen[p.slug];
  if (!soll) fehler.push(`Publikation «${p.slug}»: keine Prüfsumme der Originalfassung in data/publikationen/pruefsummen.json`);
  else if (textDigest(p) !== soll.sha256) fehler.push(`Publikation «${p.slug}»: Wortlaut weicht von der Originalfassung ab (Prüfsumme). Änderungen am Text nur mit Freigabe des Autors und neuer Prüfsumme.`);
}
for (const p of publikationen) {
  const ids = new Set<string>();
  for (const b of p.bloecke) {
    if (b.art !== "titel") continue;
    if (ids.has(b.anker)) fehler.push(`Publikation «${p.slug}»: Sprungmarke «${b.anker}» doppelt`);
    ids.add(b.anker);
  }
  if (!p.quelleUrl.startsWith("https://www.rechtsanwaltbessler.ch/")) fehler.push(`Publikation «${p.slug}»: Quelle ist nicht die bisherige Website`);
  const text = p.bloecke.map(blockText).join("\n");
  if (text.split(/\s+/).length < 200) fehler.push(`Publikation «${p.slug}»: Text wirkt unvollständig`);
  // Hinweis statt Fehler: Rechtschreibung der Quelle bleibt unangetastet, «ß» würde nur gemeldet
  if (text.includes("ß")) hinweise.push(`Publikation «${p.slug}» enthält «ß» (Wortlaut der Quelle, nicht geändert).`);
}
if (lokal) {
  for (const d of readdirSync("data/publikationen").filter((n) => n.endsWith(".json") && n !== "pruefsummen.json")) {
    const roh = JSON.parse(readFileSync(path.join("data/publikationen", d), "utf8"));
    if (!publikationen.find((p) => p.slug === roh.slug)) fehler.push(`data/publikationen/${d}: Publikation «${roh.slug}» wird nicht geladen (lib/content/local.ts ergänzen)`);
  }
}

// ── Weiterleitungen ────────────────────────────────────────────────────────
if (lokal) {
  const weiterleitungen = JSON.parse(readFileSync("data/weiterleitungen.json", "utf8")) as { alt: string; neu: string }[];
  for (const w of weiterleitungen) if (!seiten.has(w.neu)) fehler.push(`Weiterleitung ${w.alt} → ${w.neu}: Zielseite gibt es nicht`);
}

// ── Bilder (nur lokale Quelle) ─────────────────────────────────────────────
const verzeichnis = lokal ? (JSON.parse(readFileSync("data/bilder.json", "utf8")) as Record<string, { alt: string; nachweis?: { urheber?: string; quelle?: string; lizenz?: string }; quellen: { avif: { url: string }[]; webp: { url: string }[] } }>) : {};
const vorhanden = new Set(lokal ? readdirSync("public/bilder") : []);
for (const [id, b] of Object.entries(verzeichnis)) {
  if (!b.alt.trim()) fehler.push(`Bild «${id}»: Alternativtext fehlt`);
  if (!b.nachweis?.urheber || !b.nachweis.quelle || !b.nachweis.lizenz) fehler.push(`Bild «${id}»: Bildnachweis unvollständig`);
  for (const v of [...b.quellen.avif, ...b.quellen.webp]) if (!vorhanden.has(path.basename(v.url))) fehler.push(`Bild «${id}»: Datei fehlt in public/bilder: ${v.url} (npm run bilder)`);
}
if (lokal) {
  const rohInhalte = ["kanzlei", "startseite", "seiten/rechtsgebiete", "seiten/coaching"].map((d) => readFileSync(`data/${d}.json`, "utf8")).join("\n");
  for (const id of Object.keys(verzeichnis)) if (!rohInhalte.includes(`"${id}"`)) fehler.push(`Bild «${id}» wird nirgends verwendet: aus scripts/bilder-liste.json entfernen oder einsetzen`);
}

// ── Links auf der Linkseite: nur https, nicht erreichbare mit Hinweis ──────
for (const g of links.gruppen) for (const l of g.links) {
  if (!l.erreichbar && !l.hinweis) fehler.push(`Link «${l.titel}»: nicht erreichbar, aber ohne Hinweis, warum`);
}

// ── Quellen und Freigaben ──────────────────────────────────────────────────
type Beleg = { wo: string; titel: string; herkunft: { url?: string; art: string; quelle: string }[]; freigabe: string };
const belege: Beleg[] = [
  { wo: "Kanzleiangaben", titel: "Kanzlei", herkunft: k.herkunft, freigabe: k.freigabe },
  { wo: "Startseite", titel: "Belege der Seite", ...start.belege },
  { wo: "Person", titel: "Belege der Seite", ...person.belege },
  ...rechtsgebiete.map((r) => ({ wo: "Rechtsgebiete", titel: r.titel, herkunft: r.herkunft, freigabe: r.freigabe })),
  { wo: "Rechtsgebiete", titel: "Übersichtsseite", ...rgSeite.belege },
  { wo: "Coaching", titel: "Belege der Seite", ...coaching.belege },
  ...publikationen.map((p) => ({ wo: "Publikationen", titel: p.kurztitel, herkunft: p.herkunft, freigabe: p.freigabe })),
  { wo: "Publikationen", titel: "Übersichtsseite", ...pubSeite.belege },
  { wo: "Links", titel: "Belege der Seite", ...links.belege },
  { wo: "Kontakt und Anfahrt", titel: "Belege der Seite", ...kontakt.belege },
  { wo: "Impressum", titel: "Belege der Seite", ...impressum.belege },
  { wo: "Datenschutzerklärung", titel: "Belege der Seite", ...datenschutz.belege },
];
for (const b of belege) for (const h of b.herkunft) if (!h.url && h.art !== "eigene-quelle") fehler.push(`${b.wo}, «${b.titel}»: Quelle «${h.quelle}» ohne Adresse`);
const offen = await offeneFreigaben(q);
if (live) fehler.push(...offen);
else if (offen.length) hinweise.push(`${offen.length} Punkte sind für die Demo belegt, aber noch nicht für den Produktivbetrieb freigegeben (Liste: npm run inhalt:pruefen -- --live).`);

for (const h of hinweise) console.log(`· ${h}`);
if (fehler.length) {
  console.error(`✗ ${fehler.length} Problem(e) in den Inhalten:\n` + fehler.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
const woerterPub = publikationen.reduce((s, p) => s + p.bloecke.map(blockText).join(" ").split(/\s+/).length, 0);
console.log(`✓ Inhalte (${inhaltsquelleName}) in Ordnung: ${texte.length} Texte, ${linksListe.length} Links, ${Object.keys(verzeichnis).length} Bilder, ${publikationen.length} Publikationen mit ${woerterPub} Wörtern, ${belege.length} Belege mit Quelle${live ? ", alles freigegeben" : ""}.`);
