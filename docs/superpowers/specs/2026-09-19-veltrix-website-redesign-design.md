# VELTRIX Website Redesign — Design Specification

Date: 2026-09-19
Status: Design approved in chat, implementation not started
Project: GxCracks/veltrix-client
Primary target: GitHub Pages landing page

## 1. Objective

Redesign the existing VELTRIX public website so it feels cleaner, more premium, more trustworthy, and easier to understand at a glance while preserving the current Beta / Early Access positioning.

The redesign should keep the dark VELTRIX identity, but reduce visual clutter, excessive cyan glow, dense card layouts, and sci-fi decoration. The result should look closer to polished gaming software / launcher product pages than a fan-made Minecraft site.

The page must continue to work as a static GitHub Pages site and must not require a backend for the redesign.

## 2. Success Criteria

The redesign is successful when:

- the page has a clear visual hierarchy and more whitespace;
- the main Windows Beta download is immediately visible;
- macOS and Linux are clearly marked as Coming Soon;
- VELTRIX Beta / Early Access status is visible without dominating the whole page;
- major product capabilities are understandable in a few seconds;
- the launcher showcase is larger and more prominent than the shop preview;
- the page includes new Why VELTRIX, Supported Platforms, Version & Mod Support, and Beta Status / Roadmap sections;
- the Discord community/support area is visually clearer;
- existing GitHub Pages deployment, canonical metadata, download links, privacy page, and Discord invite continue to work;
- no unfinished feature is presented as fully available unless the repository/site data supports that claim;
- the design works on desktop, tablet, and mobile.

## 3. Non-Goals

This redesign does not:

- build macOS or Linux versions of the client;
- add a secure backend, account portal, payments, or admin dashboard;
- add real commerce functionality to the preview store;
- claim unsupported or unfinished features are production-ready;
- replace the current Windows installer pipeline;
- remove the Beta / Early Access warning.

## 4. Visual Direction

### 4.1 Overall Style

Use a premium dark UI with restrained accents:

- nearly black background;
- dark charcoal / graphite surfaces;
- white and soft gray typography;
- cyan used only for primary highlights and interactions;
- subtle green only for positive status indicators;
- thin low-contrast borders;
- soft blur / glass effects only where useful;
- minimal glow rather than constant neon glow;
- larger spacing between sections;
- fewer but larger cards;
- more generous typography sizing.

### 4.2 Avoid

Avoid:

- excessive cyan borders on every card;
- dense grids of many tiny boxes;
- decorative lines without information value;
- overly strong sci-fi HUD styling;
- too many simultaneous gradients/glows;
- tiny uppercase text everywhere;
- visual emphasis on the store over the client itself.

### 4.3 Brand Icons

Use the already local brand assets under `assets/brands/`:

- Windows logo for Windows;
- Apple logo for macOS;
- Tux/Linux icon for Linux;
- Discord logo for Discord.

These should remain locally hosted and visually normalized through CSS sizing rather than external CDN dependencies.

## 5. Information Architecture

The homepage should be reordered into the following sections.

### 5.1 Header

Keep a sticky header, but simplify it.

Left:
- VELTRIX logo;
- small `CLIENT BETA` sublabel.

Center / navigation:
- Home;
- Features;
- Platforms;
- Roadmap;
- News;
- Download;
- Support / Discord;
- Privacy.

Right:
- one compact primary Windows Beta download button;
- remove or greatly reduce the existing three-platform mini-card cluster from the header on smaller screens.

Mobile:
- use the existing menu toggle pattern;
- keep the main download reachable from the mobile menu or header CTA.

### 5.2 Hero

The hero becomes simpler and more product-focused.

Required content:

- `BETA / EARLY ACCESS — v0.8.2` status pill;
- `Minecraft Java Edition` eyebrow;
- main headline: `ONE CLIENT. MANY VERSIONS.`;
- concise supporting text explaining VELTRIX is an independent Minecraft Java client/launcher currently in Beta;
- primary Windows Beta download button;
- smaller macOS and Linux Coming Soon controls;
- one subtle trust/status row, such as `Windows Beta · Microsoft Login · Active Development`;
- hero artwork / world background remains, but with reduced visual noise and stronger content readability.

Remove or reduce:

- oversized side-copy decoration;
- duplicated status information;
- unnecessarily dense floating dashboard elements.

A compact status card can remain only if it adds useful information and does not compete with the primary CTA.

### 5.3 Why VELTRIX

Add a dedicated section with 3–6 larger cards.

Recommended cards:

