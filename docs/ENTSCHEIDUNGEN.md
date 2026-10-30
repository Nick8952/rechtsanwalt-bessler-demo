# Entscheidungen

Kurz begründete Festlegungen dieser Demo (Stand 27. Oktober 2026). Was sich aus dem Code ergibt, steht hier nicht.

1. **Technischer Ausgangspunkt: `../new-york-nails-schlieren-demo`** (das selbst auf `../casatex-zuerich-demo` aufbaut). Übernommen und
   angepasst: Unterpfad-Logik (`lib/deploy-ziel.ts`), Export-Prüfung, Vorschau-Server, QA-Gerüst mit puppeteer-core, Einwilligungslogik,
   Sanity-Muster «statisch + Rebuild bei Publish», Bild-Pipeline mit sharp. Neu geschrieben: Domainmodell, alle Komponenten, die Gestaltung
   «Randnotiz», die Publikationsschicht (Blockmodell mit Zitaten und Literaturlisten, Konverter, Prüfsummen), die Weiterleitungen alter Adressen.
2. **Keine Detailseiten je Rechtsgebiet.** Die bisherige Website nennt nur die drei Gebiete und vier Leistungsformen. Eine gemeinsame
   Übersichtsseite mit belegten Bezügen aus dem Lebenslauf ist ehrlicher als künstlich gefüllte Seiten. Texte dafür: `docs/UEBERGABE.md`.
3. **Publikationen vollständig und im Wortlaut.** Nick hat am 27.10.2026 entschieden, alle drei Texte vollständig zu zeigen (noindex,
   Rechte vor dem Go-Live klären). Der Konverter liest die alte HTML-Formatierung (Unterstreichung = Zwischentitel, Kursiv = Zitat) und
   wurde Wort für Wort gegen das Original geprüft; `data/publikationen/pruefsummen.json` versiegelt den Wortlaut, `npm run inhalt:pruefen`
   bricht bei Abweichungen ab. Zeilenumbrüche mitten im Satz (Artefakte) werden zu Leerzeichen; Umbrüche nach Satzende bleiben.
4. **Überschriftsebenen aus der Nummerierung** (römisch 2, arabisch 3, Buchstaben 4); Fehler der Quelle (zweimal «IV.», «D.» dann «F.»)
   bleiben sichtbar und stehen als Korrekturvorschlag in `docs/INHALTSMATRIX.md`.
5. **Kodierung Windows-1252.** Die alte Website deklariert ISO-8859-1, ist aber in Windows-1252 gespeichert; nur so bleiben die
   Anführungszeichen der Texte erhalten.
6. **Karte nur als Link.** Der Google-Maps-Ausschnitt der alten Kontaktseite (©Google) wird nicht übernommen; der goo.gl-Kurzlink auch
   nicht (Google baut Kurzlinks ab). Stattdessen ein Suchlink auf die Adresse; keine Einbettung, deshalb kein Cookie-Banner.
7. **Tramlinien nachgeprüft.** 4, 13, 17 bis «Museum für Gestaltung» laut Website des Museums (27.10.2026). Reihenfolge der Linien auf der
   Website aufsteigend.
8. **Tote Links werden nicht gezeigt, aber dokumentiert** (`erreichbar: false` in `data/seiten/links.json`): Psychex, Heiraten Stadt Zürich.
   Drei Adressen wurden auf ihre heutigen Ziele aktualisiert.
9. **Gemälde bleiben Gemälde.** Zwei sind Candida Sauter zugeschrieben (Legende der alten Website), eines ohne Angabe. Keine Behauptung
   über Urheberschaft über die Quelle hinaus; Rechte als offener Punkt.
10. **Kein Logo, kein Favicon aus der Quelle.** Die Kanzlei hat keines; das alte Favicon ist leer. Typografische Wortmarke, grünes «B» als Icon.
11. **Formular nur als vorbereitete E-Mail** mit Name, E-Mail, Telefon (freiwillig), Betreff, Nachricht. Keine Uploads, kein Versand durch die
    Website, Hinweis «kein Mandat» (Wortlaut freizugeben).
12. **Einwilligung ruhend.** Keine Dienste Dritter, also kein Banner; Komponente vorbereitet und mit Kategorien aktivierbar.
13. **Rechtsform, UID, Register, Verbände werden nicht genannt.** Die Zefix-Schnittstelle verlangt inzwischen eine Anmeldung; nichts davon
    ist belegt. Im Impressum steht, dass der Anwalt diese Angaben für den Produktivbetrieb ergänzt.
14. **Strukturierte Daten erst bei Freigabe** (`INDEXIERUNG=1`): Person, LegalService, Article; nur belegte Angaben.
15. **Alte Adressen:** statische Weiterleitungsseiten für GitHub Pages (erzeugt bei jedem Build, nicht versioniert) und 308-Weiterleitungen
    in `vercel.json`; ein Skript prüft, dass beide Listen übereinstimmen.
16. **Jeder Build prüft** (auch Vercel): Inhalte vor `next build`, Export danach. Codex-Befund 3 der Architekturprüfung.
17. **Linkziele streng:** interne Ziele dürfen nicht mit «/\» beginnen, URL-Felder sind echte https-Adressen ohne Benutzerangaben
    (Codex-Befunde 4 und 8); Sanity-Listen mit doppelten Slugs brechen den Build ab (Befund 6).
18. **Aufbau «Leporello» (30.10.2026).** Nick wollte einen Aufbau, der in keiner früheren Demo vorkam. Die Website ist jetzt ein Faltblatt:
    alle sechs Seiten als senkrecht beschriftete Streifen nebeneinander, die aktuelle aufgefaltet an ihrer Stelle; unter 70 rem sechs Reiter
    über dem Inhalt statt eines Dialogmenüs. Kopf nicht fixiert, Navigation = Register, der Streifen der aktuellen Seite bleibt als
    Rücken sichtbar (Codex-Befund: Fokusreihenfolge und `aria-current`). Preis: Das Blatt ist schmaler als das Fenster (Spaltenlayouts
    hängen deshalb an Container-Queries; Umschaltpunkt 70 rem, damit nichts zurückklappt), und `display: contents` auf dem `<nav>` setzt
    aktuelle Browser voraus (Landmarke wird im Accessibility-Tree geprüft). Verworfen: Buchaufschlag, Daumenregister, Zeitungsseite, Brief (`docs/DESIGN.md`).
