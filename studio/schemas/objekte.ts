import { defineArrayMember, defineField, defineType } from "sanity";

/** Dieselbe Regel wie lib/assets.ts (istErlaubtesLinkziel): interne Seite, Sprungmarke, https, E-Mail oder Telefon. */
const httpsOk = (wert: string) => { if (!/^https:\/\/[^\s\\]+$/.test(wert)) return false; try { const u = new URL(wert); return u.protocol === "https:" && u.hostname.length > 0 && !u.username && !u.password; } catch { return false; } };
export const linkzielErlaubt = (ziel: string | undefined) =>
  !ziel || /^\/(?![\/\\])[^\s\\]*$/.test(ziel) || /^#[A-Za-z][\w-]*$/.test(ziel) || /^(mailto:[^\s@]+@[^\s@]+|tel:\+?[\d\s()-]+)$/.test(ziel) || httpsOk(ziel) ? true : "Erlaubt sind interne Seiten («/kontakt/»), Sprungmarken («#anker»), https://-Adressen, mailto: und tel:.";

/** Schweizer Schreibweise und ruhige Satzzeichen: gilt für alle Website-Texte (nicht für den Wortlaut der Publikationen). */
export const schreibweise = (text: string | undefined) => {
  if (!text) return true;
  if (text.includes("ß")) return "Bitte «ss» statt «ß» schreiben (Schweizer Schreibweise).";
  if (/[—–]/.test(text)) return "Bitte keinen Gedankenstrich verwenden: Satz umstellen oder einen Punkt setzen.";
  return true;
};

const FREIGABE = { list: [{ title: "Demo (belegt, nicht bestätigt)", value: "demo" }, { title: "Live (vom Anwalt freigegeben)", value: "live" }], layout: "radio" as const };

export const verweis = defineType({
  name: "verweis",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "text", title: "Beschriftung", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "ziel", title: "Ziel", type: "string", description: "Interne Seite («/kontakt/»), Sprungmarke, https://-Adresse, mailto: oder tel:", validation: (r) => r.required().custom(linkzielErlaubt) }),
  ],
  preview: { select: { title: "text", subtitle: "ziel" } },
});

