# VELTRIX Cosmetics, Account Bridge & Backend — Design Specification

Date: 2026-09-19
Status: Design approved in chat, implementation not started
Project: GxCracks/veltrix-client
Frontend: Existing GitHub Pages site
Backend target: Railway
Backend stack: Node.js + TypeScript
Database: PostgreSQL
Realtime: WebSocket
Payments in Beta 1: Disabled / prepared only

## 1. Objective

Extend the existing official VELTRIX website without rebuilding it from scratch. Preserve the current landing page structure, downloads, news, privacy handling, GitHub Pages deployment, visual identity, and existing working navigation while adding:

- a polished one-time-per-session VELTRIX intro;
- a full Cosmetics storefront UI;
- secure VELTRIX Client ↔ Website account linking;
- short-lived client sessions;
- one-time web login verification codes;
- cosmetic ownership and inventory;
- equip / unequip controls;
- live client synchronization;
- account views;
- admin-ready cosmetic management;
- a payment abstraction that remains disabled during Beta 1.

The website must remain usable even if the backend is temporarily unavailable. Public browsing and downloads must continue to function independently of backend availability.

## 2. Core Decisions

The following decisions are fixed for this design:

1. The existing GitHub Pages website remains the public frontend.
2. The frontend stays static HTML/CSS/JavaScript for the current phase.
3. A separate Railway service provides the VELTRIX backend.
4. The backend uses Node.js and TypeScript.
5. PostgreSQL is the system of record for users, sessions, cosmetics, ownership, login requests, and future transactions.
6. WebSocket is preferred for client live-sync, with REST refresh on reconnect as fallback.
7. A Minecraft username alone is never authentication.
8. Website account linking requires confirmation from an authenticated VELTRIX Client session.
9. Payment is not enabled in Beta 1.
10. The VELTRIX Dragon appears in the shop as Coming Soon until the client-side cosmetic is implemented.
11. Existing website download, news, privacy, and GitHub Pages behavior must not be broken.

## 3. Current-State Constraints

The current repository is primarily a static GitHub Pages project built from files such as:

- `index.html`;
- `style.css`;
- `script.js`;
- `news.json`;
- `privacy.html`;
- `scripts/build-site.py`;
- static assets under `assets/`;
- contract tests under `tests/`;
- GitHub Pages workflow under `.github/workflows/`.

The new backend must not be required for the homepage to render, the Windows installer to remain downloadable, news to render, or privacy pages to work.

## 4. High-Level Architecture

```text
Browser
GitHub Pages
VELTRIX Website
│
├── Existing homepage
├── Intro overlay
├── Cosmetics shop
├── Account UI
├── My Cosmetics
└── Frontend API client
       │ HTTPS / WSS
       ▼
Railway
VELTRIX Backend
Node.js + TypeScript
│
├── Auth / Session API
├── Web Login API
├── Client Session API
├── Cosmetics API
├── Ownership API
├── Equip API
├── WebSocket gateway
├── Admin API
└── Payment abstraction (disabled)
       │
       ▼
PostgreSQL
```

The VELTRIX Minecraft client also connects directly to the Railway backend:

```text
VELTRIX Client
│
├── authenticated client session
├── heartbeat
├── web-login confirmation
├── cosmetics refresh
└── realtime cosmetic updates
       │
       ▼
VELTRIX Backend
```

## 5. Trust Boundaries

### 5.1 Frontend

The GitHub Pages frontend is public and untrusted.

It must never contain:

- database credentials;
- Microsoft client secrets;
- payment secrets;
- signing keys;
- admin tokens;
- server-side session secrets;
- long-lived privileged API tokens.

The frontend may contain only public configuration such as the backend base URL and public feature flags.

### 5.2 VELTRIX Client

The client is also treated as untrusted from the server perspective.

The client may present a session token, but the backend validates:

- session existence;
- expiration;
- revocation;
- user identity;
- Minecraft UUID binding;
- authorization for the requested action.

The client cannot grant itself cosmetics, roles, purchases, or ownership.

### 5.3 Backend

The backend is authoritative for:

- account identity;
- active sessions;
- website login approvals;
- cosmetic definitions;
- ownership;
- equip state;
- role checks;
- future payment confirmation.

### 5.4 Database

PostgreSQL is the source of truth for persistent ownership and account state.

## 6. Website Intro

### 6.1 Behavior

On the first homepage visit during a browser session, show a fullscreen VELTRIX intro overlay.

Sequence:

