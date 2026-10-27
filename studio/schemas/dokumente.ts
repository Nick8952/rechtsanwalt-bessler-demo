import { defineArrayMember, defineField, defineType } from "sanity";
import { freigabeFeld, linkzielErlaubt, schreibweise, seoFelder, seoGruppe, text, textOptional } from "./objekte";

const reihenfolge = defineField({ name: "reihenfolge", title: "Reihenfolge", type: "number", description: "Kleinere Zahlen stehen weiter vorne (10, 20, 30 lässt Platz für Einschübe).", initialValue: 100, validation: (r) => r.required() });
const slug = (quelle: string) =>
  defineField({ name: "slug", title: "Adresse (letzter Teil)", type: "slug", description: "Wird aus dem Titel erzeugt. Nach der Veröffentlichung nicht mehr ändern, sonst brechen bestehende Links.", options: { source: quelle, maxLength: 80 }, validation: (r) => r.required() });
const herkunftFeld = (titel = "Quellen") => defineField({ name: "herkunft", title: titel, type: "array", of: [defineArrayMember({ type: "herkunft" })], validation: (r) => r.required().min(1).error("Mindestens eine Quelle angeben.") });
const verweisFeld = (name: string, title: string, pflicht = true) => defineField({ name, title, type: "verweis", validation: pflicht ? (r) => r.required() : undefined });
const belegeFeld = defineField({ name: "belege", title: "Belege für die Texte dieser Seite", type: "belege", group: "inhalt", validation: (r) => r.required() });
const zeilenFeld = (name: string, title: string, description?: string) =>
  defineField({ name, title, description, type: "array", of: [defineArrayMember({ type: "string", validation: (r) => r.custom(schreibweise) })], validation: (r) => r.required().min(1) });

// ── Kanzlei und Kontakt ────────────────────────────────────────────────────
export const kanzlei = defineType({
  name: "kanzlei",
  title: "Kanzlei und Kontaktangaben",
  type: "document",
  groups: [{ name: "kanzlei", title: "Kanzlei", default: true }, { name: "kontakt", title: "Kontakt und Links" }, { name: "bilder", title: "Portrait und Vorschaubild" }, { name: "quellen", title: "Quellen" }],
  fields: [
    defineField({ name: "name", title: "Name der Website", type: "string", description: "Zum Beispiel «Rechtsanwalt Michael Bessler». Erscheint im Browser-Tab.", group: "kanzlei", validation: (r) => r.required() }),
    defineField({ name: "person", title: "Name", type: "string", group: "kanzlei", validation: (r) => r.required() }),
    defineField({ name: "titel", title: "Akademischer Titel", type: "string", description: "Zum Beispiel «lic. iur.»", group: "kanzlei", validation: (r) => r.required() }),
    defineField({ name: "beruf", title: "Berufsbezeichnung", type: "string", description: "Zum Beispiel «Rechtsanwalt»", group: "kanzlei", validation: (r) => r.required() }),
    zeilenFeld("taetigkeiten", "Tätigkeiten", "Zum Beispiel Rechtsanwalt, Strafverteidiger, Coach. Nur belegte Bezeichnungen; keine Fachanwaltstitel ohne Nachweis."),
    defineField({
      name: "adresse", title: "Adresse", type: "object", group: "kontakt", validation: (r) => r.required(),
      fields: [
        defineField({ name: "strasse", title: "Strasse und Nummer", type: "string", validation: (r) => r.required() }),
        defineField({ name: "plz", title: "Postleitzahl", type: "string", validation: (r) => r.required().regex(/^\d{4}$/, { name: "vierstellige Postleitzahl" }) }),
        defineField({ name: "ort", title: "Ort", type: "string", validation: (r) => r.required() }),
        defineField({ name: "land", title: "Land", type: "string", initialValue: "Schweiz", validation: (r) => r.required() }),
        defineField({ name: "zusatz", title: "Zusatz (Stockwerk, Eingang)", type: "string", description: "Zum Beispiel «4. OG»" }),
      ],
    }),
    defineField({ name: "telefon", title: "Telefon", type: "string", description: "Im internationalen Format: +41 43 960 36 28. Die Website zeigt daraus «043 960 36 28».", group: "kontakt", validation: (r) => r.required().regex(/^\+41 \d{2} \d{3} \d{2} \d{2}$/, { name: "Format +41 43 123 45 67" }) }),
    defineField({ name: "email", title: "E-Mail", type: "string", description: "An diese Adresse richtet das Kontaktformular die vorbereitete E-Mail.", group: "kontakt", validation: (r) => r.required().email() }),
    defineField({ name: "website", title: "Adresse der Website", type: "url", group: "kontakt", validation: (r) => r.required().uri({ scheme: ["https"] }) }),
    defineField({ name: "karteUrl", title: "Link zur Lage (Google Maps)", type: "url", description: "Öffnet sich in einem neuen Fenster. Es wird keine Karte eingebettet.", group: "kontakt", validation: (r) => r.required().uri({ scheme: ["https"] }) }),
    defineField({ name: "coachingUrl", title: "Eigene Website zum Coaching (optional)", type: "url", group: "kontakt", validation: (r) => r.uri({ scheme: ["https"] }) }),
    defineField({ name: "portrait", title: "Portrait", type: "bildMitText", description: "Echtes Foto von Michael Bessler, mit geklärten Rechten.", group: "bilder", validation: (r) => r.required() }),
    defineField({ name: "seoBild", title: "Vorschaubild für geteilte Links", type: "bildMitText", description: "1200 × 630 Pixel. Erscheint, wenn die Website in WhatsApp, LinkedIn usw. geteilt wird.", group: "bilder", validation: (r) => r.required() }),
    { ...herkunftFeld("Quellen der Kanzleiangaben"), group: "quellen" },
    { ...freigabeFeld, group: "quellen" },
  ],
  preview: { select: { title: "name", subtitle: "email", media: "portrait" } },
});

