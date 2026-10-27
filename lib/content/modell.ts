import { z } from "zod";

/**
 * Das eine Domainmodell der Website. Komponenten kennen nur diese Typen.
 * Beide Inhaltsquellen (lokale JSON-Dateien, später Sanity) normalisieren in dieses Modell und werden beim Build
 * gegen diese Schemas geprüft: fehlerhafte Inhalte brechen den Build mit einer klaren Meldung ab.
 *
 * Grundsatz: Alles, was etwas über die Kanzlei, die Person oder das Angebot behauptet, trägt eine Herkunft (Quelle, Abrufdatum)
 * und eine Freigabe («demo» = belegt, «live» = vom Anwalt bestätigt). Publikationen sind eigenständige Autorenwerke und werden
 * im Wortlaut der Quelle geführt (docs/INHALTSMATRIX.md, Abschnitt Publikationen).
 */

/** Zugelassene Herkunftsarten. Verzeichniseinträge und Bewertungsplattformen sind keine Quelle. */
export const HERKUNFT_ARTEN = ["eigene-website", "eigene-quelle", "amtlich", "drittquelle"] as const;
export const herkunftSchema = z
  .object({
    quelle: z.string().min(3),
    /** Adresse der Quelle. Pflicht, ausser bei eigenen Angaben des Anwalts (dann nennt `quelle`, wer wann bestätigt hat). */
    url: z.url().optional(),
    abgerufen: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum als JJJJ-MM-TT"),
    art: z.enum(HERKUNFT_ARTEN),
  })
  .refine((h) => h.art === "eigene-quelle" || !!h.url, { message: "Die Quelle braucht eine Adresse (nur bei eigenen Angaben des Anwalts darf sie fehlen).", path: ["url"] });
export type Herkunft = z.infer<typeof herkunftSchema>;

/** «demo»: für die Verkaufs-Demo belegt. «live»: zusätzlich von Michael Bessler für den Produktivbetrieb freigegeben. */
export const freigabeSchema = z.enum(["demo", "live"]);
export type Freigabe = z.infer<typeof freigabeSchema>;

/** Belege für freie Texte einer Seite: dieselbe Regel wie bei Einzelangaben, für die Seite als Ganzes. */
export const belegeSchema = z.object({ herkunft: z.array(herkunftSchema).min(1, "Mindestens eine Quelle angeben."), freigabe: freigabeSchema });
export type Belege = z.infer<typeof belegeSchema>;

