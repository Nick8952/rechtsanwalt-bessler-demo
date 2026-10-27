import "server-only";
import type { Inhaltsquelle } from "./modell";
import { indexierungErlaubt, indexierungProbe } from "../deploy-ziel";
import { offeneFreigaben } from "./freigabe";
import { pfade } from "./pfade";

export * from "./modell";

/**
 * Auswahl der Inhaltsquelle.
 *
 * - Standard (keine Env-Variablen): lokale JSON-Dateien → GitHub-Pages-Demo.
 * - CONTENT_SOURCE=sanity: Sanity. Fehlen Projekt-ID oder Dataset, bricht der Build mit einer klaren Meldung ab;
 *   bewusst kein stiller Rückfall auf Demo-Inhalte.
 *
 * Die Sanity-Quelle wird erst im gewählten Zweig geladen, damit die Demo ohne Sanity-Konfiguration baut
 * und im Pages-Build kein Sanity-Code ausgeführt wird.
 */
const quelleRoh = (process.env.CONTENT_SOURCE ?? "").trim();
if (quelleRoh && quelleRoh !== "sanity" && quelleRoh !== "lokal") {
  throw new Error(`CONTENT_SOURCE=«${quelleRoh}» ist unbekannt. Erlaubt: leer/«lokal» (data/*.json) oder «sanity».`);
}

async function laden(): Promise<Inhaltsquelle> {
  if (quelleRoh === "sanity") {
    const { sanityQuelle } = await import("./sanity");
    return sanityQuelle;
  }
  const { lokaleQuelle } = await import("./local");
  return lokaleQuelle;
}

/**
 * Invarianten, die für beide Inhaltsquellen gelten und sich nicht in einem einzelnen Schema ausdrücken lassen (sie betreffen
 * mehrere Dokumente): Navigation und Fusszeile zeigen nur auf Seiten, die es gibt; Sprungmarken in Publikationen sind eindeutig;
 * der Kontaktweg des Formulars ist die E-Mail der Kanzlei. Bricht den Build mit klarer Meldung ab, auch mit Inhalten aus Sanity.
 */
export async function invariantenPruefen(q: Inhaltsquelle): Promise<void> {
  const [t, publikationen, start, rg, coaching] = await Promise.all([q.getTexte(), q.getPublikationen(), q.getStartseite(), q.getRechtsgebieteSeite(), q.getCoachingSeite()]);
  const fehler: string[] = [];
  const seiten = new Set<string>([pfade.start, pfade.person, pfade.rechtsgebiete, pfade.coaching, pfade.publikationen, pfade.kontakt, pfade.links, pfade.impressum, pfade.datenschutz, ...publikationen.map((p) => pfade.publikation(p.slug))]);
  const links = [
    ...t.navigation, ...t.footer.weitere, ...t.footer.rechtliches, t.footer.bildnachweis, t.ui.nichtGefundenLink, t.formular.datenschutzLink,
    start.hero.knopf, start.hero.zweiterKnopf, start.rechtsgebiete.link, start.person.link, start.coaching.link, start.publikationen.link, start.kontakt.link,
    rg.kontaktLink, rg.linksLink, ...(coaching.externLink ? [coaching.externLink] : []),
  ];
  for (const l of links) {
    if (l.ziel.startsWith("/") && !seiten.has(l.ziel.split("#")[0])) fehler.push(`Link «${l.text}» zeigt auf eine Seite, die es nicht gibt: ${l.ziel}`);
  }
  for (const p of publikationen) {
    const anker = new Set<string>();
    for (const b of p.bloecke) {
      if (b.art !== "titel") continue;
      if (anker.has(b.anker)) fehler.push(`Publikation «${p.slug}»: Sprungmarke «${b.anker}» doppelt`);
      anker.add(b.anker);
    }
  }
  if (fehler.length) throw new Error(`Inhalte verletzen Invarianten:\n${fehler.map((f) => `  - ${f}`).join("\n")}`);
}

let invariantenGeprueft: Promise<void> | null = null;
let freigabeGeprueft: Promise<void> | null = null;
/**
 * Die Inhaltsquelle des Builds. Ist die Indexierung für eine echte Domain eingeschaltet (INDEXIERUNG=1), bricht der erste
 * Zugriff ab, solange Angaben nicht freigegeben sind oder die Rechtstexte noch die Demo beschreiben.
 * Ausgenommen ist nur der Probe-Build für eine reservierte Testdomain (siehe lib/deploy-ziel.ts).
 */
export async function inhaltsquelle(): Promise<Inhaltsquelle> {
  const q = await laden();
  invariantenGeprueft ??= invariantenPruefen(q);
  await invariantenGeprueft;
  if (indexierungErlaubt && !indexierungProbe) {
    freigabeGeprueft ??= offeneFreigaben(q).then((offen) => {
      if (offen.length) throw new Error(`INDEXIERUNG=1 ist gesetzt, aber ${offen.length} Punkt(e) sind nicht freigegeben:\n${offen.map((o) => `  - ${o}`).join("\n")}\nErst klären (docs/UEBERGABE.md), dann indexieren.`);
    });
    await freigabeGeprueft;
  }
  return q;
}

export const inhaltsquelleName = quelleRoh === "sanity" ? "sanity" : "lokal";
