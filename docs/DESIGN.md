# Gestaltung «Randnotiz», Aufbau «Leporello»

## Lesart (Design Read)

Redesign-Überhaul einer Einzelkanzlei-Website (Inhalte und Informationsarchitektur bleiben, die visuelle Sprache ist neu) für Menschen in
einer rechtlichen Notlage und für Leserinnen und Leser der Publikationen. Sprache: ruhig, präzise, editorial-humanistisch; Serife für
Titel, Randnotizen und Zitate, Schweizer Grotesk für Navigation, Lauftext und Bedienung. Trust-first-Rahmen (regulierter Beruf) übersteuert
jede gestalterische Lust. Keine Bildgenerierung, kein Brutalismus, keine App-Oberfläche, keine Scroll-Effekte.

Stellwerte (design-taste-frontend v2): Varianz 5 (Leporello: alle Seiten nebeneinander, die aktuelle aufgefaltet; im Blatt Randspalte und
Inhalt versetzt, sonst ruhig), Bewegung 2 (nur Hover und Fokus), Dichte 3 (luftig, 48 bis 96 px je Abschnitt). Theme: hell als Grundlage, dunkel über dieselben Tokens; kein
Abschnitt invertiert von sich aus.

## Was die Gestaltung trägt

Die Welt des Mandanten: ein Anwalt, der liest und schreibt (Rezension, Seminararbeit, Theater, Buchhandel), bunte Buchrücken im
Kanzleiportrait, Schweizer Gesetzestexte mit Randtiteln (Marginalien). Daraus die Signatur: **die Randspalte**. Sie steht links neben
dem Inhalt und trägt immer etwas Wahres, nie Dekoration:

| Seite | Inhalt der Randspalte |
| --- | --- |
| Startseite | Kontaktangaben-Etikett, die Tätigkeitszeile «Rechtsanwalt, Strafverteidiger und Coach», die vier Leistungsformen, das Gemälde der bisherigen Startseite, der Untertitel des Coachings, die Art der Publikationen, die Tramzeile |
| Rechtsgebiete | die vier Leistungsformen |
| Person | die Titelzeile «lic. iur., Rechtsanwalt, Strafverteidiger, Coach (zert. IKP)» |
| Coaching | das Gemälde von Candida Sauter |
| Publikationen | der Hinweis, dass die Texte historisch sind |
| Artikel | Rückweg, Inhaltsverzeichnis (klebend, mit aktuellem Abschnitt), Autor, Datum, Quelle, Druckknopf |
| Kontakt | Adresse, Telefon, E-Mail, Kartenlink |
| Links | Sprungliste der Gruppen |

Unter 64 rem steht die Randspalte über dem Inhalt (eine Spalte, 16 px Rand). Keine Linien quer durch die Seite ausser der einen
Trennlinie am Abschnittsanfang.

## Farben (Tokens in app/globals.css)

| Rolle | Hell | Dunkel | Herkunft |
| --- | --- | --- | --- |
| Papier (Grund) | `#f7f6f2` | `#151614` | warmes Weiss, kein Creme |
| Fläche, Fläche 2 | `#fdfdfb`, `#eeece6` | `#1b1c1a`, `#232421` | Hinweiskästen, Formularfelder |
| Tinte, Tinte 2, Grau | `#1b1c1a`, `#4b4d47`, `#676961` | `#ecebe4`, `#c2c1b9`, `#a3a29a` | nie reines Schwarz oder Weiss |
| Linie, Linie stark | `#dcd9d1`, `#8c887b` | `#2e302c`, `#6d7067` | Trennlinien 1 px; Feldränder ≥ 3:1 |
| Akzent, Akzent tief | `#1f5c47`, `#163f32` | `#8ccfb0`, `#b3e0cb` | das eine Grün: Links, aktive Navigation, Fokus, Knöpfe, Hinweiskante |
| Knopf, Knopftext | `#1f5c47`, `#f7f6f2` | `#2d7a5f`, `#f7f6f2` | |

Gemessene Kontraste (hell): Tinte auf Papier 15,9:1, Tinte 2 auf Papier 7,9:1, Grau auf Papier 5,2:1, Akzent auf Papier 7,2:1, Knopftext
auf Knopf 7,8:1, Linie stark auf Papier 3,3:1. Dunkel: Akzent auf Papier 9,0:1, Knopftext auf Knopf 5,0:1. Ein Akzent, Sättigung unter
80 %, kein AI-Violett, keine Cremetöne der bekannten KI-Palette.

## Schrift

| Rolle | Schrift | Datei | Einsatz |
| --- | --- | --- | --- |
| Serife | Newsreader Variable (Gewicht 200 bis 800; aufrecht mit optischer Grösse, kursiv nur Gewicht, weil sie allein bei 18 bis 20 px steht) | fontsource, lokal, `--schrift-serif` | Titel 1 bis 3 (Gewicht 500), Wortmarke, Randnotizen (kursiv), Leitfragen, Blockzitate (kursiv) |
| Grotesk | Hanken Grotesk Variable (Gewicht 100 bis 900) | fontsource, lokal, `--schrift-sans` | Navigation, Lauftext, Knöpfe, Formular, Etiketten |