1. Existing website is visible beneath the overlay.
2. Overlay applies darkening and approximately 20px backdrop blur.
3. VELTRIX brand logo fades in.
4. Logo scales smoothly from approximately 0.85 to 1.0.
5. Subtle cyan / violet glow appears.
6. Optional lightweight CSS particles or light sweeps may appear.
7. Clicking the logo or overlay exits the intro.
8. Logo scales slightly upward, blurs, and fades.
9. Backdrop blur transitions to zero.
10. Overlay is removed without page reload.

Target animation duration: roughly 700–1000ms for entry and a similarly restrained exit.

### 6.2 Session Behavior

Use `sessionStorage`:

```text
veltrix_intro_seen = true
```

The intro appears once per browser session, not on every page transition.

### 6.3 Accessibility / Performance

- Respect `prefers-reduced-motion`.
- No video intro.
- Use existing local VELTRIX SVG/PNG assets.
- Overlay must be keyboard dismissible.
- Intro must not block page access permanently if JavaScript fails.

## 7. Cosmetics Information Architecture

Add `Cosmetics` to the main navigation while preserving existing navigation targets.

Preferred shop structure:

```text
VELTRIX COSMETICS
Customize Minecraft.
Make Veltrix yours.

[EXPLORE COSMETICS]
```

Categories:

- Featured;
- Pets;
- Wings;
- Hats;
- Capes;
- Back Cosmetics;
- Shoulder Cosmetics;
- Emotes;
- Bundles;
- Limited;
- Owned.

Search supports:

- cosmetic name;
- category;
- rarity.

Sorting supports:

- Featured;
- Newest;
- Price Low to High;
- Price High to Low;
- Rarity.

## 8. Cosmetic Cards & Detail View

Each cosmetic card shows:

- preview image / preview area;
- name;
- category;
- rarity;
- price or Coming Soon status;
- ownership status when known;
- `VIEW` action.

Detail view shows:

- larger preview;
- name;
- description;
- rarity;
- price / status;
- category;
- animation support metadata where relevant;
- release date where known;
- ownership state;
- equip state.

Possible actions:

- `PREVIEW`;
- `BUY NOW` only after payments are enabled;
- `OWNED`;
- `EQUIP`;
- `UNEQUIP`;
- `COMING SOON`.

The UI must never present a disabled Beta-1 checkout as if real payments are live.

## 9. Rarity System

Supported rarities:

- COMMON;
- RARE;
- EPIC;
- LEGENDARY;
- MYTHIC;
- LIMITED.

Rarity styling should be subtle and consistent with the current premium dark VELTRIX design. Avoid rainbow effects or excessive neon.

## 10. VELTRIX Dragon

Seed the first cosmetic definition as:

```text
id: veltrix_dragon
name: VELTRIX Dragon
category: Pets / Shoulder Cosmetics
rarity: LEGENDARY
status: Coming Soon
```

Description:

`A cute little Veltrix Dragon that sits on your shoulder and accompanies you throughout Minecraft.`

Beta 1 behavior:

- visible in the shop;
- preview-ready;
- not purchasable;
- does not grant ownership automatically;
- may be manually granted to test accounts through admin/test tooling later;
- remains Coming Soon until client implementation is actually available.

## 11. Account Linking Flow

### 11.1 Principle

Entering a Minecraft username does not authenticate the user.

The username is used only to locate an active VELTRIX Client session associated with the real authenticated player.

### 11.2 Flow

```text
Website
↓
User enters Minecraft username
↓
POST /api/web-login/request
↓
Backend finds eligible active client session
↓
Backend creates short-lived verification request
↓
Website displays one-time code
↓
Authenticated VELTRIX Client receives request
↓
Player chooses CONFIRM or DENY
↓
Backend updates login-request state
↓
Website polls or receives realtime approval state
↓
Backend creates web session
↓
Browser receives secure authenticated session
```

Example code:

```text
VEL-7KD9-3P2X
```

Target login-request lifetime: approximately 5 minutes.

### 11.3 Login Request States

- `pending`;
- `approved`;
- `denied`;
- `expired`.

### 11.4 Website States

The frontend should clearly present:

- `Checking Veltrix Client connection...`;
- `Veltrix Client detected`;
- `Waiting for confirmation...`;
- `Connected with Veltrix`;
- `Veltrix Client not detected`.

When no eligible client session exists, provide:

- `DOWNLOAD VELTRIX`;
- `TRY AGAIN`.

## 12. Client Session Model

