import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";
import { Einwilligung } from "@/components/Einwilligung";
import { Fusszeile } from "@/components/Fusszeile";
import { Kopfzeile } from "@/components/Kopfzeile";
import { inhaltsquelle, pfade } from "@/lib/content";
import { siteUrl } from "@/lib/deploy-ziel";
import { indexierungErlaubt, jsonLdSicher, kanzleiJsonLd } from "@/lib/seo";

// Schriften lokal aus den fontsource-Paketen (SIL Open Font License); keine Anfragen an fremde Server.
// Newsreader aufrecht («standard») trägt Gewicht und optische Grösse (opsz) für die Titel. Die Kursive steht nur in Randnotizen und
// Zitaten bei 18 bis 20 px, wo die optische Grösse nicht ins Gewicht fällt: dafür die «wght»-Datei (64 statt 147 KB). Hanken Grotesk: Gewicht.
const schriftSerif = localFont({
  src: [
    { path: "../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-standard-normal.woff2", style: "normal" },
    { path: "../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "200 800",
  variable: "--schrift-serif",
  display: "swap",
});
const schriftSans = localFont({
  src: [
    { path: "../node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2", style: "normal" },
    { path: "../node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "100 900",
  variable: "--schrift-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const q = await inhaltsquelle();
  const [k, t] = await Promise.all([q.getKanzlei(), q.getTexte()]);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: k.name, template: `%s | ${t.seo.titelZusatz}` },
    description: t.seo.beschreibung,
    robots: indexierungErlaubt ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f7f6f2" }, { media: "(prefers-color-scheme: dark)", color: "#151614" }] };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const q = await inhaltsquelle();
  const [k, t, rechtsgebiete] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getRechtsgebiete()]);
  return (
    <html lang="de-CH" className={`${schriftSerif.variable} ${schriftSans.variable}`}>
      <body>
        <a href="#inhalt" className="nur-sr fixed left-4 top-4 z-50 bg-knopf px-4 py-3 font-semibold text-knopf-text focus:not-sr-only focus:[clip:auto] focus:[height:auto] focus:[width:auto] focus:[position:fixed] focus:[white-space:normal] focus:[margin:0] focus:[overflow:visible]">
          {t.ui.zumInhalt}
        </a>
        {!indexierungErlaubt && t.demoHinweis ? <p className="demo-hinweis klein border-b border-linie bg-flaeche-2 px-4 py-1.5 text-center text-tinte-2">{t.demoHinweis}</p> : null}
        <Kopfzeile kanzlei={k} texte={t} />
        <main id="inhalt" tabIndex={-1} className="w-full max-w-full overflow-x-hidden outline-none">
          {children}
        </main>
        <Fusszeile kanzlei={k} texte={t} zeigeDemoHinweis={!indexierungErlaubt} />
        <Einwilligung texte={t.einwilligung} datenschutzPfad={pfade.datenschutz} schliessen={t.kopf.schliessen} />
        {indexierungErlaubt ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSicher(kanzleiJsonLd(k, rechtsgebiete)) }} /> : null}
      </body>
    </html>
  );
}
