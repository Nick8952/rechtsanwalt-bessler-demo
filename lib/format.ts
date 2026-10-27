const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

/** «2026-10-27» → «27. Oktober 2026» */
export function datumText(iso: string): string {
  const [j, m, t] = iso.split("-").map(Number);
  return `${t}. ${MONATE[m - 1]} ${j}`;
}

/** «1999» → «1999», «1999-03» → «März 1999» (Publikationsdaten, so genau wie die Quelle) */
export function erschienenText(wert: string | undefined, fallback?: string): string | undefined {
  if (fallback) return fallback;
  if (!wert) return undefined;
  const [j, m] = wert.split("-").map(Number);
  return m ? `${MONATE[m - 1]} ${j}` : String(j);
}