/** Dieselbe Regel wie lib/assets.ts (istErlaubtesLinkziel): interne Seite, Sprungmarke, https, mailto, tel. Gilt für lokale Daten und Sanity. */
export const LINKZIEL = /^(\/(?![\/\\])[^\s\\]*|#[A-Za-z][\w-]*|https:\/\/[^\s\\]+|mailto:[^\s]+|tel:\+?[\d\s()-]+)$/;
/** Echte https-Adresse: parsebar, Protokoll https, Host vorhanden, keine Benutzerangaben (dieselbe Strenge wie das Studio-Schema). */
export const httpsUrl = z.string().refine((u) => { try { const x = new URL(u); return x.protocol === "https:" && !!x.hostname && !x.username && !x.password; } catch { return false; } }, "Erwartet eine gültige https://-Adresse ohne Benutzerangaben.");
export const linkSchema = z.object({ text: z.string().min(1), ziel: z.string().regex(LINKZIEL, "Erlaubt sind interne Seiten («/kontakt/»), Sprungmarken («#anker»), https://-Adressen, mailto: und tel:.") });
export type Link = z.infer<typeof linkSchema>;

const varianteBildSchema = z.object({ breite: z.number().int().positive(), url: z.string().min(1) });
export const bildSchema = z.object({
  /** Alternativtext; leer nur bei rein dekorativen Bildern */
  alt: z.string(),
  breite: z.number().int().positive(),
  hoehe: z.number().int().positive(),
  quellen: z.object({ avif: z.array(varianteBildSchema), webp: z.array(varianteBildSchema).min(1) }),
  legende: z.string().optional(),
  nachweis: z.object({ urheber: z.string(), quelle: z.string(), lizenz: z.string() }).optional(),
});
export type Bild = z.infer<typeof bildSchema>;

// ── Fliesstext ─────────────────────────────────────────────────────────────
const inlineSchema = z.union([
  z.string(),
  z.object({ text: z.string(), fett: z.boolean().optional(), kursiv: z.boolean().optional(), link: z.string().regex(LINKZIEL, "Linkziel nicht erlaubt (siehe LINKZIEL).").optional() }),
]);
export type Inline = z.infer<typeof inlineSchema>;
/**
 * Blöcke für Rechtsseiten und Publikationen. «zitat» ist ein Blockzitat (in den Publikationen: die im Original kursiv und
 * eingerückt gesetzten Zitate). Listen mit Stil «literatur» sind Literaturverzeichnisse (hängender Einzug, keine Punkte).
 */
export const blockSchema = z.discriminatedUnion("art", [
  z.object({ art: z.literal("absatz"), inhalt: z.array(inlineSchema).min(1) }),
  z.object({ art: z.literal("zitat"), inhalt: z.array(inlineSchema).min(1) }),
  z.object({ art: z.literal("titel"), stufe: z.union([z.literal(2), z.literal(3), z.literal(4)]), text: z.string().min(1), anker: z.string().min(1) }),
  z.object({ art: z.literal("liste"), punkte: z.array(z.array(inlineSchema)).min(1), stil: z.enum(["punkte", "literatur"]).optional() }),
]);
export type Block = z.infer<typeof blockSchema>;

// ── Kanzlei (Einstellungen) ────────────────────────────────────────────────
export const kanzleiSchema = z.object({
  /** Name der Website: «Rechtsanwalt Michael Bessler» */
  name: z.string().min(1),
  person: z.string().min(1),
  /** Akademischer Titel, wie auf der bisherigen Website: «lic. iur.» */
  titel: z.string().min(1),
  beruf: z.string().min(1),
  /** Tätigkeiten laut bisheriger Startseite: Rechtsanwalt, Strafverteidiger, Coach */
  taetigkeiten: z.array(z.string().min(1)).min(1),
  adresse: z.object({ strasse: z.string().min(1), plz: z.string().regex(/^\d{4}$/), ort: z.string().min(1), land: z.string().min(1), zusatz: z.string().optional() }),
  telefon: z.string().regex(/^\+41 \d{2} \d{3} \d{2} \d{2}$/),
  email: z.email(),
  website: httpsUrl,
  /** Externer Kartenlink (keine Einbettung) */
  karteUrl: httpsUrl,
  /** Eigene Website zum Coaching */
  coachingUrl: httpsUrl.optional(),
  portrait: bildSchema,
  seoBild: bildSchema,
  herkunft: z.array(herkunftSchema).min(1),
  freigabe: freigabeSchema,
});
export type Kanzlei = z.infer<typeof kanzleiSchema>;

// ── Wiederkehrende Texte (Navigation, Fusszeile, Formular, Einwilligung) ───
export const PUBLIKATION_ARTEN = ["rezension", "thesen", "seminararbeit"] as const;
export type PublikationArt = (typeof PUBLIKATION_ARTEN)[number];

export const texteSchema = z.object({
  demoHinweis: z.string(),
  navigation: z.array(linkSchema).min(1).max(6),
  kopf: z.object({ startLabel: z.string(), menueKnopf: z.string(), menueTitel: z.string(), schliessen: z.string(), telefonLabel: z.string() }),
  footer: z.object({
    leitsatz: z.string(), kontaktTitel: z.string(), seitenTitel: z.string(), rechtlichesTitel: z.string(),
    weitere: z.array(linkSchema), rechtliches: z.array(linkSchema).min(1), route: z.string(), bildnachweis: linkSchema, copyright: z.string(), demoHinweis: z.string(),
  }),
  ui: z.object({
    zumInhalt: z.string(), telefon: z.string(), email: z.string(), adresse: z.string(), karte: z.string(), neuesFenster: z.string(),
    stand: z.string(), quelle: z.string(), bildnachweisTitel: z.string(), weiterlesen: z.string(),
    nichtGefundenTitel: z.string(), nichtGefundenText: z.string(), nichtGefundenLink: linkSchema,
  }),
  publikation: z.object({
    inhaltsverzeichnis: z.string(), zurueck: z.string(), autor: z.string(), erschienen: z.string(), ohneDatum: z.string(),
    arten: z.object({ rezension: z.string(), thesen: z.string(), seminararbeit: z.string() }),
    drucken: z.string(), nachOben: z.string(), hinweisHistorisch: z.string(), originalLabel: z.string(), wortlaut: z.string(),
  }),
  formular: z.object({
    titel: z.string(), einleitung: z.string(), name: z.string(), email: z.string(), telefon: z.string(), telefonHilfe: z.string(), betreff: z.string(),
    betreffOptionen: z.array(z.object({ wert: z.string(), titel: z.string() })).min(1),
    nachricht: z.string(), nachrichtHilfe: z.string(), pflicht: z.string(), datenschutzHinweis: z.string(), datenschutzLink: linkSchema,
    absenden: z.string(), hinweisNachher: z.string(), kopieren: z.string(), kopiert: z.string(), kopierenFehler: z.string(), zuLangFehler: z.string(), volltextLabel: z.string(), betreffPraefix: z.string(),
    fehlerName: z.string(), fehlerEmail: z.string(), fehlerNachricht: z.string(), ohneJavascript: z.string(), keinMandat: z.string(),
  }),
  einwilligung: z.object({
    fussLink: z.string(), ruhendTitel: z.string(), ruhendText: z.string(),
    bannerTitel: z.string(), bannerText: z.string(), alleAkzeptieren: z.string(), nurNotwendige: z.string(), einstellungen: z.string(),
    auswahlSpeichern: z.string(), widerrufen: z.string(), notwendigTitel: z.string(), notwendigText: z.string(), datenschutzerklaerung: z.string(),
    /** Leer = keine einwilligungspflichtigen Dienste: kein Banner. Mit Einträgen wird der Banner aktiv. */
    kategorien: z.array(z.object({ kennung: z.string().regex(/^[a-z]+$/), titel: z.string(), beschreibung: z.string() })),
  }),
  seo: z.object({ titelZusatz: z.string(), beschreibung: z.string() }),
});
export type Texte = z.infer<typeof texteSchema>;

// ── Seiten ─────────────────────────────────────────────────────────────────
const seoSchema = { seoTitel: z.string().optional(), seoBeschreibung: z.string().optional() };
const abschnittMitLinkSchema = z.object({ titel: z.string().min(1), text: z.string().min(1), link: linkSchema });

export const startseiteSchema = z.object({
  hero: z.object({ ueberzeile: z.string().min(1), titel: z.string().min(1), text: z.string().min(1), knopf: linkSchema, zweiterKnopf: linkSchema }),
  /** Die vier Fragen der bisherigen Einleitungsseite und die Antwort der bisherigen Startseite */
  einleitung: z.object({ randnotiz: z.string().min(1), fragen: z.array(z.string().min(1)).min(1), antwort: z.string().min(1) }),
  rechtsgebiete: abschnittMitLinkSchema.extend({ randnotizTitel: z.string().min(1) }),
  person: abschnittMitLinkSchema.extend({ zweiterText: z.string().min(1), bild: bildSchema.optional() }),
  coaching: abschnittMitLinkSchema.extend({ untertitel: z.string().min(1) }),
  publikationen: abschnittMitLinkSchema.extend({ randnotiz: z.string().min(1) }),
  kontakt: z.object({ titel: z.string().min(1), text: z.string().min(1), anfahrt: z.string().min(1), link: linkSchema }),
  belege: belegeSchema,
  ...seoSchema,
});
export type Startseite = z.infer<typeof startseiteSchema>;

export const lebenslaufGruppeSchema = z.object({ _key: z.string().min(1), titel: z.string().min(1), eintraege: z.array(z.string().min(1)).min(1) });
export const personSchema = z.object({
  titel: z.string().min(1), einleitung: z.string().min(1), randnotiz: z.string().min(1),
  gruppen: z.array(lebenslaufGruppeSchema).min(1),
  bildLegende: z.string().optional(),
  belege: belegeSchema,
  ...seoSchema,
});
export type Person = z.infer<typeof personSchema>;

export const rechtsgebietSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  titel: z.string().min(1),
  /** Ein Satz, was in diesem Gebiet angeboten wird; nur aus belegten Leistungsformen zusammengesetzt */
  kurz: z.string().min(1),
  /** Belegte Bezüge aus dem Lebenslauf (Tätigkeiten, Mitgliedschaften), die zu diesem Gebiet gehören */
  bezuege: z.array(z.string().min(1)),
  reihenfolge: z.number(),
  herkunft: z.array(herkunftSchema).min(1),
  freigabe: freigabeSchema,
});
export type Rechtsgebiet = z.infer<typeof rechtsgebietSchema>;