A successful VELTRIX Client login creates a server-issued session token.

The raw token is shown only to the client and should not be stored in plaintext in PostgreSQL. Store a secure server-side hash instead where practical.

Suggested fields:

```text
id
user_id
minecraft_uuid
minecraft_username
session_hash
created_at
expires_at
last_seen
revoked_at
```

Client session requirements:

- cryptographically random token material;
- server-side validation;
- short / bounded lifetime;
- explicit revocation support;
- heartbeat tracking;
- no client-side self-validation as authority.

## 13. Client Heartbeat

Authenticated client sessions send a periodic heartbeat:

```http
POST /api/client/heartbeat
Authorization: Bearer <client-session-token>
```

The backend updates `last_seen`.

A session is considered online only within a configured recent-heartbeat window.

The exact interval and timeout belong in implementation configuration rather than being hard-coded into the public frontend.

## 14. Web Session

After a web-login request is approved, the backend creates a separate website session.

Preferred production cookie properties:

```text
HttpOnly
Secure
SameSite=Lax
Path=/
```

Because the current frontend lives on GitHub Pages and the backend lives on Railway, the implementation must account for cross-origin browser rules explicitly.

Until a custom first-party VELTRIX domain is available, authentication must be designed without exposing durable secrets to frontend JavaScript.

CORS must use an explicit allowlist for the production GitHub Pages origin and approved development origins.

## 15. Database Model

### 15.1 users

Suggested fields:

```text
id
veltrix_user_id
minecraft_uuid
minecraft_username
role
member_status
created_at
updated_at
```

### 15.2 cosmetics

Suggested fields:

```text
id
cosmetic_id
name
description
category
rarity
price_cents
currency
preview_image
model_id
enabled
purchasable
limited
release_date
created_at
updated_at
```

### 15.3 user_cosmetics

Suggested fields:

```text
id
user_id
cosmetic_id
purchased_at
source
equipped
created_at
updated_at
```

Possible `source` values:

- `purchase`;
- `admin_grant`;
- `beta_reward`;
- `promo`.

### 15.4 client_sessions

```text
id
user_id
minecraft_uuid
session_hash
created_at
expires_at
last_seen
revoked_at
```

### 15.5 web_login_requests

```text
id
verification_code_hash
minecraft_uuid
user_id
status
created_at
expires_at
approved_at
denied_at
```

Prefer storing a hash of the verification code rather than the plaintext code when practical.

### 15.6 web_sessions

```text
id
user_id
session_hash
created_at
expires_at
last_seen
revoked_at
```

### 15.7 transactions

Create the table/schema shape only when useful for the future payment abstraction. No real Beta-1 transaction flow is required.

## 16. Cosmetic Ownership

The backend is authoritative for ownership.

Example endpoint:

```http
GET /api/cosmetics/owned
```

Example response:

```json
{
  "cosmetics": [
    {
      "id": "veltrix_dragon",
      "owned": true,
      "equipped": true
    }
  ]
}
```

Ownership is never accepted from client-provided claims.

The website may browse public cosmetic definitions without authentication, but the following require an authenticated VELTRIX web session:

- owned inventory;
- equip;
- unequip;
- account management;
- future purchasing.

## 17. Equip / Unequip

Equip endpoint:

```http
POST /api/cosmetics/equip
Content-Type: application/json

{
  "cosmeticId": "veltrix_dragon"
}
```

Unequip endpoint:

```http
POST /api/cosmetics/unequip
Content-Type: application/json

{
  "cosmeticId": "veltrix_dragon"
}
```

Backend validation must confirm:

- authenticated session;
- cosmetic exists;
- cosmetic is enabled;
- user owns the cosmetic;
- equip-slot conflicts are resolved according to cosmetic category rules.

The backend writes authoritative equip state before emitting realtime events.

## 18. Realtime Sync

Use WebSocket for low-latency client updates.

Candidate events:

- `web_login_request`;
- `web_login_approved`;
- `web_login_denied`;
- `cosmetic_owned`;
- `cosmetic_equipped`;
- `cosmetic_unequipped`;
- `account_updated`;
- `session_revoked`.

Example equip sequence:

```text
Website
↓
POST /api/cosmetics/equip
↓
Backend validates ownership
↓
PostgreSQL update
↓
WebSocket event
↓
VELTRIX Client
↓
Client refreshes / applies cosmetic state
```

If WebSocket is interrupted, the client must re-fetch authoritative state over REST after reconnect.

## 19. Account Page

Account UI may show:

