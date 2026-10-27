import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Artikel } from "@/components/Artikel";
import { inhaltsquelle, pfade } from "@/lib/content";
import { indexierungErlaubt, jsonLdSicher, publikationJsonLd, seitenMetadaten } from "@/lib/seo";

/** Alle Publikationen werden beim Build erzeugt; unbekannte Adressen führen auf die Fehlerseite. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const q = await inhaltsquelle();
  return (await q.getPublikationen()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const q = await inhaltsquelle();
  const [k, t, p] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getPublikation(slug)]);
  if (!p) return {};
  const beschreibung = p.seoBeschreibung ?? `${t.publikation.arten[p.art]} von ${p.autor}: ${p.titel}${p.quellenvermerk ? `. ${p.quellenvermerk}` : ""}`.slice(0, 165);
  return seitenMetadaten({ titel: p.seoTitel ?? p.kurztitel, beschreibung, pfad: pfade.publikation(p.slug), kanzlei: k, texte: t, artikel: true });
}

export default async function PublikationSeite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const q = await inhaltsquelle();
  const [k, t, p] = await Promise.all([q.getKanzlei(), q.getTexte(), q.getPublikation(slug)]);
  if (!p) notFound();
  return (
    <>
      <Artikel publikation={p} texte={t} />
      {indexierungErlaubt ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSicher(publikationJsonLd(p, k)) }} /> : null}
    </>
  );
}
