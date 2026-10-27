import Link from "next/link";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import type { Kanzlei, Texte } from "@/lib/content/modell";
import { telLink, telefonAnzeige } from "@/lib/assets";
import { Menue } from "./Menue";
import { NavLink } from "./NavLink";
import { Wortmarke } from "./Wortmarke";

/** Kopfzeile: Wortmarke, Navigation auf einer Zeile (ab 64 rem), Telefon, Menü-Knopf auf kleinen Bildschirmen. Nicht fixiert: nichts verdeckt Überschriften. */
export function Kopfzeile({ kanzlei: k, texte: t }: { kanzlei: Kanzlei; texte: Texte }) {
  const telefon = telefonAnzeige(k.telefon);
  return (
    <header className="kopf">
      <div className="behaelter flex min-h-[4.25rem] items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Wortmarke name={k.person} beruf={k.beruf} />
          <span className="sr-only">, {t.kopf.startLabel}</span>
        </Link>
        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {t.navigation.map((n) => (
              <li key={n.ziel}>
                <NavLink ziel={n.ziel} className="navlink">{n.text}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a href={telLink(k.telefon)} className="knopf knopf-sekundaer knopf-klein knopf-symbol" aria-label={`${t.kopf.telefonLabel}: ${telefon}`}>
            <PhoneIcon size={20} aria-hidden="true" />
            <span className="hidden sm:inline zahl">{telefon}</span>
          </a>
          <Menue texte={t.kopf} navigation={t.navigation} weitere={t.footer.weitere} telefon={k.telefon} telefonAnzeige={telefon} email={k.email} />
        </div>
      </div>
    </header>
  );
}
