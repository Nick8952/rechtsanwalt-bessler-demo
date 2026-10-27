import type { MetadataRoute } from "next";
import { inhaltsquelle, pfade } from "@/lib/content";
import { siteUrl } from "@/lib/deploy-ziel";

export const dynamic = "force-static";

/** Wird nur ausgeliefert, wenn die Indexierung erlaubt ist (scripts/export-nachbereiten.mjs entfernt sie sonst). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const q = await inhaltsquelle();
  const publikationen = await q.getPublikationen();
  const seiten = [pfade.start, pfade.person, pfade.rechtsgebiete, pfade.coaching, pfade.publikationen, ...publikationen.map((p) => pfade.publikation(p.slug)), pfade.kontakt, pfade.links, pfade.impressum, pfade.datenschutz];
  return seiten.map((p) => ({ url: `${siteUrl}${p}`, lastModified: new Date() }));
}