- Minecraft avatar / head;
- Minecraft username;
- Minecraft UUID;
- VELTRIX account / user ID in safe display form;
- VELTRIX Member status;
- client connected / disconnected status;
- owned cosmetics count/list;
- equipped cosmetics;
- account creation date.

Do not display sensitive Microsoft data, access tokens, refresh tokens, or secrets.

## 20. My Cosmetics

Provide a `MY COSMETICS` inventory section.

Filters:

- All;
- Pets;
- Wings;
- Capes;
- Emotes;
- Shoulder Cosmetics.

Only owned items are shown here.

Each owned card exposes equip state and `EQUIP` / `UNEQUIP` where supported.

## 21. 3D Preview

A true interactive 3D preview is optional for the first implementation phase.

The frontend design must reserve a preview area capable of later supporting:

- Minecraft player model;
- cosmetic attached to the player;
- drag-to-rotate;
- zoom.

For Beta 1, static or pre-rendered previews are acceptable where a true model viewer is not yet available.

Do not block the rest of the shop on 3D preview implementation.

## 22. Client Status Indicator

The website may show a small status indicator:

```text
● Veltrix Connected
```

or

```text
○ Veltrix Not Connected
```

This state must come from authenticated backend session state where applicable, not from a cosmetic frontend-only boolean.

## 23. Admin Model

Prepare backend authorization for roles such as:

- `USER`;
- `MODERATOR`;
- `ADMIN`;
- `OWNER`.

Recommended rules:

- `USER`: normal account actions;
- `MODERATOR`: no cosmetic-definition mutation by default;
- `ADMIN`: cosmetic create/edit/enable/disable/grant operations;
- `OWNER`: critical system-level actions and privileged overrides.

Candidate admin endpoints:

```text
GET    /api/admin/cosmetics
POST   /api/admin/cosmetics
PATCH  /api/admin/cosmetics/:id
POST   /api/admin/cosmetics/:id/grant
POST   /api/admin/cosmetics/:id/disable
```

Do not build a separate full admin frontend in the first phase unless an existing admin UI is available to extend.

## 24. Payment Architecture

Payments are disabled for Beta 1.

The backend should nevertheless isolate future payment integration behind an interface such as:

```text
PaymentProvider
├── createCheckout()
├── verifyPayment()
└── refundPayment()
```

Beta 1 requirements:

- no real checkout;
- no real charge;
- no payment secret;
- no fake successful purchase flow;
- `BUY NOW` remains disabled or replaced by `COMING SOON`;
- test ownership may be granted through controlled admin tooling.

A future payment provider can be added without redesigning ownership logic.

## 25. Security Controls

The backend must implement defense-in-depth.

Required controls:

- HTTPS only in production;
- secure server-side session handling;
- explicit CORS allowlist;
- HttpOnly cookies for web sessions where technically applicable;
- SameSite cookie policy appropriate to the deployed origins;
- CSRF protection for cookie-authenticated state-changing requests;
- rate limiting;
- input validation;
- normalized usernames where lookup is used;
- UUID-based identity internally;
- authorization checks on every protected endpoint;
- secure token generation;
- token/session hashing where practical;
- expiration and revocation;
- request-size limits;
- Helmet / security headers;
- audit logging for privileged admin actions;
- environment-variable secrets;
- no secrets in frontend JavaScript.

Apply stricter rate limits to:

- `/api/auth/*`;
- `/api/client/*`;
- `/api/web-login/*`;
- `/api/session/*`;
- `/api/admin/*`;
- future `/api/payment/*`;
- mutation endpoints under `/api/cosmetics/*`.

## 26. Error Handling

### 26.1 Frontend

Backend outages must degrade gracefully.

Examples:

- public shop catalog may show cached/static Coming Soon content if API is unavailable;
- account controls show a clear unavailable state;
- homepage, downloads, news, privacy, and support remain usable;
- no infinite loading indicators.

### 26.2 Backend

Use structured error responses with stable machine-readable codes.

Do not expose stack traces, database details, token hashes, or secrets in production responses.

## 27. Backend Project Structure

Recommended repository layout:

```text
backend/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── config/
│   ├── auth/
│   ├── client/
│   ├── web-login/
│   ├── cosmetics/
│   ├── websocket/
│   ├── admin/
│   ├── payments/
│   ├── database/
│   ├── middleware/
│   └── shared/
├── migrations/
├── tests/
├── package.json
├── tsconfig.json
└── .env.example
```

Production `.env` files must never be committed.

