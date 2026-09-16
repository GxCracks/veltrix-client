# VELTRIX GitHub Pages Website Design

## Goal
Create a small public-facing website for VELTRIX Client that can be published at `https://<github-username>.github.io/veltrix-client/` and used as the project website in the Minecraft AppID review form.

## Design
The website uses the existing VELTRIX dark navy/cyan visual language, but remains lightweight and static. It contains a landing page, project description, authentication explanation, privacy information, contact-through-GitHub guidance, and an explicit independent-project disclaimer. No Microsoft credentials, tenant IDs, client secrets, access tokens, or private account data are displayed.

## Pages
- `index.html`: overview, features, authentication explanation, project status, contact, disclaimer.
- `privacy.html`: concise privacy policy explaining Microsoft OAuth redirect behavior and token handling claims limited to the VELTRIX project design.
- `style.css`: responsive dark/cyan design.
- `script.js`: navigation/mobile menu and current year only.
- `.github/workflows/pages.yml`: GitHub Pages deployment workflow.
- `README.md`: publishing instructions and expected Pages URL.

## Constraints
- Static HTML/CSS/JS only; no analytics or cookies.
- Mobile responsive.
- No claim of Mojang/Microsoft affiliation or endorsement.
- No public exposure of Client ID, Tenant ID, tokens, secrets, or private email address.
- GitHub Pages path must work from a project repository named `veltrix-client`.
