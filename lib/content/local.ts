import "server-only";
import kanzleiRoh from "@/data/kanzlei.json";
import texteRoh from "@/data/texte.json";
import startseiteRoh from "@/data/startseite.json";
import personRoh from "@/data/person.json";
import rechtsgebieteRoh from "@/data/rechtsgebiete.json";
import rechtsgebieteSeiteRoh from "@/data/seiten/rechtsgebiete.json";
import coachingSeiteRoh from "@/data/seiten/coaching.json";
import publikationenSeiteRoh from "@/data/seiten/publikationen.json";
import linkSeiteRoh from "@/data/seiten/links.json";
import kontaktSeiteRoh from "@/data/seiten/kontakt.json";
import impressumRoh from "@/data/seiten/impressum.json";
import datenschutzRoh from "@/data/seiten/datenschutz.json";
import bilderRoh from "@/data/bilder.json";
import rezensionRoh from "@/data/publikationen/geistesgeschichtliche-grundlagen-des-deutschen-rechts.json";
import seminararbeitRoh from "@/data/publikationen/der-mann-ohne-eigenschaften.json";
import thesenRoh from "@/data/publikationen/thesen-der-mann-ohne-eigenschaften.json";
import { z } from "zod";
import {
  coachingSeiteSchema, kanzleiSchema, kontaktSeiteSchema, linkSeiteSchema, personSchema, pruefen, publikationSchema, publikationenSeiteSchema,
  rechtSeiteSchema, rechtsgebietSchema, rechtsgebieteSeiteSchema, startseiteSchema, texteSchema,
  type Bild, type Block, type Inhaltsquelle, type Publikation, type Rechtsgebiet,
} from "./modell";
import { ankerVergeben, bloecke, type RohBlock } from "./text";

/**
 * Lokale Inhaltsquelle: liest data/*.json, löst Bildkennungen auf und prüft alles gegen das Domainmodell.
 * Das ist der Inhaltsbestand der GitHub-Pages-Demo. Dieselben Dateien sind die Vorlage für den Import nach Sanity (scripts/seed.mts).
 */
type BildEintrag = { id: string; breite: number; hoehe: number; alt: string; legende: string | null; nachweis: { urheber: string; titel: string; quelle: string; lizenz: string }; quellen: Bild["quellen"] };
const bilder = bilderRoh as unknown as Record<string, BildEintrag>;

export function bild(id: string): Bild {
  const b = bilder[id];
  if (!b) throw new Error(`Bild «${id}» fehlt in data/bilder.json (npm run bilder ausführen oder Kennung korrigieren).`);
  return { alt: b.alt, breite: b.breite, hoehe: b.hoehe, quellen: b.quellen, legende: b.legende ?? undefined, nachweis: { urheber: b.nachweis.urheber, quelle: b.nachweis.quelle, lizenz: b.nachweis.lizenz } };
}
const bildOptional = (id: string | undefined | null): Bild | undefined => (id ? bild(id) : undefined);

/** Publikationen liegen bereits als Blöcke vor; die Sprungmarken werden hier (wie bei Sanity) aus den Titeln vergeben. */
function publikation(roh: unknown, wo: string): Publikation {
  const r = roh as { bloecke: Block[] } & Record<string, unknown>;
  const ohneLeer = Object.fromEntries(Object.entries(r).filter(([, v]) => v !== null));
  return pruefen(publikationSchema, { ...ohneLeer, bloecke: ankerVergeben(r.bloecke.map((b) => (b.art === "titel" ? { ...b, anker: b.anker || "x" } : b))) }, wo);
}

