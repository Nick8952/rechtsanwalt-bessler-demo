import type { Metadata } from "next";
import { Abschnitt, Randnotiz } from "@/components/Abschnitt";
import { Figur } from "@/components/Bild";
import { Kontaktdaten } from "@/components/Kontaktdaten";
import { Publikationsliste } from "@/components/Publikationsliste";
import { Rechtsgebieteliste } from "@/components/Rechtsgebieteliste";
import { SmartLink } from "@/components/SmartLink";
import { inhaltsquelle } from "@/lib/content";
import { seitenMetadaten } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [k, t, s] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getStartseite()]);
  return seitenMetadaten({ titel: s.seoTitel ?? s.hero.titel, beschreibung: s.seoBeschreibung, pfad: "/", kanzlei: k, texte: t, istStart: true });
}

export default async function Startseite() {
  const q = await inhaltsquelle();
  const [k, t, s, rechtsgebiete, rgSeite, person, publikationen] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getStartseite(), q.getRechtsgebiete(), q.getRechtsgebieteSeite(), q.getPerson(), q.getPublikationen()]);
  return (
    <>
      {/* Einstieg: Name, Beruf, Standort, die drei Gebiete, zwei Wege weiter; rechts das Portrait in Originalgrösse */}
      <section className="abschnitt" aria-labelledby="einstieg-titel">
        <div className="behaelter hero-raster">
          <div>
            <p className="etikett">{s.hero.ueberzeile}</p>
            <h1 id="einstieg-titel" className="titel-1 mt-3">{s.hero.titel}</h1>
            <p className="vorspann mt-5">{s.hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SmartLink ziel={s.hero.knopf.ziel} className="knopf knopf-primaer">{s.hero.knopf.text}</SmartLink>
              <SmartLink ziel={s.hero.zweiterKnopf.ziel} className="knopf knopf-sekundaer">{s.hero.zweiterKnopf.text}</SmartLink>
            </div>
          </div>
          <Figur bild={k.portrait} sizes="(min-width: 64rem) 40vw, 100vw" prio />
        </div>
      </section>

      {/* Kontaktleiste: Adresse, Telefon, E-Mail sofort bedienbar */}
      <Abschnitt knapp rand={<h2 className="etikett">{t.footer.kontaktTitel}</h2>}>
        <Kontaktdaten kanzlei={k} texte={t} variante="zeile" mitKarte />
      </Abschnitt>

      {/* Einleitung: die vier Fragen der bisherigen Website und die Antwort */}
      <Abschnitt rand={<Randnotiz text={s.einleitung.randnotiz} />} labelledBy="einleitung-titel">
        <h2 id="einleitung-titel" className="nur-sr">Einleitung</h2>
        <div className="leitfragen">
          {s.einleitung.fragen.map((f) => <p key={f}>{f}</p>)}
        </div>
        <p className="lauftext mt-8 text-tinte-2">{s.einleitung.antwort}</p>
      </Abschnitt>

      {/* Rechtsgebiete als Register, am Rand die vier Leistungsformen */}
      <Abschnitt rand={<div><p className="etikett">{s.rechtsgebiete.randnotizTitel}</p><Randnotiz zeilen={rgSeite.leistungsformen} /></div>} labelledBy="rechtsgebiete-titel">
        <h2 id="rechtsgebiete-titel" className="titel-2">{s.rechtsgebiete.titel}</h2>
        <p className="lauftext mt-4 text-tinte-2">{s.rechtsgebiete.text}</p>
        <div className="mt-8">
          <Rechtsgebieteliste rechtsgebiete={rechtsgebiete} />
        </div>
        <p className="mt-6"><SmartLink ziel={s.rechtsgebiete.link.ziel} className="textlink inline-flex min-h-11 items-center">{s.rechtsgebiete.link.text}</SmartLink></p>
      </Abschnitt>

      {/* Person: Text, am Rand das Gemälde der bisherigen Startseite */}
      <Abschnitt rand={s.person.bild ? <Figur bild={s.person.bild} sizes="(min-width: 64rem) 14rem, 320px" className="max-w-[320px]" /> : <Randnotiz text={person.randnotiz} />} labelledBy="person-titel">
        <h2 id="person-titel" className="titel-2">{s.person.titel}</h2>
        <div className="lauftext mt-4 grid gap-4">
          <p>{s.person.text}</p>
          <p>{s.person.zweiterText}</p>
        </div>
        <p className="mt-6"><SmartLink ziel={s.person.link.ziel} className="textlink inline-flex min-h-11 items-center">{s.person.link.text}</SmartLink></p>
      </Abschnitt>

      {/* Coaching: eigener Einstieg */}
      <Abschnitt rand={<Randnotiz text={s.coaching.untertitel} />} labelledBy="coaching-titel">
        <h2 id="coaching-titel" className="titel-2">{s.coaching.titel}</h2>
        <p className="lauftext mt-4">{s.coaching.text}</p>
        <p className="mt-6"><SmartLink ziel={s.coaching.link.ziel} className="textlink inline-flex min-h-11 items-center">{s.coaching.link.text}</SmartLink></p>
      </Abschnitt>

      {/* Publikationen: dezenter Hinweis mit Liste */}
      <Abschnitt rand={<Randnotiz text={s.publikationen.randnotiz} />} labelledBy="publikationen-titel">
        <h2 id="publikationen-titel" className="titel-2">{s.publikationen.titel}</h2>
        <p className="lauftext mt-4 text-tinte-2">{s.publikationen.text}</p>
        <div className="mt-8">
          <Publikationsliste publikationen={publikationen} texte={t} />
        </div>
        <p className="mt-6"><SmartLink ziel={s.publikationen.link.ziel} className="textlink inline-flex min-h-11 items-center">{s.publikationen.link.text}</SmartLink></p>
      </Abschnitt>

      {/* Kontakt und Anfahrt */}
      <Abschnitt rand={<Randnotiz text={s.kontakt.anfahrt} />} labelledBy="kontakt-titel">
        <h2 id="kontakt-titel" className="titel-2">{s.kontakt.titel}</h2>
        <p className="lauftext mt-4 text-tinte-2">{s.kontakt.text}</p>
        <div className="mt-8">
          <Kontaktdaten kanzlei={k} texte={t} variante="zeile" mitKarte />
        </div>
        <p className="mt-8"><SmartLink ziel={s.kontakt.link.ziel} className="knopf knopf-primaer">{s.kontakt.link.text}</SmartLink></p>
      </Abschnitt>
    </>
  );
}
