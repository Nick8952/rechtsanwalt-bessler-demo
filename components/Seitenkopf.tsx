/** Kopf einer Unterseite: Titel in der Serife, Einleitung als Vorspann. */
export function Seitenkopf({ titel, einleitung, etikett }: { titel: string; einleitung?: string; etikett?: string }) {
  return (
    <div className="behaelter pt-10 @3xl:pt-16">
      {etikett ? <p className="etikett">{etikett}</p> : null}
      <h1 className="titel-1 mt-1 max-w-[22ch]">{titel}</h1>
      {einleitung ? <p className="vorspann mt-5">{einleitung}</p> : null}
    </div>
  );
}