export const rechtsgebieteSeiteSchema = z.object({
  titel: z.string().min(1), einleitung: z.string().min(1),
  leistungsformenTitel: z.string().min(1), leistungsformen: z.array(z.string().min(1)).min(1),
  kontaktTitel: z.string().min(1), kontaktText: z.string().min(1), kontaktLink: linkSchema,
  bild: bildSchema.optional(),
  linksTitel: z.string().min(1), linksText: z.string().min(1), linksLink: linkSchema,
  belege: belegeSchema,
  ...seoSchema,
});
export type RechtsgebieteSeite = z.infer<typeof rechtsgebieteSeiteSchema>;

export const coachingSeiteSchema = z.object({
  titel: z.string().min(1), untertitel: z.string().min(1),
  themenTitel: z.string().min(1), themen: z.array(z.string().min(1)).min(1),
  absaetze: z.array(z.string().min(1)).min(1),
  ausbildung: z.string().min(1),
  bild: bildSchema.optional(),
  externTitel: z.string().optional(), externText: z.string().optional(), externLink: linkSchema.optional(),
  belege: belegeSchema,
  ...seoSchema,
});
export type CoachingSeite = z.infer<typeof coachingSeiteSchema>;

export const publikationSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  art: z.enum(PUBLIKATION_ARTEN),
  titel: z.string().min(1),
  untertitel: z.string().optional(),
  /** Kurzer Titel für Listen und Navigation */
  kurztitel: z.string().min(1),
  autor: z.string().min(1),
  /** Veröffentlichungsdatum, soweit die Quelle es nennt: «1999» oder «1999-03». Fehlt es, wird keines erfunden. */
  erschienen: z.string().regex(/^\d{4}(-\d{2})?$/).optional(),
  erschienenText: z.string().optional(),
  /** Publikationshinweis für die Anzeige (zum Beispiel Zeitschrift, Band, Seite) */
  quellenvermerk: z.string().optional(),
  /** Wortlaut des Hinweises auf der bisherigen Website (zur Nachprüfung) */
  quellenvermerkOriginal: z.string().optional(),
  titelOriginal: z.string().optional(),
  quelleUrl: httpsUrl,
  abgerufen: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bloecke: z.array(blockSchema).min(1),
  reihenfolge: z.number(),
  herkunft: z.array(herkunftSchema).min(1),
  freigabe: freigabeSchema,
  seoTitel: z.string().optional(),
  seoBeschreibung: z.string().optional(),
});
export type Publikation = z.infer<typeof publikationSchema>;

