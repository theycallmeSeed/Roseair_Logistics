# ADR-0001: Lead Capture Architecture

## Status

Accepted (Infrastructure Implemented — Sprint 2 complete, Sprint 3 pending)

## Implementation Validation

The Google Workspace infrastructure has been successfully deployed and validated
as of Sprint 2. The following steps have been completed:

- Google Spreadsheet ("Roseair Leads") created with structured worksheets
- Google Apps Script web app deployed and published
- Webhook URL configured in production environment (`GOOGLE_SHEETS_WEBHOOK_URL`)
- Webhook tested with curl — HTTP 200 response received
- Webhook tested with Node.js `fetch` from `store.ts` — data persisted successfully
- Google Sheets verified receiving lead records in expected worksheet
- Production server connected to Google Sheets pipeline
- PM2 configuration migrated to `ecosystem.config.cjs` (CommonJS format)

The application integration (Sprint 3) — connecting the three frontend forms
to the `submitLead` server function — has not yet begun. The existing form
routes still use their original submission flows. Resend remains as a
temporary fallback.

### Operational Decisions

**Environment variable loading — dotenv via Node `--env-file`**

PM2's `env_file` directive proved unreliable in the Ubuntu 24.04 deployment.
Variables set via `env_file` were inconsistently loaded, causing the webhook
URL to be unavailable at runtime.

The solution adopted is Node's built-in `--env-file` flag:

```
node --env-file=.env.production server.js
```

This makes the application own its configuration loading rather than relying
on the process manager. It improves portability — the same mechanism works
with `pm2`, `systemd`, Docker, or direct Node invocation without any change
to the environment loading strategy.

**Incremental migration — Resend retained as rollback**

The three Resend server functions (`contact-form.ts`, `request-proposal.ts`,
`job-application.ts`) remain in the codebase and are still called by the
existing form routes. They will be replaced by the unified `submitLead` server
function during Sprint 3.

Resend is not removed until:
1. All three forms are connected to `submitLead`
2. Google Sheets persistence is verified end-to-end through each form type
3. The commercial team confirms data visibility

This staggered approach ensures no lead is lost during the transition.

## Context

The Roseair Logistics website accepts three types of form submissions:
contact inquiries, personalised freight proposals, and spontaneous job
applications. Each form was individually implemented with a dedicated
`createServerFn` that used the Resend API to email the submission to the
commercial team.

This architecture had three characteristics that motivated a change:

1. **Email as primary data store.** Leads existed only in inboxes. There was
   no central repository. If an email was deleted, misfiled, or went to spam,
   the lead was lost. The commercial team could not query, sort, or filter
   leads without manual email processing.

2. **Operational dependency on Resend.** The Resend API key
   (`re_KSDdLWjc_...`) was a single point of failure. Key rotation, account
   suspension, or API deprecation would break all three forms simultaneously.
   The `FROM_EMAIL` domain must be verified in Resend, adding onboarding
   friction.

3. **Three duplicated server functions.** Contact, proposal, and application
   each had their own `createServerFn`, their own Zod schema, their own email
   template, and their own Resend call. This tripled the maintenance surface
   for validation, error handling, rate limiting, and honeypot logic.

## Problem

The commercial team needed a way to see leads immediately, in a familiar
interface, without depending on email deliverability. The technical
requirement was to replace the email-forwarding pattern with a persistent
lead store that could later be migrated to a dedicated backend without
rewriting the frontend.

The client operates in Maputo, Moçambique, and prefers tools that are:

- Free or near-zero cost (no additional monthly subscriptions)
- Accessible from any device (mobile, desktop, low-bandwidth)
- Familiar to a non-technical team (spreadsheets)
- Quick to deploy (hours, not weeks)

## Options Considered

### 1. Resend (current, retained as rollback)

- **Complexity:** Already implemented. Three server functions, three email
  templates, Resend client library.
- **Cost:** Free tier (100 emails/day) sufficient for current volume.
- **Scalability:** Emails scale but inbox management does not. No query
  capability.
- **Maintenance:** Three functions to update when validation changes. API
  key must be kept secret.
- **Client usability:** The commercial team reads emails — familiar but
  fragile.

### 2. ASP.NET Core API (future migration target)

- **Complexity:** Full web application with database, API controllers,
  authentication, deployment pipeline. Requires a separate server or cloud
  resource.
- **Cost:** Server hosting + database. Would double the infrastructure
  footprint.
- **Scalability:** Excellent — relational database, pagination, filtering.
- **Maintenance:** Full-time maintenance of another application. Requires
  .NET expertise.
- **Client usability:** Would need a custom dashboard — not spreadsheet-
  friendly without additional development.

### 3. Firebase (Firestore + Cloud Functions)

- **Complexity:** Serverless but requires Firebase project setup, security
  rules, client SDK or REST integration.
- **Cost:** Pay-per-use. Free tier likely sufficient but unpredictable.
- **Scalability:** Excellent — Firestore is designed for this pattern.
- **Maintenance:** Google-managed infrastructure. SDK versioning and
  security rule updates required.
- **Client usability:** No built-in interface for viewing leads. Would
  need a dashboard or Sheets integration anyway.

