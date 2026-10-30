import { createHash } from "node:crypto";
import type { Publikation } from "./modell";
import { kanonisch } from "./text";

/**
 * SHA-256 einer Publikation über Titel, Publikationshinweis, Untertitel (jeweils normalisiert) und die kanonische Form der Blöcke.
 * Wird von scripts/inhalt-pruefen.mts (Vergleich mit data/publikationen/pruefsummen.json) und scripts/pruefsummen.mts (neu schreiben) benutzt.
 */
export function publikationsDigest(p: Pick<Publikation, "titelOriginal" | "quellenvermerkOriginal" | "untertitel" | "bloecke">): string {
  const norm = (s: string) => s.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  const kopf = [p.titelOriginal ?? "", p.quellenvermerkOriginal ?? "", p.untertitel ?? ""].map(norm).join("\n");
  return createHash("sha256").update(`${kopf}\n---\n${kanonisch(p.bloecke)}`).digest("hex");
}
