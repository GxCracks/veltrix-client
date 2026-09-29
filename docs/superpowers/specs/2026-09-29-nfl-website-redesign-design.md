# NFL Item-Verleih Website Redesign

## Ziel
Die GitHub-Pages-Website des Repos `GxCracks/veltrix-client` wird visuell komplett auf ein modernes NFL-Item-Verleih-Design umgebaut. Die Seite bleibt statisch und GitHub-Pages-kompatibel, erhält aber ein neues Landingpage-Layout, ein neues NFL-Logo, die zwei NFL-Skins als zentrales Hero-Visual sowie klarere Inhaltsbereiche.

## Anforderungen
- Beibehaltung der NFL-Item-Verleih-Ausrichtung für den OPSUCHT Minecraft Server.
- Abo-Stufen mit bestehenden Werten:
  - Mitglied: 4.000.000 $ / Monat, 4 Items, 90 Minuten, 20 Minuten Cooldown
  - Mitglied+: 6.500.000 $ / Monat, 6 Items, 120 Minuten, 10 Minuten Cooldown
  - NFL VIP: 10.000.000 $ / Monat, 8 Items, 180 Minuten, 5 Minuten Cooldown
- Discord-Link bleibt zentrale CTA.
- Datenschutz- und Nutzungsbedingungen bleiben verlinkt.
- Beide NFL-Skins werden sichtbar in das Gesamtdesign integriert.

## Umsetzung
- `index.html`: neue Struktur mit Hero, Abo-Sektion, Feature-Sektion, Item-Kategorien, Windows-App-Bereich und Community-Bereich.
- `style.css`: vollständiges Rework im schwarz-grünen Neon/Minecraft-Look, responsive Layouts, Glass-/Glow-Optik.
- `script.js`: mobile Navigation modernisiert, ansonsten bewusst schlank.
- `assets/nfl-mark.svg`: neues NFL-Logo als SVG.
- `assets/nfl-hero-skins.svg`: stilisierte Umsetzung der zwei bereitgestellten NFL-Skins als skalierbares Web-Asset.

## Technische Entscheidung
Kein Framework-Wechsel. Die Seite bleibt als statische HTML/CSS/JS-Seite bestehen, damit sie direkt über GitHub Pages deploybar bleibt.

## Erfolgskriterien
- Die Startseite sieht sichtbar moderner und hochwertiger aus.
- Das neue Design nutzt beide Skins als wiederkehrendes Kernelement.
- Die Inhalte zu Mitgliedschaften und Support bleiben klar lesbar.
- Mobile Navigation und responsive Darstellung funktionieren.