export const bildMitText = defineType({
  name: "bildMitText",
  title: "Bild",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Bildbeschreibung (Alternativtext)", type: "string", description: "Beschreibt, was auf dem Bild zu sehen ist, für Menschen, die es nicht sehen.", validation: (r) => r.required().min(5).custom(schreibweise) }),
    defineField({ name: "legende", title: "Bildlegende", type: "string", description: "Kurzer Text unter dem Bild (optional), zum Beispiel «Gemälde von Candida Sauter».", validation: (r) => r.custom(schreibweise) }),
    defineField({
      name: "nachweis",
      title: "Bildnachweis und Nutzungsrecht",
      type: "object",
      description: "Erscheint im Impressum. Ohne geklärtes Nutzungsrecht kein Bild veröffentlichen.",
      fields: [
        defineField({ name: "urheber", title: "Urheberin oder Urheber", type: "string", validation: (r) => r.required() }),
        defineField({ name: "quelle", title: "Quelle", type: "string", description: "Adresse der Bildquelle oder «eigenes Bild»", validation: (r) => r.required() }),
        defineField({ name: "lizenz", title: "Lizenz oder Nutzungsrecht", type: "string", description: "Zum Beispiel «Rechte bei Michael Bessler» oder «Rechte bei der Künstlerin, Nutzung freigegeben am …»", validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
  ],
});

export const herkunft = defineType({
  name: "herkunft",
  title: "Quelle",
  type: "object",
  fields: [
    defineField({ name: "quelle", title: "Bezeichnung der Quelle", type: "string", description: "Zum Beispiel «Seite Persönlich der bisherigen Website» oder «Bestätigung von Michael Bessler, E-Mail vom 3. März»", validation: (r) => r.required().min(3) }),
    defineField({
      name: "url", title: "Adresse der Quelle", type: "url",
      description: "Pflicht bei Website, amtlichen und fremden Quellen. Bei eigenen Angaben des Anwalts darf sie fehlen; dann steht in der Bezeichnung, wer wann bestätigt hat.",
      validation: (r) => r.uri({ scheme: ["https"] }).custom((url, kontext) => (url || (kontext.parent as { art?: string } | undefined)?.art === "eigene-quelle" ? true : "Bitte die Adresse der Quelle angeben.")),
    }),
    defineField({ name: "abgerufen", title: "Abgerufen oder bestätigt am", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "art",
      title: "Art der Quelle",
      type: "string",
      description: "Verzeichniseinträge, Bewertungsplattformen und automatisch erzeugte Texte sind keine zulässige Quelle.",
      options: { list: [{ title: "Eigene Website des Anwalts", value: "eigene-website" }, { title: "Eigene Angabe des Anwalts", value: "eigene-quelle" }, { title: "Amtlich (Register, Behörde)", value: "amtlich" }, { title: "Fremde Quelle (nur für Angaben, die nicht die Kanzlei betreffen)", value: "drittquelle" }], layout: "radio" },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "quelle", subtitle: "abgerufen" } },
});

export const belege = defineType({
  name: "belege",
  title: "Belege für die Texte dieser Seite",
  type: "object",
  description: "Einleitungen und freie Texte dieser Seite sagen etwas über die Kanzlei. Hier steht, worauf sie sich stützen und ob der Anwalt sie freigegeben hat.",
  fields: [
    defineField({ name: "herkunft", title: "Quellen", type: "array", of: [defineArrayMember({ type: "herkunft" })], validation: (r) => r.required().min(1).error("Mindestens eine Quelle angeben.") }),
    defineField({ name: "freigabe", title: "Freigabe", type: "string", description: "«Live» erst, wenn der Anwalt die Texte dieser Seite bestätigt hat. Vorher lässt sich die Website nicht für Suchmaschinen freigeben.", options: FREIGABE, initialValue: "demo", validation: (r) => r.required() }),
  ],
});

export const lebenslaufGruppe = defineType({
  name: "lebenslaufGruppe",
  title: "Gruppe im Lebenslauf",
  type: "object",
  fields: [
    defineField({ name: "kennung", title: "Kennung", type: "string", description: "Kleinbuchstaben, Ziffern, Bindestriche; bildet die Sprungmarke und bleibt stabil (zum Beispiel «ausbildung»)", validation: (r) => r.required().regex(/^[a-z0-9][a-z0-9-]*$/, { name: "Kennung", invert: false }) }),
    defineField({ name: "titel", title: "Titel", type: "string", description: "Zum Beispiel «Ausbildung» oder «Mitgliedschaften»", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "eintraege", title: "Einträge", type: "array", of: [defineArrayMember({ type: "string", validation: (r) => r.custom(schreibweise) })], validation: (r) => r.required().min(1) }),
  ],
  preview: { select: { title: "titel", eintraege: "eintraege" }, prepare: ({ title, eintraege }) => ({ title, subtitle: `${(eintraege as unknown[] | undefined)?.length ?? 0} Einträge` }) },
});

export const linkEintrag = defineType({
  name: "linkEintrag",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "kennung", title: "Kennung", type: "string", description: "Kleinbuchstaben, Ziffern, Bindestriche; bildet die Sprungmarke und bleibt stabil (zum Beispiel «ausbildung»)", validation: (r) => r.required().regex(/^[a-z0-9][a-z0-9-]*$/, { name: "Kennung", invert: false }) }),
    defineField({ name: "titel", title: "Bezeichnung", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "url", title: "Adresse", type: "url", validation: (r) => r.required().uri({ scheme: ["https"] }) }),
    defineField({ name: "beschreibung", title: "Beschreibung (optional)", type: "string", validation: (r) => r.custom(schreibweise) }),
    defineField({ name: "erreichbar", title: "Erreichbar", type: "boolean", description: "Ausgeschaltet: Der Link erscheint nicht auf der Website, bleibt aber hier dokumentiert.", initialValue: true, validation: (r) => r.required() }),
    defineField({ name: "hinweis", title: "Hinweis (intern)", type: "string", description: "Zum Beispiel, warum die Adresse geändert wurde oder seit wann sie nicht erreichbar ist." }),
  ],
  preview: { select: { title: "titel", subtitle: "url", erreichbar: "erreichbar" }, prepare: ({ title, subtitle, erreichbar }) => ({ title: erreichbar === false ? `${title} (nicht erreichbar)` : title, subtitle }) },
});

export const linkGruppe = defineType({
  name: "linkGruppe",
  title: "Linkgruppe",
  type: "object",
  fields: [
    defineField({ name: "kennung", title: "Kennung", type: "string", description: "Kleinbuchstaben, Ziffern, Bindestriche; bildet die Sprungmarke und bleibt stabil (zum Beispiel «ausbildung»)", validation: (r) => r.required().regex(/^[a-z0-9][a-z0-9-]*$/, { name: "Kennung", invert: false }) }),
    defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required().custom(schreibweise) }),
    defineField({ name: "links", title: "Links", type: "array", of: [defineArrayMember({ type: "linkEintrag" })], validation: (r) => r.required().min(1) }),
  ],
  preview: { select: { title: "titel", links: "links" }, prepare: ({ title, links }) => ({ title, subtitle: `${(links as unknown[] | undefined)?.length ?? 0} Links` }) },
});

export const freigabeFeld = defineField({ name: "freigabe", title: "Freigabe", type: "string", description: "«Demo»: belegt, aber vom Anwalt noch nicht bestätigt. «Live»: vom Anwalt freigegeben.", options: FREIGABE, initialValue: "demo", validation: (r) => r.required() });

/** Kurzform für ein einfaches Pflicht-Textfeld mit Schreibweise-Prüfung (einzeilig, mit `zeilen` mehrzeilig). */
export function text(name: string, title: string, description?: string, zeilen?: number) {
  return zeilen
    ? defineField({ name, title, description, type: "text", rows: zeilen, validation: (r) => r.required().custom(schreibweise) })
    : defineField({ name, title, description, type: "string", validation: (r) => r.required().custom(schreibweise) });
}
export function textOptional(name: string, title: string, description?: string, zeilen?: number) {
  return zeilen
    ? defineField({ name, title, description, type: "text", rows: zeilen, validation: (r) => r.custom(schreibweise) })
    : defineField({ name, title, description, type: "string", validation: (r) => r.custom(schreibweise) });
}

export const seoFelder = [
  defineField({ name: "seoTitel", title: "Seitentitel für Suchmaschinen", type: "string", description: "Erscheint im Browser-Tab und in Suchergebnissen. «Rechtsanwalt Bessler, Zürich» wird automatisch angehängt.", group: "seo", validation: (r) => r.max(60).custom(schreibweise) }),
  defineField({ name: "seoBeschreibung", title: "Beschreibung für Suchmaschinen", type: "text", rows: 3, description: "Ein bis zwei Sätze, 50 bis 170 Zeichen.", group: "seo", validation: (r) => r.min(50).max(170).custom(schreibweise) }),
];
export const seoGruppe = [{ name: "inhalt", title: "Inhalt", default: true }, { name: "seo", title: "Suchmaschinen" }];
