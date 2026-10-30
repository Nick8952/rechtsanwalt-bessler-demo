import type { Block, Inline } from "@/lib/content/modell";
import { SmartLink } from "./SmartLink";

/** Inline-Text mit Zeilenumbrüchen des Originals (einfaches «\n» → <br>). */
function Teile({ teile }: { teile: Inline[] }) {
  const mitUmbruechen = (text: string, key: string) => {
    const zeilen = text.split("\n");
    return zeilen.map((z, i) => (i === 0 ? z : [<br key={`${key}-${i}`} />, z]));
  };
  return (
    <>
      {teile.map((t, i) => {
        if (typeof t === "string") return mitUmbruechen(t, String(i));
        const inhalt = mitUmbruechen(t.text, String(i));
        if (t.link) {
          const innen = t.fett && t.kursiv ? <strong><em>{inhalt}</em></strong> : t.fett ? <strong>{inhalt}</strong> : t.kursiv ? <em>{inhalt}</em> : inhalt;
          return <SmartLink key={i} ziel={t.link}>{innen}</SmartLink>;
        }
        if (t.fett && t.kursiv) return <strong key={i}><em>{inhalt}</em></strong>;
        if (t.fett) return <strong key={i}>{inhalt}</strong>;
        if (t.kursiv) return <em key={i}>{inhalt}</em>;
        return inhalt;
      })}
    </>
  );
}

/** Fliesstext aus dem Blockmodell: Absätze, Zwischentitel mit Sprungmarke, Blockzitate, Aufzählungen und Literaturlisten. */
export function RichText({ bloecke, className = "richtext" }: { bloecke: Block[]; className?: string }) {
  return (
    <div className={className}>
      {bloecke.map((b, i) => {
        if (b.art === "titel") {
          const Tag = b.stufe === 4 ? "h4" : b.stufe === 3 ? "h3" : "h2";
          return <Tag key={i} id={b.anker}>{b.text}</Tag>;
        }
        if (b.art === "liste") return <ul key={i} className={b.stil === "literatur" ? "literatur" : undefined}>{b.punkte.map((p, j) => <li key={j}><Teile teile={p} /></li>)}</ul>;
        if (b.art === "zitat") return <blockquote key={i}><p><Teile teile={b.inhalt} /></p></blockquote>;
        return <p key={i}><Teile teile={b.inhalt} /></p>;
      })}
    </div>
  );
}
