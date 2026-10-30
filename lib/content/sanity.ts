import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient, type SanityClient } from "@sanity/client";
import { z } from "zod";
import { ankerVergeben } from "./text";
import {
  coachingSeiteSchema, kanzleiSchema, kontaktSeiteSchema, linkSeiteSchema, personSchema, pruefen, publikationSchema, publikationenSeiteSchema,
  rechtSeiteSchema, rechtsgebietSchema, rechtsgebieteSeiteSchema, startseiteSchema, texteSchema,
  type Bild, type Block, type Inhaltsquelle, type Inline,
} from "./modell";

/**
 * Sanity-Inhaltsquelle, VORBEREITET (es existiert noch kein Sanity-Projekt).
 *
 * Wird nur geladen, wenn CONTENT_SOURCE=sanity gesetzt ist. Sie liest beim Build die veröffentlichten Dokumente,
 * überführt sie in das Domainmodell (lib/content/modell.ts) und prüft sie gegen dieselben Schemas wie die lokalen Inhalte.
 * Die Website bleibt ein statischer Export: Änderungen in Sanity werden sichtbar, sobald ein neuer Build gelaufen ist
 * (Webhook → Vercel-Deploy-Hook, siehe docs/SANITY-VERCEL-EINRICHTUNG.md).
 *
 * Bilder kommen nicht vom Sanity-CDN, sondern aus einem lokalen Spiegel (scripts/sanity-bilder.mts), damit die Website
 * weiterhin keine Anfragen an Dritte auslöst. Dokumenttypen und Felder entsprechen studio/schemas/. Import: scripts/seed.mts.
 */
let client: SanityClient | null = null;
function sanity(): SanityClient {
  if (client) return client;
  const projectId = (process.env.SANITY_PROJECT_ID ?? "").trim();
  const dataset = (process.env.SANITY_DATASET ?? "").trim();
  if (!/^[a-z0-9]{8,}$/.test(projectId) || !dataset) {
    throw new Error("CONTENT_SOURCE=sanity verlangt SANITY_PROJECT_ID und SANITY_DATASET (siehe .env.example). Ohne diese Angaben baut die Website mit den lokalen Inhalten: CONTENT_SOURCE weglassen.");
  }
  const token = process.env.SANITY_API_READ_TOKEN?.trim() || undefined;
  client = createClient({ projectId, dataset, apiVersion: "2025-02-19", useCdn: false, perspective: "published", token });
  return client;
}

// ── Abfragen (GROQ) ────────────────────────────────────────────────────────
const BILD = `{ alt, legende, nachweis, "assetId": asset->_id, "url": asset->url, "breite": asset->metadata.dimensions.width, "hoehe": asset->metadata.dimensions.height }`;
const HERKUNFT = `herkunft[]{ quelle, url, abgerufen, art }`;
const BELEGE = `belege{ ${HERKUNFT}, freigabe }`;
const LINK = `{ text, ziel }`;
const ABFRAGEN = {
  kanzlei: `*[_type == "kanzlei"][0]{ name, person, titel, beruf, taetigkeiten, adresse{ strasse, plz, ort, land, zusatz }, telefon, email, website, karteUrl, coachingUrl, "portrait": portrait${BILD}, "seoBild": seoBild${BILD}, ${HERKUNFT}, "freigabe": coalesce(freigabe, "demo") }`,
  texte: `*[_type == "texte"][0]{ demoHinweis, navigation[]${LINK}, kopf, footer{ ..., "weitere": coalesce(weitere[]${LINK}, []), rechtliches[]${LINK}, bildnachweis${LINK} }, ui{ ..., nichtGefundenLink${LINK} }, publikation, formular{ ..., datenschutzLink${LINK} }, "einwilligung": { ...einwilligung, "kategorien": coalesce(einwilligung.kategorien, []) }, seo }`,
  startseite: `*[_type == "startseite"][0]{ hero{ ..., knopf${LINK}, zweiterKnopf${LINK} }, einleitung, rechtsgebiete{ ..., link${LINK} }, person{ ..., link${LINK}, "bild": bild${BILD} }, coaching{ ..., link${LINK} }, publikationen{ ..., link${LINK} }, kontakt{ ..., link${LINK} }, ${BELEGE}, seoTitel, seoBeschreibung }`,
  person: `*[_type == "person"][0]{ titel, einleitung, randnotiz, gruppen[]{ "kennung": coalesce(kennung, _key), titel, eintraege }, bildLegende, ${BELEGE}, seoTitel, seoBeschreibung }`,
  rechtsgebiete: `*[_type == "rechtsgebiet"] | order(reihenfolge asc){ "slug": slug.current, titel, kurz, "bezuege": coalesce(bezuege, []), reihenfolge, ${HERKUNFT}, "freigabe": coalesce(freigabe, "demo") }`,
  rechtsgebieteSeite: `*[_type == "rechtsgebieteSeite"][0]{ titel, einleitung, leistungsformenTitel, leistungsformen, kontaktTitel, kontaktText, kontaktLink${LINK}, "bild": bild${BILD}, linksTitel, linksText, linksLink${LINK}, ${BELEGE}, seoTitel, seoBeschreibung }`,
  coachingSeite: `*[_type == "coachingSeite"][0]{ titel, untertitel, themenTitel, themen, absaetze, ausbildung, "bild": bild${BILD}, externTitel, externText, externLink${LINK}, ${BELEGE}, seoTitel, seoBeschreibung }`,
  publikationen: `*[_type == "publikation"] | order(reihenfolge asc){ "slug": slug.current, art, titel, untertitel, kurztitel, autor, erschienen, erschienenText, quellenvermerk, quellenvermerkOriginal, titelOriginal, quelleUrl, abgerufen, inhalt, reihenfolge, ${HERKUNFT}, "freigabe": coalesce(freigabe, "demo"), seoTitel, seoBeschreibung }`,
  publikationenSeite: `*[_type == "publikationenSeite"][0]{ titel, einleitung, hinweis, ${BELEGE}, seoTitel, seoBeschreibung }`,
  linkSeite: `*[_type == "linkSeite"][0]{ titel, einleitung, gruppen[]{ "kennung": coalesce(kennung, _key), titel, links[]{ "kennung": coalesce(kennung, _key), titel, url, beschreibung, "erreichbar": coalesce(erreichbar, true), hinweis } }, ${BELEGE}, seoTitel, seoBeschreibung }`,
  kontaktSeite: `*[_type == "kontaktSeite"][0]{ titel, einleitung, direktTitel, lageTitel, lage, oevTitel, oev, hinweisTitel, hinweis, ${BELEGE}, seoTitel, seoBeschreibung }`,
  rechtSeite: `*[_type == "rechtSeite" && slug.current == $slug][0]{ "slug": slug.current, titel, einleitung, stand, inhalt, ${BELEGE}, seoTitel, seoBeschreibung }`,
} as const;