// ── Person ─────────────────────────────────────────────────────────────────
export const person = defineType({
  name: "person",
  title: "Zur Person",
  type: "document",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" },
    { ...text("einleitung", "Einleitung", "Ein bis drei Sätze; nur belegte Angaben, keine Erfolgsquoten, keine Titel ohne Nachweis.", 4), group: "inhalt" },
    { ...text("randnotiz", "Randnotiz", "Kurze Zeile am Rand, zum Beispiel «lic. iur., Rechtsanwalt, Strafverteidiger, Coach (zert. IKP)»"), group: "inhalt" },
    defineField({ name: "gruppen", title: "Lebenslauf (Gruppen mit Einträgen)", type: "array", of: [defineArrayMember({ type: "lebenslaufGruppe" })], group: "inhalt", validation: (r) => r.required().min(1) }),
    { ...textOptional("bildLegende", "Bildlegende zum Portrait"), group: "inhalt" },
    belegeFeld,
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Zur Person" }) },
});

// ── Rechtsgebiete ──────────────────────────────────────────────────────────
export const rechtsgebiet = defineType({
  name: "rechtsgebiet",
  title: "Rechtsgebiet",
  type: "document",
  fields: [
    text("titel", "Titel", "Zum Beispiel «Strafrecht»"),
    slug("titel"),
    text("kurz", "Was in diesem Gebiet angeboten wird", "Ein Satz, zusammengesetzt aus den belegten Leistungsformen (Rechtsauskunft, Rechtsberatung, Rechtsvertretung, Strafverteidigung). Keine Spezialisierungen ohne Quelle.", 2),
    defineField({ name: "bezuege", title: "Belegte Bezüge aus dem Lebenslauf", type: "array", of: [defineArrayMember({ type: "string", validation: (r) => r.custom(schreibweise) })], description: "Tätigkeiten oder Mitgliedschaften, die zu diesem Gebiet gehören. Darf leer sein.", initialValue: [] }),
    reihenfolge,
    herkunftFeld(),
    freigabeFeld,
  ],
  preview: { select: { title: "titel", subtitle: "kurz" } },
});

