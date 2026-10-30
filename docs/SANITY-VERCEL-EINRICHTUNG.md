# Sanity und Vercel einrichten

Diese Anleitung ist für den Tag, an dem Rechtsanwalt Michael Bessler die Website übernehmen will. **Bis dahin ist nichts davon nötig:**
Die Demo auf GitHub Pages läuft ohne Sanity, ohne Vercel und ohne Zugangsdaten. Es existiert noch kein Sanity-Projekt und kein Vercel-Projekt.

Zeitbedarf: etwa 45 Minuten. Du brauchst ein Sanity-Konto, ein Vercel-Konto und das GitHub-Repository.

## So hängt es zusammen

```text
Anwalt bearbeitet Texte im Sanity Studio  ──►  Sanity (Inhalte)
   (<name>.sanity.studio)                          │  «Veröffentlichen»
                                                   ▼
                                           Webhook von Sanity
                                                   │
                                                   ▼
                                      Deploy-Hook von Vercel  ──►  neuer Build (1 bis 3 Minuten)
                                                                        │  liest die Inhalte aus Sanity, prüft sie
                                                                        ▼
                                                            statische Website ist aktualisiert
```

Die Website bleibt ein statischer Export. Es gibt keinen Server, der Inhalte «live» nachlädt. Auch die Bilder kommen nicht vom
Sanity-CDN: Jeder Build lädt sie einmal herunter, erzeugt AVIF und WebP und liefert sie mit der Website aus (`scripts/sanity-bilder.mts`).
Besucherinnen und Besucher lösen also weiterhin keine Anfrage an Dritte aus. **Eine Änderung ist deshalb nicht sofort sichtbar, sondern
nach dem nächsten Build.** Dem Anwalt sagt man das so: «Veröffentlichen, zwei Minuten warten, neu laden.» Solange der Webhook
(Schritt 6) nicht eingerichtet ist, löst eine Veröffentlichung gar nichts aus; dann muss man in Vercel von Hand neu bauen.

Jeder Build prüft die Inhalte (`npm run inhalt:pruefen` läuft in `build:kern`): unbelegte Behauptungen, veränderte Publikationstexte
(Prüfsummen), tote interne Links oder «ß» brechen den Build ab. Die Meldung nennt Feld und Grund.

## 1. Sanity-Projekt anlegen

1. Auf <https://www.sanity.io/manage> anmelden, **Create new project**. Name zum Beispiel «Rechtsanwalt Bessler», Dataset `production`,
   Sichtbarkeit **Public** (die Inhalte stehen ohnehin auf der Website; so braucht der Build kein Lese-Token).
2. Die **Projekt-ID** notieren (acht Zeichen, steht oben auf der Projektseite). Sie ist nicht geheim.
3. Ein eigenes Projekt anlegen. Kein bestehendes Projekt einer anderen Demo wiederverwenden.

## 2. Studio starten und veröffentlichen

```bash
cd studio
cp .env.example .env          # SANITY_STUDIO_PROJECT_ID=<Projekt-ID> eintragen
npm install
npx sanity login              # einmalig, öffnet den Browser
npm run dev                   # Studio lokal: http://localhost:3333
npm run deploy                # Studio bei Sanity hosten; Namen wählen, zum Beispiel «rechtsanwalt-bessler»
```

Danach ist das Studio unter `https://rechtsanwalt-bessler.sanity.studio` erreichbar. Diese Adresse bekommt der Anwalt.
Redaktorinnen und Redaktoren lädst du auf sanity.io/manage unter **Members** mit der Rolle **Editor** ein; sie melden sich mit
E-Mail an und brauchen kein GitHub-Konto.

## 3. Inhalte importieren

Der Import überträgt den Stand der Demo (Kanzleiangaben, Texte, Lebenslauf, drei Rechtsgebiete, Coaching, drei Publikationen mit
Zwischentiteln und Zitaten, Links, Rechtstexte, Bilder) nach Sanity.

```bash
# im Projektstamm
npm run seed -- --probe       # Trockenlauf: prüft alles, schreibt nichts, braucht keinen Zugang
```

Für den echten Import auf sanity.io/manage unter **API → Tokens** ein Token mit der Berechtigung **Editor** anlegen und **nur lokal**
in `.env.local` eintragen (die Datei wird nicht committet):

```bash
SANITY_PROJECT_ID=<Projekt-ID>
SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=<Token>
```

