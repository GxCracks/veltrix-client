# NFL Item-Verleih Website – Komplettumbau Design-Spezifikation

## Ziel

Die bestehende öffentliche Website unter dem bisherigen Veltrix-GitHub-Pages-Projekt wird vollständig zu einer **NFL Item-Verleih Website** umgebaut. Der öffentliche Auftritt soll ausschließlich NFL-Verleih zeigen. Veltrix-Branding, Veltrix-Downloads, Veltrix-Texte und Veltrix-Navigation werden vollständig entfernt.

Die Website dient als zentrale öffentliche Anlaufstelle für den NFL Item-Verleih auf dem **OPSUCHT Minecraft Server**.

## Hauptbranding

- Anzeigename: **NFL Item-Verleih**
- Kurzname: **NFL Verleih**
- Farbstil: Schwarz / Dunkelgrau / Emerald / Neon-Grün
- Stil: clean, modern, hochwertig, technisch
- Keine Veltrix-Logos oder Veltrix-Bezeichnungen mehr
- Responsive für Desktop und Mobile

## Öffentliche Hauptseite

Die Startseite erhält folgende Bereiche:

### 1. Hero

- Titel: **NFL Item-Verleih**
- Untertitel: **Der Item-Verleih auf dem OPSUCHT Minecraft Server**
- Kurze Beschreibung des Systems
- Primärer CTA: **Discord beitreten**
- Sekundärer CTA: **App herunterladen**

Discord-Link:
`https://discord.gg/UvkevzwuWR`

### 2. App-Download

Der Download-Bereich wird auf eine spätere native Windows-App vorbereitet.

Aktueller Zustand:
- Plattform: Windows
- Download-Button sichtbar
- Status: **Coming Soon**
- Kein Download der vorhandenen ZIP
- Keine Fake-EXE
- Später kann die echte `.exe` ohne Redesign verlinkt werden

Vorgesehene spätere Beschriftung:
- **NFL Verleih für Windows herunterladen**
- Windows 10/11
- Versionsanzeige
- Changelog/Release-Hinweis optional

### 3. Funktionen

Darstellung der Kernfunktionen:

- Discord-Login / Discord-Verifizierung
- Mitgliedschaftsprüfung
- Item-Inventar
- Sets
- One-Click-Ausleihe
- Rückgabe
- Cooldowns
- Leihzeiten
- Bestandsanzeige
- Team-/Supportbereich

### 4. Mitgliedschaften

Aktive Stufen:

**Mitglied**
- 4.000.000 $ / Monat
- 4 Items
- 90 Minuten Leihzeit
- 20 Minuten Cooldown

**Mitglied+**
- 6.500.000 $ / Monat
- 6 Items
- 120 Minuten Leihzeit
- 10 Minuten Cooldown

**NFL VIP**
- 10.000.000 $ / Monat
- 8 Items
- 180 Minuten Leihzeit
- 5 Minuten Cooldown

Die Website darf keine Tagesleihen oder frei wählbaren Leihzeiten bewerben.

### 5. Discord / Support

Ein eigener Support- und Community-Bereich wird eingebaut.

Link für:
- Support
- Serverbeitritt
- Community
- Fragen zum Verleih

Ziel:
`https://discord.gg/UvkevzwuWR`

## Rechtliche Seiten

Es werden zwei eigene Seiten innerhalb derselben NFL-Website bereitgestellt:

### Datenschutz

Pfad:
`/datenschutz/`

Inhaltlich berücksichtigt:
- Discord OAuth
- Discord-ID
- Benutzername
- Avatar
- Discord-Servermitgliedschaft
- Rollenprüfung
- Minecraft-Name
- Mitgliedschaft
- Ausleihvorgänge
- Sets
- Regelbestätigung
- Speicherung technischer Sitzungsdaten
- Hinweis, dass keine Discord-Passwörter gespeichert werden
- Kontakt über NFL Discord

Die Seite enthält:
`<meta name="robots" content="noindex,nofollow,noarchive">`

### Nutzungsbedingungen

Pfad:
`/nutzungsbedingungen/`

