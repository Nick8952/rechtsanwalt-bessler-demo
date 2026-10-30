// Import der lokalen Inhalte (data/*.json, public/bilder) nach Sanity.
//
//   npm run seed -- --probe     Trockenlauf ohne Zugang: baut alle Dokumente, prüft sie gegen das Domainmodell und vergleicht
//                               sie mit den lokalen Inhalten (Parität). Schreibt nichts, braucht kein Sanity-Projekt.
//   npm run seed                legt fehlende Dokumente an (bestehende bleiben unangetastet)
//   npm run seed -- --force     überschreibt bestehende Dokumente mit dem lokalen Stand
//
// Der echte Lauf braucht SANITY_PROJECT_ID, SANITY_DATASET und SANITY_API_WRITE_TOKEN (Token mit Schreibrecht, nur lokal in
// .env.local, nie im Repository). Die Dokumente entstehen als veröffentlichte Dokumente. Anleitung: docs/SANITY-VERCEL-EINRICHTUNG.md
import { createReadStream, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import { createClient } from "@sanity/client";
import { lokaleQuelle } from "../lib/content/local";
import {
  coachingSeiteSchema, kanzleiSchema, kontaktSeiteSchema, linkSeiteSchema, personSchema, pruefen, publikationSchema, publikationenSeiteSchema,
  rechtSeiteSchema, rechtsgebietSchema, rechtsgebieteSeiteSchema, startseiteSchema, texteSchema, type Block, type Inline,
} from "../lib/content/modell";
import { normalisieren, portableTextZuBloecken } from "../lib/content/sanity";
import { bloecke as rohZuBloecken, type RohBlock } from "../lib/content/text";

const probe = process.argv.includes("--probe");
const force = process.argv.includes("--force");
const lesen = (datei: string) => JSON.parse(readFileSync(path.join("data", datei), "utf8"));
type Doc = { _id: string; _type: string } & Record<string, unknown>;
type Roh = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- frei geformte JSON-Dateien

const bilder = lesen("bilder.json") as Record<string, { breite: number; hoehe: number; alt: string; legende: string | null; nachweis: { urheber: string; quelle: string; lizenz: string }; quellen: { webp: { breite: number; url: string }[] } }>;
const assetIds = new Map<string, string>();

let zaehler = 0;
const key = (praefix: string) => `${praefix}${(zaehler++).toString(36)}`;
/** Array-Einträge brauchen in Sanity `_key` und (in gemischten Arrays) `_type`. */
const liste = <T extends Roh>(eintraege: T[] | undefined, typ: string) => (eintraege ?? []).map((e) => ({ _type: typ, _key: e.kennung ?? e._key ?? key(typ.slice(0, 3)), ...e }));
const verweis = (l: Roh | undefined) => (l ? { _type: "verweis", text: l.text, ziel: l.ziel } : undefined);
const ohneLeer = (o: Roh) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null));
const herkunft = (h: Roh[]) => liste(h, "herkunft");
const belege = (b: Roh) => ({ _type: "belege", herkunft: herkunft(b.herkunft), freigabe: b.freigabe });
const slug = (current: string) => ({ _type: "slug", current });
function bildFeld(id: string | undefined | null) {
  if (!id) return undefined;
  const b = bilder[id];
  if (!b) throw new Error(`Bild «${id}» fehlt in data/bilder.json.`);
  const ref = assetIds.get(id) ?? `image-probe${id.replace(/[^a-z0-9]/g, "")}-${b.breite}x${b.hoehe}-webp`;
  return { _type: "bildMitText", asset: { _type: "reference", _ref: ref }, alt: b.alt, ...(b.legende ? { legende: b.legende } : {}), nachweis: { urheber: b.nachweis.urheber, quelle: b.nachweis.quelle, lizenz: b.nachweis.lizenz } };
}

