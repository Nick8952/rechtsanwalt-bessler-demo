// Funktionsprüfungen im echten Browser (puppeteer-core). Vorschau-Server nötig: npm run vorschau:pages
// Geprüft wird, was ein Mensch bedienen würde: Erstbesuch ohne Dienste Dritter, Kontaktwege (tel:, mailto:, Karte extern),
// Tastatur, Menü (Dialog), Publikationen (Inhaltsverzeichnis, Sprungmarken, Lesemass, Druckansicht), mailto-Formular (ohne je
// etwas zu versenden), Weiterleitungen alter Adressen, Fehlerseite, Direktaufrufe, reduzierte Bewegung, dunkles Farbschema.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { BASE, alleSeiten, browserStarten, externeAnfragen, publikationen, warten } from "./chrome.mjs";
const ergebnisse = [];
const ok = (name, bedingung, detail = "") => { ergebnisse.push({ name, ok: !!bedingung, detail }); console.log(`${bedingung ? "✓" : "✗"} ${name}${detail ? " · " + detail : ""}`); };
let browser = await browserStarten();
const kanzlei = JSON.parse(readFileSync("data/kanzlei.json", "utf8"));
const weiterleitungen = JSON.parse(readFileSync("data/weiterleitungen.json", "utf8"));
const TEL = "tel:+41439603628";
const EMAIL = kanzlei.email;
/**
 * Jede Gruppe läuft in frischen Browserumgebungen. Puppeteer verliert mit neuen Chrome-Versionen (und unter hoher Systemlast) sporadisch
 * den Frame mitten in der Navigation («Navigating frame was detached»). Das ist kein Befund der Website: Die Gruppe wird dann bis zu dreimal
 * von vorn wiederholt, Teilergebnisse des abgebrochenen Versuchs werden verworfen.
 */
const offeneKontexte = [];
async function gruppe(fn) {
  for (let versuch = 1; ; versuch++) {
    const stand = ergebnisse.length;
    try { return await fn(); }
    catch (e) {
      ergebnisse.length = stand;
      for (const c of offeneKontexte.splice(0)) await c.close().catch(() => {});
      if (versuch >= 3 || !/detached|LifecycleWatcher|Target closed|Session closed|Connection closed/i.test(String(e))) throw e;
      console.log(`   (Navigation abgebrochen: ${String(e).split("\n")[0].slice(0, 70)}; Gruppe wird wiederholt, Versuch ${versuch + 1})`);
      if (!browser.connected) { await browser.close().catch(() => {}); browser = await browserStarten(); console.log("   (Browser neu gestartet)"); }
    }
  }
}
async function frisch({ breite = 1440, hoehe = 900, reduziert = false, dunkel = false } = {}) {
  const ctx = await browser.createBrowserContext();
  offeneKontexte.push(ctx);
  const page = await ctx.newPage();
  await page.setViewport({ width: breite, height: hoehe });
  const medien = [];
  if (reduziert) medien.push({ name: "prefers-reduced-motion", value: "reduce" });
  if (dunkel) medien.push({ name: "prefers-color-scheme", value: "dark" });
  if (medien.length) await page.emulateMediaFeatures(medien);
  return { ctx, page, extern: externeAnfragen(page) };
}

