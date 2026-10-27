import type { Metadata } from "next";
import Link from "next/link";
import { SmartLink } from "@/components/SmartLink";
import { inhaltsquelle } from "@/lib/content";

export const metadata: Metadata = { title: "Seite nicht gefunden", robots: { index: false, follow: false } };

/** Fehlerseite: GitHub Pages liefert sie als 404.html aus (scripts/export-nachbereiten.mjs). */
export default async function NichtGefunden() {
  const q = await inhaltsquelle();
  const t = await q.getTexte();
  return (
    <div className="behaelter py-16 lg:py-24">
      <div className="raster">
        <aside className="rand"><p className="randnotiz">404</p></aside>
        <div>
          <h1 className="titel-1">{t.ui.nichtGefundenTitel}</h1>
          <p className="vorspann mt-5">{t.ui.nichtGefundenText}</p>
          <SmartLink ziel={t.ui.nichtGefundenLink.ziel} className="knopf knopf-primaer mt-8">{t.ui.nichtGefundenLink.text}</SmartLink>
          <ul className="mt-10 grid gap-1 border-t border-linie pt-4">
            {t.navigation.map((n) => <li key={n.ziel}><Link href={n.ziel} className="inline-flex min-h-11 items-center textlink">{n.text}</Link></li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
