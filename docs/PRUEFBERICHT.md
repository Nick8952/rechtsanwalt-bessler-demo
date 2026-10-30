# Prüfbericht

Stand: 30. Oktober 2026. Alle Zahlen stammen aus tatsächlich ausgeführten Läufen; die Werkzeuge liegen im Repository (`scripts/`,
`werkzeuge/qa/`), die Rohergebnisse im nicht versionierten Ordner `pruefung/`. Was nicht geprüft werden konnte, steht in Abschnitt 11.

## 1. Build und statische Prüfungen (lokal, 27. und 30. Oktober 2026)

| Prüfung | Befehl | Ergebnis |
| --- | --- | --- |
| Inhalte (Schema, Schreibweise, Sperrliste, Links, Sprungmarken, Bilder, Publikations-Prüfsummen, Quellen) | `npm run inhalt:pruefen` | ✓ 484 Texte, 36 Links, 5 Bilder, 3 Publikationen (20'647 Wörter, Prüfsummen stimmen), 16 Belege |
| Lint, Typen | `npm run lint`, `npm run typecheck` | ✓ keine Fehler |
| Kontraste der Farbtoken, hell und dunkel | `node werkzeuge/qa/kontrast.mjs` | ✓ 26 Paare, alle über 4.5:1 (Text) beziehungsweise 3:1 (Rahmen); Tabelle in Abschnitt 5 |
| Weiterleitungen gegen vercel.json | `npm run weiterleitungen` | ✓ 10 alte Adressen, beide Listen gleich |
| Statischer Export | `npm run build` | ✓ 13 Seiten + 404 + 10 Weiterleitungsseiten; `.nojekyll`; Sitemap entfernt (Demo) |
| Export-Prüfung | `npm run export:pruefen` | ✓ 25 HTML-Dateien, 670 interne Verweise unter dem Unterpfad, noindex überall, keine Sitemap, kein JSON-LD; Budgets: vorgeladenes Bild 0/59 KB, JavaScript je Seite höchstens 591/625 KB (unkomprimiert; auf GitHub Pages gzip, siehe Abschnitt 6), alle Bildvarianten 191 KB |
| Import nach Sanity, Trockenlauf | `npm run seed -- --probe` | ✓ 17 Dokumente gebaut, zurückgelesen und feldgenau mit den lokalen Inhalten verglichen (auch Portable Text der Publikationen) |
| Studio | `cd studio && npm run typecheck && npm run schema:pruefen` | ✓ 0 Fehler, 0 Warnungen (`sanity schema validate`) |
| Go-Live-Probe | `INDEXIERUNG=1 SITE_URL=https://www.example.com npm run build:vercel` | ✓ Build, Sitemap und JSON-LD mit Testdomain; Leitplanken brechen bei `INDEXIERUNG=1` ohne `SITE_URL`, bei Vorschau-Adressen und bei fehlenden Freigaben ab |
| CI | `.github/workflows/pages.yml` | ✓ zwei Läufe grün (27.10.2026, je rund 3.5 Minuten): Prüfungen, Trockenlauf, Build, Export-Prüfung, Browser-QA, Studio-Prüfung, Veröffentlichung |

## 2. Wortlaut der Publikationen

- Übernahme aus dem alten HTML mit einem Konverter (Schriftklassen des Editors: Unterstreichung = Zwischentitel, Kursiv = Zitat,
  Aufzählungen; Kodierung Windows-1252). Wort-für-Wort-Vergleich gegen die Originalseiten am 27.10.2026: **0 Abweichungen** je Text
  (Rezension 4'464 Wörter, Seminararbeit 16'003, Thesen 251). Der Konverter war ein einmaliges Skript ausserhalb des Repositorys
  und liegt nicht mehr vor; massgebend ist der versiegelte Stand.
- Versiegelung: `data/publikationen/pruefsummen.json` (SHA-256 über Titel, Publikationshinweis, Untertitel und alle Blöcke).
  `npm run inhalt:pruefen` berechnet die Prüfsumme bei jedem Build neu und bricht bei jeder Abweichung ab; das gilt auch für Inhalte
  aus Sanity.
- Darstellung: 38 Zwischentitel der Seminararbeit mit Sprungmarken, 116 Blockzitate, Literaturverzeichnis als eigene Liste; Titel
  und Publikationshinweis im Wortlaut (`titelOriginal`, `quellenvermerkOriginal`).

## 3. Browser-Prüfungen (puppeteer-core, Chrome 142, `werkzeuge/qa/`)

Hinweis: Die Abschnitte 3 bis 7 und 12 beschreiben den Stand vor dem Umbau zum Leporello (30. Oktober 2026, nachmittags); die
Prüfungen des neuen Aufbaus stehen in Abschnitt 13.

Gegen den lokalen Vorschau-Server (`npm run vorschau:pages`, Port 4333) und gegen die Live-Adresse auf GitHub Pages; vor und nach
dem Fix vom 27.10.2026 (Abschnitt 7).

**Audit** (`audit.mjs`): 13 Seiten × 4 Breiten (360, 390, 768, 1440), jeweils hell und dunkel = 52 Prüfungen je Lauf. Je Seite:
kein horizontales Scrollen, kein Element über den Rand, alle Links/Knöpfe/Felder ≥ 44 × 44 px (Ausnahme: Links im Fliesstext),
Bilder mit `alt` und `width`/`height`, genau eine h1, keine Überschriftensprünge, keine Anfragen an fremde Hosts, keine fehlgeschlagenen
Anfragen, keine Konsolenfehler, kein Storage, keine Cookies, Sprunglink und `main#inhalt`, kein Text unter 13 px, Artikel ≥ 18 px mit
Zeilenhöhe ≥ 1.6 und ≤ 70 em Breite, `noindex`, `lang="de-CH"`.
Ergebnis: **52/52 ohne Befund** (hell), **52/52** (dunkel), lokal und live.

**Funktionen** (`funktionen.mjs`): **92/92** lokal und live. Gruppen:

| Gruppe | Prüfungen | Inhalt |
| --- | --- | --- |
| Erstbesuch, Demo | 1 bis 11 | keine fremden Hosts, kein Banner, kein Storage, Entwurfshinweis, noindex, kein JSON-LD, keine Iframes, robots.txt ohne Sperre und ohne Sitemap, Datenschutz-Hinweis (Escape schliesst) |
| Kontakt, Links | 12 bis 18 | tel:/mailto: auf Start- und Kontaktseite, Karte nur als externer Link, kein Formular mit `action`, 8 externe Links https + noopener, tote Ziele ausgeblendet |
| Tastatur, Navigation | 19 bis 25 | Sprunglink erster Tab und sichtbar, Fokus auf `main`, Fokusring ≥ 2 px, Fokusreihenfolge, `aria-current` |
| Mobil (360 × 740) | 26 bis 45 | Menüknopf und Telefon-Symbol ≥ 44 px, Dialog mit Fokusfalle (30 × Tab), Escape mit Fokusrückgabe, Navigation schliesst das Menü, 12 Seiten ohne horizontales Scrollen, Titel und «Kontakt aufnehmen» im ersten Bildschirm |
| Artikel | 46 bis 58 | 38 Zwischentitel mit Sprungmarken, Inhaltsverzeichnis vollständig, 116 Zitate, Lesemass 19 px / 1.72 / 37 em, Sprung landet sichtbar, `aria-current` im Inhaltsverzeichnis, Rückwege, Druckansicht ohne Kopf/Fuss/Randspalte, mobil eingeklapptes Inhaltsverzeichnis, je Publikation eine h1 mit Autor und Hinweis «historischer Text» |
| Formular | 59 bis 67 | Knopf «E-Mail vorbereiten», Hinweis «kein Mandat», sichtbare Beschriftungen, kein Upload, Fehlermeldungen mit Fokus, mailto mit kodierten Sonderzeichen an mail@rechtsanwaltbessler.ch (im Browser abgefangen, nichts gesendet), Hinweis statt Erfolgsmeldung, keine Anfragen |
| Alte Adressen, Fehlerseite, Direktaufrufe | 68 bis 90 | 10 Weiterleitungen, 404 mit gestalteter Seite, 12 Seiten direkt aufgerufen und neu geladen |
| Bewegung, Schema | 91, 92 | keine Scrollführung bei reduzierter Bewegung, dunkles Schema |

**Screenshots** (`screenshots.mjs`): alle Seiten in 390 und 1440 px, hell und dunkel, gesichtet. Daraus behoben: automatische
Silbentrennung im Titel («Migra-tionsrecht» → `hyphens: manual`), E-Mail-Adresse brach in der Randspalte mitten im Wort (Randspalte auf
15 rem, Adresse kleiner), Zeilenumbrüche mitten im Satz in den Publikationen (Artefakte des alten Editors, im Konverter behoben und
neu geprüft: 0 Wortabweichungen).

## 4. Mobiler Prüfbericht (Zusammenfassung für den Auftrag)

| Breite | Geprüft | Ergebnis |
| --- | --- | --- |
| 360 px | Audit aller 13 Seiten hell/dunkel; Funktionsprüfungen 26 bis 45 und 54 bis 55 (Menü, Fokus, erster Bildschirm, Artikel) | ohne Befund; vor dem Fix: Kopfzeile lief unter 400 px über (Wortmarke + Telefon + Menü) → Wortmarke gestapelt, Menüknopf kompakt |
| 390 px | Audit; Screenshots aller Seiten gesichtet (Startseite, Artikel, Kontakt, Formular) | ohne Befund; Artikel 19 px, Inhaltsverzeichnis als aufklappbares `details` über dem Text |
| 768 px | Audit aller Seiten hell/dunkel | ohne Befund; einspaltig, Randspalte noch nicht aktiv (ab 64 rem) |
| 1440 px | Audit, Screenshots, Lighthouse Desktop | ohne Befund; Randspalte 15 rem, Inhaltsverzeichnis klebt in der Randspalte |

Touch-Ziele: alle interaktiven Elemente ≥ 44 × 44 px (Inhaltsverzeichnis-Links waren 33 px → `min-height: 2.75rem`; Publikationslinks
auf der Startseite 27 px → `min-h-11`; Fusszeilen-Link im Artikel → `inline-flex min-h-11`). Keine fixierte Kopfzeile, deshalb werden
keine Überschriften verdeckt (Prüfung 50). Tel- und Mail-Links funktionieren als `tel:`/`mailto:` (Prüfungen 12, 14, 27, 64).
Vergrösserte Schrift: Masse in `rem`, Umbrüche ohne feste Höhen; der Audit prüft Überlauf bei 360 px, eine Prüfung mit 200 %
Browserzoom auf echten Geräten steht aus (Abschnitt 11).

## 5. Kontraste (gerechnet nach WCAG 2.1, `werkzeuge/qa/kontrast.mjs`)

| Paar (hell) | Verhältnis | Paar (dunkel) | Verhältnis |
| --- | --- | --- | --- |
| Lauftext `#1b1c1a` auf Papier `#f7f6f2` | 15.82:1 | `#ecebe4` auf `#151614` | 15.19:1 |
| Zweittext, Randnotizen `#4b4d47` auf Papier | 7.92:1 | `#c2c1b9` auf `#151614` | 10.05:1 |
| Meta-Angaben `#676961` auf Papier | 5.15:1 | `#a3a29a` auf `#151614` | 7.08:1 |
| Links, Akzent `#1f5c47` auf Papier | 7.25:1 | `#8ccfb0` auf `#151614` | 10.09:1 |
| Primärer Knopf `#f7f6f2` auf `#1f5c47` | 7.25:1 | `#f7f6f2` auf `#2d7a5f` | 4.78:1 |
| Fehlermeldung `#a3261b` auf Papier | 6.81:1 | `#f09a8f` auf `#151614` | 8.41:1 |
| Feldrahmen `#8c887b` auf Papier (nicht Text, min 3:1) | 3.28:1 | `#6d7067` auf `#151614` | 3.60:1 |

Alle 26 Paare erfüllen AA; der Lauf gehört zu `npm run pruefen` und damit zur CI.

## 6. Lighthouse (Chrome headless, `werkzeuge/qa/lighthouse.mjs`, Lighthouse 13.6)

Vier Seiten, Desktop und Mobil (simuliertes langsames 4G, vierfach gedrosselte CPU). SEO liegt in der Demo absichtlich bei 63 bis 66:
Lighthouse wertet `noindex` als «nicht auffindbar» (`is-crawlable`); mit `INDEXIERUNG=1` entfällt das.

**Live, 27.10.2026, vor dem Fix** (GitHub Pages, gzip):

| Seite | Desktop (Leistung / Barrierefreiheit / Best Practices / SEO) | Mobil | LCP mobil |
| --- | --- | --- | --- |
| `/` | 100 / 100 / 100 / 66 | 92 / 100 / 100 / 66 | 3.4 s |
| `/rechtsgebiete/` | 100 / 100 / 100 / 66 | 100 / 100 / 100 / 66 | 1.0 s |
| `/publikationen/der-mann-ohne-eigenschaften/` | 100 / 100 / 100 / 63 | 100 / 100 / 100 / 63 | 1.5 s |
| `/kontakt/` | 100 / 100 / 100 / 63 | 100 / 100 / 100 / 63 | 0.9 s |

Befund neben `is-crawlable`: `label-content-name-mismatch` auf allen Seiten (Wortmarke mit `aria-label`, das den sichtbaren Text
nicht enthielt; WCAG 2.5.3). Barrierefreiheit zählte trotzdem 100, weil Lighthouse die Regel nicht gewichtet. Behoben (Abschnitt 7).
Mobiler LCP der Startseite: das Portrait konkurriert mit vier vorgeladenen Schriftdateien (342 KB) um die simulierte Bandbreite.
Die lokale Messung ohne Kompression (Vorschau-Server) ist deshalb pessimistischer (mobil 77 bis 79) und nicht massgebend.

## 7. Fix vom 27.10.2026 (Commit 4be9f3d)

- Wortmarke ohne `aria-label`; «, zur Startseite» als `sr-only`-Zusatz im Link; Leerzeichen zwischen Name und Beruf im Textinhalt.
- Kursive Newsreader als `wght`-Datei (64 statt 147 KB); der aufrechte Schnitt behält die optische Grösse für die Titel.
- Nach dem Fix lokal: Audit 52/52 hell und dunkel, Funktionen 92/92, Lighthouse Desktop ohne `label-content-name-mismatch`.

## 8. Codex-Architekturprüfung (27. Oktober 2026, `codex exec --sandbox read-only`)

Acht Befunde, alle umgesetzt (Details in `docs/ENTSCHEIDUNGEN.md`, Punkte 16 und 17):

| Nr. | Schwere | Befund | Umsetzung |
| --- | --- | --- | --- |
| 1 | hoch | Publikationstitel und Quellenvermerk nicht im Wortlaut gerendert | `titelOriginal`/`quellenvermerkOriginal` in `components/Artikel.tsx` |
| 2 | hoch | Wortlautprüfung verglich die Datei mit sich selbst | Prüfsummen in `data/publikationen/pruefsummen.json`, Abgleich in jedem Build |
| 3 | hoch | Vercel-Build ohne Inhalts- und Exportprüfung; Invarianten nur für `texte` | `build:kern` für beide Ziele, Invarianten für alle Seiten |
| 4 | mittel | Interne Linkziele mit `/\` möglich | Regel in Modell, `lib/assets.ts` und Studio |
| 5 | mittel | Keine Sperre für Öffnungszeiten, Rechtsgebiete unbegrenzt | Muster ergänzt, drei Slugs erzwungen |
| 6 | mittel | Doppelte Slugs aus Sanity unbemerkt | `eindeutig()` in `lib/content/sanity.ts` |
| 7 | mittel | Inhaltsverzeichnis-Links 33 px hoch | `min-height: 2.75rem` |
| 8 | niedrig | URL-Felder nur per `startsWith` geprüft | echte URL-Prüfung (`httpsUrl`) |

## 9. Codex-Abschlussprüfung (30. Oktober 2026)

Prompt mit zehn konkreten Prüfaufträgen (Export und Unterpfad, Inhaltsschicht, Publikationen, Behauptungen, Rechtstexte, Sicherheit,
Barrierefreiheit, Weiterleitungen und SEO-Leitplanken, Skripte und CI, Dokumentation gegen Code). Codex las den Code mit Shell-Werkzeugen,
führte ESLint, die TypeScript-Prüfungen von Website und Studio sowie die Kontrastprüfung aus (alle fehlerfrei) und meldete
**13 Befunde: 0 hoch, 9 mittel, 4 niedrig**. Alle umgesetzt:

| Nr. | Schwere | Befund | Umsetzung |
| --- | --- | --- | --- |
| 1 | mittel | Prüfsumme sicherte nur den normalisierten Klartext (Titelstufe, Listenstil, Auszeichnung, Links ungesichert); keine manipulationssichere Signatur | kanonische Form in `lib/content/text.ts` (`kanonisch`) und `lib/content/pruefsummen.ts`; Prüfsummen neu geschrieben (`npm run pruefsummen -- --schreiben`); als Integritätsprüfung dokumentiert |
| 2 | mittel | Sanity-Bilder ohne Alternativtext oder Bildnachweis passierten den Build | `alt` und `nachweis` im Domainmodell Pflicht (gilt für beide Quellen) |
| 3 | mittel | https-Prüfung nicht überall (Herkunftsadressen `z.url()`, Linkregeln ohne Host-Prüfung, `SITE_URL` ohne Passwortprüfung) | `istHttpsAdresse` in `lib/assets.ts` für Modell, Linkregel und Studio; `httpsUrl` für Herkunftsadressen; `u.password` in `lib/deploy-ziel.ts` |
| 4 | mittel | Go-Live-Sperre erkannte Demo-Rechtstexte nur an einzelnen Wörtern | Merkmale erweitert (Demo, Verkaufs-Demo, GitHub Pages, GitHub Inc., Betreibername, E-Mail, «ohne Auftrag»), auch in der Einleitung; als Heuristik dokumentiert |
| 5 | mittel | Sperrliste liess Umgehungen zu (kostenfrei, Gebühr, Tarif, Euro, immer erreichbar, 7 Tage, erstklassig, Kollegium) | Muster erweitert; Selbsttest mit 11 Positiv- und 7 Negativbeispielen läuft bei jedem `inhalt:pruefen` |
| 6 | mittel | Unbekannte Felder wurden still entfernt (`z.object`) | alle 39 Objekte `z.strictObject`; Sanity-Systemfelder entfernt `normalisieren()`; Listen-Kennungen heissen jetzt `kennung` (eigenes Feld in Modell, Daten, GROQ, Studio, Seed) |
| 7 | mittel | Links verloren Fett/Kursiv | `components/RichText.tsx` |
| 8 | mittel | Reduzierte Bewegung liess Übergänge aktiv | globale Regel in `app/globals.css`; Prüfung 92 misst `transition-duration` auf Knöpfen, Links, Navigation und Aufklappern |
| 9 | mittel | Alleinstehende Textlinks auf der Startseite unter 44 px; Audit nahm alle Absatz-Links aus | sechs Links `inline-flex min-h-11`; Audit nimmt nur Links im laufenden Satz aus |
| 10 | niedrig | Wiederholte Importe luden Bilder erneut hoch (verwaiste Assets) | `scripts/seed.mts`: ohne neue Dokumente kein Upload; vorhandene Assets per Dateiname wiederverwendet |
| 11 | niedrig | Bildbudget ignorierte JPEG | JPEG/PNG im Budget (`jpgMax` 150 KB), Gesamtsumme jetzt 226 KB |
| 12 | niedrig | «keine Fotos Dritter» im Impressum zu absolut | Satz präzisiert (Portrait von der bisherigen Website, Rechte offen) |
| 13 | niedrig | Dokumentation: falsche Mitgliedschaftsliste, falscher Feldname, Icon-Schrift | `docs/UEBERGABE.md`, `docs/BILDER.md` korrigiert |

Dazu, nicht von Codex gefordert: Sicherheits-Header in `vercel.json` (nosniff, `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy).
Codex konnte `npm run pruefen` und den Seed-Trockenlauf im Read-only-Sandkasten nicht starten (tsx braucht ein beschreibbares
Temp-Verzeichnis); beide liefen danach hier: Trockenlauf 17 Dokumente mit Parität, `npm run pruefen` grün. Ein erstes Ergebnis dieser
Abschlussprüfung ging verloren, weil das Sitzungs-Scratchpad zwischen zwei Sitzungen geleert wurde; die Prüfung wurde wiederholt und
liegt in `pruefung/codex-abschluss.md`.