// ── Normalisierung ─────────────────────────────────────────────────────────
type RohBild = { assetId?: string | null; url?: string | null; breite?: number | null; hoehe?: number | null; alt?: string | null; legende?: string | null; nachweis?: Bild["nachweis"] | null };
type Varianten = Pick<Bild, "breite" | "hoehe" | "quellen">;
/** Liefert zu einem Sanity-Bild die Varianten, die die Website ausliefert. */
export type BildAufloeser = (roh: RohBild) => Varianten;
const BREITEN = [480, 960, 1600];

function istRohBild(w: unknown): w is RohBild {
  return typeof w === "object" && w !== null && "url" in w && "breite" in w && "hoehe" in w;
}

/** Varianten direkt vom Sanity-CDN. Nur für den Import-Trockenlauf (scripts/seed.mts), der keine Dateien braucht. */
export const ausCdn: BildAufloeser = (roh) => {
  const breite = roh.breite as number;
  const breiten = [...new Set(BREITEN.map((b) => Math.min(b, breite)))];
  const groesste = breiten[breiten.length - 1];
  return { breite: groesste, hoehe: Math.round((groesste / breite) * (roh.hoehe as number)), quellen: { avif: [], webp: breiten.map((b) => ({ breite: b, url: `${roh.url}?w=${b}&fm=webp&q=75` })) } };
};

/** Varianten aus dem lokalen Spiegel (`npm run sanity:bilder`, läuft vor jedem Build). */
let spiegel: Record<string, Varianten> | null = null;
const ausSpiegel: BildAufloeser = (roh) => {
  if (!spiegel) {
    const datei = path.join(process.cwd(), "data", "cms-bilder.json");
    if (!existsSync(datei)) throw new Error("data/cms-bilder.json fehlt: Die Bilder aus Sanity sind nicht gespiegelt. Vor dem Build «npm run sanity:bilder» ausführen (die Build-Befehle tun das selbst).");
    spiegel = JSON.parse(readFileSync(datei, "utf8")) as Record<string, Varianten>;
  }
  const eintrag = roh.assetId ? spiegel[roh.assetId] : undefined;
  if (!eintrag) throw new Error(`Bild ${roh.assetId ?? "(ohne Kennung)"} fehlt im Spiegel (data/cms-bilder.json): «npm run sanity:bilder» erneut ausführen.`);
  return eintrag;
};

