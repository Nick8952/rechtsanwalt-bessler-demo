# Rechtsanwalt Michael Bessler: Verkaufs-Demo

Entwurf einer neuen Website für Rechtsanwalt Michael Bessler, lic. iur. (Neugasse 6, 8005 Zürich; Strafrecht, Mietrecht,
Migrationsrecht, Coaching). **Nicht die offizielle Website der Kanzlei.** Betreiber der Demo: Nick Holzbecher.

- Live (Entwurf, noindex): <https://nick8952.github.io/rechtsanwalt-bessler-demo/>
- Bisherige Website (Quelle aller Inhalte): <https://www.rechtsanwaltbessler.ch/>
- Aufbau «Leporello»: alle Seiten als Streifen nebeneinander, die aktuelle aufgefaltet (`docs/DESIGN.md`).
- Technik: Next.js 16, TypeScript, Tailwind v4, statischer Export; Inhalte in `data/`; Sanity und Vercel vorbereitet, nicht eingerichtet.
- Anleitungen: `CLAUDE.md` (Architektur und Regeln), `docs/SANITY-VERCEL-EINRICHTUNG.md`, `docs/INHALTE-PFLEGEN.md`, `docs/UEBERGABE.md`.
- Nachweise: `docs/INHALTSMATRIX.md` (Quellen), `docs/PRUEFBERICHT.md` (Prüfungen, Codex), `SKILL-ANWENDUNG.md`, `docs/PRAESENTATION.md` (Gesprächshilfe).

```bash
npm install
npm run dev            # http://localhost:3000/rechtsanwalt-bessler-demo/
npm run pruefen && npm run build
npm run vorschau:pages # http://localhost:4321/rechtsanwalt-bessler-demo/
npm run qa
```

Alle Texte, der Lebenslauf, die Links und die drei Publikationen stammen von der bisherigen Website (Stand 27. Oktober 2026). Die
Publikationen stehen im Wortlaut und sind durch Prüfsummen gesichert. Nutzungsrechte für Texte und Bilder sind vor dem Produktivbetrieb
zu klären.
