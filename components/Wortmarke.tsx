/** Typografische Wortmarke: Name in der Serife, Beruf klein daneben. Die Kanzlei hat kein Logo; nichts wird erfunden.
 *  Das Leerzeichen zwischen den Spans wird im Flex-Container nicht dargestellt, hält aber den Textinhalt («Michael Bessler Rechtsanwalt») lesbar. */
export function Wortmarke({ name, beruf }: { name: string; beruf: string }) {
  return (
    <span className="wortmarke">
      <span className="wortmarke-name">{name}</span>{" "}
      <span className="wortmarke-beruf">{beruf}</span>
    </span>
  );
}
