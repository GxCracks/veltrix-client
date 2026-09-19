# VELTRIX Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public VELTRIX GitHub Pages homepage into a cleaner premium Beta landing page with stronger product hierarchy, truthful platform/feature status, clearer downloads, roadmap, community, and responsive behavior.

**Architecture:** Keep the existing static-site architecture: semantic HTML in `index.html`, presentation in `style.css`, lightweight behavior/news rendering in `script.js`, and build/deployment through `scripts/build-site.py` plus GitHub Pages. No framework or backend is introduced. The redesign is protected by shell contract tests before changing production markup, then the homepage, CSS, and only necessary JavaScript selectors are updated while preserving current installer, Discord, canonical, privacy, and local brand-asset contracts.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Bash contract tests, Python 3 static-site build script, GitHub Pages / GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-19-veltrix-website-redesign-design.md`

## Global Constraints

- Public site URL remains `https://gxcracks.github.io/veltrix-client/`.
- Windows installer remains `https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe`.
- Discord invite remains `https://discord.gg/5WteV2B68C`.
- Current public version remains `0.8.2 Beta / Early Access`.
- macOS and Linux remain `Coming Soon`; no active download links are added for them.
- Use local brand assets under `assets/brands/`: Windows, Apple, Tux/Linux, Discord.
- Keep canonical metadata generation through `scripts/build-site.py` and do not add `CNAME`.
- Preserve `privacy.html` and its canonical URL.
- Keep `news.json` as the homepage news source and retain safe escaping in `script.js`.
- Do not claim unverified features are available; use `Available`, `Testing`, or `Planned`.
- Do not introduce a frontend framework, CDN icon dependency, backend, account portal, or payment flow.
- Maintain mobile/tablet/desktop layouts, keyboard accessibility, visible focus states, and reduced-motion support.

## Review Focus

- **Missing/empty news feed:** homepage must show the existing safe fallback instead of leaving a blank section; pin this in Task 5 by preserving the current `.catch()` fallback and `#news-grid` contract.
- **Mobile navigation density:** header and CTA must remain usable at narrow widths without horizontal overflow; pin this in Task 4 with responsive CSS assertions and manual viewport verification.
- **False availability signals:** macOS/Linux and unfinished features must never render as active downloads or `Available`; pin this in Tasks 1 and 3 with contract assertions for `Coming Soon`, `Testing`, and `Planned`.
- **Installer/support regressions:** redesign must not replace the current 0.8.2 installer or Discord invite; pin this in Tasks 1 and 6 with existing Pages contract plus updated public-distribution contract.
- **Motion/accessibility regressions:** decorative effects must not break reduced-motion users and disabled controls must not masquerade as links; pin this in Tasks 3–5 with semantic markup and retention of the existing reduced-motion branch.

---

## File Structure

- `index.html` — semantic homepage structure, copy, status labels, platform/download/community links.
- `style.css` — all redesigned layout, typography, cards, spacing, responsive behavior, focus states, and visual hierarchy.
- `script.js` — installer-link normalization, mobile navigation, news rendering, active navigation, reveal effects, optional store-preview behavior.
- `tests/design_v50_contract.sh` — new redesign-specific structural contract.
- `tests/site_contract.sh` — baseline public-site semantics and assets; update stale version/download wording if necessary.
- `tests/public_distribution_contract.sh` — align stale homepage installer expectation with the current 0.8.2 release.
- `tests/github_pages_domain_contract.sh` — preserve deployment/domain/brand/download/support guarantees; only add structure assertions if they belong to deployment safety.
- `scripts/build-site.py` — no redesign logic expected; verify unchanged behavior through existing contract.

---

### Task 1: Add the redesign contract and align stale release assertions

**Files:**
- Create: `tests/design_v50_contract.sh`
- Modify: `tests/public_distribution_contract.sh`
- Modify: `tests/site_contract.sh` only if its old `0.8.0` CTA assertion still blocks the current Beta copy.

**Interfaces:**
- Consumes: current `index.html`, `style.css`, local brand assets.
- Produces: one structural contract that later tasks must satisfy without weakening installer/support/build guarantees.

- [ ] **Step 1: Create a failing redesign contract**

Create `tests/design_v50_contract.sh` with these exact checks:

