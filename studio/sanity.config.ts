import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { deDELocale } from "@sanity/locale-de-de";
import { schemaTypes, EINZELDOKUMENTE } from "./schemas";
import { dataset, projectId } from "./env";

/**
 * Studio der Website von Rechtsanwalt Michael Bessler. Die Seitenleiste ist nach dem geordnet, was am häufigsten gepflegt wird:
 * Kanzlei und Kontakt, Person, Rechtsgebiete, Coaching, Publikationen, Links, dann die Seitentexte und Rechtstexte.
 * Seiten, Kanzleiangaben und Texte gibt es je genau einmal; sie lassen sich weder doppelt anlegen noch löschen.
 */
const einzel = (S: StructureBuilder, typ: string, titel: string, id = typ) => S.listItem().title(titel).id(id).child(S.document().schemaType(typ).documentId(id).title(titel));

export default defineConfig({
  name: "rechtsanwalt-bessler",
  title: "Rechtsanwalt Michael Bessler",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Inhalte")
          .items([
            einzel(S, "kanzlei", "Kanzlei und Kontaktangaben"),
            einzel(S, "person", "Zur Person (Lebenslauf)"),
            S.documentTypeListItem("rechtsgebiet").title("Rechtsgebiete"),
            einzel(S, "coachingSeite", "Coaching"),
            S.documentTypeListItem("publikation").title("Publikationen"),
            einzel(S, "linkSeite", "Weiterführende Links"),
            S.divider(),
            S.listItem().title("Seiten").child(
              S.list().title("Seiten").items([
                einzel(S, "startseite", "Startseite"),
                einzel(S, "rechtsgebieteSeite", "Rechtsgebiete (Übersichtsseite)"),
                einzel(S, "publikationenSeite", "Publikationen (Übersichtsseite)"),
                einzel(S, "kontaktSeite", "Kontakt und Anfahrt"),
                einzel(S, "rechtSeite", "Impressum", "rechtSeite-impressum"),
                einzel(S, "rechtSeite", "Datenschutzerklärung", "rechtSeite-datenschutz"),
              ]),
            ),
            S.divider(),
            einzel(S, "texte", "Navigation, Fusszeile und Formulartexte"),
          ]),
    }),
    visionTool({ defaultApiVersion: "2025-02-19" }),
    deDELocale(),
  ],
  schema: {
    types: schemaTypes,
    // Einzeldokumente nicht über «Neu anlegen» anbieten
    templates: (vorlagen) => vorlagen.filter((v) => !EINZELDOKUMENTE.includes(v.schemaType)),
  },
  document: {
    // Einzeldokumente: nur bearbeiten und veröffentlichen, nicht duplizieren oder löschen
    actions: (aktionen, kontext) => (EINZELDOKUMENTE.includes(kontext.schemaType) ? aktionen.filter((a) => a.action && ["publish", "discardChanges", "restore"].includes(a.action)) : aktionen),
  },
});