// 1) Erstbesuch: nichts von Dritten, kein Banner, kein Speicher, Demo-Kennzeichnung
await gruppe(async () => {
  const { ctx, page, extern } = await frisch();
  await page.goto(BASE + "/", { waitUntil: "networkidle0" }); await warten(400);
  ok("Erstbesuch: keine Anfragen an fremde Hosts", extern.length === 0, extern.join(","));
  ok("Erstbesuch: kein Einwilligungsbanner (keine einwilligungspflichtigen Dienste)", (await page.$('[role="region"][aria-label="Datenschutz-Einstellungen"]')) === null);
  ok("Erstbesuch: kein Speicher, keine Cookies", (await page.evaluate(() => Object.keys(localStorage).length + Object.keys(sessionStorage).length)) === 0 && (await page.evaluate(() => document.cookie)) === "");
  ok("Demo: Entwurfshinweis sichtbar", await page.evaluate(() => document.body.textContent.includes("nicht die offizielle Website")));
  ok("Demo: noindex auf der Startseite", await page.evaluate(() => document.querySelector("meta[name=robots]")?.content.includes("noindex")));
  ok("Demo: kein JSON-LD (erst mit INDEXIERUNG=1 auf der Kanzleidomain)", (await page.$('script[type="application/ld+json"]')) === null);
  ok("Keine Iframes, keine eingebetteten Karten oder Widgets", (await page.$$("iframe")).length === 0);
  const robots = await (await page.goto(BASE + "/robots.txt")).text();
  ok("Demo: robots.txt sperrt nicht (noindex bleibt lesbar), nennt keine Sitemap", !/Disallow:\s*\/\s*$/m.test(robots) && !/Sitemap:/.test(robots), robots.replaceAll("\n", " "));
  ok("Demo: keine sitemap.xml", (await page.goto(BASE + "/sitemap.xml")).status() === 404);
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await page.evaluate(() => [...document.querySelectorAll("footer button")].find((b) => b.textContent.includes("Datenschutz-Einstellungen")).click()); await warten(250);
  ok("Footer: «Datenschutz-Einstellungen» öffnet einen Hinweis ohne Schalter (nichts einzustellen)", await page.evaluate(() => { const d = document.querySelector("dialog[open]"); return !!d && d.querySelectorAll('input[type="checkbox"]').length === 0 && d.textContent.includes("keine Cookies"); }));
  await page.keyboard.press("Escape"); await warten(200);
  ok("Footer: Escape schliesst den Hinweis", !(await page.$("dialog[open]")));
  await ctx.close();
});

// 2) Kontaktwege: Telefon und E-Mail sofort bedienbar, Karte nur als externer Link
await gruppe(async () => {
  const { ctx, page } = await frisch();
  for (const seite of ["/", "/kontakt/"]) {
    await page.goto(BASE + seite, { waitUntil: "networkidle0" });
    const tel = await page.$$eval(`a[href="${TEL}"]`, (as) => as.length);
    const mail = await page.$$eval(`a[href="mailto:${EMAIL}"]`, (as) => as.length);
    ok(`Kontakt ${seite}: Telefon-Link (${tel}) und E-Mail-Link (${mail}) vorhanden, Telefon im Kopf als tel:`, tel >= 2 && mail >= 1 && (await page.$(`header a[href="${TEL}"]`)) !== null);
    const karte = await page.$$eval('a[href^="https://www.google.com/maps"]', (as) => as.map((a) => ({ t: a.target, r: a.rel })));
    ok(`Kontakt ${seite}: Karte nur als externer Link (neues Fenster, noopener), keine Einbettung`, karte.length >= 1 && karte.every((k) => k.t === "_blank" && /noopener/.test(k.r)) && (await page.$$("iframe")).length === 0);
  }
  ok("Formular: kein Formular sendet an einen Server (keine action-Attribute)", await page.evaluate(() => [...document.querySelectorAll("form")].every((f) => !f.getAttribute("action") && (f.method === "dialog" || f.method === "get"))));
  await page.goto(BASE + "/links/", { waitUntil: "networkidle0" });
  const links = await page.$$eval("main a[href^='http']", (as) => as.map((a) => ({ href: a.href, target: a.target, rel: a.rel })));
  ok(`Links: ${links.length} externe Links, alle https, neues Fenster, noopener`, links.length >= 8 && links.every((l) => l.href.startsWith("https://") && l.target === "_blank" && /noopener/.test(l.rel)));
  ok("Links: nicht erreichbare Ziele (Psychex) erscheinen nicht", !links.some((l) => /psychex/.test(l.href)));
  await ctx.close();
});