/** Blöcke des Domainmodells → Portable Text (Absätze, Zwischentitel h2 bis h4, Blockzitate, Aufzählungen, Literaturlisten). */
function portableText(bloecke: Block[]) {
  const span = (t: string | { text: string; fett?: boolean; kursiv?: boolean; link?: string }, markDefs: Roh[]) => {
    if (typeof t === "string") return { _type: "span", _key: key("s"), text: t, marks: [] as string[] };
    const marks: string[] = [];
    if (t.fett) marks.push("strong");
    if (t.kursiv) marks.push("em");
    if (t.link) { const k = key("l"); markDefs.push({ _key: k, _type: "link", href: t.link }); marks.push(k); }
    return { _type: "span", _key: key("s"), text: t.text, marks };
  };
  const block = (style: string, inhalt: Inline[], extra: Roh = {}) => {
    const markDefs: Roh[] = [];
    const children = inhalt.map((t) => span(t, markDefs));
    return { _type: "block", _key: key("b"), style, markDefs, children, ...extra };
  };
  return bloecke.flatMap((b) => {
    if (b.art === "absatz") return [block("normal", b.inhalt)];
    if (b.art === "zitat") return [block("blockquote", b.inhalt)];
    if (b.art === "liste") return b.punkte.map((p) => block("normal", p, { listItem: b.stil === "literatur" ? "literatur" : "bullet", level: 1 }));
    return [block(`h${b.stufe}`, [b.text])];
  });
}
const rohText = (roh: RohBlock[]) => portableText(rohZuBloecken(roh));

