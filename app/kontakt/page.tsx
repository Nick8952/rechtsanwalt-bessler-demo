import type { Metadata } from "next";
import { Abschnitt } from "@/components/Abschnitt";
import { Anfrageformular } from "@/components/Anfrageformular";
import { Kontaktdaten } from "@/components/Kontaktdaten";
import { Seitenkopf } from "@/components/Seitenkopf";
import { inhaltsquelle, pfade } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [k, t, s] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getKontaktSeite()]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.titel, beschreibung: s.seoBeschreibung, pfad: pfade.kontakt, kanzlei: k, texte: t });
}

export default async function KontaktSeite() {
  const q = await inhaltsquelle();
  const [k, t, s] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getKontaktSeite()]);
  return (
    <>
      <Seitenkopf titel={s.titel} einleitung={s.einleitung} />
      <Abschnitt
        trenner={false}
        rand={
          <div className="rand-kleb">
            <h2 className="etikett mb-4">{s.direktTitel}</h2>
            <Kontaktdaten kanzlei={k} texte={t} variante="block" mitKarte />
          </div>
        }
      >
        <div className="grid gap-10">
          <section aria-labelledby="lage-titel">
            <h2 id="lage-titel" className="titel-3">{s.lageTitel}</h2>
            <div className="lauftext mt-3 grid gap-3">{s.lage.map((a) => <p key={a}>{a}</p>)}</div>
          </section>
          <section aria-labelledby="oev-titel">
            <h2 id="oev-titel" className="titel-3">{s.oevTitel}</h2>
            <div className="lauftext mt-3 grid gap-3">{s.oev.map((a) => <p key={a}>{a}</p>)}</div>
          </section>
          <section aria-labelledby="hinweis-titel" className="hinweis">
            <h2 id="hinweis-titel" className="titel-4">{s.hinweisTitel}</h2>
            <p className="klein mt-2">{s.hinweis}</p>
          </section>
          <div className="border-t border-linie pt-10">
            <Anfrageformular texte={t.formular} empfaenger={k.email} />
          </div>
        </div>
      </Abschnitt>
    </>
  );
}
