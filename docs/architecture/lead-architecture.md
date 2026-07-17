# Lead Capture System Architecture

## Context

The Roseair Logistics website receives lead submissions through three distinct form
types: contact inquiries, personalised freight proposals, and spontaneous job
applications. Each form was originally backed by a dedicated Resend-based server
function that emailed the submission to the commercial team.

This architecture replaces the email-forwarding pattern with a persistent,
immediately-accessible lead store while keeping the existing Resend/email
infrastructure in place as a fallback.

## Architecture Overview

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────────────────┐
│   Browser    │────▶│  submitLead()    │────▶│  saveLead() (store)             │
│ (useForm)    │     │  (server fn)     │     │  POST → GOOGLE_SHEETS_WEBHOOK   │
└──────────────┘     └──────────────────┘     └─────────────────────────────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │  Google Apps     │
                                                │  Script Web App  │
                                                └──────────────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │  Google Sheets   │
                                                │  (Roseair Leads) │
                                                └──────────────────┘

WhatsApp integration is deferred to Sprint 3.
```

The system is composed of six modules:

| Module | Location | Responsibility |
|--------|----------|----------------|
| **schemas** | `src/lib/leads/schemas.ts` | Zod discriminated union, type exports |
| **store** | `src/lib/leads/store.ts` | Persistence — POST to webhook URL |
| **message** | `src/lib/leads/message.ts` | WhatsApp message builder |
| **hooks** | `src/lib/leads/hooks.ts` | React hook — submit, honeypot, state |
| **submit-lead** | `src/server/submit-lead.ts` | Single server function endpoint |
| **index** | `src/lib/leads/index.ts` | Barrel — public API surface |

No interfaces are used. The store layer is a single exported async function,
not an abstract class or interface. Abstraction will be introduced when a
second storage provider exists (see Future Migration Path).

## Data Flow

### Standard submission

1. User fills form in browser (react-hook-form or manual state)
2. On submit, `useLeadSubmit().submit(data)` is called
3. Hook appends honeypot value (`hpProps` ref), calls `submitLead()` server fn
4. Server fn validates with Zod (discriminated union)
5. Honeypot check — if `_hp_` is populated, return success silently
6. Rate limit check — 5 req/min per IP via in-memory Map
7. Server calls `saveLead(lead)` which POSTs JSON to `GOOGLE_SHEETS_WEBHOOK_URL`
8. Success/error response propagates back to browser
9. [DEFERRED — Sprint 3] On success, hook will build WhatsApp URL via `buildWhatsAppMessage(lastLead)`
10. [DEFERRED — Sprint 3] FormSuccess component will render WhatsApp share button using `whatsappUrl`

### WhatsApp flow [DEFERRED]

The WhatsApp redirection flow is implemented in the codebase (`message.ts`,
`hooks.ts` `whatsappUrl` field) but is not yet active in the existing form
routes. Enabling it is part of Sprint 3 — frontend integration — where the
three routes (contacto, simulador, equipa) will be updated to use the
`useLeadSubmit` hook and receive the computed WhatsApp URL.

## Component Specifications

### schemas.ts

**Purpose:** Single source of truth for all form validation.

**Exports:**
- `contactLeadSchema` — Zod object for contact form
- `proposalLeadSchema` — Zod object for proposal form
- `applicationLeadSchema` — Zod object for application form
- `leadSchema` — `z.discriminatedUnion("type", [...])` combining all three
- `LeadInput` — inferred type of `leadSchema`
- `Lead` — `LeadInput & { submittedAt: string }`
- `SubmitResult` — `{ success: boolean; message: string }`
- `StoreResult` — `{ success: true; id?: string } | { success: false; error: string }`

**Design notes:**
- All schemas share `baseFields` (name, email, honeypot)
- Each schema enforces at least one literal `type` value
- Honeypot field (`_hp_`) is optional in schema, checked in server fn
- Proposal schema has the most fields (20+) reflecting the simulator output

### store.ts

**Purpose:** Persist a validated lead. The only module that touches
`GOOGLE_SHEETS_WEBHOOK_URL`.

**Exports:**
- `saveLead(lead: Lead): Promise<StoreResult>`

**Design notes:**
- Reads `process.env.GOOGLE_SHEETS_WEBHOOK_URL` directly
- Returns error when env var is missing (explicit, no silent failure)
- Returns error when HTTP response is non-2xx
- Returns error when `fetch` throws (network, DNS, timeout)
- No retry logic — considered a concern of the receiver

### message.ts

**Purpose:** Build a WhatsApp deep-link URL with pre-populated message.

**Status:** Implemented in codebase. Not yet active in routes. [DEFERRED — Sprint 3]

**Exports:**
- `buildWhatsAppMessage(lead: Lead): string`

**Design notes:**
- Formats numbers with Portuguese locale (`pt-PT`)
- Currency formatting uses `Intl.NumberFormat`
- Only includes non-null, non-zero fields
- Always includes name, email, phone (where applicable)
- Message varies by lead type

### hooks.ts

**Purpose:** Provide React state management for lead submission.

**Exports:**
- `useLeadSubmit(): UseLeadSubmitResult`

**Return value fields:**
- `submit(data)` — async, returns `SubmitResult`, manages `submitting`/`submitted` state
- `submitting` — boolean, true during server call
- `submitted` — boolean, true after success
- `setSubmitted(v)` — manual override for dialog reset
- `reset()` — clears submitted state and lastLead
- `hpProps` — spreadable props for honeypot input element
- `lastLead` — full `Lead` object from last successful submit
- `whatsappUrl` — computed WhatsApp URL, undefined when no lead submitted

**Design notes:**
- Honeypot ref is managed inside the hook, not exposed to routes
- Whatsapp URL is derived state (`lastLead && submitted`)
- Toast notifications are called inside the hook

### submit-lead.ts

**Purpose:** Server function — single endpoint for all three lead types.

**Exports:**
- `submitLead` — `createServerFn({ method: "POST" })`

**Handler order:**
1. Zod input validation (via `inputValidator(leadSchema)`)
2. Honeypot check (early return with success)
3. Rate limit check (early return with error)
4. Attach `submittedAt` timestamp
5. Call `saveLead(lead)`
6. Return success or error

**Design notes:**
- Messages map is per-type (`contact`, `proposal`, `application`)
- Honeypot returns success, not error (bots don't get feedback)
- Rate limit error message in Portuguese
- Zod validation errors return 400 automatically via TanStack Start

### index.ts

**Purpose:** Barrel — controlled public API surface for the leads module.

**Exports:** All schemas, types, `buildWhatsAppMessage`, `useLeadSubmit`, `saveLead`.

## Environment Configuration

| Variable | Required | Status | Description |
|----------|----------|--------|-------------|
| `GOOGLE_SHEETS_WEBHOOK_URL` | Yes (production) | **Configured** | Apps Script Web App deployment URL |
| `RESEND_API_KEY` | No (legacy) | Retained | Legacy email delivery — rollback only |
| `CONTACT_EMAIL` | No (legacy) | Retained | Legacy email recipient |
| `FROM_EMAIL` | No (legacy) | Retained | Legacy verified sender domain |

Environment variables are loaded at Node.js runtime via the `--env-file`
flag (`--env-file=.env.production`). This approach replaced PM2's `env_file`
after it proved unreliable in this specific Ubuntu 24.04 deployment.

The configuration loading strategy is documented in ADR-0001 (Operational
Decisions section).

## Deployment Architecture

- **Server:** Ubuntu 24.04, Node 20 LTS, PM2 (`ecosystem.config.cjs` — CommonJS format)
- **Environment loading:** Node `--env-file=.env.production` (not PM2 `env_file`)
- **Reverse proxy:** Nginx (`nginx/roseair.conf`), TLS via Certbot
- **Startup:** `server.js` — Node HTTP wrapper, serves `dist/client`, delegates SSR
- **Health:** `GET /health` returns JSON with `status`, `timestamp`, `uptime`, `buildLoaded`
- **CI/CD:** GitHub Actions — push to main deploys via SSH

## Future Migration Path

When the organisation requires a dedicated backend (ASP.NET Core API):

1. Create `src/lib/leads/store-aspnet.ts` implementing the same `saveLead` signature
2. Change one import in `src/server/submit-lead.ts`
3. Deploy backend independently
4. Update `GOOGLE_SHEETS_WEBHOOK_URL` or replace with `ASPNET_API_URL`

No architectural changes needed at the schema, server function, hook, or route
level. The discriminated union contract travels with the POST body.

## Glossary

| Term | Definition |
|------|------------|
| Lead | A validated form submission with type, fields, and timestamp |
| Store | The persistence layer — currently Google Sheets via webhook |
| Honeypot | Hidden form field that bots fill but humans don't |
| WhatsApp URL | `wa.me` deep link with pre-encoded message text |
| Discriminated union | Zod union where the `type` field selects the schema |
| Barrel | Re-export module that aggregates sub-module exports |
| Separation of concerns | Store is replaceable; schemas are shared; server is thin |