```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX="$ROOT/index.html"
STYLE="$ROOT/style.css"

for id in why-veltrix launcher-showcase platforms compatibility roadmap news download community; do
  grep -q "id=\"$id\"" "$INDEX" || { echo "Missing redesign section: $id"; exit 1; }
done

grep -q 'ONE CLIENT' "$INDEX"
grep -q 'MANY VERSIONS' "$INDEX"
grep -q 'BETA / EARLY ACCESS — v0.8.2' "$INDEX"
grep -q 'Beta available' "$INDEX"
grep -q 'macOS' "$INDEX"
grep -q 'Linux' "$INDEX"
grep -q 'Coming Soon' "$INDEX"
grep -q 'Available' "$INDEX"
grep -q 'Testing' "$INDEX"
grep -q 'Planned' "$INDEX"
grep -q 'https://discord.gg/5WteV2B68C' "$INDEX"
grep -q 'releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe' "$INDEX"

for icon in windows apple linux discord; do
  test -f "$ROOT/assets/brands/${icon}.svg"
  grep -q "assets/brands/${icon}.svg" "$INDEX"
done

# Coming-soon platform controls must not be downloadable links.
if grep -Eq '<a[^>]+(macOS|Linux)[^>]*>.*Coming Soon|<a[^>]+>[^<]*(macOS|Linux)[^<]*Coming Soon' "$INDEX"; then
  echo "Coming Soon platform rendered as active link"
  exit 1
fi

# CSS must contain the core redesign/responsive selectors.
for selector in '.section-heading' '.why-grid' '.showcase-grid' '.platform-grid' '.roadmap-grid' '.download-panel' '.community-panel'; do
  grep -Fq "$selector" "$STYLE" || { echo "Missing redesign style: $selector"; exit 1; }
done

grep -q '@media (max-width:' "$STYLE"
grep -q 'prefers-reduced-motion' "$STYLE"

echo 'DesignV50ContractTest: PASS'
```

- [ ] **Step 2: Run the new contract and verify RED**

Run:

```bash
bash tests/design_v50_contract.sh
```

Expected: FAIL on the first missing redesign section such as `why-veltrix`.

- [ ] **Step 3: Update the stale public distribution installer assertion**

In `tests/public_distribution_contract.sh`, replace:

```bash
grep -q 'releases/download/v0.8.0/VELTRIX-Setup-0.8.0.exe' "$ROOT/index.html"
```

with:

```bash
grep -q 'releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe' "$ROOT/index.html"
```

Do not change the ZIP-content checks; they validate the legacy packaged artifact rather than the homepage installer CTA.

- [ ] **Step 4: Align `tests/site_contract.sh` only where its homepage CTA is stale**

If the current test still contains:

```bash
grep -qi "DOWNLOAD VELTRIX 0.8.0" index.html || fail "download CTA missing"
```

replace it with:

```bash
grep -qi "DOWNLOAD VELTRIX BETA" index.html || fail "download CTA missing"
grep -qi "0.8.2" index.html || fail "current beta version missing"
```

Keep all privacy, disclaimer, news, logo, and project-documentation checks intact.

- [ ] **Step 5: Run the existing baseline tests**

Run:

```bash
bash tests/site_contract.sh
bash tests/public_distribution_contract.sh
bash tests/github_pages_domain_contract.sh
```

Expected: baseline/deployment tests PASS; `design_v50_contract.sh` remains RED until the redesign markup is implemented.

- [ ] **Step 6: Commit the contract-first changes**

```bash
git add tests/design_v50_contract.sh tests/public_distribution_contract.sh tests/site_contract.sh
git commit -m "test: define VELTRIX website redesign contract"
```

---

### Task 2: Rebuild the header and hero around one primary Windows Beta action

**Files:**
- Modify: `index.html`
- Modify: `style.css`

**Interfaces:**
- Consumes: local `assets/veltrix-logo-web.webp`, Windows/Apple/Linux SVG assets, current 0.8.2 installer URL.
- Produces: stable section anchors `#top`, `#features`, `#platforms`, `#roadmap`, `#news`, `#download`, `#community` used by navigation and `script.js` active-link logic.

- [ ] **Step 1: Extend the failing contract with header/hero semantics**

Add these checks to `tests/design_v50_contract.sh` before the final PASS line:

