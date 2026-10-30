# Inhalte pflegen: Kanzleidaten, Seiten, Publikationen

Für zwei Situationen: **heute** (Demo, Inhalte in `data/`, Änderung durch Nick) und **später** (Sanity Studio, Änderung durch den Anwalt
ohne Programmierkenntnisse). Die Felder heissen an beiden Orten gleich.

## Grundregel: nur Belegtes, jede Änderung geprüft

Jede Seite trägt «Belege» (Quelle, Abrufdatum, Freigabe). Wer einen Text ändert, aktualisiert die Quelle (zum Beispiel «Bestätigung von
Michael Bessler, E-Mail vom 3. März 2027», Art «Eigene Angabe des Anwalts»). Heute prüft `npm run inhalt:pruefen` die Texte vor jedem Build
und lehnt ab: «ß», Gedankenstriche, kostenlose Erstberatung, Garantien, Erfolgsquoten, Fachanwaltstitel, Notfallnummern, Antwortzeiten,
Honorare, Bewertungen, Öffnungszeiten, Kanzleiteam, Therapieversprechen. Später gelten dieselben Prüfungen im Build nach jeder Veröffentlichung.

## Kanzleidaten (Adresse, Telefon, E-Mail, Links)

Heute: `data/kanzlei.json`. Später: Sanity Studio → **Kanzlei und Kontaktangaben**.

| Feld | Bedeutung | Beispiel |
| --- | --- | --- |
| Name der Website | erscheint im Browser-Tab | Rechtsanwalt Michael Bessler |
| Name, Akademischer Titel, Berufsbezeichnung | Wortmarke, Kontaktblöcke | Michael Bessler, lic. iur., Rechtsanwalt |
| Tätigkeiten | belegte Bezeichnungen | Rechtsanwalt, Strafverteidiger, Coach |
| Adresse (Strasse, PLZ, Ort, Zusatz) | Kontaktblöcke, Fusszeile | Neugasse 6, 8005 Zürich, 4. OG |
| Telefon | im Format +41 43 960 36 28; die Website zeigt 043 960 36 28 | |
| E-Mail | Ziel des Kontaktformulars | mail@rechtsanwaltbessler.ch |
| Link zur Lage (Google Maps) | externer Link, keine Einbettung | |
| Eigene Website zum Coaching | optional | https://www.michaelbessler.ch |
| Portrait, Vorschaubild | mit Bildbeschreibung und Bildnachweis | |

Telefon und E-Mail erscheinen automatisch in Kopfzeile, Fusszeile, auf der Startseite und auf der Kontaktseite. Es gibt nur diese eine
Stelle dafür; die Prüfung meldet abweichende Nummern oder Adressen in freien Texten.

## Seitentexte

| Seite | Heute | Später (Studio) |
| --- | --- | --- |
| Startseite (Einstieg, Leitfragen, Abschnitte) | `data/startseite.json` | Seiten → Startseite |
| Zur Person (Einleitung, Lebenslaufgruppen) | `data/person.json` | Zur Person (Lebenslauf) |
| Rechtsgebiete (je Gebiet: Titel, Leistungssatz, belegte Bezüge) | `data/rechtsgebiete.json` | Rechtsgebiete |
| Rechtsgebiete, Übersichtsseite | `data/seiten/rechtsgebiete.json` | Seiten → Rechtsgebiete (Übersichtsseite) |
| Coaching | `data/seiten/coaching.json` | Coaching |
| Publikationen, Übersichtsseite | `data/seiten/publikationen.json` | Seiten → Publikationen (Übersichtsseite) |
| Links (Gruppen, Einträge, erreichbar ja/nein) | `data/seiten/links.json` | Weiterführende Links |
| Kontakt (Lage, Tram, Hinweis zur Mandatsannahme) | `data/seiten/kontakt.json` | Seiten → Kontakt und Anfahrt |
| Impressum, Datenschutzerklärung | `data/seiten/impressum.json`, `datenschutz.json` | Seiten → Impressum / Datenschutzerklärung |
| Navigation, Fusszeile, Formular, Datenschutz-Einstellungen | `data/texte.json` | Navigation, Fusszeile und Formulartexte |

