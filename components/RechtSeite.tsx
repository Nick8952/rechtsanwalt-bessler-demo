import { RichText } from "@/components/RichText";
import { Seitenkopf } from "@/components/Seitenkopf";
import { inhaltsquelle } from "@/lib/content";

/** Impressum und Datenschutzerklärung: Fliesstext aus dem Blockmodell; das Impressum zeigt zusätzlich den Bildnachweis. */
export async function RechtSeite({ slug }: { slug: "impressum" | "datenschutz" }) {
  const q = await inhaltsquelle();
  const [seite, t, nachweise] = await Promise.all([q.getRechtSeite(slug), q.getTexte(), slug === "impressum" ? q.getBildnachweise() : Promise.resolve([])]);
  return (
    <>
      <Seitenkopf titel={seite.titel} einleitung={seite.einleitung} />
      <div className="behaelter pb-16 pt-6 @3xl:pb-24">
        <p className="klein text-grau">{t.ui.stand}: {seite.stand}</p>
        <div className="mt-6">
          <RichText bloecke={seite.bloecke} />
        </div>
        {slug === "impressum" ? (
          <div className="richtext mt-6">
            <h2 id="bildnachweis">{t.ui.bildnachweisTitel}</h2>
            <ul>
              {nachweise.map((n) => (
                <li key={n.quelle}><strong>{n.titel}</strong>: {n.urheber}. {t.ui.quelle}: {n.quelle}. {n.lizenz}.</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
}