```bash
grep -q 'class="header-download"' "$INDEX"
grep -q 'class="hero-primary"' "$INDEX"
grep -q 'class="hero-trust"' "$INDEX"
grep -q 'href="#platforms"' "$INDEX"
grep -q 'href="#roadmap"' "$INDEX"
grep -q 'href="#community"' "$INDEX"
```

- [ ] **Step 2: Run the contract to confirm those checks are RED**

```bash
bash tests/design_v50_contract.sh
```

Expected: FAIL because `.header-download` / `.hero-primary` do not exist yet.

- [ ] **Step 3: Replace the dense header platform cluster with a compact CTA**

Implement this structure in `index.html`:

```html
<header class="site-header" id="top">
  <div class="shell header-inner">
    <a class="brand" href="#top" aria-label="VELTRIX Home">
      <img src="assets/veltrix-logo-web.webp" alt="VELTRIX logo">
      <span><strong>VELTRIX</strong><small>CLIENT BETA</small></span>
    </a>
    <button class="nav-toggle" aria-controls="main-nav" aria-expanded="false">MENU</button>
    <nav class="main-nav" id="main-nav">
      <a class="active" href="#top">Home</a>
      <a href="#features">Features</a>
      <a href="#platforms">Platforms</a>
      <a href="#roadmap">Roadmap</a>
      <a href="#news">News</a>
      <a href="#download">Download</a>
      <a href="#community">Support</a>
      <a href="privacy.html">Privacy</a>
    </nav>
    <a class="header-download" href="https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe">
      <img class="brand-icon" src="assets/brands/windows.svg" alt="" aria-hidden="true">
      <span>Download Beta</span>
    </a>
  </div>
</header>
```

- [ ] **Step 4: Replace the hero content with the cleaner hierarchy**

Use a hero copy block with:

```html
<div class="release-chip"><span></span>BETA / EARLY ACCESS — v0.8.2</div>
<p class="eyebrow">Minecraft Java Edition</p>
<h1 id="hero-title">ONE CLIENT.<br><span>MANY VERSIONS.</span></h1>
<p class="hero-lead">VELTRIX is an independent Minecraft Java client and launcher in active Beta. Download the Windows test build now; macOS and Linux are in development.</p>
<div class="hero-actions">
  <a class="hero-primary" href="https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe">
    <img class="brand-icon" src="assets/brands/windows.svg" alt="" aria-hidden="true">
    <span><strong>Download Windows Beta</strong><small>v0.8.2 · Windows 10/11 · Early Access</small></span>
  </a>
  <span class="hero-platform disabled"><img class="brand-icon" src="assets/brands/apple.svg" alt="" aria-hidden="true"><span>macOS<small>Coming Soon</small></span></span>
  <span class="hero-platform disabled"><img class="brand-icon" src="assets/brands/linux.svg" alt="" aria-hidden="true"><span>Linux<small>Coming Soon</small></span></span>
</div>
<div class="hero-trust"><span>Windows Beta</span><span>Microsoft Login</span><span>Active Development</span></div>
```

Keep the existing background artwork but remove the large side-copy and duplicated hero status blocks.

- [ ] **Step 5: Add the clean header/hero CSS**

In `style.css`, replace the old header mini-platform and hero status emphasis with rules centered on:

```css
.header-download{display:inline-flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:#f3f7f9;color:#071018;font-weight:800}
.hero-copy{max-width:760px;padding-top:clamp(72px,9vw,118px)}
.hero-primary{display:inline-flex;align-items:center;gap:14px;min-height:64px;padding:12px 18px;border-radius:12px;background:#f5f8fa;color:#071018;box-shadow:0 14px 40px rgba(0,0,0,.28)}
.hero-platform{display:inline-flex;align-items:center;gap:10px;min-height:64px;padding:12px 16px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.035)}
.hero-trust{display:flex;gap:18px;flex-wrap:wrap;margin-top:20px;color:var(--muted);font-size:.78rem}
```

Preserve restrained cyan only for the release pill/active state rather than every control border.

- [ ] **Step 6: Run the redesign contract**

```bash
bash tests/design_v50_contract.sh
```

Expected: still FAIL on later missing sections, not on header/hero checks.

- [ ] **Step 7: Commit the header/hero slice**

```bash
git add index.html style.css tests/design_v50_contract.sh
git commit -m "feat: simplify VELTRIX header and hero"
```

---

### Task 3: Add Why VELTRIX, launcher showcase, platforms, compatibility, and roadmap

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `tests/design_v50_contract.sh`

