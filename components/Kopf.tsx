import Link from "next/link";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import type { Kanzlei, Texte } from "@/lib/content/modell";
import { telLink, telefonAnzeige } from "@/lib/assets";
import { Wortmarke } from "./Wortmarke";

/**
 * Kopf über dem Leporello: nur Wortmarke und Telefon. Die Navigation ist das Register des Leporellos (components/Leporello.tsx).
 * Nicht fixiert: nichts verdeckt Überschriften.
 */
export function Kopf({ kanzlei: k, texte: t }: { kanzlei: Kanzlei; texte: Texte }) {
  const telefon = telefonAnzeige(k.telefon);
  return (
    <header className="kopf">
      <div className="behaelter flex min-h-[4.25rem] items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Wortmarke name={k.person} beruf={k.beruf} />
          <span className="sr-only">, {t.kopf.startLabel}</span>
        </Link>
        <a href={telLink(k.telefon)} className="knopf knopf-sekundaer knopf-klein knopf-symbol" aria-label={`${t.kopf.telefonLabel}: ${telefon}`}>
          <PhoneIcon size={20} aria-hidden="true" />
          <span className="hidden sm:inline zahl">{telefon}</span>
        </a>
      </div>
    </header>
  );
}