// 3) Tastatur: Sprunglink, Fokusring, Reihenfolge, aktuelle Seite
await gruppe(async () => {
  const { ctx, page } = await frisch();
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await page.keyboard.press("Tab");
  ok("Tastatur: erster Tab = «Zum Inhalt springen»", await page.evaluate(() => document.activeElement?.textContent?.trim() === "Zum Inhalt springen"));
  ok("Tastatur: Sprunglink wird beim Fokus sichtbar", await page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return r.width > 40 && r.height > 20 && r.top >= 0; }));
  await page.keyboard.press("Enter"); await warten(150);
  ok("Tastatur: Sprunglink setzt den Fokus auf <main>", await page.evaluate(() => location.hash === "#inhalt" && document.activeElement?.id === "inhalt"));
  await page.keyboard.press("Tab");
  const fokus = await page.evaluate(() => { const st = getComputedStyle(document.activeElement); return { stil: st.outlineStyle, breite: parseFloat(st.outlineWidth), tag: document.activeElement.tagName }; });
  ok("Tastatur: Fokusring sichtbar (Outline ≥ 2px)", fokus.stil !== "none" && fokus.breite >= 2, JSON.stringify(fokus));
  const reihenfolge = [];
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); reihenfolge.push(await page.evaluate(() => (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60))); }
  ok("Tastatur: Fokusreihenfolge folgt dem Aufbau (Sprunglink, Wortmarke, Navigation, Telefon)", /^Zum Inhalt/.test(reihenfolge[0]) && /Startseite/.test(reihenfolge[1]) && reihenfolge[2] === "Person" && reihenfolge[3] === "Rechtsgebiete" && reihenfolge[4] === "Coaching" && reihenfolge[5] === "Publikationen" && reihenfolge[6] === "Kontakt" && /^Anrufen/.test(reihenfolge[7]), reihenfolge.join(" → "));
  await page.goto(BASE + "/person/", { waitUntil: "networkidle0" });
  ok("Navigation: aria-current auf «Person»", await page.evaluate(() => document.querySelector('header a[aria-current="page"]')?.textContent?.trim() === "Person"));
  await page.goto(BASE + "/publikationen/" + publikationen()[0] + "/", { waitUntil: "networkidle0" });
  ok("Navigation: Artikelseite markiert «Publikationen» als aktuell", await page.evaluate(() => document.querySelector('header a[aria-current="page"]')?.textContent?.trim() === "Publikationen"));
  await ctx.close();
});