**Interfaces:**
- Consumes: `assets/launcher-live.svg`, brand SVG assets, status vocabulary `Available`, `Testing`, `Planned`.
- Produces: section IDs `#why-veltrix`, `#launcher-showcase`, `#platforms`, `#compatibility`, `#roadmap`; CSS selectors required by the redesign contract.

- [ ] **Step 1: Add content-specific assertions before implementation**

Add:

```bash
grep -q 'Performance' "$INDEX"
grep -q 'Multi-Version Support' "$INDEX"
grep -q 'Modern Launcher' "$INDEX"
grep -q 'Microsoft Login' "$INDEX"
grep -q 'Mods & Customization' "$INDEX"
grep -q 'Community Driven' "$INDEX"
grep -q 'assets/launcher-live.svg' "$INDEX"
grep -q 'Windows Beta' "$INDEX"
grep -q 'Minecraft Java Edition' "$INDEX"
grep -q 'Fabric' "$INDEX"
```

- [ ] **Step 2: Run RED**

```bash
bash tests/design_v50_contract.sh
```

Expected: FAIL on missing new section IDs and/or content.

- [ ] **Step 3: Add `#why-veltrix`**

Use six larger cards inside `.why-grid`, exactly covering:

- Performance — smoother/faster experience wording without guarantees.
- Multi-Version Support — launcher-managed Minecraft versions.
- Modern Launcher — cleaner launcher/workflow focus.
- Microsoft Login — official OAuth flow wording.
- Mods & Customization — Fabric/mod/resource-pack capability, conservative wording.
- Community Driven — feedback/support/update loop.

- [ ] **Step 4: Add `#launcher-showcase`**

Use a two-column `.showcase-grid`: large `assets/launcher-live.svg` preview plus descriptive copy and status chips. Chips must visibly distinguish released vs. unfinished features, for example:

```html
<ul class="feature-status-list">
  <li><span>Version Manager</span><strong class="status available">Available</strong></li>
  <li><span>Fabric Support</span><strong class="status available">Available</strong></li>
  <li><span>Friends & Social</span><strong class="status testing">Testing</strong></li>
  <li><span>Voice Chat</span><strong class="status testing">Testing</strong></li>
  <li><span>Cosmetics</span><strong class="status planned">Planned</strong></li>
</ul>
```

If repository evidence at implementation time contradicts any example status, use the more conservative status rather than upgrading it.

- [ ] **Step 5: Add `#platforms`**

Create `.platform-grid` with three cards:

```html
<article class="platform-card platform-windows">
  <img src="assets/brands/windows.svg" alt="Windows">
  <h3>Windows</h3>
  <span class="platform-state available">Beta available</span>
  <p>VELTRIX Beta v0.8.2 for Windows 10/11.</p>
  <a href="https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe">Download Beta</a>
</article>
<article class="platform-card platform-macos">
  <img src="assets/brands/apple.svg" alt="Apple">
  <h3>macOS</h3>
  <span class="platform-state planned">Coming Soon</span>
  <p>macOS support is in development.</p>
  <span class="platform-disabled" aria-disabled="true">Coming Soon</span>
</article>
<article class="platform-card platform-linux">
  <img src="assets/brands/linux.svg" alt="Linux">
  <h3>Linux</h3>
  <span class="platform-state planned">Coming Soon</span>
  <p>Linux support is in development.</p>
  <span class="platform-disabled" aria-disabled="true">Coming Soon</span>
</article>
```

Do not wrap macOS/Linux controls in `<a>` tags.

- [ ] **Step 6: Add `#compatibility`**

Use concise compatibility cards/rows for:

- Minecraft Java Edition;
- multi-version launcher support;
- Fabric support/integration;
- mods and resource packs;
- Modrinth / CurseForge only as `Planned` unless verified otherwise;
- shaders only as `Testing`/`Planned` unless verified otherwise.

Add an explicit note that universal mod/shader compatibility is not guaranteed.

- [ ] **Step 7: Add `#roadmap`**

Use `.roadmap-grid` and `.roadmap-item` rows with three visual statuses. Required entries:

- Windows Beta — Available;
- Launcher Core — Available or Testing based on current state;
- Microsoft Login — Testing unless current implementation is freshly verified as complete;
- macOS — Planned;
- Linux — Planned;
- Voice / Social — Testing or Planned;
- Cosmetics — Planned unless verified otherwise.

