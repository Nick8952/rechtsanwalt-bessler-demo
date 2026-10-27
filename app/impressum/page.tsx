import type { Metadata } from "next";
import { RechtSeite } from "@/components/RechtSeite";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [k, t, s] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getRechtSeite("impressum")]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.impressum, kanzlei: k, texte: t });
}

export default function ImpressumSeite() {
  return <RechtSeite slug="impressum" />;
}
