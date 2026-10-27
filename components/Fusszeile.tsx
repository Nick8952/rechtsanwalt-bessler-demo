import Link from "next/link";
import type { Kanzlei, Texte } from "@/lib/content/modell";
import { telLink, telefonAnzeige } from "@/lib/assets";
import { EinwilligungFussLink } from "./Einwilligung";
import { SmartLink } from "./SmartLink";

/** Fusszeile: Kanzleiangaben, Seiten, Rechtliches. Kein Linkfeld mit vier Spalten, nur die Wege, die es gibt. */
export function Fusszeile({ kanzlei: k, texte: t, zeigeDemoHinweis }: { kanzlei: Kanzlei; texte: Texte; zeigeDemoHinweis: boolean }) {
  return (
    <footer className="fuss border-t border-linie">
      <div className="behaelter py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="wortmarke-name">{k.person}</p>
            <p className="klein mt-2 max-w-[36ch] text-tinte-2">{t.footer.leitsatz}</p>
            <address className="mt-5 grid gap-1 not-italic">
              <span>{k.adresse.strasse}{k.adresse.zusatz ? `, ${k.adresse.zusatz}` : ""}</span>
              <span>{k.adresse.plz} {k.adresse.ort}</span>
              <a href={telLink(k.telefon)} className="kontakt-link zahl">{telefonAnzeige(k.telefon)}</a>
              <a href={`mailto:${k.email}`} className="kontakt-link">{k.email}</a>
            </address>
            <p className="mt-3">
              <SmartLink ziel={k.karteUrl} className="textlink">{t.footer.route}</SmartLink>
            </p>
          </div>
          <nav aria-label="Seiten (Fusszeile)">
            <h2 className="titel-4">{t.footer.seitenTitel}</h2>
            <ul className="mt-3 grid gap-1">
              <li><Link href="/" className="inline-flex min-h-11 items-center hover:text-akzent">Startseite</Link></li>
              {[...t.navigation, ...t.footer.weitere].map((n) => (
                <li key={n.ziel}><Link href={n.ziel} className="inline-flex min-h-11 items-center hover:text-akzent">{n.text}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="titel-4">{t.footer.rechtlichesTitel}</h2>
            <ul className="mt-3 grid gap-1">
              {t.footer.rechtliches.map((n) => (
                <li key={n.ziel}><Link href={n.ziel} className="inline-flex min-h-11 items-center hover:text-akzent">{n.text}</Link></li>
              ))}
              <li><EinwilligungFussLink titel={t.einwilligung.fussLink} /></li>
              <li><SmartLink ziel={t.footer.bildnachweis.ziel} className="inline-flex min-h-11 items-center hover:text-akzent">{t.footer.bildnachweis.text}</SmartLink></li>
            </ul>
          </div>
        </div>
        <div className="klein mt-10 grid gap-2 border-t border-linie pt-5 text-grau">
          <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
          {zeigeDemoHinweis ? <p className="max-w-[80ch]">{t.footer.demoHinweis}</p> : null}
        </div>
      </div>
    </footer>
  );
}