- Performance;
- Multi-Version Support;
- Modern Launcher;
- Microsoft Login;
- Mods & Customization;
- Community Driven.

Each card should use:

- one simple icon;
- one clear heading;
- one or two short sentences;
- restrained hover animation.

Do not use unsupported absolute claims such as guaranteed FPS increases or zero lag.

### 5.4 Launcher Showcase

Make the launcher preview one of the largest sections on the page.

Layout:

- large launcher image on one side;
- text and feature list on the other;
- stack vertically on mobile.

Feature chips / points may include, only where supported or clearly marked by status:

- Version Manager;
- Fabric support;
- Mods;
- Shaders;
- Friends;
- Voice Chat;
- Cosmetics;
- Auto Updates.

If a feature is not currently available, show `Testing` or `Planned` rather than implying it is released.

The current small store preview should no longer dominate the launcher showcase.

### 5.5 Supported Platforms

Add a dedicated three-card platform section.

Windows:
- logo;
- `Windows`;
- `Beta available`;
- version `0.8.2`;
- active download button.

macOS:
- Apple logo;
- `macOS`;
- `Coming Soon`;
- disabled download control.

Linux:
- Tux/Linux icon;
- `Linux`;
- `Coming Soon`;
- disabled download control.

Visually distinguish available vs. planned without making Coming Soon options look broken.

### 5.6 Version & Mod Support

Add a clean section describing compatibility and the intended ecosystem.

Supported statements should be phrased conservatively.

Possible content:

- Minecraft Java Edition;
- multi-version launcher support;
- Fabric integration/support where currently applicable;
- mods and resource packs;
- Modrinth / CurseForge only as available/planned according to current implementation status;
- shaders only according to current implementation status.

Do not claim universal compatibility.

### 5.7 Beta Status / Roadmap

Add a clear product-status section.

Use statuses such as:

- Available;
- Testing;
- Planned.

Suggested rows:

- Windows Beta — Available;
- Launcher Core — Available / Testing according to current implementation;
- Microsoft Login — reflect current real state;
- macOS — Planned / In Development;
- Linux — Planned / In Development;
- Voice / Social / Cosmetics — mark individually according to real status.

The section should explain that VELTRIX is under active development and may contain bugs.

Avoid dates unless they are actually committed to.

### 5.8 News

Retain the existing `news.json`-driven content, but redesign presentation.

Use 2–3 larger cards visible by default with:

- date;
- version / category;
- headline;
- short summary.

Keep the data-driven rendering in `script.js` where practical.

### 5.9 Store Preview

The store preview remains optional and secondary.

Preferred treatment:

- move below core product/roadmap sections;
- reduce to a compact preview strip or 2–3 representative cards;
- clearly label it as `Preview` where purchase functionality is not live;
- avoid letting fictional prices or unfinished commerce features look like a currently functioning store.

If needed for clarity, existing preview items can remain but should receive less visual weight.

### 5.10 Download Section

Create a strong standalone download section near the bottom.

Content:

- VELTRIX Beta v0.8.2;
- Windows 10/11;
- Early Access / Beta warning;
- primary installer link;
- Windows logo;
- macOS and Linux Coming Soon indicators;
- Discord bug-report link;
- optional future placeholder for SHA-256, but do not invent a hash.

The current installer URL must remain:

`https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe`

### 5.11 Discord / Community

Give Discord a clearer dedicated community panel.

Content:

- local Discord logo;
- `Join the VELTRIX Discord`;
- Support;
- Bug Reports;
- Updates;
- Community;
- one prominent CTA.

Official current invite:

`https://discord.gg/5WteV2B68C`

### 5.12 Footer

Simplify the footer.

Include:

- VELTRIX Client Beta branding;
- Features;
- Download;
- Discord / Support;
- Privacy;
- GitHub repository link where appropriate;
- Beta disclaimer;
- independent-project / no-affiliation statement already used by the project.

## 6. Content Rules

The redesign must preserve truthful status communication.

Rules:

- `Beta`, `Early Access`, `Testing`, `Planned`, and `Coming Soon` must be used consistently;
- do not label macOS/Linux as downloadable until builds actually exist;
- do not claim Microsoft login is fully working unless the current implementation is verified;
- do not promise compatibility with every Minecraft version, mod, shader, or third-party client without evidence;
- avoid absolute performance guarantees;
- keep the independent-project disclaimer.

## 7. Responsive Behavior

### Desktop

