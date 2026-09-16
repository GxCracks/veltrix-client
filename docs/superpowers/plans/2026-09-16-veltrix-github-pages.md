# VELTRIX GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained GitHub Pages website for the VELTRIX Client project.

**Architecture:** Static HTML/CSS/JS hosted by GitHub Pages. A GitHub Actions workflow publishes the repository root as a Pages artifact. The site contains no server-side code and no account secrets.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-16-veltrix-github-pages-design.md`

## Global Constraints
- Repository name: `veltrix-client`.
- Intended URL: `https://<github-username>.github.io/veltrix-client/`.
- No analytics, cookies, tokens, secrets, tenant IDs, or private contact data.
- Include an independent-project disclaimer.
- Keep all links and assets project-path compatible.

---

### Task 1: Site contract test
**Files:** Create `tests/site_contract.sh`
- [ ] Write assertions for required pages, VELTRIX copy, privacy, disclaimer, logo, and Pages workflow.
- [ ] Run the test before production files exist and confirm failure.

### Task 2: Landing page and privacy page
**Files:** Create `index.html`, `privacy.html`, `style.css`, `script.js`, `assets/veltrix-logo.png`
- [ ] Implement semantic responsive landing page.
- [ ] Implement privacy page.
- [ ] Add existing VELTRIX branding asset.
- [ ] Run `tests/site_contract.sh` and confirm pass.

### Task 3: GitHub Pages deployment
**Files:** Create `.github/workflows/pages.yml`, `README.md`, `.nojekyll`
- [ ] Add GitHub Pages workflow using official Pages actions.
- [ ] Document repository creation and Pages URL.
- [ ] Run the contract test again.

### Task 4: Package and final verification
**Files:** Create `/mnt/data/veltrix-client-github-pages.zip`
- [ ] Check HTML/CSS/JS references.
- [ ] Validate ZIP integrity.
- [ ] Initialize a local git repository and commit the site so it is ready to push.