Grössen: Titel 1 `clamp(2.25rem, 1.5rem + 2.6vw, 3.6rem)`, Titel 2 `clamp(1.75rem, 1.35rem + 1.3vw, 2.5rem)`, Titel 3
`clamp(1.3rem, 1.15rem + 0.5vw, 1.6rem)`, Lauftext 17 px / 1.6, Artikel 18 px (ab 48 rem 19 px) / 1.72, Zeilenlänge 66 Zeichen,
Zitate 1.08 em kursiv mit stiller Linie am Rand. Keine Silbentrennung in Titeln, `text-wrap: balance` für Titel, `pretty` für Absätze.
Serife mit Begründung: der Auftrag verlangt sie ausdrücklich, und die Website ist zur Hälfte Publikationsorgan (Rezension, Seminararbeit).
Newsreader ist keine der beiden im Skill gebannten Serifen und wurde in keiner früheren Demo verwendet.

## Aufbau «Leporello» (seit 30. Oktober 2026)

Auf Nicks Wunsch nach einem Aufbau, der in keiner früheren Demo vorkam, ist die Website ein Faltblatt:

- **Ab 70 rem Fensterbreite** stehen alle Seiten (zwei bis sechs Einträge des Registers, heute sechs) als 3.5 rem schmale Streifen nebeneinander, senkrecht beschriftet (von unten nach
  oben, wie ein Buchrücken), in der Reihenfolge des Registers: Start, Person, Rechtsgebiete, Coaching, Publikationen, Kontakt. Die aktuelle
  Seite ist aufgefaltet: Das Blatt liegt rechts neben ihrem Streifen, der als «Rücken» des offenen Blatts sichtbar bleibt (Akzentfläche,
  `aria-current`); auf der Seite «Coaching» stehen also drei Streifen und der Rücken links, zwei Streifen rechts. Die Streifen kleben am oberen Rand und bleiben beim Lesen sichtbar; sie sind die Navigation. Seiten ausserhalb des
  Registers (Impressum, Datenschutz, Links) liegen rechts von allen sechs Streifen.
- **Unter 70 rem** wird das Register zu sechs Reitern über dem Inhalt (drei je Zeile, mindestens 48 px hoch, aktuelle Seite mit Akzentfläche).
  Kein Dialogmenü mehr: alles ist sichtbar.
- **Kopf** (Wortmarke, Telefon) liegt über dem Leporello und ist nicht fixiert. Fusszeile im Blatt.
- **Technik:** reines CSS. `components/Leporello.tsx` berechnet aus dem Pfad die Position (`--aktiv`), die Streifen tragen `--i`; auf Desktop ist
  das `<nav>` `display: contents`, Streifen und Blatt werden per Flex-Order angeordnet. Das Blatt ist ein Container (`container-name: blatt`);
  alle Spaltenlayouts im Blatt (Randspalte, Einstieg, Register der Rechtsgebiete, Kontaktzeile, Tailwind `@xl:`, `@2xl:`, `@3xl:`) hängen an
  der Blattbreite, nicht an der Fensterbreite. Der Umschaltpunkt 70 rem ist so gewählt, dass das Blatt beim Auffalten mindestens 49 rem
  breit ist (sechs Streifen) und die Zweispaltigkeit (ab 48 rem Blattbreite) nicht zurückklappt. Hairlines zwischen den Reitern sind Schatten
  je Zelle, damit auch weniger als sechs Einträge sauber aussehen.
- **Fokusreihenfolge** (bewusst): Sprunglink, Kopf (Wortmarke, Telefon), alle Streifen des Registers in Registerreihenfolge, dann das Blatt;
  die Streifen rechts des Blatts kommen vor dem Blatt dran, wie bei einer Kopfnavigation. Das `<nav>` ist auf Desktop `display: contents`;
  aktuelle Browser behalten Rolle und Namen («Seiten»), die Funktionsprüfung kontrolliert das im Accessibility-Tree.
- **Geprüft:** Funktionsprüfungen zu Geometrie (Streifen links und rechts des Blatts, 56 px breit, bildschirmhoch, klebend nach 1500 px
  Scrollen), Start und Kontakt als aufgefaltete Seite, Seiten ausserhalb des Registers, `aria-current`, Fokusreihenfolge, Landmarke im
  Accessibility-Tree, Reiter auf 360 px, Audit zusätzlich bei 1119 und 1120 px, Druckansicht ohne Register.

Verworfene Alternativen: Buchaufschlag (zwei feste Buchseiten; zu nah am geteilten Bildschirm), Daumenregister am rechten Rand (nur die
Navigation wäre neu gewesen, nicht der Aufbau), Zeitungsseite in drei Spalten (einer der bekannten KI-Standardlooks), Brief des Anwalts
(hätte neue Prosa verlangt, die nicht belegt ist).

## Inhalt des Blatts «Start» (Layoutfamilien)

