import Link from "next/link";
import { ArrowLeftIcon, ArrowUpIcon } from "@phosphor-icons/react/dist/ssr";
import type { Publikation, Texte } from "@/lib/content/modell";
import { pfade } from "@/lib/content/pfade";
import { inhaltsverzeichnis } from "@/lib/content/text";
import { erschienenText } from "@/lib/format";
import { Druckknopf } from "./Druckknopf";
import { Inhaltsverzeichnis } from "./Inhaltsverzeichnis";
import { RichText } from "./RichText";
import { SmartLink } from "./SmartLink";

/**
 * Artikelansicht einer Publikation: Randspalte mit Rückweg, Inhaltsverzeichnis, Angaben zu Autor, Datum und Quelle und Druckknopf;
 * rechts der Text in Lesebreite (66 Zeichen, 18 bis 19 px). Der Wortlaut bleibt unverändert; Hinweise stehen ausserhalb des Textes.
 */
/** Mehrzeiliger Originaltext: Zeilenumbrüche der Quelle als <br>. */
function zeilen(text: string) {
  return text.split("\n").map((z, i) => (i === 0 ? z : [<br key={i} />, z]));
}

export function Artikel({ publikation: p, texte: t }: { publikation: Publikation; texte: Texte }) {
  const toc = inhaltsverzeichnis(p.bloecke);
  const datum = erschienenText(p.erschienen, p.erschienenText);
  return (
    <article className="behaelter pb-16 pt-10 lg:pb-24 lg:pt-14">
      <div className="raster">
        <aside className="rand">
          <div className="rand-kleb grid gap-6">
            <Link href={pfade.publikationen} className="kontakt-link kein-druck">
              <ArrowLeftIcon size={18} aria-hidden="true" />
              {t.publikation.zurueck}
            </Link>
            {toc.length ? <Inhaltsverzeichnis eintraege={toc} titel={t.publikation.inhaltsverzeichnis} /> : null}
            <dl className="klein grid gap-2 text-tinte-2">
              <div><dt className="font-semibold">{t.publikation.autor}</dt><dd>{p.autor}</dd></div>
              <div><dt className="font-semibold">{t.publikation.erschienen}</dt><dd>{datum ?? t.publikation.ohneDatum}</dd></div>
              {p.quellenvermerk ? <div><dt className="font-semibold">{t.ui.quelle}</dt><dd>{p.quellenvermerk}</dd></div> : null}
            </dl>
            <Druckknopf text={t.publikation.drucken} />
          </div>
        </aside>
        <div className="min-w-0" id="artikel">
          <header className="artikel-kopf">
            <p className="etikett">{t.publikation.arten[p.art]}{datum ? `, ${datum}` : ""}</p>
            {/* Titel und Publikationshinweis im Wortlaut der bisherigen Website (Zeilenumbrüche des Originals bleiben) */}
            <h1 className="titel-1 mt-2">{zeilen(p.titelOriginal ?? p.titel)}</h1>
            {p.untertitel ? <p className="vorspann mt-4">{p.untertitel}</p> : null}
            <p className="klein mt-4 text-grau">{p.quellenvermerkOriginal ? zeilen(p.quellenvermerkOriginal) : p.autor}</p>
            <p className="hinweis klein mt-6 kein-druck">{t.publikation.hinweisHistorisch} {t.publikation.wortlaut}</p>
          </header>
          <RichText bloecke={p.bloecke} className="artikel mt-10" />
          <footer className="kein-druck mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-linie pt-6">
            <Link href={pfade.publikationen} className="knopf knopf-sekundaer knopf-klein">{t.publikation.zurueck}</Link>
            <a href="#artikel" className="kontakt-link">
              <ArrowUpIcon size={18} aria-hidden="true" />
              {t.publikation.nachOben}
            </a>
            <SmartLink ziel={p.quelleUrl} className="textlink klein inline-flex min-h-11 items-center">{t.publikation.originalLabel}</SmartLink>
          </footer>
        </div>
      </div>
    </article>
  );
}
