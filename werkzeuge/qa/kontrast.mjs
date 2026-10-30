// Kontraste der Farbtoken (WCAG 2.1, relative Leuchtdichte) für das helle und das dunkle Schema.
// Liest app/globals.css: den @theme-Block (hell) und den Block unter prefers-color-scheme: dark.
// Aufruf: node werkzeuge/qa/kontrast.mjs    → Tabelle; Exit 1, wenn ein Textpaar unter 4.5:1 oder ein Flächenpaar unter 3:1 liegt.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
process.chdir(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));
const css = readFileSync("app/globals.css", "utf8");
const tokens = (block) => Object.fromEntries([...block.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2].toLowerCase()]));
const hell = tokens(css.match(/@theme\s*{([\s\S]*?)\n}/)[1]);
const dunkel = { ...hell, ...tokens(css.match(/@media \(prefers-color-scheme: dark\)\s*{\s*:root[^{]*{([\s\S]*?)}/)[1]) };
const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const kontrast = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
// [Vordergrund, Hintergrund, Verwendung, Mindestwert]
const paare = [
  ["tinte", "papier", "Lauftext auf Papier", 4.5], ["tinte", "flaeche", "Lauftext auf Fläche (Formularfelder)", 4.5], ["tinte", "flaeche-2", "Text auf Fläche 2 (Hinweise)", 4.5],
  ["tinte-2", "papier", "Zweittext, Randnotizen, Legenden", 4.5], ["grau", "papier", "Meta-Angaben (Datum, Überzeile)", 4.5],
  ["akzent", "papier", "Links, aktive Navigation, Akzenttext", 4.5], ["akzent-tief", "papier", "Links im Hover", 4.5], ["akzent", "akzent-hell", "Text auf Akzentfläche", 4.5],
  ["knopf-text", "knopf", "Primärer Knopf", 4.5], ["fehler", "papier", "Fehlermeldungen", 4.5], ["fehler", "flaeche", "Fehlermeldung auf Fläche", 4.5],
  ["linie-stark", "papier", "Rahmen von Feldern und Knöpfen (nicht Text)", 3], ["akzent", "papier", "Fokusring (nicht Text)", 3],
];
let fehler = 0;
for (const [name, t] of [["hell", hell], ["dunkel", dunkel]]) {
  console.log(`\n${name.toUpperCase()}`);
  for (const [vg, hg, zweck, min] of paare) {
    const k = kontrast(t[vg], t[hg]); const ok = k >= min; if (!ok) fehler++;
    console.log(`${ok ? "✓" : "✗"} ${k.toFixed(2).padStart(5)}:1  ${vg} (${t[vg]}) auf ${hg} (${t[hg]})  ${zweck} (min ${min}:1)`);
  }
}
console.log(fehler ? `\n${fehler} Paare unter dem Mindestwert` : "\nAlle Paare erfüllen die Mindestwerte.");
process.exit(fehler ? 1 : 0);
