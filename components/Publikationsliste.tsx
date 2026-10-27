import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Publikation, Texte } from "@/lib/content/modell";
import { pfade } from "@/lib/content/pfade";
import { erschienenText } from "@/lib/format";

/** Liste der Publikationen: Art und Jahr als Etikett, Titel in der Serife, Untertitel und Publikationshinweis darunter. */
export function Publikationsliste({ publikationen, texte: t, ausfuehrlich = false, ueberschriftStufe = 3 }: { publikationen: Publikation[]; texte: Texte; ausfuehrlich?: boolean; ueberschriftStufe?: 2 | 3 }) {
  const Tag = ueberschriftStufe === 2 ? "h2" : "h3";
  return (
    <ul className="grid">
      {publikationen.map((p) => {
        const datum = erschienenText(p.erschienen, p.erschienenText);
        return (
          <li key={p.slug} className="border-t border-linie py-6 last:border-b">
            <p className="etikett">{t.publikation.arten[p.art]}{datum ? `, ${datum}` : ""}</p>
            <Tag className="titel-3 mt-1">
              <Link href={pfade.publikation(p.slug)} className="zeile-link inline-flex min-h-11 items-start gap-2 py-1 hover:text-akzent">
                <span>{ausfuehrlich ? p.titel : p.kurztitel}</span>
                <ArrowRightIcon size={20} aria-hidden="true" className="zeile-pfeil mt-1.5 shrink-0" />
              </Link>
            </Tag>
            {ausfuehrlich && p.untertitel ? <p className="lauftext mt-2 text-tinte-2">{p.untertitel}</p> : null}
            {ausfuehrlich && p.quellenvermerk ? <p className="klein mt-2 text-grau">{p.quellenvermerk}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