function dokumenteBauen(): Doc[] {
  const k = lesen("kanzlei.json"), t = lesen("texte.json"), s = lesen("startseite.json"), p = lesen("person.json");
  const rg = lesen("seiten/rechtsgebiete.json"), co = lesen("seiten/coaching.json"), pu = lesen("seiten/publikationen.json"), li = lesen("seiten/links.json"), ko = lesen("seiten/kontakt.json");
  const docs: Doc[] = [];
  docs.push(ohneLeer({ _id: "kanzlei", _type: "kanzlei", ...k, portrait: bildFeld(k.portrait), seoBild: bildFeld(k.seoBild), herkunft: herkunft(k.herkunft) }) as Doc);
  docs.push({
    _id: "texte", _type: "texte", demoHinweis: t.demoHinweis, navigation: liste(t.navigation, "verweis"), kopf: t.kopf,
    footer: { ...t.footer, weitere: liste(t.footer.weitere, "verweis"), rechtliches: liste(t.footer.rechtliches, "verweis"), bildnachweis: verweis(t.footer.bildnachweis) },
    ui: { ...t.ui, nichtGefundenLink: verweis(t.ui.nichtGefundenLink) },
    publikation: t.publikation,
    formular: { ...t.formular, betreffOptionen: liste(t.formular.betreffOptionen, "betreffOption"), datenschutzLink: verweis(t.formular.datenschutzLink) },
    einwilligung: { ...t.einwilligung, kategorien: liste(t.einwilligung.kategorien, "einwilligungKategorie") },
    seo: t.seo,
  });
  docs.push(ohneLeer({
    _id: "startseite", _type: "startseite", ...s,
    hero: { ...s.hero, knopf: verweis(s.hero.knopf), zweiterKnopf: verweis(s.hero.zweiterKnopf) },
    rechtsgebiete: { ...s.rechtsgebiete, link: verweis(s.rechtsgebiete.link) },
    person: ohneLeer({ ...s.person, link: verweis(s.person.link), bild: bildFeld(s.person.bild) }),
    coaching: { ...s.coaching, link: verweis(s.coaching.link) },
    publikationen: { ...s.publikationen, link: verweis(s.publikationen.link) },
    kontakt: { ...s.kontakt, link: verweis(s.kontakt.link) },
    belege: belege(s.belege),
  }) as Doc);
  docs.push(ohneLeer({ _id: "person", _type: "person", ...p, gruppen: liste(p.gruppen, "lebenslaufGruppe"), belege: belege(p.belege) }) as Doc);
  for (const r of lesen("rechtsgebiete.json") as Roh[]) {
    const { slug: s2, herkunft: h, ...rest } = r;
    docs.push({ _id: `rechtsgebiet-${s2}`, _type: "rechtsgebiet", ...rest, slug: slug(s2), herkunft: herkunft(h) });
  }
  docs.push(ohneLeer({ _id: "rechtsgebieteSeite", _type: "rechtsgebieteSeite", ...rg, kontaktLink: verweis(rg.kontaktLink), linksLink: verweis(rg.linksLink), bild: bildFeld(rg.bild), belege: belege(rg.belege) }) as Doc);
  docs.push(ohneLeer({ _id: "coachingSeite", _type: "coachingSeite", ...co, bild: bildFeld(co.bild), externLink: verweis(co.externLink), belege: belege(co.belege) }) as Doc);
  for (const d of readdirSync("data/publikationen").filter((n) => n.endsWith(".json") && n !== "pruefsummen.json")) {
    const { slug: s2, bloecke, herkunft: h, ...rest } = JSON.parse(readFileSync(path.join("data/publikationen", d), "utf8"));
    docs.push(ohneLeer({ _id: `publikation-${s2}`, _type: "publikation", ...rest, slug: slug(s2), inhalt: portableText(rohZuBloeckenAusModell(bloecke)), herkunft: herkunft(h) }) as Doc);
  }
  docs.push({ _id: "publikationenSeite", _type: "publikationenSeite", ...pu, belege: belege(pu.belege) });
  docs.push({ _id: "linkSeite", _type: "linkSeite", ...li, gruppen: liste(li.gruppen, "linkGruppe").map((g) => ({ ...g, links: liste(g.links, "linkEintrag") })), belege: belege(li.belege) });
  docs.push({ _id: "kontaktSeite", _type: "kontaktSeite", ...ko, belege: belege(ko.belege) });
  for (const name of ["impressum", "datenschutz"]) {
    const { bloecke, slug: s2, belege: b, ...rest } = lesen(`seiten/${name}.json`);
    docs.push(ohneLeer({ _id: `rechtSeite-${name}`, _type: "rechtSeite", ...rest, slug: slug(s2), inhalt: rohText(bloecke), belege: belege(b) }) as Doc);
  }
  return docs;
}
/** Publikationen liegen bereits als Modell-Blöcke vor (mit oder ohne Sprungmarke). */
function rohZuBloeckenAusModell(bloecke: Roh[]): Block[] {
  return bloecke.map((b) => (b.art === "titel" ? { ...b, anker: b.anker || "x" } : b)) as Block[];
}