```bash
set -a; source .env.local; set +a
npm run seed                  # legt fehlende Dokumente an, bestehende bleiben unangetastet; Bilder nur, wenn Dokumente fehlen (vorhandene Assets werden wiederverwendet)
# npm run seed -- --force     # überschreibt bestehende Dokumente mit dem lokalen Stand (Vorsicht nach Redaktionsarbeit)
```

Danach das Token in Sanity **wieder löschen** und die Zeile aus `.env.local` entfernen. Im Studio prüfen, ob alles da ist.

## 4. Lokal mit Sanity bauen

```bash
CONTENT_SOURCE=sanity SANITY_PROJECT_ID=<Projekt-ID> SANITY_DATASET=production npm run build:vercel
```

Der Befehl prüft die Inhalte, spiegelt die Bilder (`✓ … Bilder aus Sanity gespiegelt`), baut und prüft den Export.
Bricht der Build ab, nennt die Meldung das Dokument und das Feld, das fehlt oder ungültig ist (zum Beispiel
«Sanity: Publikationen – 1.inhalt: Mindestens ein Block» oder «Publikation … Wortlaut weicht von der Originalfassung ab»).
Im Studio korrigieren, veröffentlichen, erneut bauen. Anschliessend für die Demo wieder `npm run build` ausführen.

## 5. Vercel-Projekt anlegen

1. Auf <https://vercel.com/new> das GitHub-Repository `Nick8952/rechtsanwalt-bessler-demo` importieren. Framework: Next.js (wird erkannt).
   Den Build-Befehl gibt `vercel.json` vor (`npm run build:vercel`); nichts überschreiben. `vercel.json` enthält auch die
   308-Weiterleitungen der alten Adressen (`/konktakt.html` → `/kontakt/` usw.).
2. Unter **Settings → Environment Variables** für *Production* (und *Preview*) eintragen:

   | Variable | Wert |
   | --- | --- |
   | `CONTENT_SOURCE` | `sanity` |
   | `SANITY_PROJECT_ID` | Projekt-ID |
   | `SANITY_DATASET` | `production` |
   | `SITE_URL` | zunächst leer lassen (Standard `https://rechtsanwalt-bessler-demo.vercel.app`), später die Kanzleidomain |
   | `INDEXIERUNG` | leer lassen, bis zum Go-Live |

   `DEPLOY_TARGET` setzt der Build-Befehl selbst. **Kein Token eintragen**, solange das Dataset öffentlich ist. Eine leere `SITE_URL`
   ist erlaubt; ein falscher Wert bricht den Build mit einer klaren Meldung ab.
3. **Deploy** auslösen und die Vercel-Adresse prüfen: Startseite, eine Publikation direkt aufrufen, neu laden, eine alte Adresse
   (`/konktakt.html` muss mit 308 auf `/kontakt/` führen), eine falsche Adresse (404).

Hinweis aus früheren Projekten: Vercel liefert die Build-Ausgabe von Next aus, nicht den Ordner `out/`. Alles, was nur in `out/`
nachbereitet wird (404.html, .nojekyll, Sitemap entfernen), fehlt dort; die Website braucht es auf Vercel nicht. Der anonyme Testmodus
`vercel deploy --temporary` liefert bei statischen Exporten 404; immer den Import über das Dashboard verwenden. Ohne Sanity-Variablen
baut Vercel die Demo mit den lokalen Inhalten (ebenfalls gültig).

## 6. Veröffentlichen löst einen Build aus

1. In Vercel unter **Settings → Git → Deploy Hooks** einen Hook anlegen (Name «Sanity», Branch `main`). Die Adresse kopieren.
   Sie wirkt wie ein Passwort: nicht ins Repository, nicht in Chats.
2. Auf sanity.io/manage unter **API → Webhooks** einen Webhook anlegen:
   - URL: die Adresse des Deploy-Hooks
   - Dataset: `production`
   - Trigger on: **Create, Update, Delete**
   - Filter: leer lassen (alle Dokumente) oder `!(_id in path("drafts.**"))`
   - HTTP method: **POST**, Projection und Secret leer lassen
3. Probe: Im Studio einen Text ändern und **veröffentlichen**. In Vercel erscheint unter **Deployments** ein neuer Build. Nach ein
   bis drei Minuten ist die Änderung auf der Website. Wenn nichts passiert: in Sanity unter dem Webhook das **Attempts log** ansehen.

