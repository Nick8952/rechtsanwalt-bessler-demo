import type { ReactNode } from "react";

/**
 * Abschnitt mit Randspalte: links die Randnotiz (oder ein anderes schmales Element), rechts der Inhalt.
 * Unter 64 rem steht die Randspalte über dem Inhalt. Mit `trenner` beginnt der Abschnitt mit einer Linie über die Breite des Behälters.
 */
export function Abschnitt({ id, rand, children, trenner = true, knapp = false, labelledBy }: { id?: string; rand?: ReactNode; children: ReactNode; trenner?: boolean; knapp?: boolean; labelledBy?: string }) {
  return (
    <section id={id} className={knapp ? "abschnitt-knapp" : "abschnitt"} aria-labelledby={labelledBy}>
      <div className="behaelter">
        <div className={`raster ${trenner ? "trenner pt-8 @3xl:pt-10" : ""}`.trim()}>
          <aside className="rand">{rand}</aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Randnotiz: ein Satz oder mehrere Zeilen in der kursiven Serife. */
export function Randnotiz({ zeilen, text }: { zeilen?: string[]; text?: string }) {
  if (zeilen) return <ul className="randnotiz randnotiz-liste">{zeilen.map((z) => <li key={z}>{z}</li>)}</ul>;
  return <p className="randnotiz">{text}</p>;
}
