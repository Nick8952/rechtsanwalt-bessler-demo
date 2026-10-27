/**
 * Adressen der Seiten (ohne Unterpfad; den setzt next/link bzw. assetUrl).
 * Bewusst ohne Abhängigkeiten: Diese Datei darf in Client-Komponenten landen.
 */
export const PUBLIKATIONEN_BASIS = "publikationen";
export const pfade = {
  start: "/",
  person: "/person/",
  rechtsgebiete: "/rechtsgebiete/",
  coaching: "/coaching/",
  publikationen: `/${PUBLIKATIONEN_BASIS}/`,
  publikation: (slug: string) => `/${PUBLIKATIONEN_BASIS}/${slug}/`,
  kontakt: "/kontakt/",
  links: "/links/",
  impressum: "/impressum/",
  datenschutz: "/datenschutz/",
} as const;
