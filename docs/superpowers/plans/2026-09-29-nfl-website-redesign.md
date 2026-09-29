# NFL Item-Verleih Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Die bestehende GitHub-Pages-Startseite vollständig in das neue NFL-Item-Verleih-Design mit neuem Logo und den zwei NFL-Skins überführen.

**Architecture:** Die Website bleibt statisches HTML/CSS/JS und wird ohne Framework-Wechsel direkt auf GitHub Pages ausgeliefert. `index.html` definiert die Landingpage-Struktur, `style.css` das responsive Neon-/Minecraft-Design, `script.js` ausschließlich die mobile Navigation. Medien liegen unter `assets/`.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, SVG, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-09-29-nfl-website-redesign-design.md`

## Global Constraints
- Kein Framework-Wechsel.
- Bestehende Abo-Werte unverändert übernehmen.
- Discord-CTA und Rechtsseiten beibehalten.
- Zwei NFL-Skins sichtbar im Hero und Community-Bereich verwenden.
- Responsive Darstellung für Desktop, Tablet und Mobile.

## Review Focus
- Navigation funktioniert auf schmalen Viewports und schließt nach Linkklick.
- Alle internen Anker zeigen auf vorhandene Sections.
- Alle Asset-Pfade existieren nach dem Commit.
- Abo-Werte entsprechen exakt dem Spec.
- GitHub Pages benötigt keine Build-Schritte.

---

### Task 1: Branding und Medien
- Neues NFL-Logo bereitstellen.
- Skin-Artwork einfügen.
- Asset-Pfade prüfen.

### Task 2: Landingpage-Struktur
- Hero, Navigation, Abo-Stufen, Features, Angebote, App und Community-Bereich einbauen.
- Bestehende Discord- und Rechtslinks beibehalten.
- Abo-Werte gegen das Spec prüfen.

### Task 3: Responsive Design
- Schwarzes/emeraldgrünes Neon-Design umsetzen.
- Karten, Hero, Logo und Skin-Visuals gestalten.
- Breakpoints für Desktop, Tablet und Mobile prüfen.

### Task 4: Navigation und Abschlussprüfung
- Mobile Navigation öffnen/schließen.
- Menü nach Linkklick und Desktop-Resize schließen.
- HTML/CSS/JS auf offensichtliche Syntax- und Pfadfehler prüfen.