- max-width content container around the existing wide desktop range;
- hero can use split content / artwork;
- launcher showcase uses two columns;
- platform cards show in one row;
- Why VELTRIX can use 3-column or 2x3 layout.

### Tablet

- reduce navigation density;
- stack complex two-column sections as needed;
- preserve large CTA targets.

### Mobile

- single-column layout;
- mobile menu;
- no horizontal overflow;
- platform cards stack;
- button labels remain readable;
- launcher preview retains 16:9 ratio;
- decorative effects are reduced for performance and readability.

## 8. Accessibility

Maintain or improve:

- semantic section headings;
- meaningful `alt` text for informational images;
- `aria-hidden` for decorative brand icons where text already names the platform;
- keyboard-accessible links and controls;
- visible focus states;
- sufficient text contrast;
- disabled Coming Soon controls should not masquerade as active links.

## 9. Performance

The page should remain lightweight.

Guidelines:

- keep brand SVGs local;
- reuse existing optimized images where possible;
- avoid heavy frameworks;
- use CSS/vanilla JS only unless the current architecture changes later;
- reduce unnecessary animated effects on mobile;
- respect `prefers-reduced-motion` if animations are expanded.

## 10. Files Expected To Change

Primary files:

- `index.html` — new section structure and revised content;
- `style.css` — new layout, spacing, typography, responsive rules, cards, platform section, roadmap, download, community;
- `script.js` — only where needed for navigation/news/reveal behavior and any new lightweight interactions;
- `tests/github_pages_domain_contract.sh` — only if structure-specific expectations need safe updates;
- `tests/site_contract.sh` and/or design contract tests — update/add assertions for the new required sections and local assets.

Existing local brand SVGs under `assets/brands/` should be reused.

## 11. GitHub Pages / Build Constraints

Do not break the current deployment pipeline.

Must preserve:

- GitHub Pages project URL: `https://gxcracks.github.io/veltrix-client/`;
- no `CNAME` while using that project URL;
- canonical metadata injection from `scripts/build-site.py`;
- current privacy canonical URL;
- current Windows installer URL;
- current Discord invite;
- `_site` generation via `scripts/build-site.py`;
- `.github/workflows/pages.yml` deployment path.

The redesign must pass the GitHub Pages contract before deployment.

## 12. Testing Strategy

Implementation should use regression-first changes where practical.

Required verification:

1. Add/update a site design contract that checks for the new required sections, including:
   - Why VELTRIX;
   - Supported Platforms;
   - Roadmap / Beta Status;
   - Download;
   - Discord CTA;
   - local Windows/Apple/Linux/Discord assets.
2. Run the design/site contract and confirm it fails for the missing new structure before implementation.
3. Implement the redesign.
4. Run:
   - site/design contract tests;
   - `tests/github_pages_domain_contract.sh`;
   - `scripts/build-site.py` indirectly through the Pages contract;
   - any other existing public-site contract tests that cover `index.html`.
5. Push only after tests pass.
6. Confirm the GitHub Pages workflow completes successfully.
7. Verify the live site after deployment.

## 13. Migration / Risk Control

The redesign should be implemented as a focused static-site change.

Risk controls:

- preserve current download URLs exactly;
- preserve the Discord invite exactly;
- preserve privacy link and canonical behavior;
- avoid unnecessary changes to launcher/client code;
- keep existing `news.json` data compatibility;
- avoid introducing external runtime dependencies;
- ensure Coming Soon controls are non-functional until binaries exist;
- keep Beta status visible throughout the redesign.

## 14. Final Acceptance Checklist

Before declaring the redesign complete:

- [ ] Hero is cleaner and focused on the Windows Beta download.
- [ ] Why VELTRIX section exists.
- [ ] Launcher showcase is larger and clearer.
- [ ] Supported Platforms section exists with Windows, macOS, Linux.
- [ ] Tux/Linux icon is used for Linux.
- [ ] Version & Mod Support section exists.
- [ ] Beta Status / Roadmap section exists.
- [ ] News layout is cleaner.
- [ ] Store preview is visually secondary.
- [ ] Standalone Download section exists.
- [ ] Discord Community section exists and uses the current invite.
- [ ] Footer is simplified.
- [ ] Beta / Early Access messaging remains accurate.
- [ ] No unsupported availability claims were added.
- [ ] Desktop/tablet/mobile layouts are covered.
- [ ] Accessibility basics are preserved.
- [ ] GitHub Pages domain contract passes.
- [ ] Site/design tests pass.
- [ ] GitHub Pages deployment succeeds.
- [ ] Live site is verified after deployment.