// ── Trockenlauf: Dokumente so lesen, wie die Website sie aus Sanity bekäme, und mit dem lokalen Stand vergleichen ──
function projizieren(wert: unknown, docs: Map<string, Doc>): unknown {
  if (Array.isArray(wert)) return wert.map((v) => projizieren(v, docs));
  if (!wert || typeof wert !== "object") return wert;
  const o = wert as Roh;
  if (o._type === "slug") return o.current;
  if (o._type === "block") return o; // Portable Text bleibt, wie er ist (die Website wandelt ihn selbst um)
  if (o._type === "reference") {
    const ziel = docs.get(o._ref);
    if (!ziel) throw new Error(`Verweis auf ein Dokument, das nicht angelegt wird: ${o._ref}`);
    return (ziel.slug as Roh).current;
  }
  if (o._type === "bildMitText") {
    const m = /-(\d+)x(\d+)-/.exec(o.asset._ref);
    return { assetId: o.asset._ref, url: `https://cdn.sanity.io/images/probe/production/${o.asset._ref}.webp`, breite: Number(m?.[1]), hoehe: Number(m?.[2]), alt: o.alt, legende: o.legende ?? null, nachweis: o.nachweis };
  }
  const aus: Roh = {};
  for (const [k, v] of Object.entries(o)) if (k !== "_type" && k !== "_id") aus[k] = projizieren(v, docs);
  return aus;
}
/** Für den Vergleich: Bilder (andere Adressen im CDN) ausblenden. */
function vergleichbar(wert: unknown): unknown {
  if (Array.isArray(wert)) return wert.map(vergleichbar);
  if (!wert || typeof wert !== "object") return wert;
  const o = wert as Roh;
  if ("quellen" in o && "breite" in o) return { alt: o.alt, legende: o.legende, nachweis: o.nachweis };
  const aus: Roh = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) aus[k] = vergleichbar(v);
  return aus;
}
async function trockenlauf(liste2: Doc[]) {
  const docs = new Map(liste2.map((d) => [d._id, d]));
  const proj = (id: string) => normalisieren(projizieren(docs.get(id), docs));
  const q = lokaleQuelle;
  const unterschiede: string[] = [];
  const abgleich = new Map<string, [unknown, unknown]>();
  const gleich = (name: string, ausSanity: unknown, lokal: unknown) => { abgleich.set(name, [ausSanity, lokal]); if (!isDeepStrictEqual(vergleichbar(ausSanity), vergleichbar(lokal))) unterschiede.push(name); };
  const mitBloecken = (roh: Roh) => { const { inhalt, ...rest } = roh; return { ...rest, bloecke: portableTextZuBloecken(inhalt) }; };
  gleich("Kanzlei", pruefen(kanzleiSchema, proj("kanzlei"), "Import: Kanzlei"), await q.getKanzlei());
  gleich("Texte", pruefen(texteSchema, proj("texte"), "Import: Texte"), await q.getTexte());
  gleich("Startseite", pruefen(startseiteSchema, proj("startseite"), "Import: Startseite"), await q.getStartseite());
  gleich("Person", pruefen(personSchema, proj("person"), "Import: Person"), await q.getPerson());
  const rechtsgebiete = liste2.filter((d) => d._type === "rechtsgebiet").map((d) => proj(d._id) as Roh).sort((a, b) => a.reihenfolge - b.reihenfolge);
  gleich("Rechtsgebiete", pruefen(z.array(rechtsgebietSchema), rechtsgebiete, "Import: Rechtsgebiete"), await q.getRechtsgebiete());
  gleich("Seite Rechtsgebiete", pruefen(rechtsgebieteSeiteSchema, proj("rechtsgebieteSeite"), "Import: Seite Rechtsgebiete"), await q.getRechtsgebieteSeite());
  gleich("Seite Coaching", pruefen(coachingSeiteSchema, proj("coachingSeite"), "Import: Seite Coaching"), await q.getCoachingSeite());
  const publikationen = liste2.filter((d) => d._type === "publikation").map((d) => mitBloecken(proj(d._id) as Roh) as Roh).sort((a, b) => a.reihenfolge - b.reihenfolge);
  gleich("Publikationen", pruefen(z.array(publikationSchema), publikationen, "Import: Publikationen"), await q.getPublikationen());
  gleich("Seite Publikationen", pruefen(publikationenSeiteSchema, proj("publikationenSeite"), "Import: Seite Publikationen"), await q.getPublikationenSeite());
  gleich("Seite Links", pruefen(linkSeiteSchema, proj("linkSeite"), "Import: Seite Links"), await q.getLinkSeite());
  gleich("Seite Kontakt", pruefen(kontaktSeiteSchema, proj("kontaktSeite"), "Import: Seite Kontakt"), await q.getKontaktSeite());
  for (const name of ["impressum", "datenschutz"] as const) {
    gleich(`Rechtsseite ${name}`, pruefen(rechtSeiteSchema, mitBloecken(proj(`rechtSeite-${name}`) as Roh), `Import: ${name}`), await q.getRechtSeite(name));
  }
  if (unterschiede.length) {
    for (const u of unterschiede) if (process.env.DEBUG) console.error(u, JSON.stringify(vergleichbar(abgleich.get(u)?.[0]), null, 1), JSON.stringify(vergleichbar(abgleich.get(u)?.[1]), null, 1));
    throw new Error(`Import weicht vom lokalen Stand ab: ${unterschiede.join(", ")}. scripts/seed.mts und lib/content/sanity.ts abgleichen (DEBUG=1 zeigt beide Stände).`);
  }
}

