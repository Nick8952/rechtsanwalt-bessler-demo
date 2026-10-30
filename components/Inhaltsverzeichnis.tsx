"use client";

import { useEffect, useState } from "react";

type Eintrag = { stufe: 2 | 3 | 4; text: string; anker: string };

/**
 * Inhaltsverzeichnis einer Publikation aus den tatsächlichen Zwischentiteln. Auf dem Handy aufklappbar über dem Text,
 * am Bildschirm in der Randspalte (klebend, mit eigenem Scrollbereich). Der aktuelle Abschnitt wird über IntersectionObserver
 * markiert (kein Scroll-Listener); ohne JavaScript bleiben es gewöhnliche Sprunglinks.
 */
export function Inhaltsverzeichnis({ eintraege, titel }: { eintraege: Eintrag[]; titel: string }) {
  const [aktiv, setAktiv] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const ziele = eintraege.map((e) => document.getElementById(e.anker)).filter((el): el is HTMLElement => el !== null);
    if (!ziele.length) return;
    // Aktiv ist die Überschrift, die zuletzt in das obere Fünftel des Fensters eingetreten ist.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setAktiv(e.target.id);
      },
      { rootMargin: "0px 0px -78% 0px", threshold: 0 },
    );
    ziele.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, [eintraege]);

  const liste = (
    <ul className="inhalt-liste">
      {eintraege.map((e) => (
        <li key={e.anker} className={`stufe-${e.stufe}`}>
          <a href={`#${e.anker}`} aria-current={aktiv === e.anker ? "true" : undefined}>{e.text}</a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <details className="inhalt-mobil border-y border-linie py-1 @3xl:hidden">
        <summary>{titel}</summary>
        <nav aria-label={titel} className="mb-2 mt-1">{liste}</nav>
      </details>
      <nav aria-label={titel} className="hidden @3xl:block">
        <p className="titel-4">{titel}</p>
        <div className="inhalt-scroll mt-2">{liste}</div>
      </nav>
    </>
  );
}
