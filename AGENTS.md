# Anweisungen für Codex

Für dieses Projekt gelten `CLAUDE.md` in diesem Ordner (Architektur, Regeln, Befehle) und `../AGENTS.md` (Workspace, Obsidian-Brain).
Kurzfassung der harten Regeln:

- Statischer Export, keine Serverfunktionen, keine Anfragen an Dritte beim Seitenaufruf, Demo bleibt `noindex`.
- Nichts erfinden: nur Angaben der bisherigen Website rechtsanwaltbessler.ch; keine Fachanwaltstitel, Erfolgsquoten, Honorare,
  Öffnungszeiten, Notfallnummern, kein Kanzleiteam. Rechtsgebiete nur Strafrecht, Mietrecht, Migrationsrecht.
- Publikationen (`data/publikationen/`) sind Autorenwerke im Wortlaut; `pruefsummen.json` versiegelt sie. Nie umformulieren.
- Formular nur als vorbereitete E-Mail; keine Nachrichten an die Kanzlei senden. Karte nur als Link.
- Schweizer Hochdeutsch ohne «ß», keine Gedankenstriche.
- Prüfen vor Abschluss: `npm run pruefen && npm run build` (prüft Inhalte und Export); Browser-Prüfungen mit `npm run vorschau:pages` + `npm run qa`.
- Reviews lesend ausführen, keine Sanity- oder Vercel-Projekte anlegen, keine Tokens anfordern.
