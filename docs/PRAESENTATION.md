# Gesprächshilfe: Demo für Rechtsanwalt Michael Bessler

Für Nick, für das Gespräch mit dem Anwalt. Sachlich, ohne Versprechen zu Umsatz, Suchmaschinenrang oder Mandaten.
Demo: <https://nick8952.github.io/rechtsanwalt-bessler-demo/> (Entwurf, von Suchmaschinen ausgeschlossen).

## In einem Satz

Die Demo zeigt, wie die bestehende Website mit denselben Inhalten heute aussehen kann: ruhig, gut lesbar auf dem Handy, mit den
Publikationen als richtige Artikel, mit Telefon und E-Mail auf jeder Seite, ohne eine einzige erfundene Angabe. Der Aufbau ist ein
Faltblatt: Am Bildschirm stehen alle Seiten als beschriftete Streifen nebeneinander, die aufgeschlagene liegt dazwischen; auf dem Handy
sind es sechs Reiter über dem Inhalt.

## Was sich der Anwalt ansehen soll (Reihenfolge für das Gespräch)

1. **Startseite auf dem Handy.** Name, die drei Rechtsgebiete, Telefon sofort erreichbar. Die vier Leitfragen der alten Einleitung stehen
   wörtlich da, nur anders gesetzt.
2. **Publikationen.** Die Seminararbeit zu Musil (16'000 Wörter) als Artikel mit Inhaltsverzeichnis, Sprungmarken und Druckansicht.
   Wortlaut unverändert, auch die Fehler der Vorlage; eine Liste mit Korrekturvorschlägen liegt bereit, er entscheidet.
3. **Zur Person.** Lebenslauf, Ausbildung, Mitgliedschaften wie auf der alten Website, nur gegliedert.
4. **Kontakt.** Lage, Tramlinien (nachgeprüft), Kartenlink statt eingebetteter Karte (deshalb kein Cookie-Banner). Das Formular öffnet sein
   E-Mail-Programm; die Website speichert nichts.
5. **Alte Adressen.** Wer die alte Kontaktseite (mit dem Tippfehler «konktakt») aufruft, landet auf der neuen. Nichts geht verloren.

## Was bewusst fehlt

- Keine Öffnungszeiten, Honorare, Erreichbarkeitsversprechen, Bewertungen, Erfolgszahlen, Fachanwaltstitel: nichts davon steht auf der alten
  Website, also steht es auch hier nicht. Was er ergänzen will, trägt er selbst ein.
- Keine Detailseiten je Rechtsgebiet: dafür fehlen Texte. Eine gemeinsame Übersichtsseite ist ehrlicher als gefüllte Platzhalter.
- Keine KI-Bilder, keine Stockfotos. Sein Portrait und die drei Gemälde der alten Website, sonst nichts.

## Was er davon hat (nur Belegbares)

- Lesbar auf jedem Gerät; Prüfungen in vier Bildschirmbreiten, hell und dunkel, dokumentiert.
- Barrierefreiheit nach WCAG-Grundregeln geprüft (Tastatur, Kontrast, Vorlesbarkeit); Lighthouse-Werte im Prüfbericht.
- Keine Dienste Dritter beim Seitenaufruf: keine Google-Schriften, keine Karte, keine Analyse. Das vereinfacht die Datenschutzerklärung.
- Publikationen zitierfähig: stabile Sprungmarken, Druckansicht, Quelle sichtbar.
- Später selbst pflegbar (Sanity): Texte, Lebenslauf, Links, Publikationen ohne Programmierkenntnisse; jede Änderung läuft vor der
  Veröffentlichung durch dieselben Prüfungen (nichts Erfundenes, Wortlaut der Publikationen geschützt).

## Was es bis zum Betrieb braucht

| Schritt | Wer | Aufwand |
| --- | --- | --- |
| Angaben bestätigen (Lebenslauf, Mitgliedschaften, Tram, Rechtsform/UID fürs Impressum) | Anwalt | ein Gespräch |
| Rechte klären: Portrait (Fotograf), Gemälde (Candida Sauter, ein Bild ohne Angabe), Wiederveröffentlichung der Rezension | Anwalt | Rückfragen |
| Impressum und Datenschutzerklärung für den Betrieb | Anwalt (Freigabe), Nick (Einbau) | kurz |
| Hosting (Vercel) und Redaktion (Sanity) einrichten, Domain umhängen | Nick | etwa ein halber Tag |
| Alte Website abschalten, Weiterleitungen aktiv | Nick | Teil des Umzugs |

Bis dahin bleibt die bestehende Website unverändert online. Die Demo ist nicht auffindbar und kann jederzeit entfernt werden.

## Fragen, die er stellen wird

- **«Ist das wirklich alles aus meiner Website?»** Ja. Die Matrix (`docs/INHALTSMATRIX.md`) zeigt je Seite Quelle, Ziel und Status.
- **«Kann ich Texte selbst ändern?»** Heute über Nick; nach der Einrichtung von Sanity selbst, in einem Formular mit Vorschau, ohne Code.
- **«Was kostet das?»** Nicks Preisliste. Keine laufenden Lizenzkosten für Schriften oder Karten; Sanity und Vercel haben kostenlose Stufen,
  deren Grenzen für eine Kanzleiwebsite genügen (Stand der Anbieter prüfen).
- **«Wird man mich besser finden?»** Keine Zusage. Belegbar ist: sauberes HTML, individuelle Seitentitel, strukturierte Daten (nach
  Freigabe), schnelle Ladezeit, funktionierende alte Adressen. Was Suchmaschinen daraus machen, entscheidet niemand hier.

Offene Punkte und Kundenfragen im Detail: `docs/UEBERGABE.md`.
