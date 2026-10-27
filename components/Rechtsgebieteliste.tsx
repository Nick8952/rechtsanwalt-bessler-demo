import type { Rechtsgebiet } from "@/lib/content/modell";

/** Register: eine Zeile je Rechtsgebiet, Titel in der Serife links, Leistungssatz und belegte Bezüge rechts. Keine Kacheln. */
export function Rechtsgebieteliste({ rechtsgebiete, ueberschriftStufe = 3 }: { rechtsgebiete: Rechtsgebiet[]; ueberschriftStufe?: 2 | 3 }) {
  const Tag = ueberschriftStufe === 2 ? "h2" : "h3";
  return (
    <ul className="grid">
      {rechtsgebiete.map((r) => (
        <li key={r.slug} id={`gebiet-${r.slug}`} className="register-zeile">
          <Tag className="titel-3">{r.titel}</Tag>
          <div className="grid gap-2">
            <p className="lauftext">{r.kurz}</p>
            {r.bezuege.length ? (
              <ul className="klein grid gap-1 text-tinte-2">
                {r.bezuege.map((b) => <li key={b}>{b}</li>)}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
