# Übergabe: offene Angaben, Kundenfragen, Freigaben

Stand: 28. Oktober 2026. Arbeitspapier für das Gespräch mit Rechtsanwalt Michael Bessler und für den späteren Produktivbetrieb.

## Stand der Demo

- Repository: <https://github.com/Nick8952/rechtsanwalt-bessler-demo> (öffentlich)
- Live: <https://nick8952.github.io/rechtsanwalt-bessler-demo/> (noindex, als Entwurf gekennzeichnet)
- Inhalte: lokal in `data/`. Sanity und Vercel sind vorbereitet, nicht eingerichtet (`docs/SANITY-VERCEL-EINRICHTUNG.md`).
- Die bestehende Website <https://www.rechtsanwaltbessler.ch/> und die Domain wurden nicht angefasst.

## Für Nick, vor dem Versand der Demo

1. **Postanschrift im Impressum der Demo.** In `data/seiten/impressum.json` und `datenschutz.json` steht «Die Postanschrift wird auf
   Anfrage mitgeteilt». Für eine öffentlich erreichbare Website ist eine Anschrift des Betreibers üblich; eintragen oder bewusst so lassen.
2. **Bilder ohne Freigabe.** Die Demo zeigt das Portrait und drei Gemälde der bisherigen Website (Download am 27.10.2026 von dir
   freigegeben). Deine Zustimmung zum Download ersetzt keine Nutzungsrechte; die Rechte klärt der Anwalt (Fotografin oder Fotograf des
   Portraits, Candida Sauter für zwei Gemälde, ein Gemälde ohne Angabe). Das Vorschaubild für Link-Vorschauen (`og-bessler`) ist ein
   Ausschnitt des Portraits und hängt an denselben Rechten. Wer das nicht will, entfernt die Bilder in `scripts/bilder-liste.json` und
   `data/*.json`; die Seiten funktionieren ohne Bilder (Randnotizen rücken nach).
3. **Publikationen vollständig online.** Deine Entscheidung vom 27.10.2026. Die Rezension erschien im Rechtshistorischen Journal; die
   Wiederveröffentlichung braucht die Zustimmung des Autors und gegebenenfalls des Verlags. Die Demo ist noindex; vor dem Go-Live klären.
4. **Formular nicht mit echten Nachrichten testen.** Es öffnet das E-Mail-Programm mit `mail@rechtsanwaltbessler.ch` als Empfänger.
   Während der Entwicklung wurde keine E-Mail an die Kanzlei gesendet (die Prüfung fängt die mailto-Adresse im Browser ab).
5. **Demo gemeinsam ansehen, nicht nur den Link senden.** Der Entwurfshinweis am Seitenanfang und das Impressum erklären, dass die Demo
   ohne Auftrag entstand. Das sollte im ersten Satz des Gesprächs stehen.

## Fragen an den Anwalt

### Betreiber und Recht

| Nr. | Frage | Warum |
| --- | --- | --- |
| 1 | Rechtsform der Kanzlei (Einzelunternehmen oder Gesellschaft), UID, Handelsregistereintrag, zuständige Aufsichtskommission? | Impressum im Produktivbetrieb. Nichts davon steht auf der bisherigen Website; die Zefix-Abfrage war ohne Anmeldung nicht möglich. Nichts wird erfunden. |
| 2 | Welche Person ist für die Datenschutzerklärung verantwortlich, mit welcher Anschrift? | Informationspflicht (DSG Art. 19). Heute ist Nick als Betreiber der Demo genannt. |
| 3 | Sollen die Mitgliedschaften (DJZ Demokratische Juristinnen und Juristen Zürich, Verein Anwaltskollektiv, Verein Pikett Strafverteidigung, Verein humanrights.ch) weiterhin genannt werden, und stimmen sie noch? | Sie stehen wörtlich auf der bisherigen Website; die Demo zeigt sie unverändert. |
| 4 | Darf der Kartenlink auf Google Maps bleiben, oder lieber ein neutraler Link (zum Beispiel map.geo.admin.ch)? | Beim Klick verlassen Besucherinnen und Besucher die Website; keine Einbettung. |
| 5 | Wortlaut des Hinweises «noch kein Mandat» (Kontaktseite und Formular) freigeben oder ändern? | Standesrechtliche Formulierung; Vorschlag der Demo in `data/seiten/kontakt.json` («hinweis») und `data/texte.json` («keinMandat»). |
| 6 | Impressum, Datenschutzerklärung und Haftungshinweis für den Betrieb prüfen und freigeben. | Rechtstexte wurden ohne anwaltliche Prüfung erstellt. |