## 10. Hinweis zu den Rechtsquellen

Die Datenschutzerklärung nennt Art. 19 und 25 DSG (Informationspflicht, Auskunftsrecht) und den EDÖB als Aufsichtsbehörde. Bei der
Recherche am 27.10.2026 lieferte die Websuche nur Sekundärquellen (Kanzleiseiten, Ratgeber) zu DSG Art. 19 und zur Impressumspflicht nach
UWG Art. 3 Abs. 1 lit. s; der Wortlaut auf fedlex.admin.ch wurde nicht direkt geladen. Die Rechtstexte sind deshalb ausdrücklich ohne
anwaltliche Prüfung erstellt und vom Anwalt freizugeben (`docs/UEBERGABE.md`, Frage 6).

## 11. Nicht durchführbar oder nicht geprüft

- Screenreader (VoiceOver, NVDA) und Vergrösserung auf echten Geräten; Zoom 200 % nur über die 360-px-Breite angenähert.
- Druckausgabe nur über die Druck-Stilregeln und die Prüfung 53 (Kopf, Fuss, Randspalte ausgeblendet); kein PDF-Druck geprüft.
- Vercel-Build, Sanity-Import und Webhook: ohne Projekte nur als Trockenlauf und Go-Live-Probe mit Testdomain (Abschnitt 1).
- Mobiler LCP der Startseite unter simuliertem langsamem 4G: 3.0 s nach dem Fix (Ziel 2.5 s). Übrige Seiten 0.9 bis 1.5 s.
- Browser-Prüfungen am 30.10.2026: Nach einem Chrome-Update auf 156.0.8078.79 und bei hoher Systemlast (Load 37) brach puppeteer-core
  25.16 sporadisch mit «Navigating frame was detached» ab, lokal wie live, auch mit der passenden Chrome-for-Testing-Fassung 156.0.8078.47.
  Das ist kein Befund der Website. Audit und Funktionsprüfung wiederholen abgebrochene Navigationen seither bis zu dreimal in frischer
  Umgebung; die Ergebnisse in Abschnitt 12 stammen aus Läufen nach dieser Änderung.