// 4) Handy (360 px): Menü als Dialog, Touch-Ziele, kein horizontales Scrollen, Einstieg im ersten Bildschirm
await gruppe(async () => {
  const { ctx, page } = await frisch({ breite: 360, hoehe: 740 });
  await page.goto(BASE + "/rechtsgebiete/", { waitUntil: "networkidle0" });
  const knopf = await page.$('header button[aria-haspopup="dialog"]');
  const box = await knopf.boundingBox();
  ok("Mobil: Menüknopf ≥ 44 × 44 px, beschriftet «Menü»", box.height >= 44 && box.width >= 44 && (await page.evaluate((b) => b.textContent.trim(), knopf)) === "Menü", `${Math.round(box.width)}×${Math.round(box.height)}`);
  ok("Mobil: Telefon im Kopf als Symbol-Link ≥ 44 px mit Beschriftung für Screenreader", await page.evaluate((tel) => { const a = document.querySelector(`header a[href="${tel}"]`); const r = a.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && /Anrufen/.test(a.getAttribute("aria-label") || ""); }, TEL));
  await knopf.click(); await warten(400);
  ok("Mobil: Menü füllt den Bildschirm, 7 Seitenlinks, Telefon und E-Mail vorhanden, Fokus im Dialog", await page.evaluate((tel, mail) => { const d = document.querySelector("dialog.menue[open]"); const r = d.getBoundingClientRect(); return r.width >= innerWidth - 1 && r.height >= innerHeight - 1 && d.querySelectorAll("nav a").length === 7 && !!d.querySelector(`a[href="${tel}"]`) && !!d.querySelector(`a[href="mailto:${mail}"]`) && d.contains(document.activeElement); }, TEL, EMAIL));
  const kleine = await page.evaluate(() => [...document.querySelectorAll("dialog.menue[open] nav a, dialog.menue[open] button, dialog.menue[open] a")].filter((e) => e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 44).length);
  ok("Mobil: alle Menüziele ≥ 44 px hoch", kleine === 0, `${kleine} zu klein`);
  let draussen = 0;
  for (let i = 0; i < 30; i++) { await page.keyboard.press("Tab"); if (!(await page.evaluate(() => document.querySelector("dialog.menue[open]").contains(document.activeElement) || document.activeElement === document.body))) draussen++; }
  ok("Mobil: Fokus bleibt im Menü (30-mal Tab)", draussen === 0, `${draussen} ausserhalb`);
  await page.keyboard.press("Escape"); await warten(250);
  ok("Mobil: Escape schliesst das Menü, Fokus zurück auf dem Knopf", await page.evaluate(() => !document.querySelector("dialog[open]") && document.activeElement?.getAttribute("aria-haspopup") === "dialog" && document.activeElement.getAttribute("aria-expanded") === "false"));
  await knopf.click(); await warten(300);
  await page.evaluate(() => document.querySelector('dialog.menue[open] nav a[href$="/kontakt/"]').click()); await warten(900);
  ok("Mobil: Menülink navigiert und schliesst das Menü", page.url().endsWith("/kontakt/") && !(await page.$("dialog[open]")), page.url().replace(BASE, ""));
  for (const s of alleSeiten()) {
    await page.goto(BASE + s, { waitUntil: "networkidle0" });
    ok(`Mobil ${s}: kein horizontales Scrollen`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  }
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  ok("Mobil: Einstieg zeigt Titel und «Kontakt aufnehmen» im ersten Bildschirm (360 × 740)", await page.evaluate(() => { const h = document.querySelector("h1").getBoundingClientRect(); const k = [...document.querySelectorAll("main a")].find((a) => a.textContent.trim().startsWith("Kontakt aufnehmen")).getBoundingClientRect(); return h.top >= 0 && k.bottom <= innerHeight; }));
  await ctx.close();
});

// 5) Publikationen: Inhaltsverzeichnis, Sprungmarken, Lesemass, Zitate, Druckansicht
await gruppe(async () => {
  const { ctx, page } = await frisch();
  const slug = "der-mann-ohne-eigenschaften";
  await page.goto(BASE + `/publikationen/${slug}/`, { waitUntil: "networkidle0" });
  const z = await page.evaluate(() => {
    const art = document.querySelector(".artikel");
    const hs = [...art.querySelectorAll("h2,h3,h4")];
    const toc = [...document.querySelectorAll('nav[aria-label="Inhalt"] a')];
    const sichtbareToc = toc.filter((a) => a.getBoundingClientRect().width > 0);
    const ziele = sichtbareToc.map((a) => a.getAttribute("href").slice(1));
    const p = art.querySelector("p");
    return { ueberschriften: hs.length, ohneId: hs.filter((h) => !h.id).length, tocSichtbar: sichtbareToc.length, fehlendeZiele: ziele.filter((id) => !document.getElementById(id)).length, zitate: art.querySelectorAll("blockquote").length, px: parseFloat(getComputedStyle(p).fontSize), lh: parseFloat(getComputedStyle(p).lineHeight) / parseFloat(getComputedStyle(p).fontSize), breiteEm: art.getBoundingClientRect().width / parseFloat(getComputedStyle(p).fontSize), scrollbar: art.scrollWidth <= art.clientWidth + 1 };
  });
  ok(`Artikel: ${z.ueberschriften} Zwischentitel, alle mit Sprungmarke`, z.ueberschriften >= 30 && z.ohneId === 0);
  ok(`Artikel: Inhaltsverzeichnis in der Randspalte mit ${z.tocSichtbar} Einträgen, alle Ziele vorhanden`, z.tocSichtbar === z.ueberschriften && z.fehlendeZiele === 0);
  ok(`Artikel: ${z.zitate} Blockzitate (im Original kursiv gesetzt)`, z.zitate >= 100);
  ok(`Artikel: Lesemass ${z.px}px, Zeilenhöhe ${z.lh.toFixed(2)}, Zeilenlänge ${z.breiteEm.toFixed(0)}em, kein seitliches Scrollen`, z.px >= 18 && z.lh >= 1.6 && z.breiteEm <= 70 && z.scrollbar);
  // Sprung ohne sanftes Scrollen messen (reduzierte Bewegung), sonst hängt das Ergebnis von der Scrolldauer ab
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.evaluate(() => document.querySelector('nav[aria-label="Inhalt"] a[href="#iv-der-fall-moosbrugger"]').click()); await warten(900);
  ok("Artikel: Sprung über das Inhaltsverzeichnis landet auf der Überschrift (nicht verdeckt, im oberen Bereich)", await page.evaluate(() => { const r = document.getElementById("iv-der-fall-moosbrugger").getBoundingClientRect(); return r.top >= 0 && r.top < 200; }));
  ok("Artikel: aktueller Abschnitt im Inhaltsverzeichnis markiert", await page.evaluate(() => ["#iv-der-fall-moosbrugger", "#1-moosbrugger"].includes(document.querySelector('nav[aria-label="Inhalt"] a[aria-current="true"]')?.getAttribute("href"))));
  ok("Artikel: «Nach oben», Rückweg zur Übersicht und Hinweis auf die Quelle vorhanden", await page.evaluate(() => !!document.querySelector('main a[href="#artikel"]') && !!document.querySelector('main a[href$="/publikationen/"]') && !!document.querySelector('main a[href^="https://www.rechtsanwaltbessler.ch/"]')));
  await page.emulateMediaFeatures([]);
  await page.emulateMediaType("print"); await warten(200);
  const druck = await page.evaluate(() => ({ kopf: getComputedStyle(document.querySelector("header.kopf")).display, fuss: getComputedStyle(document.querySelector("footer")).display, rand: getComputedStyle(document.querySelector("aside.rand")).display, text: getComputedStyle(document.querySelector(".artikel p")).fontSize }));
  ok("Artikel: Druckansicht blendet Kopfzeile, Fusszeile und Randspalte aus", druck.kopf === "none" && druck.fuss === "none" && druck.rand === "none", JSON.stringify(druck));
  await page.emulateMediaType(null);
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(BASE + `/publikationen/${slug}/`, { waitUntil: "networkidle0" });
  ok("Artikel mobil: Inhaltsverzeichnis eingeklappt über dem Text, aufklappbar", await page.evaluate(() => { const d = document.querySelector("details.inhalt-mobil"); if (!d || d.open) return false; d.querySelector("summary").click(); return d.open && d.querySelectorAll("a").length > 30; }));
  ok("Artikel mobil: Lesetext ≥ 18 px, kein horizontales Scrollen", await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".artikel p")).fontSize) >= 18 && document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  for (const s of publikationen()) {
    await page.goto(BASE + `/publikationen/${s}/`, { waitUntil: "networkidle0" });
    ok(`Publikation ${s}: genau eine h1, Autor und Hinweis auf historischen Text sichtbar`, await page.evaluate(() => document.querySelectorAll("main h1").length === 1 && document.body.textContent.includes("Michael Bessler") && document.body.textContent.includes("keine aktuelle Rechtsauskunft")));
  }
  await ctx.close();
});