Include one sentence that the Beta may contain bugs and roadmap items can change.

- [ ] **Step 8: Add section-system CSS**

Define `.section-heading`, `.why-grid`, `.why-card`, `.showcase-grid`, `.feature-status-list`, `.status.available`, `.status.testing`, `.status.planned`, `.platform-grid`, `.platform-card`, `.platform-disabled`, `.compatibility-grid`, `.roadmap-grid`, `.roadmap-item` with restrained surfaces, 12–18px radii, larger spacing, soft shadows, and minimal cyan.

- [ ] **Step 9: Run the redesign contract**

```bash
bash tests/design_v50_contract.sh
```

Expected: later sections may still fail, but Tasks 2–3 structure checks pass.

- [ ] **Step 10: Commit the product-information slice**

```bash
git add index.html style.css tests/design_v50_contract.sh
git commit -m "feat: add VELTRIX product and roadmap sections"
```

---

### Task 4: Redesign News, secondary Store preview, Download, Community, and Footer

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `tests/design_v50_contract.sh`

**Interfaces:**
- Consumes: existing `#news-grid` JavaScript renderer, Discord URL, installer URL, local Discord/Windows/Apple/Linux assets.
- Produces: final lower-page hierarchy with `#news`, optional `#store`, `#download`, `#community`, simplified footer.

- [ ] **Step 1: Add failing lower-page assertions**

Add to `tests/design_v50_contract.sh`:

```bash
grep -q 'id="news-grid"' "$INDEX"
grep -q 'class="download-panel"' "$INDEX"
grep -q 'class="community-panel"' "$INDEX"
grep -q 'Support' "$INDEX"
grep -q 'Bug Reports' "$INDEX"
grep -q 'Updates' "$INDEX"
grep -q 'Community' "$INDEX"
grep -qi 'not affiliated' "$INDEX"
```

- [ ] **Step 2: Run RED**

```bash
bash tests/design_v50_contract.sh
```

Expected: FAIL on `.download-panel` / `.community-panel` until implemented.

- [ ] **Step 3: Keep News data-driven but simplify markup around it**

Retain:

```html
<section class="section news-section" id="news">
  <div class="shell">
    <div class="section-heading">
      <span>VELTRIX Network</span>
      <h2>Latest News</h2>
      <p>Updates, Beta changes and development notes.</p>
    </div>
    <div class="news-grid" id="news-grid">
      <article class="news-card skeleton">Loading news…</article>
    </div>
  </div>
</section>
```

Do not rename `#news-grid`.

- [ ] **Step 4: Reduce the store to a secondary preview**

Move the store below core product/roadmap sections and limit visible preview content to 2–3 representative cards or one horizontal preview strip. Every non-functional commerce control must visibly say `Preview`; do not add a checkout link.

- [ ] **Step 5: Add the standalone download panel**

Use `id="download"` and `.download-panel` with:

- Windows logo;
- `VELTRIX Beta v0.8.2`;
- Windows 10/11;
- Early Access warning;
- exact installer URL;
- macOS/Linux Coming Soon rows as non-links;
- Discord bug-report CTA;
- no fabricated SHA-256 value.

- [ ] **Step 6: Add the dedicated community panel**

Use `id="community"` and `.community-panel`:

```html
<section class="section community-section" id="community">
  <div class="shell community-panel">
    <img src="assets/brands/discord.svg" alt="Discord">
    <div>
      <span class="section-kicker">VELTRIX Community</span>
      <h2>Join the VELTRIX Discord</h2>
      <p>Support · Bug Reports · Updates · Community</p>
    </div>
    <a href="https://discord.gg/5WteV2B68C" target="_blank" rel="noopener noreferrer">Open Discord</a>
  </div>
</section>
```

- [ ] **Step 7: Simplify the footer**

Keep only VELTRIX Beta branding, feature/download/community/privacy/GitHub links, concise Beta disclaimer, and the existing independent/not-affiliated wording. Remove large decorative footer copy that competes with navigation.

- [ ] **Step 8: Add lower-page CSS**

Create `.news-section`, `.news-grid`, `.news-card`, `.store-preview`, `.download-panel`, `.download-platforms`, `.community-panel`, and simplified footer rules. Use larger gaps, fewer borders, and softer surfaces than the old dashboard design.

