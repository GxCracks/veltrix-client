# VELTRIX Cosmetics, Account Bridge & Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing VELTRIX GitHub Pages site with the approved intro, Cosmetics shop, secure VELTRIX Client account bridge, PostgreSQL-backed ownership, equip/unequip, realtime sync, admin-ready APIs, and Railway deployment readiness without enabling real payments in Beta 1.

**Architecture:** Keep the current static frontend and Pages deployment intact. Add a separate `backend/` Node.js + TypeScript service using Express, PostgreSQL, WebSocket, Zod validation, hashed server-side session tokens, and role-based authorization. Frontend account/shop behavior talks only to the backend API; public browsing and downloads remain functional when the backend is unavailable.

**Tech Stack:** Existing HTML/CSS/vanilla JS + Bash/Python site contracts; Node.js 22; TypeScript; Express; `pg`; `zod`; `helmet`; `cors`; `express-rate-limit`; `cookie-parser`; `ws`; Vitest; Supertest; Railway PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-09-19-veltrix-cosmetics-backend-design.md`

## Global Constraints

- Existing GitHub Pages website remains the public frontend.
- Existing download, news, privacy, Discord/support, canonical metadata, and Pages workflow must keep working.
- Backend target is Railway; database is PostgreSQL; realtime transport is WebSocket.
- Minecraft username alone is never authentication.
- Raw durable session tokens must not be persisted in plaintext where avoidable.
- Payment is disabled in Beta 1; no real checkout or charge path may be exposed.
- VELTRIX Dragon is visible as `Coming Soon` until the client cosmetic exists.
- Frontend JavaScript must contain no database passwords, Microsoft secrets, payment secrets, signing keys, admin tokens, or server session secrets.
- Public shop browsing must continue when the backend is unavailable.

## Review Focus

1. **Cross-origin auth from GitHub Pages to Railway:** production cookie must be `HttpOnly; Secure; SameSite=None` while origins are cross-site, with CSRF protection on state-changing web-session routes; switch to `Lax` only when frontend/API share a first-party site.
2. **Expired/revoked client sessions:** heartbeat, login approval, and cosmetics endpoints must reject them consistently with `401 SESSION_INVALID`.
3. **Duplicate/rapid web-login requests:** one username cannot create unbounded pending login requests; rate limit and expire older requests.
4. **Equip conflicts:** equipping a cosmetic must atomically unequip other cosmetics in the same slot before emitting realtime state.
5. **Backend outage:** intro, homepage, downloads, news, privacy, and static Coming Soon shop content must still work with finite error states and no endless spinners.

---

## File Structure

### Existing frontend files to modify

- `index.html` — add Cosmetics navigation and intro overlay hook without rebuilding the homepage.
- `style.css` — intro, shop-link, modal/account status styling while preserving existing design tokens.
- `script.js` — session intro behavior only; keep existing navigation/news/reveal logic.
- `scripts/build-site.py` — publish the new static pages/scripts.
- `tests/design_v50_contract.sh` — preserve existing redesign assertions and add stable brand/intro hooks.
- `tests/site_contract.sh` — assert new public static files exist.
- `tests/github_pages_domain_contract.sh` — assert new pages/scripts are copied into `_site`.

### New frontend files

- `cosmetics.html` — Cosmetics storefront, filters, static fallback catalog, login/account bridge panel, detail modal.
- `cosmetics.js` — filtering/sorting/detail modal/backend catalog merge/login request/owned/equip flows.
- `account.html` — connected account and My Cosmetics screen.
- `account.js` — account, owned inventory, equip/unequip, backend outage state.
- `api.js` — shared backend fetch helper, CSRF handling, safe JSON/error normalization.
- `assets/cosmetics/veltrix-dragon.svg` — lightweight local Coming Soon preview asset.
- `tests/cosmetics_contract.sh` — static frontend contract.

### New backend files

- `backend/package.json` — scripts/dependencies.
- `backend/tsconfig.json` — TypeScript config.
- `backend/.env.example` — non-secret variable names only.
- `backend/src/app.ts` — Express composition and middleware.
- `backend/src/server.ts` — HTTP/WebSocket startup.
- `backend/src/config.ts` — validated environment config.
- `backend/src/errors.ts` — stable API error shape.
- `backend/src/security/tokens.ts` — secure random tokens/codes and hashing.
- `backend/src/security/webSession.ts` — cookie + CSRF helpers.
- `backend/src/db/pool.ts` — PostgreSQL pool.
- `backend/src/db/migrate.ts` — SQL migration runner.
- `backend/migrations/001_initial.sql` — users, cosmetics, ownership, sessions, login requests, audit tables.
- `backend/src/client/sessionService.ts` — client sessions/heartbeat/revocation.
- `backend/src/web-login/service.ts` — one-time login lifecycle.
- `backend/src/cosmetics/service.ts` — catalog/ownership/equip semantics.
- `backend/src/realtime/hub.ts` — authenticated WebSocket user/client fan-out.
- `backend/src/admin/routes.ts` — role-guarded cosmetic mutation/grant routes.
- `backend/src/payments/provider.ts` — disabled payment interface.
- `backend/src/routes.ts` — route assembly.
- `backend/tests/*.test.ts` — Vitest/Supertest behavior tests.
- `backend/railway.json` — Railway start/health configuration.

---

### Task 1: Lock the frontend contract before UI changes

**Files:**
- Create: `tests/cosmetics_contract.sh`
- Modify: `tests/site_contract.sh`
- Modify: `tests/github_pages_domain_contract.sh`

**Interfaces:**
- Consumes: current static site/build pipeline.
- Produces: executable assertions for all Phase-1 public files and no-live-checkout behavior.

- [ ] **Step 1: Write the failing cosmetics contract**

Create `tests/cosmetics_contract.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

for file in cosmetics.html cosmetics.js account.html account.js api.js; do
  test -f "$ROOT/$file" || { echo "Missing $file"; exit 1; }
done

grep -q 'id="veltrix-intro"' "$ROOT/index.html"
grep -q 'veltrix_intro_seen' "$ROOT/script.js"
grep -q 'href="cosmetics.html"' "$ROOT/index.html"
grep -q 'VELTRIX COSMETICS' "$ROOT/cosmetics.html"
grep -q 'veltrix_dragon' "$ROOT/cosmetics.js"
grep -q 'COMING SOON' "$ROOT/cosmetics.html"
grep -q 'Search cosmetics' "$ROOT/cosmetics.html"
grep -q 'My Cosmetics' "$ROOT/account.html"

if grep -Eq 'BUY NOW[^<]*</button>|data-action="purchase"' "$ROOT/cosmetics.html"; then
  echo "Beta 1 must not expose an active checkout action"
  exit 1
fi

echo 'CosmeticsContractTest: PASS'
```

- [ ] **Step 2: Run it and confirm RED**

Run:

```bash
bash tests/cosmetics_contract.sh
```

Expected: FAIL because `cosmetics.html` does not exist yet.

- [ ] **Step 3: Extend build-output assertions**

Add to `tests/github_pages_domain_contract.sh` after `python3 "$ROOT/scripts/build-site.py"`:

```bash
for file in cosmetics.html cosmetics.js account.html account.js api.js; do
  test -f "$ROOT/_site/$file" || { echo "Built site missing $file"; exit 1; }
done
```

Add to `tests/site_contract.sh`:

```bash
[[ -f cosmetics.html ]] || fail "cosmetics.html missing"
[[ -f account.html ]] || fail "account.html missing"
```

- [ ] **Step 4: Commit the red contracts**

```bash
git add tests/cosmetics_contract.sh tests/site_contract.sh tests/github_pages_domain_contract.sh
git commit -m "test: define VELTRIX cosmetics frontend contract"
```

---

### Task 2: Implement the once-per-session VELTRIX intro

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `script.js`
- Test: `tests/cosmetics_contract.sh`

**Interfaces:**
- Consumes: local `assets/veltrix-brand.svg` / `assets/veltrix-mark.svg`.
- Produces: `#veltrix-intro` overlay and `veltrix_intro_seen` session flag.

- [ ] **Step 1: Add failing semantic assertions**

Append to `tests/cosmetics_contract.sh`:

```bash
grep -q 'aria-label="Enter VELTRIX website"' "$ROOT/index.html"
grep -q 'prefers-reduced-motion' "$ROOT/style.css"
grep -q 'sessionStorage.setItem(INTRO_KEY' "$ROOT/script.js"
```

Run `bash tests/cosmetics_contract.sh`; expected FAIL on missing intro.

- [ ] **Step 2: Add the overlay markup directly after `<body>`**

```html
<div class="veltrix-intro" id="veltrix-intro" role="button" tabindex="0" aria-label="Enter VELTRIX website">
  <div class="veltrix-intro-glow" aria-hidden="true"></div>
  <img src="assets/veltrix-brand.svg" alt="VELTRIX Client">
  <span>Click to enter</span>
</div>
```

Also add `<a href="cosmetics.html">Cosmetics</a>` to the existing primary navigation.

- [ ] **Step 3: Add restrained intro CSS**

Add `.veltrix-intro` fixed fullscreen styles with `backdrop-filter: blur(20px)`, dark translucent background, 0.85→1 logo keyframe, `.leaving` fade/blur/scale, keyboard focus style, and reduced-motion override.

- [ ] **Step 4: Add intro JS without touching news/download logic**

At the start of `script.js` inside the IIFE:

```js
const INTRO_KEY = 'veltrix_intro_seen';
const intro = document.getElementById('veltrix-intro');
if (intro) {
  const seen = sessionStorage.getItem(INTRO_KEY) === 'true';
  if (seen) intro.remove();
  else {
    const closeIntro = () => {
      if (!intro.isConnected || intro.classList.contains('leaving')) return;
      sessionStorage.setItem(INTRO_KEY, 'true');
      intro.classList.add('leaving');
      setTimeout(() => intro.remove(), 650);
    };
    intro.addEventListener('click', closeIntro);
    intro.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        closeIntro();
      }
    });
  }
}
```

- [ ] **Step 5: Run contracts**

```bash
bash tests/design_v50_contract.sh
bash tests/cosmetics_contract.sh
```

Expected: cosmetics still fails only because shop/account files are not created; existing design contract passes.

- [ ] **Step 6: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: add session VELTRIX website intro"
```

---

### Task 3: Build the static Cosmetics and Account frontend with graceful fallback

**Files:**
- Create: `cosmetics.html`
- Create: `cosmetics.js`
- Create: `account.html`
- Create: `account.js`
- Create: `api.js`
- Create: `assets/cosmetics/veltrix-dragon.svg`
- Modify: `style.css`
- Modify: `scripts/build-site.py`
- Test: `tests/cosmetics_contract.sh`

**Interfaces:**
- Produces: global `VeltrixApi` helper with `request(path, options)` and static `FALLBACK_COSMETICS` catalog.
- Later backend tasks provide matching `/api/*` routes.

- [ ] **Step 1: Create the shared API helper**

`api.js` must expose:

```js
window.VeltrixApi = (() => {
  const base = (window.VELTRIX_API_BASE || '').replace(/\/$/, '');
  let csrfToken = null;

  async function request(path, options = {}) {
    if (!base) throw Object.assign(new Error('Backend unavailable'), { code: 'BACKEND_UNAVAILABLE' });
    const headers = new Headers(options.headers || {});
    if (csrfToken && !['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase())) {
      headers.set('x-csrf-token', csrfToken);
    }
    const response = await fetch(`${base}${path}`, { ...options, headers, credentials: 'include' });
    const body = await response.json().catch(() => ({}));
    if (body.csrfToken) csrfToken = body.csrfToken;
    if (!response.ok) throw Object.assign(new Error(body.message || 'Request failed'), { code: body.code || 'REQUEST_FAILED', status: response.status });
    return body;
  }

  return { request };
})();
```

- [ ] **Step 2: Create Cosmetics markup**

`cosmetics.html` must reuse the existing header/footer classes and contain:

```html
<h1>VELTRIX COSMETICS</h1>
<p>Customize Minecraft. Make Veltrix yours.</p>
<input id="cosmetic-search" type="search" placeholder="Search cosmetics...">
<select id="cosmetic-sort" aria-label="Sort cosmetics">
  <option value="featured">Featured</option>
  <option value="newest">Newest</option>
  <option value="price-asc">Price Low to High</option>
  <option value="price-desc">Price High to Low</option>
  <option value="rarity">Rarity</option>
</select>
```

Include filter buttons for every approved category, a `#cosmetic-grid`, login bridge panel, and accessible detail `<dialog id="cosmetic-dialog">`. Show visible `COMING SOON` copy; do not render an enabled purchase button.

- [ ] **Step 3: Seed the fallback Dragon catalog**

At the top of `cosmetics.js`:

```js
const FALLBACK_COSMETICS = [{
  id: 'veltrix_dragon',
  name: 'VELTRIX Dragon',
  categories: ['Pets', 'Shoulder Cosmetics'],
  rarity: 'LEGENDARY',
  status: 'COMING SOON',
  purchasable: false,
  priceCents: 499,
  preview: 'assets/cosmetics/veltrix-dragon.svg',
  description: 'A cute little Veltrix Dragon that sits on your shoulder and accompanies you throughout Minecraft.'
}];
```

Render from fallback immediately, then attempt `VeltrixApi.request('/api/cosmetics')` and replace only when valid data arrives. On API failure keep fallback visible and show a finite `Backend temporarily unavailable` status.

- [ ] **Step 4: Implement filters, search, sorting, and detail dialog**

Use pure functions `filterCosmetics(items, query, category)` and `sortCosmetics(items, sort)` so browser behavior stays testable. `VIEW` opens the dialog; `COMING SOON` is disabled.

- [ ] **Step 5: Create Account page**

`account.html` contains `My VELTRIX Account`, connection state, avatar placeholder, username/UUID/member/client status, `My Cosmetics`, filters, and a logged-out state linking back to `cosmetics.html`.

`account.js` calls `/api/account` and `/api/cosmetics/owned`; on `401` renders a login-required state; on backend failure renders a retry state.

- [ ] **Step 6: Publish the new files**

Add to `PUBLIC_FILES` in `scripts/build-site.py`:

```python
"cosmetics.html",
"cosmetics.js",
"account.html",
"account.js",
"api.js",
```

`assets/` is already copied recursively, so the Dragon SVG ships automatically.

- [ ] **Step 7: Run all static contracts**

```bash
bash tests/cosmetics_contract.sh
bash tests/site_contract.sh
bash tests/github_pages_domain_contract.sh
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add cosmetics.html cosmetics.js account.html account.js api.js assets/cosmetics/veltrix-dragon.svg style.css scripts/build-site.py tests
git commit -m "feat: add VELTRIX cosmetics and account frontend"
```

---

### Task 4: Scaffold the Railway backend with security defaults

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/src/config.ts`
- Create: `backend/src/errors.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/routes.ts`
- Create: `backend/tests/health.test.ts`

**Interfaces:**
- Produces: `createApp(deps?: Partial<AppDeps>): Express`, `config`, `GET /api/health`.

- [ ] **Step 1: Write health/security test**

```ts
import request from 'supertest';
import { createApp } from '../src/app.js';

it('returns health without leaking configuration', async () => {
  const response = await request(createApp()).get('/api/health').expect(200);
  expect(response.body).toEqual({ ok: true, service: 'veltrix-api' });
  expect(JSON.stringify(response.body)).not.toContain('DATABASE_URL');
});
```

- [ ] **Step 2: Create package scripts/dependencies**

`backend/package.json` scripts:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "test": "vitest run",
    "migrate": "tsx src/db/migrate.ts"
  }
}
```

Dependencies: `express`, `pg`, `zod`, `helmet`, `cors`, `express-rate-limit`, `cookie-parser`, `ws`. Dev dependencies: `typescript`, `tsx`, `vitest`, `supertest`, matching type packages.

- [ ] **Step 3: Implement config validation**

`config.ts` uses Zod and requires production `DATABASE_URL`, `SESSION_SECRET`, `TOKEN_PEPPER`, `CORS_ORIGIN`; test defaults may use safe local values.

- [ ] **Step 4: Implement Express composition**

`createApp()` applies Helmet, JSON size limit `64kb`, explicit CORS origin callback, cookie parser, and `/api/health` before protected routes. Errors are returned as:

```json
{ "code": "INTERNAL_ERROR", "message": "Internal server error" }
```

Never send stack traces in production.

- [ ] **Step 5: Run tests and build**

```bash
cd backend
npm install
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend
git commit -m "feat: scaffold secure VELTRIX Railway API"
```

---

### Task 5: Add PostgreSQL schema and token primitives

**Files:**
- Create: `backend/migrations/001_initial.sql`
- Create: `backend/src/db/pool.ts`
- Create: `backend/src/db/migrate.ts`
- Create: `backend/src/security/tokens.ts`
- Create: `backend/tests/tokens.test.ts`

**Interfaces:**
- Produces: `generateBearerToken(): string`, `hashToken(raw: string): string`, `generateVerificationCode(): string`.

- [ ] **Step 1: Write token tests**

```ts
import { generateBearerToken, generateVerificationCode, hashToken } from '../src/security/tokens.js';

it('generates non-repeatable bearer tokens and hashes them', () => {
  const a = generateBearerToken();
  const b = generateBearerToken();
  expect(a).not.toBe(b);
  expect(hashToken(a)).not.toBe(a);
  expect(hashToken(a)).toBe(hashToken(a));
});

it('generates readable VEL verification codes', () => {
  expect(generateVerificationCode()).toMatch(/^VEL-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
});
```

- [ ] **Step 2: Create schema**

`001_initial.sql` creates `users`, `cosmetics`, `user_cosmetics`, `client_sessions`, `web_login_requests`, `web_sessions`, and `admin_audit`. Add unique indexes on Minecraft UUID, `cosmetic_id`, session hashes, and active login request identifiers. Store role as constrained text `USER|MODERATOR|ADMIN|OWNER` and login status as `pending|approved|denied|expired`.

- [ ] **Step 3: Seed VELTRIX Dragon idempotently**

In migration SQL use `INSERT ... ON CONFLICT (cosmetic_id) DO NOTHING` with `purchasable=false`, `enabled=true`, `rarity='LEGENDARY'`.

- [ ] **Step 4: Implement token generation/hashing**

Use `crypto.randomBytes(32).toString('base64url')` for bearer tokens and `createHmac('sha256', config.tokenPepper)` for stored hashes.

- [ ] **Step 5: Run tests/build and commit**

```bash
cd backend && npm test && npm run build
cd ..
git add backend
git commit -m "feat: add VELTRIX database schema and token security"
```

---

### Task 6: Implement client sessions, heartbeat, expiry, and revocation

**Files:**
- Create: `backend/src/client/sessionService.ts`
- Create: `backend/src/client/routes.ts`
- Modify: `backend/src/routes.ts`
- Create: `backend/tests/client-session.test.ts`

**Interfaces:**
- Produces: authenticated client middleware attaching `{ sessionId, userId, minecraftUuid }` to request state.
- Consumes: token hash helpers and PostgreSQL pool.

- [ ] **Step 1: Write tests for valid, expired, and revoked sessions**

Tests must assert:

```text
POST /api/client/session -> 201 + raw token once
POST /api/client/heartbeat with valid bearer -> 204
expired bearer -> 401 SESSION_INVALID
revoked bearer -> 401 SESSION_INVALID
```

Also assert API responses never return `session_hash`.

- [ ] **Step 2: Implement session creation**

Input schema:

```ts
z.object({
  veltrixUserId: z.string().min(3).max(80),
  minecraftUuid: z.string().uuid(),
  minecraftUsername: z.string().regex(/^[A-Za-z0-9_]{3,16}$/)
})
```

For the current integration boundary, this route is called only after the client has already completed its trusted Microsoft/Minecraft login handoff; the implementation must isolate this route so a later upstream-auth proof can replace the temporary trusted-client bootstrap without changing downstream session semantics.

- [ ] **Step 3: Implement heartbeat and revoke**

Heartbeat updates `last_seen` only for unexpired/unrevoked sessions. Revoke sets `revoked_at=NOW()`.

- [ ] **Step 4: Add strict rate limits**

Use separate limiters for session creation and heartbeat; return `429 RATE_LIMITED`.

- [ ] **Step 5: Run tests and commit**

```bash
cd backend && npm test && npm run build
cd ..
git add backend/src/client backend/src/routes.ts backend/tests/client-session.test.ts
git commit -m "feat: add VELTRIX client session lifecycle"
```

---

### Task 7: Implement one-time website login and secure web sessions

**Files:**
- Create: `backend/src/web-login/service.ts`
- Create: `backend/src/web-login/routes.ts`
- Create: `backend/src/security/webSession.ts`
- Modify: `backend/src/client/routes.ts`
- Modify: `backend/src/routes.ts`
- Create: `backend/tests/web-login.test.ts`

**Interfaces:**
- Produces: request/status/approve/deny/complete/logout flow and web-session auth middleware.

- [ ] **Step 1: Write full lifecycle tests**

Cover:

```text
username with no recent heartbeat -> 404 CLIENT_NOT_CONNECTED
active client -> request returns id + display code
second rapid request for same user -> previous pending request becomes expired
client approve requires client session for same user
client deny -> web completion rejected
request older than 5 minutes -> EXPIRED
approved request complete -> HttpOnly web-session cookie + csrfToken
reuse same request -> rejected
```

- [ ] **Step 2: Implement login request creation**

Normalize username lookup case-insensitively, resolve to recent active client session, generate the display code, store only its hash, and expire any previous pending request for that user in the same transaction.

- [ ] **Step 3: Implement client approve/deny**

Client route must prove the approving session belongs to the request user; then atomically set `approved` or `denied` once.

- [ ] **Step 4: Implement web-session completion**

On approved request, create one raw web-session token, store its hash, consume the login request, set cookie:

```ts
{
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
  maxAge: 1000 * 60 * 60 * 8
}
```

For local non-HTTPS tests, allow `secure=false` via test config only. Generate a session-bound CSRF token and require `x-csrf-token` on cookie-authenticated mutation routes.

- [ ] **Step 5: Run tests and commit**

```bash
cd backend && npm test && npm run build
cd ..
git add backend/src/web-login backend/src/security/webSession.ts backend/src/client backend/src/routes.ts backend/tests/web-login.test.ts
git commit -m "feat: add secure VELTRIX website account linking"
```

---

### Task 8: Implement cosmetics catalog, ownership, atomic equip, and account API

**Files:**
- Create: `backend/src/cosmetics/service.ts`
- Create: `backend/src/cosmetics/routes.ts`
- Create: `backend/src/account/routes.ts`
- Modify: `backend/src/routes.ts`
- Create: `backend/tests/cosmetics.test.ts`

**Interfaces:**
- Produces: `GET /api/cosmetics`, `GET /api/cosmetics/:id`, `GET /api/account`, `GET /api/cosmetics/owned`, `POST /api/cosmetics/equip`, `POST /api/cosmetics/unequip`.

- [ ] **Step 1: Write public catalog and auth tests**

Assert public Dragon response includes `purchasable:false`, while `/owned` returns `401` without a web session.

- [ ] **Step 2: Write ownership/equip tests**

Assert:

```text
not owned -> 403 COSMETIC_NOT_OWNED
owned + enabled -> equip succeeds
disabled cosmetic -> 409 COSMETIC_DISABLED
same-slot previous cosmetic -> atomically unequipped
unequip not equipped -> idempotent success
```

- [ ] **Step 3: Implement catalog/ownership queries**

Map database rows to safe DTOs; never expose internal numeric user IDs, session hashes, or admin-only metadata.

- [ ] **Step 4: Implement atomic equip transaction**

Within one PostgreSQL transaction:

```sql
SELECT ... FOR UPDATE;
UPDATE user_cosmetics SET equipped=false WHERE user_id=$1 AND slot=$2;
UPDATE user_cosmetics SET equipped=true WHERE user_id=$1 AND cosmetic_id=$3;
```

If schema uses category-derived slots, expose a deterministic `slotForCosmetic()` helper and test it.

- [ ] **Step 5: Run tests and commit**

```bash
cd backend && npm test && npm run build
cd ..
git add backend/src/cosmetics backend/src/account backend/src/routes.ts backend/tests/cosmetics.test.ts
git commit -m "feat: add cosmetic ownership and equip APIs"
```

---

### Task 9: Add authenticated WebSocket realtime sync

**Files:**
- Create: `backend/src/realtime/hub.ts`
- Modify: `backend/src/server.ts`
- Modify: `backend/src/web-login/service.ts`
- Modify: `backend/src/cosmetics/service.ts`
- Create: `backend/tests/realtime.test.ts`

**Interfaces:**
- Produces WebSocket events `web_login_request`, `web_login_approved`, `web_login_denied`, `cosmetic_equipped`, `cosmetic_unequipped`, `session_revoked`.

- [ ] **Step 1: Write WebSocket auth/reconnect tests**

Assert invalid/expired token is closed with policy violation, valid client session subscribes to its own user only, and another user's event is never received.

- [ ] **Step 2: Implement Hub**

Maintain `Map<userId, Set<WebSocket>>`; validate bearer token during upgrade; remove sockets on close/error; never log raw tokens.

- [ ] **Step 3: Emit only after committed state**

Cosmetic service emits after transaction commit. Web-login request emits after request row exists. Approval emits after state transition succeeds.

- [ ] **Step 4: Run tests and commit**

```bash
cd backend && npm test && npm run build
cd ..
git add backend/src/realtime backend/src/server.ts backend/src/web-login backend/src/cosmetics backend/tests/realtime.test.ts
git commit -m "feat: add VELTRIX realtime client sync"
```

---

### Task 10: Wire frontend login, account, owned cosmetics, and equip actions to the API

**Files:**
- Modify: `cosmetics.js`
- Modify: `account.js`
- Modify: `cosmetics.html`
- Modify: `account.html`
- Test: `tests/cosmetics_contract.sh`

**Interfaces:**
- Consumes backend routes from Tasks 7–9 and `VeltrixApi.request` from Task 3.

- [ ] **Step 1: Add frontend contract assertions for safe state labels**

```bash
grep -q 'CONNECT WITH VELTRIX' "$ROOT/cosmetics.html"
grep -q 'Waiting for confirmation' "$ROOT/cosmetics.js"
grep -q '/api/cosmetics/equip' "$ROOT/account.js"
grep -q '/api/cosmetics/unequip' "$ROOT/account.js"
```

- [ ] **Step 2: Implement request → poll → complete flow**

The Connect form posts `{ minecraftUsername }` to `/api/web-login/request`, displays the returned code, then polls `/api/web-login/:id/status` at a bounded interval (e.g. 2 seconds, max 5 minutes). On `approved`, POST `/api/web-login/:id/complete`; on denied/expired stop polling and show finite status.

- [ ] **Step 3: Implement account/owned/equip**

`account.js` fetches `/api/account` and `/api/cosmetics/owned`; buttons call equip/unequip using CSRF-enabled helper, then refetch authoritative state. Do not optimistically grant ownership.

- [ ] **Step 4: Test backend outage behavior manually via a local static server**

Run:

```bash
python3 -m http.server 8080
```

With no `VELTRIX_API_BASE`, verify Cosmetics fallback renders and homepage/download/news remain usable.

- [ ] **Step 5: Run site contracts and commit**

```bash
bash tests/cosmetics_contract.sh
bash tests/github_pages_domain_contract.sh
git add cosmetics.html cosmetics.js account.html account.js
git commit -m "feat: connect VELTRIX website to account and cosmetics APIs"
```

---

### Task 11: Add admin authorization and disabled payment abstraction

**Files:**
- Create: `backend/src/admin/routes.ts`
- Create: `backend/src/payments/provider.ts`
- Modify: `backend/src/routes.ts`
- Create: `backend/tests/admin-payment.test.ts`

**Interfaces:**
- Produces admin cosmetic list/create/edit/disable/grant and `DisabledPaymentProvider`.

- [ ] **Step 1: Write role tests**

Assert USER/MODERATOR receive `403 FORBIDDEN`; ADMIN can create/edit/disable/grant; OWNER can do the same; each mutation writes an `admin_audit` record.

- [ ] **Step 2: Implement admin guard**

Create `requireRole('ADMIN','OWNER')` based only on backend user role, never a frontend claim/header.

- [ ] **Step 3: Implement disabled payment provider**

```ts
export interface PaymentProvider {
  createCheckout(input: { userId: string; cosmeticId: string }): Promise<{ url: string }>;
  verifyPayment(id: string): Promise<boolean>;
  refundPayment(id: string): Promise<void>;
}

export class DisabledPaymentProvider implements PaymentProvider {
  async createCheckout(): Promise<{ url: string }> { throw new ApiError(503, 'PAYMENTS_DISABLED', 'Payments are not enabled in Beta 1'); }
  async verifyPayment(): Promise<boolean> { return false; }
  async refundPayment(): Promise<void> { throw new ApiError(503, 'PAYMENTS_DISABLED', 'Payments are not enabled in Beta 1'); }
}
```

- [ ] **Step 4: Run tests and commit**

```bash
cd backend && npm test && npm run build
cd ..
git add backend/src/admin backend/src/payments backend/src/routes.ts backend/tests/admin-payment.test.ts
git commit -m "feat: add admin cosmetic controls and payment guard"
```

---

### Task 12: Add Railway deployment config and full verification

**Files:**
- Create: `backend/railway.json`
- Modify: `backend/.env.example`
- Modify: `README.md`
- Modify: `.gitignore` if present; otherwise create it.

**Interfaces:**
- Produces a deployable Railway backend with `/api/health` health check and documented frontend API-base configuration.

- [ ] **Step 1: Add Railway config**

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": { "builder": "NIXPACKS", "buildCommand": "npm ci && npm run build" },
  "deploy": { "startCommand": "npm run migrate && npm start", "healthcheckPath": "/api/health", "restartPolicyType": "ON_FAILURE", "restartPolicyMaxRetries": 5 }
}
```

- [ ] **Step 2: Lock secret hygiene**

`.gitignore` must include:

```text
backend/.env
backend/node_modules/
backend/dist/
```

`.env.example` contains only names/safe examples, never real secret values.

- [ ] **Step 3: Run complete backend verification**

```bash
cd backend
npm ci
npm test
npm run build
cd ..
```

Expected: all Vitest tests PASS and TypeScript build exits 0.

- [ ] **Step 4: Run complete frontend verification**

```bash
bash tests/design_v50_contract.sh
bash tests/cosmetics_contract.sh
bash tests/site_contract.sh
bash tests/public_distribution_contract.sh
bash tests/github_pages_domain_contract.sh
```

Expected: all PASS.

- [ ] **Step 5: Run secret scan**

```bash
! grep -R -E '(DATABASE_URL=.*postgres|CLIENT_SECRET=.+|PAYMENT_SECRET=.+|SESSION_SECRET=.+)' --exclude='.env.example' --exclude-dir='.git' .
```

Expected: command exits 0.

- [ ] **Step 6: Commit deployment readiness**

```bash
git add backend/railway.json backend/.env.example README.md .gitignore
git commit -m "chore: prepare VELTRIX backend for Railway"
```

- [ ] **Step 7: Push and verify GitHub Pages**

After pushing, verify the Pages workflow for the final commit reaches `success`, including build/upload/deploy.

- [ ] **Step 8: Railway production verification after environment provisioning**

Configure Railway environment variables `DATABASE_URL`, `SESSION_SECRET`, `TOKEN_PEPPER`, and `CORS_ORIGIN=https://gxcracks.github.io`; deploy `backend/`; verify `GET /api/health` returns `200 {"ok":true,"service":"veltrix-api"}`; then set the public frontend API base to the assigned Railway HTTPS origin and rerun the Pages deployment.

---

## Self-Review

### Spec coverage

- Intro/session animation: Tasks 1–2.
- Cosmetics categories/search/sort/detail/Dragon/fallback: Task 3.
- Backend/Railway/PostgreSQL/security: Tasks 4–5, 12.
- Client sessions/heartbeat: Task 6.
- Username lookup + one-time client confirmation + web session: Task 7.
- Ownership/account/equip: Task 8.
- Live WebSocket sync/reconnect model: Task 9.
- Website account/My Cosmetics integration: Task 10.
- Admin-ready management/payment disabled: Task 11.
- Build/deployment/regression verification: Tasks 1, 3, 12.

### Placeholder scan

No `TBD`, `TODO`, “similar to”, or unspecified implementation steps remain. Production values supplied by Railway are intentionally represented as environment variable names because real secrets must not be committed.

### Type/interface consistency

The plan consistently uses `VeltrixApi.request`, hashed bearer/web session tokens, `cosmeticId`, `minecraftUuid`, `minecraftUsername`, and the API route names defined in the approved spec.

### Review-focus tests

- Cross-origin session + CSRF: Task 7.
- Expired/revoked client sessions: Task 6.
- Duplicate login requests: Task 7.
- Equip slot conflict transaction: Task 8.
- Backend outage graceful fallback: Tasks 3 and 10.