## 28. Frontend Project Changes

Expected additions may include:

```text
cosmetics.html
account.html
cosmetics.js
account.js
assets/cosmetics/
```

Existing `index.html`, `style.css`, and `script.js` should be extended conservatively.

The intro may live on the existing homepage rather than requiring a new route.

A shared frontend API helper is preferred over duplicating raw fetch logic across multiple files.

## 29. Railway Deployment Model

Use Railway for:

- Node.js API service;
- WebSocket endpoint;
- PostgreSQL database;
- production environment variables.

Suggested environment variables:

```text
NODE_ENV=production
DATABASE_URL=...
SESSION_SECRET=...
TOKEN_PEPPER=...
CORS_ORIGIN=...
```

Additional secrets should be added only when needed.

The backend health endpoint should be lightweight and safe for Railway health checks.

## 30. GitHub Pages Build Constraints

The existing GitHub Pages build pipeline must continue to work.

`assets/`, new static shop files, and any account frontend files required at runtime must be copied into `_site` by `scripts/build-site.py`.

Existing deployment behavior must remain intact:

- GitHub Pages project URL remains supported;
- no accidental CNAME requirement;
- current installer URL remains valid;
- privacy page remains valid;
- current Discord support link remains valid;
- current `news.json` flow remains valid;
- frontend must pass existing site contracts plus new cosmetic/intro contracts.

## 31. API Surface — Initial Beta

The exact route naming can be refined during implementation, but the initial contract should cover:

### Public

```text
GET /api/health
GET /api/cosmetics
GET /api/cosmetics/:id
```

### Client Authenticated

```text
POST /api/client/session
POST /api/client/heartbeat
POST /api/client/session/revoke
GET  /api/client/web-login/requests
POST /api/client/web-login/:id/approve
POST /api/client/web-login/:id/deny
GET  /api/client/cosmetics
```

### Web Login

```text
POST /api/web-login/request
GET  /api/web-login/:id/status
POST /api/web-login/:id/complete
POST /api/web-session/logout
```

### Authenticated Web Account

```text
GET  /api/account
GET  /api/cosmetics/owned
POST /api/cosmetics/equip
POST /api/cosmetics/unequip
```

### Admin

```text
GET    /api/admin/cosmetics
POST   /api/admin/cosmetics
PATCH  /api/admin/cosmetics/:id
POST   /api/admin/cosmetics/:id/grant
POST   /api/admin/cosmetics/:id/disable
```

## 32. Phased Delivery

### Phase 1 — Frontend Shop & Intro

Deliver:

- session-based intro overlay;
- Cosmetics navigation;
- shop hero;
- categories;
- search;
- sorting;
- rarity visuals;
- cosmetic cards;
- cosmetic detail modal/page;
- VELTRIX Dragon Coming Soon seed content;
- responsive/mobile behavior;
- no real checkout.

### Phase 2 — Railway Backend & Account Bridge

Deliver:

- Node.js/TypeScript backend;
- PostgreSQL migrations;
- client sessions;
- token hashing;
- heartbeat;
- web-login request flow;
- one-time codes;
- client approve/deny;
- web session;
- basic account endpoint;
- rate limiting and validation.

### Phase 3 — Ownership & Realtime Cosmetics

Deliver:

- public cosmetics API;
- user ownership API;
- My Cosmetics;
- equip / unequip;
- WebSocket gateway;
- reconnect refresh;
- client cosmetic state synchronization;
- beta admin grants.

### Phase 4 — Admin & Payment Readiness

Deliver:

- admin authorization;
- cosmetic create/edit/disable/grant API;
- audit trail;
- payment-provider interface;
- transaction schema if needed;
- checkout remains disabled until separately approved and implemented.

## 33. Testing Strategy

Implementation must be regression-first where practical.

### 33.1 Frontend

Add contract tests for:

- Intro overlay structure;
- direct local VELTRIX logo use;
- `sessionStorage` intro behavior;
- Cosmetics navigation;
- shop categories;
- Dragon Coming Soon card;
- responsive CSS hooks;
- no active Beta-1 checkout;
- build output contains new files/assets.

Preserve all existing homepage and GitHub Pages contracts.

### 33.2 Backend

Use automated tests for:

- session-token creation and hashing;
- expired/revoked session rejection;
- heartbeat updates;
- username lookup not equaling authentication;
- one-time login code lifecycle;
- approve / deny / expire states;
- web session creation;
- ownership authorization;
- equip only when owned;
- unauthorized admin rejection;
- rate-limit behavior on sensitive routes;
- WebSocket authentication;
- reconnect state refresh;
- disabled payment behavior.