export const publikationenSeiteSchema = z.object({
  titel: z.string().min(1), einleitung: z.string().min(1), hinweis: z.string().min(1),
  belege: belegeSchema,
  ...seoSchema,
});
export type PublikationenSeite = z.infer<typeof publikationenSeiteSchema>;

export const linkEintragSchema = z.object({
  _key: z.string().min(1),
  titel: z.string().min(1),
  url: httpsUrl,
  beschreibung: z.string().optional(),
  /** Am Abrufdatum erreichbar? Nicht erreichbare Ziele erscheinen nicht auf der Website, bleiben aber dokumentiert. */
  erreichbar: z.boolean(),
  hinweis: z.string().optional(),
});
export type LinkEintrag = z.infer<typeof linkEintragSchema>;
export const linkGruppeSchema = z.object({ _key: z.string().min(1), titel: z.string().min(1), links: z.array(linkEintragSchema).min(1) });
export const linkSeiteSchema = z.object({
  titel: z.string().min(1), einleitung: z.string().min(1),
  gruppen: z.array(linkGruppeSchema).min(1),
  belege: belegeSchema,
  ...seoSchema,
});
export type LinkSeite = z.infer<typeof linkSeiteSchema>;

export const kontaktSeiteSchema = z.object({
  titel: z.string().min(1), einleitung: z.string().min(1),
  direktTitel: z.string().min(1),
  lageTitel: z.string().min(1), lage: z.array(z.string().min(1)).min(1),
  oevTitel: z.string().min(1), oev: z.array(z.string().min(1)).min(1),
  hinweisTitel: z.string().min(1), hinweis: z.string().min(1),
  belege: belegeSchema,
  ...seoSchema,
});
export type KontaktSeite = z.infer<typeof kontaktSeiteSchema>;