1. Einstieg: Text links (Überzeile, Titel, 13 Wörter Text, ein primärer und ein sekundärer Knopf), Portrait rechts in Originalgrösse;
   zweispaltig erst ab 56 rem Blattbreite, darunter steht das Portrait unter dem Text (sonst bräche der Titel mitten im Wort).
2. Kontaktleiste: Definitionsliste mit drei Spalten (Adresse, Telefon, E-Mail).
3. Einleitung: die vier Fragen der bisherigen Website als Strophe in der Serife, darunter die Antwort.
4. Rechtsgebiete: Register mit einer Zeile je Gebiet (Titel links, Leistungssatz und belegte Bezüge rechts). Keine Kacheln.
5. Zur Person: Text, am Rand das Gemälde.
6. Coaching: Text mit Untertitel am Rand.
7. Publikationen: Liste mit Art, Jahr und Titel.
8. Kontakt: Text, Definitionsliste, Knopf.

Acht Abschnitte, sechs Layoutfamilien, eine Überzeile (im Einstieg), keine Abschnittsnummern, keine Scroll-Hinweise, kein Gedankenstrich,
ein Wortlaut je Absicht («Kontakt aufnehmen» im Einstieg, auf den Unterseiten und am Ende der Startseite).

## Bewegung

Nur Rückmeldung: Farbwechsel 160 bis 180 ms (`cubic-bezier(0.23, 1, 0.32, 1)`), Druckgefühl `scale(0.98)` auf Knöpfen, Pfeil der
Listenzeilen 4 px nach rechts (nur bei `hover: hover`), Reiter und Streifen des Registers 160 ms Farbwechsel,
sanftes Scrollen zu Sprungmarken (unter reduzierter Bewegung sofort). Unter `prefers-reduced-motion: reduce` sind ausserdem alle
Übergänge und Animationen global abgeschaltet (Zustände wechseln sofort). Keine Scroll-Animationen, keine Dauerschleifen, keine Scrollführung.

## Zustände

| Element | Zustände |
| --- | --- |
| Links | Unterstrich 1 px, bei Hover 2 px und Akzent tief; Fokusring 3 px Akzent mit 3 px Abstand |
| Register | Reiter (unter 70 rem): aktuelle Seite mit Akzentfläche, Akzentfarbe und 3 px Linie, `aria-current="page"` (auch Unterseiten); Streifen (ab 70 rem): der Streifen der aktuellen Seite ist der Rücken links vom Blatt (Akzentfläche, 3 px Linie zum Blatt); Hover Fläche 2; Fokusring innen (Abstand −4 px) |
| Knöpfe | primär (Grün, Papier-Text), sekundär (Umriss Tinte, bei Hover gefüllt), gesperrt (Formular ohne JavaScript: 60 % Deckkraft) |
| Formularfelder | Rand 1,5 px Linie stark, Fokus Akzent, Fehler Rot mit Meldung am Feld (`role="alert"`), Hilfetext unter dem Feld |
| Inhaltsverzeichnis | Einträge 44 px hoch, aktueller Abschnitt mit Akzentlinie und fett (IntersectionObserver), mobil als `<details>` |
| Dialoge | natives `<dialog>` (Datenschutz-Hinweis): Fokus bleibt im Dialog, Escape schliesst, Klick auf den Hintergrund schliesst |
| Leer, Fehler | 404 gestaltet mit Seitenliste; Linkgruppen ohne erreichbare Ziele erscheinen nicht |

## Druckansicht

`@media print`: Kopf, Register, Fusszeile, Randspalte, Knöpfe, Demo-Hinweis ausgeblendet; Leporello und Blatt als Block; Artikel in voller Breite, 11 pt, Zeilenhöhe 1,5,
Überschriften nicht am Seitenende, Zitate nicht umbrochen, externe Links mit Adresse in Klammern.

## Selbstkritik nach den ersten Screenshots

- Titel wurden automatisch getrennt («Migra-tionsrecht»): Silbentrennung in Titeln auf manuell gestellt.
- Die E-Mail-Adresse brach in der Randspalte mitten im Wort: Spalte 15 rem breit, Adresse in der Randspalte kleiner gesetzt.
- Die Kopfzeile lief unter 400 px über: Wortmarke gestapelt, Menüknopf kompakter.
- Zeilenumbrüche mitten im Satz (Artefakte des alten Editors) störten den Lesefluss der Publikationen: Umbrüche nach Satzende bleiben,
  Umbrüche mitten im Satz werden zu Leerzeichen (Wortlaut unverändert, Prüfsumme über den Text).
- Ein Zubehör entfernt: Die Goldlinie unter Titeln früherer Demos gibt es hier nicht; die einzige Linie ist die Trennlinie am Abschnittsanfang.

Nach dem Umbau zum Leporello (30. Oktober 2026): Streifenbeschriftung stand in der Mitte des Streifens → oben beginnend wie ein Buchrücken;
E-Mail in der Kontaktzeile brach mitten im Wort, weil das Blatt schmaler ist als das Fenster → E-Mail-Spalte breiter (1.35fr).
