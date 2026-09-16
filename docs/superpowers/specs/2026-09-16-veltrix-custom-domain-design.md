# VELTRIX Custom Domain + GitHub Pages Design

## Goal

Publish the existing static VELTRIX website through GitHub Pages and make `https://veltrixclient.de` the canonical production URL without redesigning the site or changing the Windows installer flow.

## Current architecture

The repository is a static HTML/CSS/JavaScript site, not React, Vite, Next.js, or another application framework. GitHub Pages is already deployed with a custom GitHub Actions workflow. The Windows client installer is hosted as a GitHub Release asset and must remain outside the Pages artifact.

## Deployment design

Keep the existing Pages workflow, but stage a clean `_site` directory before upload. Only public web assets are copied into `_site`: HTML, CSS, JavaScript, news JSON, images, `.nojekyll`, `CNAME`, `robots.txt`, and `sitemap.xml`. Repository documentation, tests, publisher scripts, and the legacy ZIP download remain in the repository but are not served by the Pages artifact.

## Domain design

Add a root `CNAME` file containing exactly `veltrixclient.de`. The apex domain is the canonical production domain. DNS uses GitHub Pages A/AAAA records; `www.veltrixclient.de` uses a CNAME to `gxcracks.github.io`. GitHub Pages Settings must be configured with `veltrixclient.de`, then HTTPS enforcement can be enabled after certificate provisioning.

## Paths and routing

All runtime assets remain relative to the site root and must not use `/veltrix-client/`. The site is not an SPA. `404.html` provides friendly redirects for known section-like routes (`/download`, `/features`, `/news`, `/privacy`) and sends unknown routes to `/`, preventing visitors from seeing GitHub's default 404 page.

## SEO

Use `https://veltrixclient.de/` as the canonical URL for the homepage and `https://veltrixclient.de/privacy.html` for privacy. Add Open Graph URL/image metadata, `robots.txt`, and `sitemap.xml`. No HTTP external assets are allowed; SVG XML namespace declarations are not network requests and are allowed.

## Constraints

- Preserve current VELTRIX visual design and functionality.
- Preserve the GitHub Release Windows installer URL.
- Do not add server-side APIs or databases; GitHub Pages is static hosting.
- Do not create a second competing Pages deployment workflow.
- Do not remove existing important repository files.
