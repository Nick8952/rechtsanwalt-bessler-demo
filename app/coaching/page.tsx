import type { Metadata } from "next";
import { Abschnitt, Randnotiz } from "@/components/Abschnitt";
import { Figur } from "@/components/Bild";
import { Seitenkopf } from "@/components/Seitenkopf";
import { SmartLink } from "@/components/SmartLink";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [k, t, s] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getCoachingSeite()]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.coaching, kanzlei: k, texte: t });
}

export default async function CoachingSeite() {
  const q = await inhaltsquelle();
  const [s, start] = await Promise.all([q.getCoachingSeite(), q.getStartseite()]);
  return (
    <>
      <Seitenkopf titel={s.titel} einleitung={s.untertitel} />
      <Abschnitt trenner={false} rand={s.bild ? <Figur bild={s.bild} sizes="(min-width: 64rem) 14rem, 320px" className="max-w-[320px]" /> : <Randnotiz text={s.untertitel} />}>
        <h2 className="titel-3">{s.themenTitel}</h2>
        <ul className="lauftext mt-3 grid gap-1 border-t border-linie pt-3">
          {s.themen.map((th) => <li key={th}>{th}</li>)}
        </ul>
        <div className="lauftext mt-10 grid gap-4">
          {s.absaetze.map((a) => <p key={a}>{a}</p>)}
        </div>
        <p className="klein mt-8 max-w-[62ch] text-tinte-2">{s.ausbildung}</p>
        {s.externLink ? (
          <div className="mt-10 border-t border-linie pt-6">
            {s.externTitel ? <h2 className="titel-4">{s.externTitel}</h2> : null}
            <p className="mt-2">
              {s.externText ? `${s.externText} ` : null}
              <SmartLink ziel={s.externLink.ziel} className="textlink">{s.externLink.text}</SmartLink>
            </p>
          </div>
        ) : null}
        <p className="mt-12"><SmartLink ziel={start.kontakt.link.ziel} className="knopf knopf-primaer">{start.kontakt.link.text}</SmartLink></p>
      </Abschnitt>
    </>
  );
}
