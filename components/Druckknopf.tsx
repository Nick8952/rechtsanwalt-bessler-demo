"use client";

import { PrinterIcon } from "@phosphor-icons/react";

/** Öffnet den Druckdialog des Browsers; die Druckansicht ist in app/globals.css (@media print) definiert. */
export function Druckknopf({ text }: { text: string }) {
  return (
    <button type="button" className="knopf knopf-sekundaer knopf-klein kein-druck justify-self-start" onClick={() => window.print()}>
      <PrinterIcon size={18} aria-hidden="true" />
      {text}
    </button>
  );
}
