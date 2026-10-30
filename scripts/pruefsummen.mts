// Prüfsummen der Publikationen: vergleicht data/publikationen/pruefsummen.json mit dem geladenen Stand und schreibt sie auf Wunsch neu.
// Aufruf: npm run pruefsummen                         → Vergleich je Werk (Exit 1 bei Abweichung)
//         npm run pruefsummen -- --schreiben <slug …>  → neue Prüfsumme für die genannten Werke (nur nach Freigabe des Autors!)
//         npm run pruefsummen -- --schreiben           → alle Werke
import { readFileSync, writeFileSync } from "node:fs";
import { lokaleQuelle } from "../lib/content/local";
import { publikationsDigest } from "../lib/content/pruefsummen";
import { blockText } from "../lib/content/text";

const args = process.argv.slice(2);
const schreiben = args.includes("--schreiben");
const nur = new Set(args.filter((a) => !a.startsWith("--")));
const datei = "data/publikationen/pruefsummen.json";
const summen = JSON.parse(readFileSync(datei, "utf8")) as Record<string, { sha256: string; woerter: number; quelle?: string; stand?: string }>;
const publikationen = await lokaleQuelle.getPublikationen();
let abweichungen = 0;
for (const p of publikationen) {
  if (nur.size && !nur.has(p.slug)) continue;
  const ist = publikationsDigest(p);
  const woerter = p.bloecke.map(blockText).join(" ").split(/\s+/).filter(Boolean).length;
  const soll = summen[p.slug]?.sha256;
  if (schreiben) {
    summen[p.slug] = { ...summen[p.slug], sha256: ist, woerter, stand: new Date().toISOString().slice(0, 10) };
    console.log(`✎ ${p.slug}: neue Prüfsumme ${ist.slice(0, 12)}… (${woerter} Wörter)`);
  } else if (ist === soll) console.log(`✓ ${p.slug}: unverändert (${woerter} Wörter)`);
  else { abweichungen++; console.log(`✗ ${p.slug}: weicht ab (ist ${ist.slice(0, 12)}…, hinterlegt ${(soll ?? "keine").slice(0, 12)}…)`); }
}
if (schreiben) { writeFileSync(datei, JSON.stringify(summen, null, 1) + "\n"); console.log(`✓ ${datei} geschrieben. Nur nach Freigabe des Autors committen.`); }
process.exit(abweichungen ? 1 : 0);