const kanzlei = pruefen(kanzleiSchema, { ...kanzleiRoh, portrait: bild(kanzleiRoh.portrait), seoBild: bild(kanzleiRoh.seoBild) }, "data/kanzlei.json");
const texte = pruefen(texteSchema, texteRoh, "data/texte.json");
const startseite = pruefen(startseiteSchema, { ...startseiteRoh, person: { ...startseiteRoh.person, bild: bildOptional(startseiteRoh.person.bild) } }, "data/startseite.json");
const person = pruefen(personSchema, personRoh, "data/person.json");
const rechtsgebiete: Rechtsgebiet[] = pruefen(z.array(rechtsgebietSchema), rechtsgebieteRoh, "data/rechtsgebiete.json").sort((a, b) => a.reihenfolge - b.reihenfolge);
{
  const slugs = new Set<string>();
  for (const r of rechtsgebiete) {
    if (slugs.has(r.slug)) throw new Error(`data/rechtsgebiete.json: Slug «${r.slug}» kommt doppelt vor.`);
    slugs.add(r.slug);
  }
}
const rechtsgebieteSeite = pruefen(rechtsgebieteSeiteSchema, { ...rechtsgebieteSeiteRoh, bild: bildOptional(rechtsgebieteSeiteRoh.bild) }, "data/seiten/rechtsgebiete.json");
const coachingSeite = pruefen(coachingSeiteSchema, { ...coachingSeiteRoh, bild: bildOptional(coachingSeiteRoh.bild) }, "data/seiten/coaching.json");
const publikationenSeite = pruefen(publikationenSeiteSchema, publikationenSeiteRoh, "data/seiten/publikationen.json");
const publikationen: Publikation[] = [
  publikation(rezensionRoh, "data/publikationen/geistesgeschichtliche-grundlagen-des-deutschen-rechts.json"),
  publikation(seminararbeitRoh, "data/publikationen/der-mann-ohne-eigenschaften.json"),
  publikation(thesenRoh, "data/publikationen/thesen-der-mann-ohne-eigenschaften.json"),
].sort((a, b) => a.reihenfolge - b.reihenfolge);
{
  const slugs = new Set<string>();
  for (const p of publikationen) {
    if (slugs.has(p.slug)) throw new Error(`data/publikationen: Slug «${p.slug}» kommt doppelt vor.`);
    slugs.add(p.slug);
  }
}
const linkSeite = pruefen(linkSeiteSchema, linkSeiteRoh, "data/seiten/links.json");
const kontaktSeite = pruefen(kontaktSeiteSchema, kontaktSeiteRoh, "data/seiten/kontakt.json");
const impressum = pruefen(rechtSeiteSchema, { ...impressumRoh, bloecke: bloecke(impressumRoh.bloecke as RohBlock[]) }, "data/seiten/impressum.json");
const datenschutz = pruefen(rechtSeiteSchema, { ...datenschutzRoh, bloecke: bloecke(datenschutzRoh.bloecke as RohBlock[]) }, "data/seiten/datenschutz.json");

export const lokaleQuelle: Inhaltsquelle = {
  getKanzlei: async () => kanzlei,
  getTexte: async () => texte,
  getStartseite: async () => startseite,
  getPerson: async () => person,
  getRechtsgebiete: async () => rechtsgebiete,
  getRechtsgebieteSeite: async () => rechtsgebieteSeite,
  getCoachingSeite: async () => coachingSeite,
  getPublikationen: async () => publikationen,
  getPublikation: async (slug) => publikationen.find((p) => p.slug === slug) ?? null,
  getPublikationenSeite: async () => publikationenSeite,
  getLinkSeite: async () => linkSeite,
  getKontaktSeite: async () => kontaktSeite,
  getRechtSeite: async (slug) => (slug === "impressum" ? impressum : datenschutz),
  getBildnachweise: async () => {
    const gesehen = new Set<string>();
    return Object.values(bilder)
      .filter((b) => (gesehen.has(b.nachweis.quelle) ? false : (gesehen.add(b.nachweis.quelle), true)))
      .map((b) => ({ titel: b.nachweis.titel ?? b.legende ?? b.alt, urheber: b.nachweis.urheber, quelle: b.nachweis.quelle, lizenz: b.nachweis.lizenz }));
  },
};