// 6) mailto-Formular: Prüfung, kodierter Link, kein Versand. Die Navigation zu mailto: wird über das Chrome-Protokoll
//    beobachtet (Page.frameRequestedNavigation); es öffnet sich kein Programm, und es wird nichts gesendet.
await gruppe(async () => {
  const { ctx, page, extern } = await frisch();
  const cdp = await page.createCDPSession();
  await cdp.send("Page.enable");
  const navigationen = [];
  cdp.on("Page.frameRequestedNavigation", (e) => navigationen.push(e.url));
  cdp.on("Page.frameScheduledNavigation", (e) => navigationen.push(e.url));
  const gesendet = [];
  page.on("request", (r) => { if (!["GET", "HEAD", "OPTIONS"].includes(r.method())) gesendet.push(`${r.method()} ${r.url()}`); });
  await page.goto(BASE + "/kontakt/", { waitUntil: "networkidle0" });
  ok("Formular: Knopf heisst «E-Mail vorbereiten», keine Versandbestätigung im Text", await page.evaluate(() => document.querySelector('form button[type="submit"]').textContent.trim() === "E-Mail vorbereiten" && !/gesendet|verschickt/.test(document.querySelector("form").textContent)));
  ok("Formular: Hinweis «kein Mandat» und Bitte um keine vertraulichen Details sichtbar", await page.evaluate(() => /kein Mandat/.test(document.querySelector("form").textContent) && /keine vertraulichen Falldetails/.test(document.querySelector("form").textContent)));
  ok("Formular: Felder Name, E-Mail, Telefon, Betreff, Nachricht mit sichtbaren Beschriftungen; kein Datei-Upload", await page.evaluate(() => { const f = document.querySelector("form"); const namen = [...f.querySelectorAll("input,select,textarea")].map((i) => i.name); return namen.join(",") === "Name,E-Mail,Telefon,Betreff,Nachricht" && !f.querySelector('input[type="file"]') && [...f.querySelectorAll("input,select,textarea")].every((i) => !!f.querySelector(`label[for="${i.id}"]`)); }));
  await page.evaluate(() => document.querySelector('form button[type="submit"]').click()); await warten(200);
  const fehler = await page.evaluate(() => [...document.querySelectorAll('form [role="alert"]')].map((e) => e.textContent));
  ok("Formular: leeres Absenden zeigt drei Fehlermeldungen am Feld, Fokus im ersten Feld, kein mailto", fehler.length === 3 && (await page.evaluate(() => document.activeElement?.name === "Name" && document.activeElement.getAttribute("aria-invalid") === "true")) && !navigationen.some((u) => u.startsWith("mailto:")), fehler.join(" | "));
  await page.type('form input[name="Name"]', "Testperson Fiktiv & Co");
  await page.type('form input[name="E-Mail"]', "keine-adresse");
  await page.evaluate(() => document.querySelector('form button[type="submit"]').click()); await warten(200);
  ok("Formular: ungültige E-Mail → Fehlermeldungen nur für E-Mail und Nachricht, kein mailto", (await page.$$('form [role="alert"]')).length === 2 && !navigationen.some((u) => u.startsWith("mailto:")));
  await page.click('form input[name="E-Mail"]', { clickCount: 3 }); await page.type('form input[name="E-Mail"]', "test@example.com");
  await page.type('form input[name="Telefon"]', "079 000 00 00");
  await page.select('form select[name="Betreff"]', "mietrecht");
  await page.type('form textarea[name="Nachricht"]', "Prüfung & Test, Zeile 1\nZeile 2 mit #Raute?");
  await page.evaluate(() => document.querySelector('form button[type="submit"]').click()); await warten(700);
  const mailto = navigationen.find((u) => u.startsWith("mailto:")) ?? "";
  const dekodiert = (() => { try { return decodeURIComponent(mailto); } catch { return ""; } })();
  ok(`Formular: gültig absenden erzeugt mailto an ${EMAIL} mit Name, Telefon, Betreff und Nachricht`, mailto.startsWith(`mailto:${EMAIL}?subject=`) && dekodiert.includes("Testperson Fiktiv & Co") && dekodiert.includes("Telefon: 079 000 00 00") && dekodiert.includes("Betreff: Mietrecht") && dekodiert.includes("Zeile 2 mit #Raute?"), dekodiert.slice(0, 110).replaceAll("\n", " ⏎ "));
  ok("Formular: Sonderzeichen kodiert (kein rohes «&», «#», Leerzeichen oder Zeilenumbruch im Link)", !/[\s#]/.test(mailto) && (mailto.match(/&/g) ?? []).length === 1 && mailto.includes("%0A") && mailto.includes("%26") && mailto.includes("%23"));
  const status = await page.evaluate(() => document.querySelector('form [role="status"]').textContent);
  ok("Formular: Hinweis nach dem Klick nennt das E-Mail-Programm und die Adresse (keine Erfolgsmeldung)", /E-Mail-Programm/.test(status) && status.includes(EMAIL) && !/gesendet/.test(status), status.slice(0, 80));
  ok("Formular: nichts an einen Server gesendet, keine Anfragen an fremde Hosts", gesendet.length === 0 && extern.length === 0, [...gesendet, ...extern].join(","));
  await ctx.close();
});

// 7) Alte Adressen: Weiterleitungsseiten führen auf die neuen Seiten
await gruppe(async () => {
  const { ctx, page } = await frisch();
  for (const w of weiterleitungen) {
    await page.goto(BASE + w.alt, { waitUntil: "networkidle0" }); await warten(300);
    ok(`Weiterleitung ${w.alt} → ${w.neu}`, page.url() === BASE + w.neu || page.url() === BASE + w.neu + "#", page.url().replace(BASE, ""));
  }
  await ctx.close();
});

// 8) Fehlerseite, Direktaufrufe, Neuladen
await gruppe(async () => {
  const { ctx, page } = await frisch();
  const r = await page.goto(BASE + "/diese-seite-gibt-es-nicht/", { waitUntil: "networkidle0" });
  ok("Fehlerseite: 404 mit gestalteter Seite und Link zur Startseite", r.status() === 404 && (await page.evaluate(() => document.querySelector("h1")?.textContent.includes("gibt es nicht") && !!document.querySelector('main a[href$="/rechtsanwalt-bessler-demo/"], main a[href="/"]'))));
  for (const s of alleSeiten()) {
    const r2 = await page.goto(BASE + s, { waitUntil: "networkidle0" });
    await page.reload({ waitUntil: "networkidle0" });
    ok(`Direktaufruf + Neuladen ${s}: 200, genau eine h1`, r2.status() === 200 && (await page.evaluate(() => document.querySelectorAll("main h1").length === 1)));
  }
  await ctx.close();
});

// 9) Reduzierte Bewegung und dunkles Schema
await gruppe(async () => {
  const { ctx, page } = await frisch({ reduziert: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  ok("Reduzierte Bewegung: kein scroll-behavior smooth", (await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)) === "auto");
  ok("Reduzierte Bewegung: keine Übergänge auf Knöpfen, Links, Navigation und Aufklappern", await page.evaluate(() => { const els = [...document.querySelectorAll(".knopf, .textlink, .navlink, summary, .zeile-pfeil")]; return els.length > 0 && els.every((el) => parseFloat(getComputedStyle(el).transitionDuration) <= 0.011); }));
  await ctx.close();
  const d = await frisch({ dunkel: true });
  await d.page.goto(BASE + "/", { waitUntil: "networkidle0" });
  const farben = await d.page.evaluate(() => ({ bg: getComputedStyle(document.body).backgroundColor, text: getComputedStyle(document.body).color }));
  ok("Dunkles Schema: dunkler Grund, helle Schrift", /rgb\(21, 22, 20\)/.test(farben.bg) && /rgb\(236, 235, 228\)/.test(farben.text), JSON.stringify(farben));
  await d.ctx.close();
});

await browser.close();
mkdirSync("pruefung", { recursive: true });
writeFileSync("pruefung/funktionen.json", JSON.stringify(ergebnisse, null, 1));
const fehler = ergebnisse.filter((e) => !e.ok);
console.log(`\n${ergebnisse.length} Prüfungen, ${fehler.length} fehlgeschlagen → pruefung/funktionen.json`);
process.exitCode = fehler.length ? 1 : 0;