- [ ] **Step 9: Run the redesign contract**

```bash
bash tests/design_v50_contract.sh
```

Expected: PASS if Tasks 2–4 are complete and CSS selectors exist.

- [ ] **Step 10: Commit the lower-page slice**

```bash
git add index.html style.css tests/design_v50_contract.sh
git commit -m "feat: redesign VELTRIX news download and community sections"
```

---

### Task 5: Update JavaScript selectors and responsive/accessibility behavior

**Files:**
- Modify: `script.js`
- Modify: `style.css`
- Modify: `tests/design_v50_contract.sh`

**Interfaces:**
- Consumes: `.header-download`, `.hero-primary`, platform Windows download link, `#main-nav`, `#news-grid`, `.reveal`, optional `.store-preview` cards.
- Produces: consistent installer URL assignment, stable mobile nav, safe news fallback, active-section nav, reduced-motion behavior.

- [ ] **Step 1: Add JS contract checks**

Add to `tests/design_v50_contract.sh`:

```bash
grep -q "const windowsInstallerUrl = 'https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe'" "$ROOT/script.js"
grep -q "document.getElementById('news-grid')" "$ROOT/script.js"
grep -q "News temporarily unavailable" "$ROOT/script.js"
grep -q "prefers-reduced-motion" "$ROOT/script.js"
```

- [ ] **Step 2: Run the contract before selector changes**

```bash
bash tests/design_v50_contract.sh
```

Expected: existing JS safety checks pass; after the old HTML classes were removed, installer normalization must be updated to the new selector names.

- [ ] **Step 3: Update only the installer-link selector list**

Change:

```js
document.querySelectorAll('.hero-download,.mini-platform.windows,.platform-action').forEach(link => {
  link.setAttribute('href', windowsInstallerUrl);
});
```

into:

```js
document.querySelectorAll('.header-download,.hero-primary,.platform-windows a,.download-panel a[href*="VELTRIX-Setup-"]').forEach(link => {
  link.setAttribute('href', windowsInstallerUrl);
});
```

Do not assign installer URLs to macOS/Linux disabled controls.

- [ ] **Step 4: Preserve the safe news implementation**

Keep `esc()`, UTC date formatting, three-item limit, `#news-grid` target, and this fallback behavior:

```js
.catch(() => {
  const root = document.getElementById('news-grid');
  if (root) root.innerHTML = '<article class="news-card"><h3>News temporarily unavailable</h3><p>Please try again later.</p></article>';
});
```

- [ ] **Step 5: Preserve mobile navigation and reduced-motion behavior**

Keep the existing `aria-expanded` update, close-on-nav-click behavior, `IntersectionObserver` fallback, and `matchMedia('(prefers-reduced-motion: reduce)')` branch.

If hero pointer movement is retained, reduce amplitude and keep it disabled for reduced-motion users. If removed, delete both its JS and CSS custom-property dependency together.

- [ ] **Step 6: Add responsive CSS for the new structure**

At minimum cover:

```css
@media (max-width:1100px){.main-nav{display:none}.main-nav.open{display:flex}.nav-toggle{display:inline-flex}.showcase-grid{grid-template-columns:1fr}.why-grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:760px){.shell{width:min(100% - 28px,1530px)}.header-download{display:none}.hero{min-height:auto}.hero-actions{flex-direction:column}.why-grid,.platform-grid,.compatibility-grid,.roadmap-grid{grid-template-columns:1fr}.community-panel{grid-template-columns:1fr}.news-grid{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
```

Adapt exact property values to the existing stylesheet, but preserve these behaviors.

- [ ] **Step 7: Add visible keyboard focus**

Ensure interactive elements have a visible focus style such as:

```css
a:focus-visible,button:focus-visible{outline:2px solid var(--cyan);outline-offset:4px}
```

- [ ] **Step 8: Run all site-facing contracts**

```bash
bash tests/design_v50_contract.sh
bash tests/site_contract.sh
bash tests/public_distribution_contract.sh
bash tests/github_pages_domain_contract.sh
```

Expected: all PASS.

- [ ] **Step 9: Commit behavior/responsive changes**

```bash
git add script.js style.css tests/design_v50_contract.sh
git commit -m "fix: align VELTRIX site behavior with redesign"
```

---