export const rechtsgebieteSeite = defineType({
  name: "rechtsgebieteSeite",
  title: "Rechtsgebiete (Übersichtsseite)",
  type: "document",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" },
    { ...text("einleitung", "Einleitung", undefined, 3), group: "inhalt" },
    { ...text("leistungsformenTitel", "Titel der Leistungsformen"), group: "inhalt" },
    { ...zeilenFeld("leistungsformen", "Leistungsformen", "Zum Beispiel Rechtsauskunft, Rechtsberatung, Rechtsvertretung, Strafverteidigung"), group: "inhalt" },
    { ...text("kontaktTitel", "Titel «Ihr Anliegen»"), group: "inhalt" },
    { ...text("kontaktText", "Text «Ihr Anliegen»", undefined, 3), group: "inhalt" },
    { ...verweisFeld("kontaktLink", "Kontaktlink"), group: "inhalt" },
    defineField({ name: "bild", title: "Bild (optional)", type: "bildMitText", group: "inhalt" }),
    { ...text("linksTitel", "Titel «Anlaufstellen»"), group: "inhalt" },
    { ...text("linksText", "Text «Anlaufstellen»", undefined, 3), group: "inhalt" },
    { ...verweisFeld("linksLink", "Link zur Linkseite"), group: "inhalt" },
    belegeFeld,
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Rechtsgebiete (Übersichtsseite)" }) },
});

// ── Coaching ───────────────────────────────────────────────────────────────
export const coachingSeite = defineType({
  name: "coachingSeite",
  title: "Coaching",
  type: "document",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" },
    { ...text("untertitel", "Untertitel", "Zum Beispiel «persönlich, ganzheitlich, bedürfnis- und lösungsorientiert»"), group: "inhalt" },
    { ...text("themenTitel", "Titel der Themen"), group: "inhalt" },
    { ...zeilenFeld("themen", "Themen"), group: "inhalt" },
    { ...zeilenFeld("absaetze", "Absätze", "Ein Absatz je Eintrag. Coaching ist keine Psychotherapie und keine medizinische Leistung; nichts davon versprechen."), group: "inhalt" },
    { ...text("ausbildung", "Ausbildung (ein Satz)", undefined, 2), group: "inhalt" },
    defineField({ name: "bild", title: "Bild (optional)", type: "bildMitText", group: "inhalt" }),
    { ...textOptional("externTitel", "Titel zur eigenen Coaching-Website"), group: "inhalt" },
    { ...textOptional("externText", "Text zur eigenen Coaching-Website"), group: "inhalt" },
    { ...verweisFeld("externLink", "Link zur eigenen Coaching-Website (optional)", false), group: "inhalt" },
    belegeFeld,
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Coaching" }) },
});