const docs = dokumenteBauen();
const zaehlung = docs.reduce<Record<string, number>>((z2, d) => ((z2[d._type] = (z2[d._type] ?? 0) + 1), z2), {});
const uebersicht = Object.entries(zaehlung).map(([t, n]) => `${n} × ${t}`).join(", ");

if (probe) {
  await trockenlauf(docs);
  console.log(`✓ Trockenlauf: ${docs.length} Dokumente gebaut (${uebersicht}), ${Object.keys(bilder).length} Bilder zugeordnet.`);
  console.log("  Jedes Dokument besteht das Domainmodell und entspricht nach dem Zurücklesen den lokalen Inhalten. Es wurde nichts geschrieben.");
} else {
  const projectId = (process.env.SANITY_PROJECT_ID ?? "").trim(), dataset = (process.env.SANITY_DATASET ?? "").trim(), token = (process.env.SANITY_API_WRITE_TOKEN ?? "").trim();
  if (!/^[a-z0-9]{8,}$/.test(projectId) || !dataset || !token) {
    console.error("✗ Für den Import fehlen SANITY_PROJECT_ID, SANITY_DATASET oder SANITY_API_WRITE_TOKEN (siehe .env.example).\n  Ohne Zugang lässt sich der Import mit «npm run seed -- --probe» prüfen.");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset, token, apiVersion: "2025-02-19", useCdn: false });
  // Ohne --force werden nur fehlende Dokumente angelegt; sind alle vorhanden, wird auch kein Bild hochgeladen (keine verwaisten Assets).
  const vorhandene = new Set<string>(await client.fetch(`*[_id in $ids]._id`, { ids: docs.map((d) => d._id) }));
  if (!force && docs.every((d) => vorhandene.has(d._id))) {
    console.log(`✓ Alle ${docs.length} Dokumente sind bereits in Sanity vorhanden; nichts geschrieben, keine Bilder hochgeladen (zum Überschreiben: npm run seed -- --force).`);
    process.exit(0);
  }
  // Bilder: vorhandene Assets mit gleichem Dateinamen (der Name trägt einen Inhalts-Hash) wiederverwenden, sonst hochladen (grösste WebP-Variante).
  for (const [id, b] of Object.entries(bilder)) {
    const datei = path.join("public", b.quellen.webp[b.quellen.webp.length - 1].url);
    const bestehend = await client.fetch<string | null>(`*[_type == "sanity.imageAsset" && originalFilename == $name][0]._id`, { name: path.basename(datei) });
    if (bestehend) { assetIds.set(id, bestehend); console.log(`  Bild ${id} → ${bestehend} (vorhanden, nicht erneut hochgeladen)`); continue; }
    const asset = await client.assets.upload("image", createReadStream(datei), { filename: path.basename(datei) });
    assetIds.set(id, asset._id);
    console.log(`  Bild ${id} → ${asset._id}`);
  }
  zaehler = 0;
  const fertig = dokumenteBauen();
  let tx = client.transaction();
  for (const d of fertig) tx = force ? tx.createOrReplace(d) : tx.createIfNotExists(d);
  await tx.commit();
  console.log(`✓ ${fertig.length} Dokumente ${force ? "geschrieben (bestehende überschrieben)" : "angelegt (bestehende unverändert)"}: ${uebersicht}.`);
}