### 33.3 Integration

Integration tests should cover:

1. client session established;
2. website login requested;
3. client receives request;
4. request approved;
5. browser web session established;
6. owned cosmetics fetched;
7. cosmetic equipped;
8. realtime event received by client;
9. REST refresh matches database state.

## 34. Observability

Backend should expose operational visibility without leaking personal data or secrets.

Recommended:

- structured request logs;
- error logs;
- health endpoint;
- connection counts;
- WebSocket connection/reconnect metrics where useful;
- admin-action audit records;
- no raw bearer tokens in logs;
- no secret environment values in logs.

## 35. Privacy / Data Minimization

Store only what is needed for VELTRIX account and cosmetic functionality.

Do not persist unnecessary Microsoft account data.

Public account UI must not expose sensitive identifiers beyond what is intentionally needed for Minecraft / VELTRIX account display.

Session/token secrets must not be exposed through account endpoints.

## 36. Design Consistency

The Cosmetics and Account UI must use the existing VELTRIX visual system:

- nearly black / graphite backgrounds;
- existing typography approach;
- existing button shapes;
- existing border radii;
- current spacing rhythm;
- restrained cyan accent;
- white/gray copy;
- subtle cyan/violet brand glow only where useful;
- existing responsive conventions.

The new pages must feel like extensions of the same product, not a separate web shop template.

## 37. Non-Goals for Initial Implementation

The first implementation does not need to:

- charge real money;
- integrate Stripe or PayPal;
- render a production 3D Minecraft model viewer;
- expose a full admin dashboard UI;
- migrate the frontend away from GitHub Pages;
- replace Microsoft authentication in the client;
- make the VELTRIX Dragon purchasable before the cosmetic exists in the client;
- store Microsoft secrets in the frontend;
- guarantee all future cosmetic categories are already implemented in the Minecraft client.

## 38. Migration & Risk Control

Key risk controls:

- implement in phases;
- preserve the working static website at every phase;
- keep backend-dependent controls clearly unavailable when the backend is down;
- keep payment disabled;
- do not treat username presence as identity proof;
- use UUID internally after verification;
- preserve existing installer and support URLs;
- do not modify launcher/client behavior until the backend contract for that step is defined and tested;
- deploy Railway changes independently from GitHub Pages changes where possible;
- add feature flags for unfinished backend-connected UI if useful.

## 39. Acceptance Criteria

The design is implemented successfully when:

- [ ] Existing VELTRIX homepage remains recognizable and functional.
- [ ] Existing download flow remains functional.
- [ ] Existing news and privacy flow remains functional.
- [ ] Intro appears once per browser session and exits cleanly.
- [ ] Intro respects reduced-motion preferences.
- [ ] Cosmetics page matches existing VELTRIX styling.
- [ ] All planned shop categories exist.
- [ ] Search and sorting work.
- [ ] VELTRIX Dragon appears as Coming Soon.
- [ ] No real checkout is active in Beta 1.
- [ ] Railway backend can run independently of GitHub Pages.
- [ ] PostgreSQL migrations create required account/session/cosmetic tables.
- [ ] Minecraft username alone cannot authenticate a website session.
- [ ] Website login requires an authenticated client confirmation.
- [ ] One-time login requests expire.
- [ ] Raw durable session tokens are not persisted in plaintext where avoidable.
- [ ] Web sessions can be revoked.
- [ ] Public cosmetic browsing works without login.
- [ ] Owned inventory requires authentication.
- [ ] Equip / unequip requires ownership.
- [ ] Client receives cosmetic-state updates through WebSocket.
- [ ] REST reconnect refresh restores authoritative state.
- [ ] Admin cosmetic mutation requires privileged role.
- [ ] No secrets are shipped in frontend JavaScript.
- [ ] Sensitive endpoints are rate-limited and validated.
- [ ] GitHub Pages contracts pass.
- [ ] Backend automated tests pass.
- [ ] Railway deployment health check passes.
- [ ] GitHub Pages deployment passes after frontend changes.

## 40. Final Product Direction

VELTRIX should remain a client-first product website rather than becoming a generic Minecraft shop.

The shop, account bridge, and backend are supporting systems around the VELTRIX Client. The primary product remains the client itself, and the website should continue to communicate Beta / Early Access status clearly while progressively enabling secure account and cosmetic functionality.