export const rechtSeiteSchema = z.object({
  slug: z.enum(["impressum", "datenschutz"]),
  titel: z.string().min(1), einleitung: z.string().optional(), stand: z.string().min(1),
  bloecke: z.array(blockSchema).min(1),
  belege: belegeSchema,
  ...seoSchema,
});
export type RechtSeite = z.infer<typeof rechtSeiteSchema>;

// ── Schnittstelle der Inhaltsquellen ───────────────────────────────────────
export interface Inhaltsquelle {
  getKanzlei(): Promise<Kanzlei>;
  getTexte(): Promise<Texte>;
  getStartseite(): Promise<Startseite>;
  getPerson(): Promise<Person>;
  getRechtsgebiete(): Promise<Rechtsgebiet[]>;
  getRechtsgebieteSeite(): Promise<RechtsgebieteSeite>;
  getCoachingSeite(): Promise<CoachingSeite>;
  getPublikationen(): Promise<Publikation[]>;
  getPublikation(slug: string): Promise<Publikation | null>;
  getPublikationenSeite(): Promise<PublikationenSeite>;
  getLinkSeite(): Promise<LinkSeite>;
  getKontaktSeite(): Promise<KontaktSeite>;
  getRechtSeite(slug: "impressum" | "datenschutz"): Promise<RechtSeite>;
  /** Alle Bilder mit Nachweis, für den Bildnachweis im Impressum */
  getBildnachweise(): Promise<{ titel: string; urheber: string; quelle: string; lizenz: string }[]>;
}

/** Prüft Daten gegen ein Schema und bricht mit einer lesbaren Meldung ab (Pfad und Grund je Fehler). */
export function pruefen<T extends z.ZodTypeAny>(schema: T, daten: unknown, wo: string): z.infer<T> {
  const ergebnis = schema.safeParse(daten);
  if (ergebnis.success) return ergebnis.data;
  const zeilen = ergebnis.error.issues.map((i) => `  - ${i.path.join(".") || "(Wurzel)"}: ${i.message}`);
  throw new Error(`${wo}: Inhalt entspricht nicht dem Domainmodell:\n${zeilen.join("\n")}`);
}

// ── Pfade ──────────────────────────────────────────────────────────────────
// Liegen in einer eigenen Datei ohne zod, damit Client-Komponenten sie einbinden können, ohne die Schemas mitzuladen.
export { PUBLIKATIONEN_BASIS, pfade } from "./pfade";