// ── Publikationen ──────────────────────────────────────────────────────────
export const publikation = defineType({
  name: "publikation",
  title: "Publikation",
  type: "document",
  description: "Ein eigenständiges Autorenwerk. Wortlaut, Zitate, Quellen und Gliederung bleiben erhalten; keine stillschweigenden Umarbeitungen.",
  groups: [{ name: "kopf", title: "Angaben", default: true }, { name: "text", title: "Text" }, { name: "quellen", title: "Quellen und Freigabe" }, { name: "seo", title: "Suchmaschinen" }],
  fields: [
    defineField({ name: "art", title: "Art", type: "string", options: { list: [{ title: "Rezension", value: "rezension" }, { title: "Thesen", value: "thesen" }, { title: "Seminararbeit", value: "seminararbeit" }], layout: "radio" }, group: "kopf", validation: (r) => r.required() }),
    defineField({ name: "titel", title: "Titel", type: "string", group: "kopf", validation: (r) => r.required() }),
    defineField({ name: "untertitel", title: "Untertitel (optional)", type: "string", group: "kopf" }),
    defineField({ name: "kurztitel", title: "Kurztitel für Listen", type: "string", group: "kopf", validation: (r) => r.required().custom(schreibweise) }),
    { ...slug("kurztitel"), group: "kopf" },
    defineField({ name: "autor", title: "Autor", type: "string", group: "kopf", initialValue: "Michael Bessler", validation: (r) => r.required() }),
    defineField({ name: "erschienen", title: "Erschienen (Jahr oder Jahr-Monat)", type: "string", description: "Nur, wenn die Quelle es nennt: «1999» oder «1999-03». Leer lassen statt schätzen.", group: "kopf", validation: (r) => r.regex(/^\d{4}(-\d{2})?$/, { name: "JJJJ oder JJJJ-MM" }) }),
    defineField({ name: "erschienenText", title: "Datum als Text (optional)", type: "string", description: "Zum Beispiel «März 1999». Leer = aus dem Feld «Erschienen» abgeleitet.", group: "kopf" }),
    defineField({ name: "quellenvermerk", title: "Publikationshinweis", type: "string", description: "Zum Beispiel «Erschienen in: Rechtshistorisches Journal 18, 1999, S. 67.»", group: "kopf" }),
    defineField({ name: "quellenvermerkOriginal", title: "Hinweis im Wortlaut der bisherigen Website", type: "text", rows: 2, group: "quellen", readOnly: true }),
    defineField({ name: "titelOriginal", title: "Titel im Wortlaut der bisherigen Website", type: "text", rows: 2, group: "quellen", readOnly: true }),
    defineField({ name: "quelleUrl", title: "Adresse der bisherigen Seite", type: "url", group: "quellen", validation: (r) => r.required().uri({ scheme: ["https"] }) }),
    defineField({ name: "abgerufen", title: "Abgerufen am", type: "date", group: "quellen", validation: (r) => r.required() }),
    defineField({
      name: "inhalt", title: "Text", type: "array", group: "text",
      description: "Zwischentitel (h2 bis h4) ergeben das Inhaltsverzeichnis und die Sprungmarken. Zitate als «Zitat»-Absatz. Literaturverzeichnis als Liste «Literatur».",
      of: [defineArrayMember({
        type: "block",
        styles: [{ title: "Absatz", value: "normal" }, { title: "Zwischentitel", value: "h2" }, { title: "Untertitel", value: "h3" }, { title: "Unter-Untertitel", value: "h4" }, { title: "Zitat", value: "blockquote" }],
        lists: [{ title: "Aufzählung", value: "bullet" }, { title: "Literaturverzeichnis", value: "literatur" }],
        marks: { decorators: [{ title: "Fett", value: "strong" }, { title: "Kursiv", value: "em" }], annotations: [{ name: "link", type: "object", title: "Link", fields: [defineField({ name: "href", title: "Ziel", type: "string", validation: (r) => r.required().custom(linkzielErlaubt) })] }] },
      })],
      validation: (r) => r.required().min(1),
    }),
    { ...reihenfolge, group: "kopf" },
    { ...herkunftFeld("Quelle des Textes"), group: "quellen" },
    { ...freigabeFeld, group: "quellen", description: "«Live» erst, wenn Michael Bessler Wortlaut und Veröffentlichung freigegeben hat (Nutzungsrechte)." },
    ...seoFelder,
  ],
  preview: { select: { title: "kurztitel", subtitle: "art" } },
});

export const publikationenSeite = defineType({
  name: "publikationenSeite",
  title: "Publikationen (Übersichtsseite)",
  type: "document",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" },
    { ...text("einleitung", "Einleitung", undefined, 3), group: "inhalt" },
    { ...text("hinweis", "Hinweis", "Zum Beispiel, dass die Texte historisch sind und keine Rechtsauskunft darstellen.", 3), group: "inhalt" },
    belegeFeld,
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Publikationen (Übersichtsseite)" }) },
});