### Angaben zur Person und zur Kanzlei

| Nr. | Frage | Warum |
| --- | --- | --- |
| 7 | Ausbildung «Psychologisches Coaching, IKP»: Die bisherige Website nennt das Institut für Körperzentrierte **Psychologie**, michaelbessler.ch die Körperzentrierte **Psychotherapie**. Welche Bezeichnung ist richtig? | Die Demo folgt der Kanzleiwebsite. Keine Therapieversprechen. |
| 8 | Schreibweise «MVZ (Mieter- und Mieterinnenverband Zürich)» beibehalten oder «Mieterinnen- und Mieterverband»? | Übernommen wie auf der bisherigen Website. |
| 9 | Stimmen Lage (Neugasse 6, 4. OG, Ecke Klingenstrasse), Tramlinien 4, 13, 17 bis «Museum für Gestaltung» und die Wegbeschreibung? | Tramlinien am 27.10.2026 über die Website des Museums für Gestaltung geprüft; Reihenfolge aufsteigend statt 4, 17, 13. |
| 10 | Gibt es weitere Tätigkeiten, die genannt werden sollen (zum Beispiel Pikettanwalt, Vertrauensanwalt des MVZ sind übernommen)? | Nur Belegtes. |
| 11 | Datum der «Thesen zum Roman»? Die Quelle nennt keines. | Angabe «Erschienen» fehlt bewusst. |
| 12 | Korrekturvorschläge zu den Publikationen (`docs/INHALTSMATRIX.md`, Abschnitt 4) annehmen oder ablehnen? | Wortlaut ist geschützt; jede Änderung braucht seine Freigabe und eine neue Prüfsumme. |
| 13 | Sprachliche Bereinigungen im Coaching-Text («Das systemischen» → «Das systemische», «z.B.» ausgeschrieben, Schlusspunkt) in Ordnung? | Fakten unverändert. |

### Rechtsgebiete und Inhalte, die fehlen

| Nr. | Frage | Warum |
| --- | --- | --- |
| 14 | Sollen Detailseiten je Rechtsgebiet entstehen? Dafür braucht es je Gebiet: typische Anliegen (3 bis 6), Ablauf einer ersten Anfrage, was Mandantinnen und Mandanten mitbringen sollten, Abgrenzung (was nicht übernommen wird). | Die bisherige Website nennt nur die Gebiete und vier Leistungsformen. Die Demo zeigt eine gemeinsame Übersichtsseite. Platzhalter wären unehrlich. |
| 15 | Honorar: Soll ein Hinweis zur Abrechnung (Stundenansatz, unentgeltliche Rechtspflege, Rechtsschutzversicherung) stehen? Wenn ja, Wortlaut vom Anwalt. | Nichts belegt; die Prüfung lehnt Honorarangaben ohne Quelle ab. |
| 16 | Erreichbarkeit: Soll etwas zu Bürozeiten oder Rückruf stehen? Wenn ja, Wortlaut vom Anwalt. | Keine Öffnungszeiten erfunden. |
| 17 | Ersatz für zwei tote Links (Psychex, Heiraten Stadt Zürich)? Drei Adressen wurden aktualisiert (Sans-Papiers, zwei Seiten der Gerichte ZH): prüfen, ob die neuen Ziele passen. | `data/seiten/links.json`, Einträge mit `erreichbar: false` sind dokumentiert, aber ausgeblendet. |
| 18 | Gruppierung der Links (Anlaufstellen, Mietrecht, Gerichte, Strafrecht, Coaching) in Ordnung? | Redaktionelle Entscheidung der Demo. |
| 19 | Coaching-Website michaelbessler.ch bleibt eigenständig verlinkt, oder soll das Coaching ganz auf die Kanzleiwebsite? | Beide Websites nennen unterschiedliche E-Mail-Adressen; die Demo verwendet nur die Kanzleiadresse. |

### Bilder

| Nr. | Frage | Warum |
| --- | --- | --- |
| 20 | Wer hat das Portrait fotografiert, und darf es verwendet werden (auch als Ausschnitt für Link-Vorschauen)? | Urheberrecht, Bildnachweis. |
| 21 | Dürfen die Gemälde von Candida Sauter gezeigt werden? Wer hat das dritte Gemälde (Rechtsgebiete-Seite der alten Website) gemalt? | Urheberrecht; ohne Angabe keine Zuschreibung. |
| 22 | Gibt es ein Logo oder eine Hausschrift? Die Demo nutzt eine typografische Wortmarke und ein grünes «B» als Icon. | Nichts wird erfunden; das alte Favicon ist leer. |
| 23 | Soll die alte Google-Maps-Abbildung ersetzt werden (zum Beispiel ein eigenes Foto des Eingangs)? | Der alte Kartenausschnitt (©Google) wurde nicht übernommen. |

