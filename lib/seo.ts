import type { Metadata } from "next";
import type { Bild, Kanzlei, Publikation, Texte } from "./content/modell";
import { indexierungErlaubt, siteUrl } from "./deploy-ziel";
import { telLink } from "./assets";
import { pfade } from "./content/pfade";

export { indexierungErlaubt };

const robots = () => (indexierungErlaubt ? { index: true, follow: true } : { index: false, follow: false });
/** Lokale Pfade bekommen die Site-URL (samt Unterpfad auf GitHub Pages). */
const absolut = (url: string) => (/^https?:\/\//.test(url) ? url : `${siteUrl}${url}`);

/**
 * Metadaten einer Seite. `pfad` ist der Pfad ohne Unterpfad («/kontakt/»); Canonical und Open Graph zeigen immer auf die
 * tatsächliche Adresse der laufenden Installation (Demo: GitHub Pages, später: SITE_URL der Kanzleidomain).
 * Open-Graph-Angaben werden vollständig je Seite gesetzt, weil Next sie nicht mit denen des Layouts zusammenführt.
 */
export function seitenMetadaten(opt: { titel: string; beschreibung?: string; pfad: string; bild?: Bild; kanzlei: Kanzlei; texte: Texte; istStart?: boolean; artikel?: boolean }): Metadata {
  const { titel, pfad, kanzlei: k, texte: t } = opt;
  const beschreibung = opt.beschreibung ?? t.seo.beschreibung;
  const b = opt.bild ?? k.seoBild;
  const groesste = b.quellen.webp[b.quellen.webp.length - 1];
  return {
    title: opt.istStart ? { absolute: `${k.name}: ${titel}` } : titel,
    description: beschreibung,
    alternates: { canonical: `${siteUrl}${pfad}` },
    openGraph: {
      title: opt.istStart ? `${k.name}: ${titel}` : `${titel} | ${t.seo.titelZusatz}`,
      description: beschreibung,
      url: `${siteUrl}${pfad}`,
      siteName: k.name,
      locale: "de_CH",
      type: opt.artikel ? "article" : "website",
      images: [{ url: absolut(groesste.url), width: b.breite, height: b.hoehe, alt: b.alt }],
    },
    robots: robots(),
  };
}

/**
 * Strukturierte Daten für Person und Kanzlei (schema.org Person und LegalService). Sie werden nur ausgegeben, wenn die
 * Indexierung freigegeben ist (INDEXIERUNG=1 auf der Kanzleidomain). Enthalten sind ausschliesslich belegte Angaben:
 * Name, Titel, Beruf, Adresse, Telefon, E-Mail, Rechtsgebiete als Stichworte. Keine Bewertungen, keine Honorare, keine Öffnungszeiten.
 */
export function kanzleiJsonLd(k: Kanzlei, rechtsgebiete: { titel: string }[]) {
  const personId = `${siteUrl}/#person`;
  const adresse = { "@type": "PostalAddress", streetAddress: k.adresse.strasse, postalCode: k.adresse.plz, addressLocality: k.adresse.ort, addressCountry: "CH" };
  const portrait = absolut(k.portrait.quellen.webp[k.portrait.quellen.webp.length - 1].url);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: k.person,
        honorificPrefix: k.titel,
        jobTitle: k.beruf,
        image: portrait,
        url: `${siteUrl}/`,
        telephone: telLink(k.telefon).replace("tel:", ""),
        email: k.email,
        address: adresse,
        knowsAbout: rechtsgebiete.map((r) => r.titel),
      },
      {
        "@type": "LegalService",
        "@id": `${siteUrl}/#kanzlei`,
        name: k.name,
        url: `${siteUrl}/`,
        image: portrait,
        telephone: telLink(k.telefon).replace("tel:", ""),
        email: k.email,
        address: adresse,
        founder: { "@id": personId },
        employee: { "@id": personId },
      },
    ],
  };
}

/** Strukturierte Daten für eine Publikation (schema.org Article): nur Titel, Autor und das in der Quelle genannte Datum. */
export function publikationJsonLd(p: Publikation, k: Kanzlei) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteUrl}${pfade.publikation(p.slug)}#artikel`,
    headline: p.titel,
    ...(p.untertitel ? { alternativeHeadline: p.untertitel } : {}),
    author: { "@type": "Person", "@id": `${siteUrl}/#person`, name: p.autor },
    ...(p.erschienen ? { datePublished: p.erschienen } : {}),
    inLanguage: "de-CH",
    url: `${siteUrl}${pfade.publikation(p.slug)}`,
    publisher: { "@type": "Person", name: k.person },
  };
}

/** JSON für ein <script type="application/ld+json">: «<» wird maskiert, damit Inhalte das Skript nicht beenden können. */
export function jsonLdSicher(daten: unknown): string {
  return JSON.stringify(daten).replace(/</g, "\\u003c");
}