// ── Links ──────────────────────────────────────────────────────────────────
export const linkSeite = defineType({
  name: "linkSeite",
  title: "Weiterführende Links",
  type: "document",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" },
    { ...text("einleitung", "Einleitung", undefined, 3), group: "inhalt" },
    defineField({ name: "gruppen", title: "Gruppen", type: "array", of: [defineArrayMember({ type: "linkGruppe" })], group: "inhalt", validation: (r) => r.required().min(1) }),
    belegeFeld,
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Weiterführende Links" }) },
});

// ── Kontakt ────────────────────────────────────────────────────────────────
export const kontaktSeite = defineType({
  name: "kontaktSeite",
  title: "Kontakt und Anfahrt",
  type: "document",
  groups: seoGruppe,
  fields: [
    { ...text("titel", "Titel"), group: "inhalt" },
    { ...text("einleitung", "Einleitung", undefined, 2), group: "inhalt" },
    { ...text("direktTitel", "Titel «Direkt erreichen»"), group: "inhalt" },
    { ...text("lageTitel", "Titel «Lage»"), group: "inhalt" },
    { ...zeilenFeld("lage", "Lage (Absätze)"), group: "inhalt" },
    { ...text("oevTitel", "Titel «Mit dem Tram»"), group: "inhalt" },
    { ...zeilenFeld("oev", "Öffentlicher Verkehr (Absätze)", "Tramlinien und Wegbeschreibung vor jeder Änderung prüfen."), group: "inhalt" },
    { ...text("hinweisTitel", "Titel des Hinweises"), group: "inhalt" },
    { ...text("hinweis", "Hinweis zur Kontaktaufnahme", "Zum Beispiel, dass eine Anfrage noch kein Mandat begründet. Wortlaut vom Anwalt freigeben lassen.", 3), group: "inhalt" },
    belegeFeld,
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Kontakt und Anfahrt" }) },
});

// ── Startseite ─────────────────────────────────────────────────────────────
const abschnittMitLink = (name: string, title: string, extra: ReturnType<typeof defineField>[] = []) =>
  defineField({ name, title, type: "object", group: "inhalt", validation: (r) => r.required(), fields: [text("titel", "Titel"), text("text", "Text", undefined, 3), ...extra, verweisFeld("link", "Link")] });

export const startseite = defineType({
  name: "startseite",
  title: "Startseite",
  type: "document",
  groups: seoGruppe,
  fields: [
    defineField({
      name: "hero", title: "Einstieg", type: "object", group: "inhalt", validation: (r) => r.required(),
      fields: [
        text("ueberzeile", "Überzeile", "Zum Beispiel «lic. iur. Michael Bessler, Rechtsanwalt in Zürich»"),
        text("titel", "Titel", "Höchstens zwei Zeilen."),
        text("text", "Text", "Höchstens 20 Wörter.", 2),
        verweisFeld("knopf", "Knopf (Kontakt aufnehmen)"),
        verweisFeld("zweiterKnopf", "Zweiter Knopf"),
      ],
    }),
    defineField({
      name: "einleitung", title: "Einleitung (Fragen und Antwort)", type: "object", group: "inhalt", validation: (r) => r.required(),
      fields: [text("randnotiz", "Randnotiz"), zeilenFeld("fragen", "Fragen", "Die Fragen der bisherigen Einleitungsseite, eine je Eintrag."), text("antwort", "Antwort", undefined, 3)],
    }),
    abschnittMitLink("rechtsgebiete", "Abschnitt «Rechtsgebiete»", [text("randnotizTitel", "Titel der Randnotiz")]),
    abschnittMitLink("person", "Abschnitt «Zur Person»", [text("zweiterText", "Zweiter Absatz", undefined, 3), defineField({ name: "bild", title: "Bild am Rand (optional)", type: "bildMitText" })]),
    abschnittMitLink("coaching", "Abschnitt «Coaching»", [text("untertitel", "Untertitel")]),
    abschnittMitLink("publikationen", "Abschnitt «Publikationen»", [text("randnotiz", "Randnotiz")]),
    defineField({ name: "kontakt", title: "Abschnitt «Kontakt»", type: "object", group: "inhalt", validation: (r) => r.required(), fields: [text("titel", "Titel"), text("text", "Text", undefined, 3), text("anfahrt", "Anfahrt (eine Zeile)"), verweisFeld("link", "Link")] }),
    belegeFeld,
    ...seoFelder,
  ],
  preview: { prepare: () => ({ title: "Startseite" }) },
});

// ── Navigation, Fusszeile und Formulartexte ────────────────────────────────
export const texte = defineType({
  name: "texte",
  title: "Navigation, Fusszeile und Formulartexte",
  type: "document",
  groups: [{ name: "navigation", title: "Navigation", default: true }, { name: "fuss", title: "Fusszeile" }, { name: "ui", title: "Kleine Texte" }, { name: "publikation", title: "Publikationen" }, { name: "formular", title: "Kontaktformular" }, { name: "einwilligung", title: "Datenschutz-Einstellungen" }, { name: "seo", title: "Suchmaschinen" }],
  fields: [
    defineField({ name: "demoHinweis", title: "Hinweis «Entwurf»", type: "string", description: "Schmale Zeile über der Kopfzeile. Sie erscheint nur, solange die Website nicht für Suchmaschinen freigegeben ist.", group: "navigation" }),
    defineField({ name: "navigation", title: "Seiten in der Navigation", type: "array", of: [defineArrayMember({ type: "verweis" })], group: "navigation", validation: (r) => r.required().min(1).max(6) }),
    defineField({ name: "kopf", title: "Kopfzeile", type: "object", group: "navigation", validation: (r) => r.required(), fields: [text("startLabel", "Zusatz zur Wortmarke, nur für Screenreader (zum Beispiel «zur Startseite»)"), text("menueKnopf", "Knopf «Menü»"), text("menueTitel", "Titel des Menüs"), text("schliessen", "Knopf «Schliessen»"), text("telefonLabel", "Beschriftung des Telefon-Links (für Screenreader)")] }),
    defineField({
      name: "footer", title: "Fusszeile", type: "object", group: "fuss", validation: (r) => r.required(),
      fields: [
        text("leitsatz", "Leitsatz"), text("kontaktTitel", "Titel «Kanzlei»"), text("seitenTitel", "Titel «Seiten»"), text("rechtlichesTitel", "Titel «Rechtliches»"),
        defineField({ name: "weitere", title: "Weitere Seiten (zum Beispiel Links)", type: "array", of: [defineArrayMember({ type: "verweis" })], initialValue: [] }),
        defineField({ name: "rechtliches", title: "Rechtliche Seiten", type: "array", of: [defineArrayMember({ type: "verweis" })], validation: (r) => r.required().min(1) }),
        text("route", "Beschriftung des Kartenlinks"), verweisFeld("bildnachweis", "Link zum Bildnachweis"), text("copyright", "Copyright-Inhaber"), text("demoHinweis", "Hinweis in der Fusszeile, solange die Website ein Entwurf ist", undefined, 2),
      ],
    }),
    defineField({
      name: "ui", title: "Kleine Texte", type: "object", group: "ui", validation: (r) => r.required(),
      fields: [
        text("zumInhalt", "Sprunglink"), text("telefon", "«Telefon»"), text("email", "«E-Mail»"), text("adresse", "«Adresse»"), text("karte", "Link «Lage in Google Maps»"), text("neuesFenster", "Hinweis «öffnet in einem neuen Fenster»"),
        text("stand", "«Stand»"), text("quelle", "«Quelle»"), text("bildnachweisTitel", "Titel «Bildnachweis»"), text("weiterlesen", "«Weiterlesen»"),
        text("nichtGefundenTitel", "Fehlerseite: Titel"), text("nichtGefundenText", "Fehlerseite: Text", undefined, 2), verweisFeld("nichtGefundenLink", "Fehlerseite: Link"),
      ],
    }),
    defineField({
      name: "publikation", title: "Publikationen", type: "object", group: "publikation", validation: (r) => r.required(),
      fields: [
        text("inhaltsverzeichnis", "Titel «Inhalt»"), text("zurueck", "Link «Alle Publikationen»"), text("autor", "«Autor»"), text("erschienen", "«Erschienen»"), text("ohneDatum", "«ohne Datumsangabe»"),
        defineField({ name: "arten", title: "Bezeichnungen der Arten", type: "object", validation: (r) => r.required(), fields: [text("rezension", "Rezension"), text("thesen", "Thesen"), text("seminararbeit", "Seminararbeit")] }),
        text("drucken", "Knopf «Drucken»"), text("nachOben", "Link «Nach oben»"), text("hinweisHistorisch", "Hinweis «keine aktuelle Rechtsauskunft»", undefined, 2), text("originalLabel", "Link zur bisherigen Seite"), text("wortlaut", "Hinweis «im Wortlaut»", undefined, 2),
      ],
    }),
    defineField({
      name: "formular", title: "Kontaktformular", type: "object", group: "formular", validation: (r) => r.required(),
      description: "Das Formular versendet nichts. Es bereitet eine E-Mail im E-Mail-Programm der Besucherin oder des Besuchers vor. Die Texte müssen das ehrlich sagen.",
      fields: [
        text("titel", "Titel"), text("einleitung", "Einleitung", "Muss erklären, dass sich das E-Mail-Programm öffnet und die Website nichts sendet.", 3),
        text("name", "Feld «Name»"), text("email", "Feld «E-Mail»"), text("telefon", "Feld «Telefon»"), text("telefonHilfe", "Hilfetext zum Telefon"), text("betreff", "Feld «Betreff»"),
        defineField({ name: "betreffOptionen", title: "Auswahl «Betreff»", type: "array", of: [defineArrayMember({ type: "object", name: "betreffOption", fields: [defineField({ name: "wert", title: "Kennung (klein, ohne Leerzeichen)", type: "string", validation: (r) => r.required().regex(/^[a-z0-9-]+$/, { name: "Kleinbuchstaben, Ziffern, Bindestrich" }) }), defineField({ name: "titel", title: "Beschriftung", type: "string", validation: (r) => r.required() })], preview: { select: { title: "titel", subtitle: "wert" } } })], validation: (r) => r.required().min(1) }),
        text("nachricht", "Feld «Nachricht»"), text("nachrichtHilfe", "Hilfetext unter der Nachricht", "Muss um Zurückhaltung bei vertraulichen Falldetails bitten.", 2), text("pflicht", "Hinweis auf Pflichtfelder"), text("datenschutzHinweis", "Hinweis vor dem Link zur Datenschutzerklärung"),
        verweisFeld("datenschutzLink", "Link zur Datenschutzerklärung"),
        text("absenden", "Knopf", "Ehrlich beschriften, zum Beispiel «E-Mail vorbereiten». Nicht «Senden»."), text("hinweisNachher", "Hinweis nach dem Klick", "Keine Versandbestätigung: Die Website weiss nicht, ob die E-Mail gesendet wurde.", 3),
        text("kopieren", "Knopf «Nachricht kopieren»"), text("kopiert", "Meldung nach dem Kopieren"), text("kopierenFehler", "Meldung, wenn das Kopieren nicht geht", undefined, 2),
        text("zuLangFehler", "Meldung bei sehr langer Nachricht ohne Zwischenablage", undefined, 3), text("volltextLabel", "Beschriftung der Nachricht zum Kopieren"), text("betreffPraefix", "Betreff der E-Mail (Anfang)"),
        text("fehlerName", "Fehlermeldung Name"), text("fehlerEmail", "Fehlermeldung E-Mail"), text("fehlerNachricht", "Fehlermeldung Nachricht"), text("ohneJavascript", "Text ohne JavaScript"), text("keinMandat", "Hinweis «kein Mandat»", "Wortlaut vom Anwalt freigeben lassen.", 3),
      ],
    }),
    defineField({
      name: "einwilligung", title: "Datenschutz-Einstellungen", type: "object", group: "einwilligung", validation: (r) => r.required(),
      description: "Solange keine Kategorie eingetragen ist, erscheint kein Banner. Eine Kategorie nur eintragen, wenn die Website tatsächlich einen einwilligungspflichtigen Dienst einbindet (das braucht eine Entwicklerin oder einen Entwickler).",
      fields: [
        text("fussLink", "Link in der Fusszeile"), text("ruhendTitel", "Titel, wenn nichts einzustellen ist"), text("ruhendText", "Text, wenn nichts einzustellen ist", undefined, 3),
        text("bannerTitel", "Banner: Titel"), text("bannerText", "Banner: Text", undefined, 3), text("alleAkzeptieren", "Knopf «Alle akzeptieren»"), text("nurNotwendige", "Knopf «Nur notwendige»"), text("einstellungen", "Knopf «Einstellungen»"),
        text("auswahlSpeichern", "Knopf «Auswahl speichern»"), text("widerrufen", "Knopf «Einwilligung widerrufen»"), text("notwendigTitel", "Kategorie «Notwendig»: Titel"), text("notwendigText", "Kategorie «Notwendig»: Text"), text("datenschutzerklaerung", "Link «Datenschutzerklärung»"),
        defineField({ name: "kategorien", title: "Optionale Kategorien", type: "array", of: [defineArrayMember({ type: "object", name: "einwilligungKategorie", fields: [defineField({ name: "kennung", title: "Kennung (Kleinbuchstaben)", type: "string", validation: (r) => r.required().regex(/^[a-z]+$/, { name: "nur Kleinbuchstaben" }) }), defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required() }), defineField({ name: "beschreibung", title: "Beschreibung", type: "text", rows: 2, validation: (r) => r.required() })], preview: { select: { title: "titel", subtitle: "kennung" } } })], initialValue: [] }),
      ],
    }),
    defineField({ name: "seo", title: "Suchmaschinen (Standard)", type: "object", group: "seo", validation: (r) => r.required(), fields: [text("titelZusatz", "Zusatz im Seitentitel", "Wird an jeden Seitentitel angehängt, zum Beispiel «Rechtsanwalt Bessler, Zürich»."), text("beschreibung", "Standardbeschreibung", "Gilt für Seiten ohne eigene Beschreibung.", 3)] }),
  ],
  preview: { prepare: () => ({ title: "Navigation, Fusszeile und Formulartexte" }) },
});