### Task 6: Full verification, build, deploy, and live check

**Files:**
- Verify: `index.html`, `style.css`, `script.js`, tests, generated `_site/`
- Do not commit generated `_site/` unless repository policy already tracks it.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified deployable GitHub Pages site.

- [ ] **Step 1: Run every relevant static-site contract**

Run:

```bash
bash tests/design_v50_contract.sh
bash tests/site_contract.sh
bash tests/public_distribution_contract.sh
bash tests/github_pages_domain_contract.sh
```

Expected: four PASS results and exit code 0.

- [ ] **Step 2: Verify the built homepage directly**

Run:

```bash
python3 scripts/build-site.py
grep -q '<link rel="canonical" href="https://gxcracks.github.io/veltrix-client/">' _site/index.html
grep -q 'https://github.com/GxCracks/veltrix-client/releases/download/v0.8.2/VELTRIX-Setup-0.8.2.exe' _site/index.html
grep -q 'https://discord.gg/5WteV2B68C' _site/index.html
grep -q 'id="platforms"' _site/index.html
grep -q 'id="roadmap"' _site/index.html
grep -q 'id="community"' _site/index.html
```

Expected: exit code 0 for every command.

- [ ] **Step 3: Check for prohibited regressions**

Run:

```bash
! grep -R -q 'https://veltrixclient.de' _site
! grep -Eq '<a[^>]+>[^<]*(macOS|Linux)[^<]*Coming Soon' index.html
! grep -Eq 'href="support.html"' index.html
```

Expected: exit code 0.

- [ ] **Step 4: Manual responsive/accessibility smoke check**

Verify the built site at representative viewport widths:

- 1440px desktop: header, hero, showcase, three platform cards, roadmap, news, download, community all aligned with no overlapping text.
- 1024px tablet: nav toggle works; showcase stacks; no horizontal scrollbar.
- 390px mobile: one-column layout, full-width readable primary CTA, platform cards stack, disabled macOS/Linux controls remain non-clickable.
- Keyboard-only: header/nav/download/Discord links receive visible focus.
- Reduced motion: reveal/parallax effects do not animate substantially when `prefers-reduced-motion: reduce` is active.

- [ ] **Step 5: Review the final diff against the spec acceptance checklist**

Confirm every checklist item in `docs/superpowers/specs/2026-09-19-veltrix-website-redesign-design.md` has a corresponding implementation or explicit conservative status.

- [ ] **Step 6: Commit any final verification-only fixes**

If verification required code/test corrections, commit only those verified corrections:

```bash
git add index.html style.css script.js tests
git commit -m "fix: finalize VELTRIX website redesign verification"
```

If no corrections were needed, do not create an empty commit.

- [ ] **Step 7: Push and verify GitHub Pages workflow**

Push the implementation branch/commits and inspect the newest `Deploy VELTRIX website to GitHub Pages` run. Required successful steps:

- Checkout — success;
- Setup Pages — success;
- Test and build static site — success;
- Upload site — success;
- Deploy to GitHub Pages — success.

- [ ] **Step 8: Verify the live deployment**

Open `https://gxcracks.github.io/veltrix-client/` after the workflow reports success and verify the live source contains the redesign section IDs, current installer URL, current Discord invite, and the local brand assets. If a browser shows stale content, force-refresh before diagnosing a deploy regression.

---

## Self-Review Result

- **Spec coverage:** All specification sections are mapped: visual direction (Tasks 2–5), header/hero (Task 2), Why VELTRIX/showcase/platforms/compatibility/roadmap (Task 3), News/store/download/community/footer (Task 4), responsive/accessibility/performance-sensitive behavior (Task 5), deployment/build/live verification (Task 6).
- **Placeholder scan:** No `TBD`, `TODO`, `implement later`, undefined helper, or generic “add tests” instruction remains in this plan.
- **Interface consistency:** Section IDs and selectors are fixed across HTML, CSS, JavaScript, tests, and final verification: `why-veltrix`, `launcher-showcase`, `platforms`, `compatibility`, `roadmap`, `news`, `download`, `community`; installer selectors use `.header-download`, `.hero-primary`, `.platform-windows a`, and download-panel installer anchors.
- **Review focus coverage:** News fallback, mobile navigation, false availability, installer/support regression, and reduced-motion/accessibility all have explicit tests or verification steps in their owning tasks.