### 4. Google Sheets + Apps Script (selected)

- **Complexity:** Single Apps Script file. One POST handler. Writes to a
  spreadsheet the team already knows how to use.
- **Cost:** Free. Google account required.
- **Scalability:** Sufficient for current volume (tens of leads per day,
  not thousands). Sheets caps at 10M cells — not a constraint.
- **Maintenance:** Minimal. Google manages hosting. The webhook URL only
  changes on redeployment.
- **Client usability:** Highest possible — the commercial team opens Google
  Sheets and sees new rows in real time. Mobile apps available. Can
  collaborate, comment, and filter without any training.

## Decision

Adopt Google Sheets + Apps Script as the lead storage backend.

The existing Resend infrastructure is retained as a rollback mechanism. The
server function (`submitLead`) writes to Google Sheets via POST webhook. The
Resend email functions remain in the codebase but are no longer called by the
forms. This dual-path approach allows:

- Immediate rollout of the Sheets pipeline
- Fallback if webhook is unavailable
- Gradual deprecation of Resend code after validation

The overall architecture follows a strict separation of concerns:

- **Schemas** (`schemas.ts`) — shared by client and server, implementation-
  independent
- **Store** (`store.ts`) — sole dependency on Google Sheets, replaceable
  via single import change
- **Server** (`submit-lead.ts`) — thin handler, no storage logic
- **Hooks** (`hooks.ts`) — React state, no backend coupling
- **Message** (`message.ts`) — WhatsApp URL builder, no storage coupling

## Implementation Validation

The Google Workspace infrastructure has been implemented and validated:

- **Spreadsheet created** — `Roseair Leads` with six worksheets (`Leads`,
  `Contactos`, `Propostas`, `Candidaturas`, `Erros`, `Config`)
- **Apps Script deployed** — `Roseair Lead Webhook` project with `doPost`
  handler writing to the appropriate worksheets
- **Web App published** — Deployed as "Execute as: Me", "Who has access:
  Anyone" at the production URL
- **Webhook tested successfully** — `curl` POST returned HTTP 200
- **Google Sheets persistence verified** — Test payloads appeared in the
  `Leads` and type-specific worksheets within seconds
- **Production environment configured** — `GOOGLE_SHEETS_WEBHOOK_URL`
  loaded via Node `--env-file=.env.production`

The webhook is operational. The application integration (Sprint 3) will
connect the existing form routes to the `submitLead` server function.

## Consequences

### Positive

1. **Real-time visibility.** The commercial team sees leads appear in the
   spreadsheet within seconds of submission. No email polling required.
2. **Zero additional cost.** Google Sheets and Apps Script are free for this
   usage level.
3. **Familiar interface.** The team already uses spreadsheets. No new tool
   to learn.
4. **Reduced code footprint.** Three server functions collapsed into one.
   Three email templates eliminated. Zod schemas unified.
5. **Rate limiting and honeypot applied uniformly.** Single implementation
   in the server function, not duplicated across three handlers.
6. **Future migration is trivial.** The store layer is a single async
   function. ASP.NET Core API or any other backend can be swapped in by
   changing one import.

### Negative

1. **Google dependency.** If Google Sheets is blocked (network policy,
   regional outage) or the Apps Script quota is exceeded, leads stop
   persisting. The system degrades to a user-facing error message.
2. **No offline queue.** If the webhook URL is unreachable at submission
   time, the lead is lost. The store function does not retry or buffer.
3. **Apps Script limitations.** 6-minute execution timeout, 30 req/min
   rate limit, no built-in authentication for webhook calls. Mitigated by
   the application-level rate limit (5 req/min per IP).

### Operational Decisions

The following operational decisions were made during implementation:

- **Incremental migration.** The Google Sheets pipeline is validated in
  isolation before any production form traffic is redirected. Resend
  remains the active submission path until the migration is explicitly
  executed.
- **Resend retained as rollback.** The legacy email functions (`contact-form.ts`,
  `request-proposal.ts`, `job-application.ts`) and Resend package are not
  removed. They can be re-enabled by reverting a single import in the
  affected routes.
- **Google Sheets validated before replacing production flow.** No form
  route was switched to `submitLead` until the webhook returned HTTP 200
  and data appeared in the spreadsheet.
- **Environment loading via Node `--env-file`.** PM2's `env_file` proved
  unreliable on Ubuntu 24.04. The production deployment now uses
  `node --env-file=.env.production server.js` (configured in
  `ecosystem.config.cjs`). This gives the application direct ownership of
  configuration loading and improves portability across process managers.

### Future Migration Path

When lead volume or organisational requirements justify a dedicated backend:

1. Create `src/lib/leads/store-aspnet.ts` with the same `saveLead` signature
2. Change the import in `src/server/submit-lead.ts`
3. Deploy ASP.NET Core API behind the same Nginx reverse proxy
4. Migrate existing Google Sheets data to the database
5. Deprecate the Sheets webhook URL
6. Remove Resend code (`lib/resend.ts`, `lib/email/`, `resend` package)

The transition requires zero frontend changes, zero schema changes, and zero
route changes. The API contract is preserved.