Mehrere Veröffentlichungen kurz nacheinander lösen mehrere Builds aus; Vercel bricht ältere ab. Das ist in Ordnung.

## 7. Go-Live auf der Kanzleidomain

Erst wenn der Anwalt die Inhalte freigegeben hat:

1. `npm run inhalt:pruefen -- --live` listet, was noch offen ist: nicht freigegebene Seiten, Rechtsgebiete und Publikationen, das
   Impressum der Demo, die Datenschutzerklärung der Demo. Alle Punkte aus `docs/UEBERGABE.md` klären.
2. **Impressum und Datenschutzerklärung neu schreiben** (Verantwortlich ist dann der Anwalt; Hosting Vercel; Sanity als
   Auftragsbearbeiter für die Redaktion). Solange das Wort «Demo» in den Rechtstexten steht, lässt sich die Website nicht freigeben.
3. Im Studio bei den bestätigten Dokumenten und bei «Belege für die Texte dieser Seite» die Freigabe auf «Live» stellen. Bei den
   Publikationen bedeutet «Live»: Wortlaut und Veröffentlichung sind vom Autor freigegeben.
4. In Vercel die Domain verbinden (**Settings → Domains**) und die Variablen setzen: `SITE_URL=https://www.<domain>` und `INDEXIERUNG=1`.
   Neu bauen. Jetzt verschwinden `noindex` und der Entwurfshinweis, die Sitemap und die strukturierten Daten (Person, LegalService, Article) entstehen.
5. Prüfen: `https://www.<domain>/robots.txt` nennt die Sitemap, der Seitenquelltext enthält kein `noindex` mehr, die Canonical-Adressen
   zeigen auf die Kanzleidomain, `/konktakt.html` leitet mit 308 auf `/kontakt/`.
6. Die GitHub-Pages-Demo abschalten (Repository-Einstellungen → Pages) oder das Repository auf privat stellen, damit nicht zwei
   Fassungen im Netz stehen. Die bestehende Website und Domain bis dahin nicht anfassen; beim Domainwechsel die alten Adressen
   (`data/weiterleitungen.json`) laufen über `vercel.json` weiter.

Der Build schützt vor Versehen. Er bricht ab, wenn

- `INDEXIERUNG=1` ohne `SITE_URL` gesetzt ist,
- `SITE_URL` auf eine Vorschau-Adresse zeigt (`github.io`, `vercel.app`, `localhost`),
- `SITE_URL` zusammen mit dem Unterpfad der GitHub-Pages-Demo verwendet wird,
- bei einer echten Domain noch etwas nicht freigegeben ist. Die Meldung nennt jeden offenen Punkt.

Zum Ausprobieren ohne Freigaben dient eine reservierte Testdomain: `INDEXIERUNG=1 SITE_URL=https://www.example.com npm run build:vercel`.

`noindex` ist kein Zugangsschutz. Wer den Link zur Demo kennt, kann sie lesen.

## Was diese Vorbereitung nicht kann

- Keine Vorschau unveröffentlichter Entwürfe auf der Website. Entwürfe sieht man nur im Studio.
- Keine sofortige Veröffentlichung: immer erst nach dem Build.
- Neue Seitentypen (zum Beispiel Detailseiten je Rechtsgebiet) oder neue Dienste (Karte, Analyse) brauchen Entwicklung.

## Geprüft, ohne dass ein Projekt existiert

- Studio: Typprüfung und `sanity schema validate` (0 Fehler, 0 Warnungen; `docs/PRUEFBERICHT.md`)
- Import: Trockenlauf baut 17 Dokumente und vergleicht sie nach dem Zurücklesen mit den lokalen Inhalten (Parität, auch für die
  Publikationen als Portable Text)
- Bild-Spiegel: Selbsttest mit einer lokalen Datei (`npx tsx scripts/sanity-bilder.mts --probe <Bild>`)
- Website: Probe-Build mit `DEPLOY_TARGET=vercel`, `INDEXIERUNG=1` und einer Testdomain; Export-Prüfung grün
- Leitplanken: unzulässige Kombinationen von `INDEXIERUNG` und `SITE_URL` brechen den Build wie vorgesehen ab

Nicht geprüft werden konnte, weil kein Projekt existiert: der echte Import, das Herunterladen der Bilder, ein Build mit
`CONTENT_SOURCE=sanity`, der Webhook. Beim ersten Durchlauf deshalb Schritt 4 nicht überspringen.