// ── Rechtsseiten ───────────────────────────────────────────────────────────
export const rechtSeite = defineType({
  name: "rechtSeite",
  title: "Rechtsseite",
  type: "document",
  groups: seoGruppe,
  fields: [
    defineField({ name: "slug", title: "Kennung", type: "slug", group: "inhalt", options: { source: "titel" }, validation: (r) => r.required().custom((s) => (s?.current === "impressum" || s?.current === "datenschutz" ? true : "Erlaubt sind «impressum» und «datenschutz».")) }),
    { ...text("titel", "Titel"), group: "inhalt" },
    { ...textOptional("einleitung", "Einleitung (optional)", undefined, 3), group: "inhalt" },
    { ...text("stand", "Stand", "Zum Beispiel «27. Oktober 2026»"), group: "inhalt" },
    defineField({
      name: "inhalt", title: "Inhalt", type: "array", group: "inhalt",
      of: [defineArrayMember({ type: "block", styles: [{ title: "Absatz", value: "normal" }, { title: "Zwischentitel", value: "h2" }, { title: "Untertitel", value: "h3" }], lists: [{ title: "Aufzählung", value: "bullet" }], marks: { decorators: [{ title: "Fett", value: "strong" }, { title: "Kursiv", value: "em" }], annotations: [{ name: "link", type: "object", title: "Link", fields: [defineField({ name: "href", title: "Ziel", type: "string", description: "Interne Seite («/kontakt/»), https://-Adresse, mailto: oder tel:", validation: (r) => r.required().custom(linkzielErlaubt) })] }] } })],
      validation: (r) => r.required().min(1),
    }),
    belegeFeld,
    ...seoFelder,
  ],
  preview: { select: { title: "titel", subtitle: "stand" } },
});