function bild(roh: RohBild, aufloesen: BildAufloeser): Bild | undefined {
  if (!roh.url || !roh.breite || !roh.hoehe) return undefined;
  // Fehlender Alternativtext oder Nachweis bleibt sichtbar: das Domainmodell lehnt leere Werte mit klarer Meldung ab (Bild aus Sanity ohne Angaben).
  return { alt: roh.alt ?? "", ...aufloesen(roh), legende: roh.legende ?? undefined, nachweis: { urheber: roh.nachweis?.urheber ?? "", ...(roh.nachweis?.titel ? { titel: roh.nachweis.titel } : {}), quelle: roh.nachweis?.quelle ?? "", lizenz: roh.nachweis?.lizenz ?? "" } };
}

const SYSTEMFELDER = new Set(["_type", "_key", "_id", "_rev", "_createdAt", "_updatedAt", "_system", "_originalId"]);
/** Geht die Antwort rekursiv durch: wandelt Bilder um, entfernt null (GROQ liefert null, das Domainmodell kennt nur «fehlt») und Sanity-Systemfelder. */
export function normalisieren(wert: unknown, aufloesen: BildAufloeser = ausCdn): unknown {
  if (wert === null) return undefined;
  if (Array.isArray(wert)) return wert.map((v) => normalisieren(v, aufloesen)).filter((v) => v !== undefined);
  if (istRohBild(wert)) return bild(wert, aufloesen);
  if (typeof wert === "object") {
    const t = (wert as { _type?: unknown })._type;
    if (t === "block" || t === "span") return wert; // Portable Text bleibt unverändert: portableTextZuBloecken braucht _type, _key und markDefs
    const aus: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(wert as Record<string, unknown>)) {
      if (SYSTEMFELDER.has(k)) continue; // Sanity-Systemfelder gehören nicht ins Domainmodell (strikte Schemas); Kennungen heissen «kennung»
      const n = normalisieren(v, aufloesen);
      if (n !== undefined) aus[k] = n;
    }
    return aus;
  }
  return wert;
}

/** Sammelt aus normalisierten Inhalten alle Bilder mit Nachweis ein, egal wie tief sie liegen. */
function nachweiseSammeln(wert: unknown, liste: { titel: string; urheber: string; quelle: string; lizenz: string }[]): void {
  if (Array.isArray(wert)) { wert.forEach((v) => nachweiseSammeln(v, liste)); return; }
  if (!wert || typeof wert !== "object") return;
  const o = wert as Record<string, unknown>;
  if ("quellen" in o && "alt" in o) {
    const n = o.nachweis as Bild["nachweis"];
    if (n) liste.push({ titel: (o.legende as string | undefined) || (o.alt as string), urheber: n.urheber, quelle: n.quelle, lizenz: n.lizenz });
    return;
  }
  for (const v of Object.values(o)) nachweiseSammeln(v, liste);
}

// Portable Text (Sanity) → Fliesstext des Domainmodells
type PtSpan = { _type: "span"; text: string; marks?: string[] };
type PtBlock = { _type: string; style?: string; listItem?: string; children?: PtSpan[]; markDefs?: { _key: string; _type: string; href?: string }[] };

function inlineAusPt(b: PtBlock): Inline[] {
  return (b.children ?? []).filter((c) => c._type === "span" && c.text).map((c) => {
    const marks = c.marks ?? [];
    const link = b.markDefs?.find((d) => d._type === "link" && marks.includes(d._key))?.href;
    const fett = marks.includes("strong");
    const kursiv = marks.includes("em");
    if (!link && !fett && !kursiv) return c.text;
    return { text: c.text, ...(fett ? { fett: true } : {}), ...(kursiv ? { kursiv: true } : {}), ...(link ? { link } : {}) };
  });
}

/** Sanity-Fliesstext (Absätze, Zwischentitel h2 bis h4, Blockzitate, Aufzählungen und Literaturlisten) → Blöcke; Sprungmarken wie lokal. */
export function portableTextZuBloecken(pt: PtBlock[]): Block[] {
  const bloecke: Block[] = [];
  for (const b of pt ?? []) {
    if (b._type !== "block") continue;
    const inhalt = inlineAusPt(b);
    if (!inhalt.length) continue;
    if (b.listItem) {
      const stil = b.listItem === "literatur" ? "literatur" : "punkte";
      const letzter = bloecke[bloecke.length - 1];
      if (letzter?.art === "liste" && (letzter.stil ?? "punkte") === stil) letzter.punkte.push(inhalt);
      else bloecke.push({ art: "liste", punkte: [inhalt], ...(stil === "literatur" ? { stil } : {}) });
    } else if (b.style === "h2" || b.style === "h3" || b.style === "h4") {
      const text = inhalt.map((t) => (typeof t === "string" ? t : t.text)).join("");
      bloecke.push({ art: "titel", stufe: b.style === "h2" ? 2 : b.style === "h3" ? 3 : 4, text, anker: "x" });
    } else if (b.style === "blockquote") {
      bloecke.push({ art: "zitat", inhalt });
    } else {
      bloecke.push({ art: "absatz", inhalt });
    }
  }
  return ankerVergeben(bloecke);
}

