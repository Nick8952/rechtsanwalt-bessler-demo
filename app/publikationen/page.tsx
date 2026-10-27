import type { Metadata } from "next";
import { Abschnitt } from "@/components/Abschnitt";
import { Publikationsliste } from "@/components/Publikationsliste";
import { Seitenkopf } from "@/components/Seitenkopf";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [k, t, s] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getPublikationenSeite()]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.publikationen, kanzlei: k, texte: t });
}

export default async function PublikationenSeite() {
  const q = await inhaltsquelle();
  const [t, s, publikationen] = await Promise.all([q.getTexte(), q.getPublikationenSeite(), q.getPublikationen()]);
  return (
    <>
      <Seitenkopf titel={s.titel} einleitung={s.einleitung} />
      <Abschnitt trenner={false} rand={<p className="hinweis klein">{s.hinweis}</p>}>
        <Publikationsliste publikationen={publikationen} texte={t} ausfuehrlich ueberschriftStufe={2} />
      </Abschnitt>
    </>
  );
}
