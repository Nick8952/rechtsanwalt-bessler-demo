import type { Block, Inhaltsquelle } from "./modell";
import { blockText } from "./text";

/**
 * Was vor dem Go-Live noch offen ist, gelesen aus der Inhaltsquelle, die der Build tatsächlich verwendet (lokal oder Sanity):
 *  - Kanzleiangaben, Seitenbelege, Rechtsgebiete und Publikationen, die Michael Bessler noch nicht freigegeben hat (`freigabe` ist nicht «live»)
 *  - Rechtstexte, die noch die Demo beschreiben
 * Die Liste benutzt `npm run inhalt:pruefen -- --live`, und der Build bricht mit ihr ab, sobald INDEXIERUNG=1 für eine echte
 * Domain gesetzt ist: Eine indexierbare Website mit unbestätigten Angaben kann so nicht entstehen.
 */
export async function offeneFreigaben(q: Inhaltsquelle): Promise<string[]> {
  const [k, start, person, rechtsgebiete, rgSeite, coaching, publikationen, pubSeite, links, kontakt, impressum, datenschutz] = await Promise.all([
    q.getKanzlei(), q.getStartseite(), q.getPerson(), q.getRechtsgebiete(), q.getRechtsgebieteSeite(), q.getCoachingSeite(), q.getPublikationen(), q.getPublikationenSeite(), q.getLinkSeite(), q.getKontaktSeite(), q.getRechtSeite("impressum"), q.getRechtSeite("datenschutz"),
  ]);
  const offen: string[] = [];
  const pruefe = (wo: string, titel: string, freigabe: string) => { if (freigabe !== "live") offen.push(`Noch nicht vom Anwalt freigegeben: ${wo}, «${titel}»`); };
  pruefe("Kanzleiangaben", "Adresse, Telefon, E-Mail, Links", k.freigabe);
  pruefe("Startseite", "Einstieg und Abschnitte", start.belege.freigabe);
  pruefe("Person", "Einleitung und Lebenslauf", person.belege.freigabe);
  for (const r of rechtsgebiete) pruefe("Rechtsgebiete", r.titel, r.freigabe);
  pruefe("Rechtsgebiete", "Übersichtsseite", rgSeite.belege.freigabe);
  pruefe("Coaching", "Texte", coaching.belege.freigabe);
  for (const p of publikationen) pruefe("Publikationen (Nutzungsrechte und Wortlaut)", p.kurztitel, p.freigabe);
  pruefe("Publikationen", "Übersichtsseite", pubSeite.belege.freigabe);
  pruefe("Links", "Liste der weiterführenden Links", links.belege.freigabe);
  pruefe("Kontakt und Anfahrt", "Lage, Anfahrt, Hinweis zur Mandatsannahme", kontakt.belege.freigabe);
  pruefe("Impressum", "Betreiberangaben und Texte", impressum.belege.freigabe);
  pruefe("Datenschutzerklärung", "Verantwortliche und Texte", datenschutz.belege.freigabe);
  // Heuristik, keine Garantie: Merkmale der Demo-Fassung (Zweck, Betreiber, Hosting). Die produktiven Rechtstexte schreibt der Anwalt neu
  // und gibt sie frei; erst dann darf «freigabe» auf «live» stehen (docs/UEBERGABE.md).
  const DEMO_MERKMALE = /\bDemo\b|Verkaufs-Demo|GitHub Pages|GitHub, Inc|Nick Holzbecher|holzbechernick|ohne Auftrag/i;
  const demoText = (seite: { einleitung?: string; bloecke: Block[] }) => [seite.einleitung ?? "", ...seite.bloecke.map(blockText)].find((t) => DEMO_MERKMALE.test(t));
  const im = demoText(impressum); if (im) offen.push(`Das Impressum beschreibt noch die Demo («${im.match(DEMO_MERKMALE)?.[0]}»): für den Produktivbetrieb neu schreiben (Betreiber, Zweck, Hosting).`);
  const ds = demoText(datenschutz); if (ds) offen.push(`Die Datenschutzerklärung beschreibt noch die Demo («${ds.match(DEMO_MERKMALE)?.[0]}»): an Verantwortliche und produktives Hosting anpassen.`);
  return offen;
}
