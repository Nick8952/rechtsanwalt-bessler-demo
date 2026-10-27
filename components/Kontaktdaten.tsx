import { EnvelopeSimpleIcon, MapPinIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import type { Kanzlei, Texte } from "@/lib/content/modell";
import { telLink, telefonAnzeige } from "@/lib/assets";
import { SmartLink } from "./SmartLink";

/** Adresse, Telefon und E-Mail als Definitionsliste; «zeile» = drei Spalten nebeneinander, «block» = untereinander (Randspalte). */
export function Kontaktdaten({ kanzlei: k, texte: t, variante = "zeile", mitKarte = false }: { kanzlei: Kanzlei; texte: Texte; variante?: "zeile" | "block"; mitKarte?: boolean }) {
  return (
    <dl className={variante === "zeile" ? "kontaktzeile" : "kontaktblock"}>
      <div>
        <dt>{t.ui.adresse}</dt>
        <dd>
          <address className="not-italic">
            {k.person}, {k.beruf}<br />
            {k.adresse.strasse}{k.adresse.zusatz ? `, ${k.adresse.zusatz}` : ""}<br />
            {k.adresse.plz} {k.adresse.ort}
          </address>
          {mitKarte ? (
            <SmartLink ziel={k.karteUrl} className="kontakt-link klein">
              <MapPinIcon size={18} aria-hidden="true" />
              {t.ui.karte}
            </SmartLink>
          ) : null}
        </dd>
      </div>
      <div>
        <dt>{t.ui.telefon}</dt>
        <dd>
          <a href={telLink(k.telefon)} className="kontakt-link zahl">
            <PhoneIcon size={20} aria-hidden="true" />
            {telefonAnzeige(k.telefon)}
          </a>
        </dd>
      </div>
      <div>
        <dt>{t.ui.email}</dt>
        <dd>
          <a href={`mailto:${k.email}`} className={`kontakt-link ${variante === "block" ? "klein" : ""}`} style={{ overflowWrap: "anywhere" }}>
            <EnvelopeSimpleIcon size={20} aria-hidden="true" />
            {k.email}
          </a>
        </dd>
      </div>
    </dl>
  );
}