## Alte Adressen → neue Adressen

Die Liste liegt in `data/weiterleitungen.json`. GitHub Pages kennt keine serverseitigen Weiterleitungen; dort liegt unter jeder alten
Adresse eine kleine Seite mit `meta refresh` (0 Sekunden), `rel="canonical"` auf das neue Ziel und einem Link, falls der Browser nicht folgt.
Auf Vercel sind dieselben Ziele als echte 308-Weiterleitungen in `vercel.json` hinterlegt (`npm run weiterleitungen` prüft, dass beide
Listen übereinstimmen). Adressen beziehen sich auf die Domain, unter der die Website läuft; für die Demo mit Unterpfad `/rechtsanwalt-bessler-demo`.

| Alte Adresse (rechtsanwaltbessler.ch) | Neue Adresse | Bemerkung |
| --- | --- | --- |
| `/` und `/index.html` («Einleitung») | `/` | Einleitung und Home zusammengeführt; keine Weiterleitung nötig |
| `/home.html` («Home») | `/` | |
| `/personlich.html` («Persönlich») | `/person/` | |
| `/rechtsgebiete.html` | `/rechtsgebiete/` | |
| `/coaching.html` | `/coaching/` | |
| `/konktakt.html` («Konktakt») | `/kontakt/` | Tippfehler der alten Adresse; die neue Seite heisst «Kontakt» |
| `/kontakt.html` | `/kontakt/` | vorsorglich, falls irgendwo korrekt verlinkt |
| `/links.html` | `/links/` | |
| `/_die_geistgeschichtlichen_grundlagen_des_deutschen.html` | `/publikationen/geistesgeschichtliche-grundlagen-des-deutschen-rechts/` | Rezension |
| `/_der_mann_ohne_eigenschaften-1.html` | `/publikationen/der-mann-ohne-eigenschaften/` | Seminararbeit |
| `/_der_mann_ohne_eigenschaften.html` | `/publikationen/thesen-der-mann-ohne-eigenschaften/` | Thesen |
| `/sitemap.xml` | entfällt bis zur Freigabe | neue Sitemap entsteht mit `INDEXIERUNG=1` |

Neu ohne Vorgänger: `/publikationen/` (Übersicht), `/impressum/`, `/datenschutz/`, gestaltete Fehlerseite.

## Freigaben vor dem Produktivbetrieb (technisch erzwungen)

`npm run inhalt:pruefen -- --live` und jeder Build mit `INDEXIERUNG=1` und einer echten Domain brechen ab, solange offen ist:

- Freigabe `live` für: Startseite, Zur Person, Rechtsgebiete (Übersicht und drei Gebiete), Coaching, Publikationen (Übersicht und drei
  Werke), Links, Kontakt, Impressum, Datenschutzerklärung (Feld `freigabe` bei Kanzlei, Rechtsgebieten und Publikationen, `belege.freigabe` bei den Seiten).
- Impressum und Datenschutzerklärung ohne das Wort «Demo»: Betreiber ist dann der Anwalt, Hosting Vercel, gegebenenfalls Sanity als
  Auftragsbearbeiter für die Redaktion. Beide Texte neu schreiben und freigeben lassen.
- Bildrechte (Fragen 20 bis 21) und Publikationsrechte (Frage 12 und Abschnitt «Für Nick», Punkt 3) geklärt; Bildnachweis anpassen.
- `SITE_URL` auf die Kanzleidomain, Canonical-Adressen prüfen, Weiterleitungen auf der neuen Domain testen.
- Demo auf GitHub Pages abschalten, damit nicht zwei Fassungen im Netz stehen.

## Was die Demo bewusst nicht enthält

Keine Öffnungszeiten, Honorare, Notfallnummern, Antwortzeiten, Garantien, Erfolgsquoten, Bewertungen, Fachanwaltstitel, kein Team, keine
Therapieangebote, keine Fallprüfung oder Chat-Funktion, keine Karteneinbettung, keine Analyse, keine KI-Bilder. Alles davon kann später
ergänzt werden, sobald der Anwalt die Angaben liefert; die Prüfung verlangt dann eine Quelle der Art «eigene-quelle».