## 12. Stand nach der Codex-Abschlussprüfung (30. Oktober 2026, Commits ce336e5 und dcaa33d)

**CI auf GitHub Actions (ubuntu, sauberer Runner, Lauf 41051245, grün):**

| Schritt | Ergebnis |
| --- | --- |
| `npm run pruefen` | ✓ 484 Texte, 36 Links, 5 Bilder, 3 Publikationen (20'647 Wörter, neue kanonische Prüfsummen), 16 Belege; Sperrlisten-Selbsttest; Lint, Typen; Kontraste «Alle Paare erfüllen die Mindestwerte» |
| `npm run seed -- --probe` | ✓ 17 Dokumente mit Parität (strikte Schemas, Feld `kennung`) |
| `npm run build` + `export:pruefen` | ✓ 25 HTML-Dateien, 670 Verweise, noindex, keine Sitemap, kein JSON-LD; Bildvarianten 226 KB (jetzt inklusive OG-JPEG) |
| `npm run qa` (Audit + Funktionen, Chrome des Runners) | ✓ **52/52** (13 Seiten × 4 Breiten), **93/93** (neu: Prüfung 92 «keine Übergänge unter reduzierter Bewegung»); keine Wiederholung nötig |
| Studio | ✓ Typen, `sanity schema validate` 0 Fehler, 0 Warnungen |
| Deploy | ✓ GitHub Pages aktualisiert |

**Live (HTTP-Stichproben nach dem Deploy):** sechs alleinstehende Textlinks mit 44 px Höhe auf der Startseite, Screenreader-Zusatz der
Wortmarke, präzisierter Impressumssatz, Sprungmarken aus `kennung` auf der Linkseite, Weiterleitung `/konktakt.html` → `/kontakt/`,
404 für unbekannte Adressen, `robots.txt` ohne Sperre, keine `sitemap.xml`, 40 Zwischentitel mit `id` im Artikel.

**Live nach dem letzten Deploy (30.10.2026, 13:37 bis 13:52, Commit 251993c, Chrome for Testing 156.0.8078.47, Load 14 → 7):**
Funktionen **93/93**, Audit **52/52** hell und **52/52** dunkel, keine Wiederholung nötig. Lighthouse:

| Seite | Desktop (Leistung / Barrierefreiheit / Best Practices / SEO) | Mobil | LCP mobil |
| --- | --- | --- | --- |
| `/` | 100 / 100 / 100 / 66 | **95** / 100 / 100 / 66 | 3.0 s |
| `/rechtsgebiete/` | 100 / 100 / 100 / 66 | 100 / 100 / 100 / 66 | 0.9 s |
| `/publikationen/der-mann-ohne-eigenschaften/` | 100 / 100 / 100 / 63 | 100 / 100 / 100 / 63 | 1.5 s |
| `/kontakt/` | 100 / 100 / 100 / 63 | 100 / 100 / 100 / 63 | 0.9 s |

Einziger nicht bestandener Lighthouse-Punkt ist `is-crawlable` (gewollt: Demo ist `noindex`). `label-content-name-mismatch` ist weg.
Der mobile LCP der Startseite (simuliertes langsames 4G) liegt mit 3.0 s über dem Ziel von 2.5 s: Das Portrait teilt sich die
simulierte Bandbreite mit den vorgeladenen Schriften (jetzt 259 KB statt 342 KB). Weitere Hebel wären eine kleinere aufrechte
Newsreader-Datei ohne optische Grösse (minus 74 KB, Preis: Titelzeichnung) oder kein Vorladen der Schriften (Preis: sichtbarer
Schriftwechsel); beides bewusst nicht umgesetzt.

**Lokal auf dem belasteten Rechner (Load über 30):** Audit 360 px bis zur Artikelseite ohne Befund, danach Puppeteer-Abbruch
(Abschnitt 11); massgebend sind die CI-Läufe und die Live-Läufe oben.

## 13. Aufbau «Leporello» (30. Oktober 2026, nachmittags)

Auf Nicks Wunsch nach einem nie verwendeten Aufbau wurde die Website zum Faltblatt (`docs/DESIGN.md`, Abschnitt «Aufbau Leporello»;
`docs/ENTSCHEIDUNGEN.md`, Punkt 18). Kopfzeile mit horizontaler Navigation und Menü-Dialog sind entfernt; das Register ist die Navigation.

**Codex-Zweitmeinung zum Leporello** (read-only, 8 Befunde: 1 hoch, 5 mittel, 2 niedrig), alle umgesetzt:

| Nr. | Schwere | Befund | Umsetzung |
| --- | --- | --- | --- |
| 1 | hoch | Streifen der aktiven Seite war ausgeblendet: Fokusreihenfolge auf der Startseite ohne «Start», visuelle Sprünge | Streifen der aktiven Seite bleibt als Rücken direkt links vom Blatt sichtbar und fokussierbar; Fokusstrategie (Sprunglink, Kopf, alle Streifen, Blatt) dokumentiert |
| 2 | mittel | `aria-current` damit nicht im Accessibility-Tree | durch 1 behoben; Prüfung «Landmarke Navigation «Seiten» im Accessibility-Tree» ergänzt |
| 3 | mittel, unsicher | `display: contents` auf `<nav>` browserabhängig | Landmarke wird per Accessibility-Snapshot geprüft (Chrome); in `docs/DESIGN.md` festgehalten; echte Screenreader-Prüfung offen (Abschnitt 11) |
| 4 | mittel | Modell erlaubte 1 bis 6 Einträge, Reiter-Hairlines setzten sechs voraus | Hairlines als Schatten je Zelle (zählunabhängig); Modell 2 bis 6 Einträge, Beschriftung ≤ 18 Zeichen; Invarianten: «/» zuerst, keine doppelten Ziele; Tests zählen 2 bis 6 |
| 5 | mittel | Am 64-rem-Wechsel klappte das Blatt kurz auf eine Spalte zurück | Umschaltpunkt 70 rem (Blatt beim Auffalten ≥ 49 rem), Einstieg zweispaltig erst ab 56 rem Blattbreite; Audit prüft zusätzlich 1119 und 1120 px |
| 6 | mittel | Tests deckten Start, Kontakt, Druck des Registers und Landmarken nicht ab | Prüfungen für Start (Fokusreihenfolge), Kontakt (Blatt rechts aussen), Impressum (ausserhalb des Registers), Druck (Register aus, Blatt als Block), Landmarke ergänzt |
| 7 | niedrig | lange Registertitel könnten überlaufen | Modell ≤ 18 Zeichen, Streifen `overflow: hidden` |
| 8 | niedrig | Texte nannten noch das Menü (404, Studio, Matrix, Prüfbericht, Skills) | 404-Text, Studio-Feldtitel, Inhaltsmatrix, Skill-Bericht angepasst; Prüfbericht mit Hinweis in Abschnitt 3 und diesem Abschnitt |

**Lokale Prüfungen nach dem Umbau** (Chrome for Testing 156.0.8078.47, Load 2 bis 4):

| Prüfung | Ergebnis |
| --- | --- |
| `npm run pruefen` | ✓ 484 Texte, 37 Links (neu: «Start» im Register), Kontraste |
| `npm run build`, `export:pruefen` | ✓ 25 HTML, 568 interne Verweise, JavaScript ≤ 581/625 KB |
| `npm run seed -- --probe`, Studio | ✓ 17 Dokumente mit Parität; Schema 0 Fehler |
| Audit (jetzt 6 Breiten: 360, 390, 768, 1119, 1120, 1440) | ✓ **78/78** hell, **78/78** dunkel; Befund «Start»-Link in der Fusszeile 37 px breit → `min-w-11` |
| Funktionen (jetzt 95) | ✓ **95/95**: Register-Reiter auf 360 px (sechs Reiter ≥ 44 px, aktueller markiert, Reiter navigiert), Leporello-Geometrie bei 1440 (Rücken links vom Blatt, Streifen 56 px breit, bildschirmhoch, klebend nach 1500 px), Start und Kontakt als aktive Seite, Impressum ausserhalb des Registers, Landmarke «Seiten», Fokusreihenfolge, Druckansicht ohne Register |
| Screenshots | 390, 768, 1120, 1440 px hell und 1440 dunkel gesichtet; behoben: Streifenbeschriftung oben beginnend, E-Mail-Spalte der Kontaktzeile breiter, Einstieg bei 1120 px einspaltig (Titel brach mitten im Wort) |

**CI (GitHub Actions, Lauf für Commit 5d8d58a, grün):** Prüfungen, Trockenlauf, Build, Export-Prüfung, Audit **78/78**, Funktionen **95/95**
(Chrome des Runners, keine Wiederholung nötig), Studio, Deploy.

**Live nach dem Deploy (30.10.2026, 14:23 bis 14:33, Load 2 bis 3):** Funktionen **95/95**, Audit **78/78** hell und **78/78** dunkel. Lighthouse:

| Seite | Desktop (Leistung / Barrierefreiheit / Best Practices / SEO) | Mobil | LCP mobil |
| --- | --- | --- | --- |
| `/` | 100 / 100 / 100 / 66 | **100** / 100 / 100 / 66 | 0.9 s |
| `/rechtsgebiete/` | 100 / 100 / 100 / 66 | 100 / 100 / 100 / 66 | 0.9 s |
| `/publikationen/der-mann-ohne-eigenschaften/` | 100 / 100 / 100 / 63 | 100 / 100 / 100 / 63 | 1.5 s |
| `/kontakt/` | 100 / 100 / 100 / 63 | 100 / 100 / 100 / 63 | 0.9 s |

Der mobile LCP der Startseite fiel von 3.0 s auf 0.9 s: Mit dem Register über dem Inhalt ist auf dem Handy der Titel das grösste
Element im ersten Bildschirm, nicht mehr das Portrait. Einziger nicht bestandener Punkt bleibt `is-crawlable` (gewollt, `noindex`).