Inhaltlich berücksichtigt:
- Zweck des NFL Item-Verleihs
- Nutzung auf OPSUCHT
- Mitgliedschaften
- Leihlimits
- Rückgabe
- Cooldowns
- Missbrauch
- Sperren
- Discord-Verifizierung
- Verantwortlichkeit bei Verlust/Missbrauch
- Änderungen der Regeln
- Support über Discord

Auch diese Seite enthält:
`<meta name="robots" content="noindex,nofollow,noarchive">`

## Navigation

Neue Navigation:

- Start
- Funktionen
- Mitgliedschaften
- App
- Discord

Datenschutz und Nutzungsbedingungen werden im Footer verlinkt, nicht prominent in der Hauptnavigation.

## Footer

Footer enthält:

- NFL Item-Verleih
- OPSUCHT Minecraft Server
- Discord / Support
- App
- Datenschutz
- Nutzungsbedingungen

Keine Veltrix-Verweise.

## Bestehende GitHub-Pages-Adresse

Die bestehende GitHub-Pages-Projektadresse kann weiter genutzt werden:

`https://gxcracks.github.io/veltrix-client/`

Obwohl der Repository-Name technisch `veltrix-client` bleibt, zeigt die Website selbst ausschließlich NFL-Inhalte.

Rechtliche URLs:

`https://gxcracks.github.io/veltrix-client/datenschutz/`

`https://gxcracks.github.io/veltrix-client/nutzungsbedingungen/`

## GitHub Pages

Der vorhandene Pages-Workflow wird angepasst, sodass folgende Inhalte veröffentlicht werden:

- `/index.html`
- `/datenschutz/index.html`
- `/nutzungsbedingungen/index.html`
- alle neuen NFL-CSS-/JS-/Asset-Dateien

Der Build darf keine alten Veltrix-Inhalte mehr in `_site` kopieren.

## Entfernung alter Veltrix-Inhalte

Aus dem öffentlichen Build werden vollständig entfernt:

- Veltrix Branding
- Veltrix Logo
- Veltrix Client Texte
- Veltrix Download-Buttons
- Veltrix Releases
- Veltrix Support-Links
- Veltrix Privacy-Seite
- Veltrix News
- Veltrix Cosmetics-Navigation
- Veltrix Account-Navigation
- alte Veltrix-Weiterleitungen

Historische Dateien dürfen im Repository technisch bestehen bleiben, solange sie nicht mehr öffentlich ausgeliefert, verlinkt oder referenziert werden.

## Technische Anforderungen

- statische GitHub-Pages-kompatible Website
- keine Secrets im Frontend
- keine Bot-Tokens
- keine Client-Secrets
- keine privaten API-Schlüssel
- HTTPS-kompatibel
- keine Mixed-Content-Links
- responsive
- direkte Legal-URLs müssen HTTP 200 liefern
- keine 404-Weiterleitung zur alten Veltrix-Seite
- Discord-Link muss auf `https://discord.gg/UvkevzwuWR` zeigen

## Download-Verhalten

Da noch keine Windows-`.exe` vorliegt:

- Button bleibt sichtbar
- Status: **Coming Soon**
- kein toter Link
- kein ZIP-Download
- kein Dummy-Installer

Sobald eine echte `.exe` vorliegt, wird nur die Download-URL und Versionsanzeige ergänzt.

## Erfolgskriterien

Der Umbau ist abgeschlossen, wenn:

1. Die Startseite ausschließlich NFL-Verleih zeigt.
2. Keine sichtbaren Veltrix-Inhalte mehr vorhanden sind.
3. Discord-Support/Beitritt korrekt auf `https://discord.gg/UvkevzwuWR` zeigt.
4. Die App-Sektion für eine spätere Windows-`.exe` vorbereitet ist.
5. `/datenschutz/` funktioniert.
6. `/nutzungsbedingungen/` funktioniert.
7. Beide Legal-Seiten direkt per URL erreichbar sind.
8. GitHub Pages erfolgreich deployt.
9. Alle öffentlichen Seiten responsive sind.
10. Keine Secrets oder privaten Zugangsdaten im Repository landen.
