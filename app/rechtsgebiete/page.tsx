import type { Metadata } from "next";
import { Abschnitt } from "@/components/Abschnitt";
import { Figur } from "@/components/Bild";
import { Rechtsgebieteliste } from "@/components/Rechtsgebieteliste";
import { Seitenkopf } from "@/components/Seitenkopf";
import { SmartLink } from "@/components/SmartLink";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [k, t, s] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getRechtsgebieteSeite()]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.rechtsgebiete, kanzlei: k, texte: t });
}

export default async function RechtsgebieteSeite() {
  const q = await inhaltsquelle();
  const [s, rechtsgebiete] = await Promise.all([q.getRechtsgebieteSeite(), q.getRechtsgebiete()]);
  return (
    <>
      <Seitenkopf titel={s.titel} einleitung={s.einleitung} />
      <Abschnitt
        trenner={false}
        rand={
          <div>
            <p className="etikett">{s.leistungsformenTitel}</p>
            <ul className="randnotiz randnotiz-liste">{s.leistungsformen.map((l) => <li key={l}>{l}</li>)}</ul>
          </div>
        }
      >
        <Rechtsgebieteliste rechtsgebiete={rechtsgebiete} ueberschriftStufe={2} />
        <div className="mt-12 grid items-start gap-8 md:grid-cols-2">
          <div>
            <h2 className="titel-3">{s.kontaktTitel}</h2>
            <p className="lauftext mt-3 text-tinte-2">{s.kontaktText}</p>
            <SmartLink ziel={s.kontaktLink.ziel} className="knopf knopf-primaer mt-6">{s.kontaktLink.text}</SmartLink>
          </div>
          {s.bild ? <Figur bild={s.bild} sizes="(min-width: 48rem) 40vw, 100vw" /> : null}
        </div>
        <div className="mt-12 border-t border-linie pt-8">
          <h2 className="titel-3">{s.linksTitel}</h2>
          <p className="lauftext mt-3 text-tinte-2">{s.linksText}</p>
          <p className="mt-4"><SmartLink ziel={s.linksLink.ziel} className="textlink">{s.linksLink.text}</SmartLink></p>
        </div>
      </Abschnitt>
    </>
  );
}
