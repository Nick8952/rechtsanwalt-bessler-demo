import type { Metadata } from "next";
import { Abschnitt, Randnotiz } from "@/components/Abschnitt";
import { Figur } from "@/components/Bild";
import { Seitenkopf } from "@/components/Seitenkopf";
import { SmartLink } from "@/components/SmartLink";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [k, t, p] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getPerson()]);
  return seitenMetadaten({ titel: p.seoTitel ?? p.titel, beschreibung: p.seoBeschreibung, pfad: pfade.person, kanzlei: k, texte: t });
}

export default async function PersonSeite() {
  const q = await inhaltsquelle();
  const [k, p, s] = await Promise.all([q.getKanzlei(), q.getPerson(), q.getStartseite()]);
  return (
    <>
      <Seitenkopf titel={p.titel} einleitung={p.einleitung} />
      <Abschnitt trenner={false} rand={<Randnotiz text={p.randnotiz} />}>
        <Figur bild={k.portrait} sizes="(min-width: 64rem) 652px, 100vw" legende={p.bildLegende} prio />
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {p.gruppen.map((g) => (
            <section key={g._key} aria-labelledby={`gruppe-${g._key}`}>
              <h2 id={`gruppe-${g._key}`} className="titel-3">{g.titel}</h2>
              <ul className="mt-3 grid gap-2 border-t border-linie pt-3">
                {g.eintraege.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-12"><SmartLink ziel={s.kontakt.link.ziel} className="knopf knopf-primaer">{s.kontakt.link.text}</SmartLink></p>
      </Abschnitt>
    </>
  );
}
