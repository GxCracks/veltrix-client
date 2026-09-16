# VELTRIX Custom Domain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the existing VELTRIX static site for GitHub Pages production at `https://veltrixclient.de` with HTTPS-ready DNS documentation, SEO metadata, clean Pages artifacts, and route fallbacks.

**Architecture:** Keep the existing static HTML/CSS/JS architecture and GitHub Pages workflow. Stage only public site files into `_site`, use a root CNAME file for the apex domain, and keep the Windows installer on GitHub Releases.

**Tech Stack:** Static HTML/CSS/JavaScript, GitHub Pages, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-16-veltrix-custom-domain-design.md`

## Global Constraints

- Production domain: `https://veltrixclient.de`.
- Preserve existing design and Windows installer behavior.
- Do not add or require a JavaScript framework/build tool.
- GitHub Pages deploys from `main` using the existing workflow.
- Public Pages artifact must not expose repo-only docs/tests/publisher scripts.

---

### Task 1: Domain contract and public metadata

**Files:**
- Create: `CNAME`
- Create: `DOMAIN-SETUP.md`
- Create: `robots.txt`
- Create: `sitemap.xml`
- Test: `tests/custom_domain_contract.sh`

- [ ] Write a failing contract test for required domain files, canonical URLs, and DNS documentation.
- [ ] Run the test and confirm it fails because `CNAME` is absent.
- [ ] Add domain files with exact GitHub Pages A/AAAA/CNAME values.
- [ ] Run the contract test again.

### Task 2: Canonical URL and routing

**Files:**
- Modify: `index.html`
- Modify: `privacy.html`
- Modify: `404.html`

- [ ] Add homepage and privacy canonical/Open Graph metadata.
- [ ] Update the 404 fallback to map known routes to homepage sections and privacy.
- [ ] Verify runtime asset references remain root-safe and HTTPS-safe.

### Task 3: Clean GitHub Pages deployment

**Files:**
- Modify: `.github/workflows/pages.yml`

- [ ] Add a staging step that builds `_site` from only public web files.
- [ ] Point `actions/upload-pages-artifact` at `_site`.
- [ ] Keep current official Pages actions and permissions.

### Task 4: Documentation and production verification

**Files:**
- Modify: `README.md`

- [ ] Add the requested Website section with production URL, hosting, and deployment.
- [ ] Run every repository site contract test.
- [ ] Emulate the production `_site` build and verify CNAME, assets, SEO files, links, and installer URL are present.
- [ ] Verify no external `http://` asset/script/font references exist.
