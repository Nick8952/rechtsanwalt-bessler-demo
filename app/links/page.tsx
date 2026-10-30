import type { Metadata } from "next";
import { Abschnitt } from "@/components/Abschnitt";
import { Seitenkopf } from "@/components/Seitenkopf";
import { SmartLink } from "@/components/SmartLink";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [k, t, s] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getLinkSeite()]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.links, kanzlei: k, texte: t });
}

export default async function LinksSeite() {
  const q = await inhaltsquelle();
  const s = await q.getLinkSeite();
  // Nur erreichbare Ziele erscheinen; nicht erreichbare bleiben in den Daten dokumentiert (docs/UEBERGABE.md).
  const gruppen = s.gruppen.map((g) => ({ ...g, links: g.links.filter((l) => l.erreichbar) })).filter((g) => g.links.length);
  return (
    <>
      <Seitenkopf titel={s.titel} einleitung={s.einleitung} />
      <Abschnitt
        trenner={false}
        rand={
          <nav aria-label="Gruppen" className="rand-kleb">
            <ul className="grid gap-1">
              {gruppen.map((g) => <li key={g.kennung}><a href={`#links-${g.kennung}`} className="textlink inline-flex min-h-11 items-center">{g.titel}</a></li>)}
            </ul>
          </nav>
        }
      >
        <div className="grid gap-10">
          {gruppen.map((g) => (
            <section key={g.kennung} id={`links-${g.kennung}`} aria-labelledby={`links-${g.kennung}-titel`} className="scroll-mt-6">
              <h2 id={`links-${g.kennung}-titel`} className="titel-3">{g.titel}</h2>
              <ul className="mt-3 grid">
                {g.links.map((l) => (
                  <li key={l.kennung} className="border-t border-linie py-3 last:border-b">
                    <SmartLink ziel={l.url} className="textlink inline-flex min-h-11 items-center">{l.titel}</SmartLink>
                    {l.beschreibung ? <p className="klein mt-1 text-tinte-2">{l.beschreibung}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Abschnitt>
    </>
  );
}