// ── Quelle ─────────────────────────────────────────────────────────────────
const zwischenspeicher = new Map<string, Promise<unknown>>();
/** Jede Abfrage läuft pro Build höchstens einmal. Listen dürfen leer sein; Einzeldokumente müssen existieren. */
function holen(name: keyof typeof ABFRAGEN, parameter: Record<string, string> = {}, listeErlaubtLeer = false): Promise<unknown> {
  const schluessel = `${name}:${JSON.stringify(parameter)}`;
  let p = zwischenspeicher.get(schluessel);
  if (!p) {
    p = sanity().fetch(ABFRAGEN[name], parameter).then((roh) => {
      if (roh === null && !listeErlaubtLeer) throw new Error(`Sanity: Dokument «${name}» fehlt oder ist nicht veröffentlicht (Import mit npm run seed, dann im Studio veröffentlichen).`);
      return normalisieren(roh ?? [], ausSpiegel);
    });
    zwischenspeicher.set(schluessel, p);
  }
  return p;
}

type MitInhalt = { inhalt?: PtBlock[] } & Record<string, unknown>;
/** Dieselbe Eindeutigkeitsregel wie in der lokalen Quelle: zwei veröffentlichte Dokumente mit gleichem Slug brechen den Build ab. */
function eindeutig<T extends { slug: string }>(liste: T[], wo: string): T[] {
  const gesehen = new Set<string>();
  for (const e of liste) {
    if (gesehen.has(e.slug)) throw new Error(`Sanity: ${wo}: Slug «${e.slug}» kommt doppelt vor (zwei veröffentlichte Dokumente). Eines umbenennen oder zurückziehen.`);
    gesehen.add(e.slug);
  }
  return liste;
}
const mitBloecken = (roh: MitInhalt) => {
  const { inhalt, ...rest } = roh;
  return { ...rest, bloecke: portableTextZuBloecken(inhalt ?? []) };
};

export const sanityQuelle: Inhaltsquelle = {
  getKanzlei: async () => pruefen(kanzleiSchema, await holen("kanzlei"), "Sanity: Kanzlei"),
  getTexte: async () => pruefen(texteSchema, await holen("texte"), "Sanity: Texte"),
  getStartseite: async () => pruefen(startseiteSchema, await holen("startseite"), "Sanity: Startseite"),
  getPerson: async () => pruefen(personSchema, await holen("person"), "Sanity: Person"),
  getRechtsgebiete: async () => eindeutig(pruefen(z.array(rechtsgebietSchema), await holen("rechtsgebiete", {}, true), "Sanity: Rechtsgebiete"), "Rechtsgebiete"),
  getRechtsgebieteSeite: async () => pruefen(rechtsgebieteSeiteSchema, await holen("rechtsgebieteSeite"), "Sanity: Seite Rechtsgebiete"),
  getCoachingSeite: async () => pruefen(coachingSeiteSchema, await holen("coachingSeite"), "Sanity: Seite Coaching"),
  getPublikationen: async () => eindeutig(pruefen(z.array(publikationSchema), ((await holen("publikationen", {}, true)) as MitInhalt[]).map(mitBloecken), "Sanity: Publikationen"), "Publikationen"),
  getPublikation: async (slug) => (await sanityQuelle.getPublikationen()).find((p) => p.slug === slug) ?? null,
  getPublikationenSeite: async () => pruefen(publikationenSeiteSchema, await holen("publikationenSeite"), "Sanity: Seite Publikationen"),
  getLinkSeite: async () => pruefen(linkSeiteSchema, await holen("linkSeite"), "Sanity: Seite Links"),
  getKontaktSeite: async () => pruefen(kontaktSeiteSchema, await holen("kontaktSeite"), "Sanity: Seite Kontakt"),
  getRechtSeite: async (slug) => pruefen(rechtSeiteSchema, mitBloecken((await holen("rechtSeite", { slug })) as MitInhalt), `Sanity: Rechtsseite «${slug}»`),
  getBildnachweise: async () => {
    const [k, start, rg, coaching] = await Promise.all([sanityQuelle.getKanzlei(), sanityQuelle.getStartseite(), sanityQuelle.getRechtsgebieteSeite(), sanityQuelle.getCoachingSeite()]);
    const liste: { titel: string; urheber: string; quelle: string; lizenz: string }[] = [];
    nachweiseSammeln({ portrait: k.portrait, seoBild: k.seoBild, personBild: start.person.bild, rgBild: rg.bild, coachingBild: coaching.bild }, liste);
    const gesehen = new Set<string>();
    return liste.filter((n) => (gesehen.has(n.quelle) ? false : (gesehen.add(n.quelle), true)));
  },
};
