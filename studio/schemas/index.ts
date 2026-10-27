import { belege, bildMitText, herkunft, lebenslaufGruppe, linkEintrag, linkGruppe, verweis } from "./objekte";
import { coachingSeite, kanzlei, kontaktSeite, linkSeite, person, publikation, publikationenSeite, rechtSeite, rechtsgebiet, rechtsgebieteSeite, startseite, texte } from "./dokumente";

/** Dokumente, die es genau einmal gibt (feste Kennung, kein «Neu anlegen», kein Löschen). */
export const EINZELDOKUMENTE = ["kanzlei", "texte", "startseite", "person", "rechtsgebieteSeite", "coachingSeite", "publikationenSeite", "linkSeite", "kontaktSeite", "rechtSeite"];

export const schemaTypes = [
  // Objekte
  verweis, bildMitText, herkunft, belege, lebenslaufGruppe, linkEintrag, linkGruppe,
  // Dokumente
  kanzlei, texte, startseite, person, rechtsgebiet, rechtsgebieteSeite, coachingSeite, publikation, publikationenSeite, linkSeite, kontaktSeite, rechtSeite,
];