Ein neues Rechtsgebiet ist nur mit einer Quelle der Art «Eigene Angabe des Anwalts» möglich (sonst bricht die Prüfung ab). Der Einstieg
der Startseite ist auf zwei Zeilen Titel und 20 Wörter Text begrenzt.

Heute nach jeder Änderung: `npm run inhalt:pruefen`, dann `npm run build` (prüft den Export), `npm run vorschau:pages` zum Ansehen.
Später: im Studio **Veröffentlichen**, zwei Minuten warten, Website neu laden.

## Publikationen

Eine Publikation besteht aus Angaben (Art, Titel, Kurztitel, Autor, Erschienen, Publikationshinweis, Quelle) und dem Text.
Der Text ist gegliedert in Absätze, Zwischentitel (Ebenen 2 bis 4, sie bilden das Inhaltsverzeichnis), Zitate und Listen
(Aufzählung oder Literaturverzeichnis). Kursiv und fett sind möglich, Links auch.

**Wortlaut:** Die drei vorhandenen Texte sind Werke von Michael Bessler und durch Prüfsummen gesichert
(`data/publikationen/pruefsummen.json`). Ändert sich der Text (auch ein Tippfehler), bricht die Prüfung ab, bis der Autor die Änderung
freigegeben hat und die Prüfsumme neu berechnet wurde:

```bash
npm run pruefsummen                                        # Vergleich je Werk
npm run pruefsummen -- --schreiben der-mann-ohne-eigenschaften   # neue Prüfsumme nach freigegebener Änderung
```

Die Prüfsumme läuft über Titel, Publikationshinweis und die kanonische Form der Blöcke (Blockart, Titelstufe, Listenstil, Fett/Kursiv,
Linkziele, Zeilenumbrüche). Sie schützt vor Versehen, nicht vor Absicht: Wer Text und Prüfsumme zusammen ändert, umgeht sie. Deshalb gilt:
Prüfsumme nur nach Freigabe des Autors neu schreiben und beides gemeinsam committen.

Eine **neue Publikation** anlegen (heute): JSON-Datei nach dem Muster der vorhandenen in `data/publikationen/` ablegen, in
`lib/content/local.ts` einbinden, Prüfsumme mit dem Befehl oben berechnen, `npm run inhalt:pruefen`. Später im Studio: **Publikationen →
Neu**, Angaben ausfüllen, Text mit Zwischentiteln erfassen, Quelle und Freigabe setzen, veröffentlichen; die Prüfsumme trägt der
Entwickler mit `npm run pruefsummen -- --schreiben <slug>` nach (ohne sie bricht der Build mit einer klaren Meldung ab). Das ist Absicht: Kein Text geht ungeprüft online.

Das Inhaltsverzeichnis, die Sprungmarken (aus den Zwischentiteln), die Druckansicht und die Artikelseite entstehen automatisch.
Zwischentitel sollten eindeutig sein; gleiche Titel bekommen Sprungmarken mit Zusatz «-2».

## Links

Jede Gruppe und jeder Link hat eine Kennung (Kleinbuchstaben, Ziffern, Bindestriche; bildet die Sprungmarke, nach dem Anlegen nicht mehr
ändern), jeder Link ausserdem Bezeichnung, Adresse (https), optional Beschreibung und einen Schalter «erreichbar». Dasselbe gilt für die
Gruppen des Lebenslaufs. Nicht erreichbare Links bleiben
dokumentiert, erscheinen aber nicht. Einmal im Jahr prüfen, zum Beispiel mit `curl -sIL <adresse>`.

## Bilder

Heute: Original nach `assets/originale/` legen, in `scripts/bilder-liste.json` mit Alternativtext, Legende und Bildnachweis eintragen,
`npm run bilder`, dann in den Inhalten die Kennung verwenden. Später: im Studio hochladen (Bildbeschreibung und Bildnachweis sind Pflicht).
Nie Bilder ohne geklärte Rechte; keine KI-Bilder, keine Stockfotos als Kanzleiräume oder Personen.

## Alte Adressen

`data/weiterleitungen.json` und `vercel.json` müssen übereinstimmen (`npm run weiterleitungen` prüft das). Wird eine Seite umbenannt,
die alte Adresse dort eintragen.
