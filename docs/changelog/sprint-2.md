# Sprint 2 — Google Workspace Infrastructure

**Status:** Complete

**Period:** 2026-07 (July)

**Goal:** Deploy Google Sheets + Apps Script as the lead persistence backend.

---

## Infrastructure Completed

- Google Spreadsheet "Roseair Leads" created with typed worksheets
- Google Apps Script Web App deployed and published
- Webhook URL configured in production environment
- `GOOGLE_SHEETS_WEBHOOK_URL` active in `.env.production`
- Webhook validated with curl (HTTP 200)
- Google Sheets verified receiving lead records
- Node.js `fetch` connectivity confirmed via `store.ts`
- Environment loading migrated from PM2 `env_file` to Node `--env-file`
- PM2 configuration file format changed to CommonJS (`ecosystem.config.cjs`)
- Production server connected to Google Sheets pipeline

---

## Files Created or Modified

| File | Action | Purpose |
|------|--------|---------|
| `docs/architecture/lead-architecture.md` | Created | Foundation architecture document |
| `docs/architecture/api-contract.md` | Created | API contract — form types, responses, versioning |
| `docs/architecture/google-sheets-setup.md` | Created | Deployment guide for Google Workspace |
| `docs/adr/0001-lead-capture-architecture.md` | Created | Architecture decision record |
| `ecosystem.config.cjs` | Created | PM2 config (CommonJS, replaced `ecosystem.config.js`) |
| `.env.production.example` | Updated | Added environment variable documentation |

**Note:** The Google Apps Script code (`Code.gs`) was deployed directly in the
Apps Script editor and is not version-controlled in this repository.

---

## Architectural Decisions

1. **Node `--env-file` over PM2 `env_file`.** PM2's `env_file` was unreliable
   on Ubuntu 24.04 — variables were inconsistently loaded. Node's built-in
   `--env-file` support provides deterministic loading and improves
   portability across deployment environments (PM2, systemd, Docker).

2. **CommonJS ecosystem config.** `ecosystem.config.js` was replaced with
   `ecosystem.config.cjs` to ensure compatibility with PM2's loading
   mechanism regardless of the project's ESM configuration.

3. **Incremental migration — Resend retained.** The three Resend server
   functions remain in the codebase and are still active in the existing
   form routes. They will be replaced by the unified `submitLead` server
   function during Sprint 3. This staggered approach prevents lead loss
   during the transition.

4. **Webhook URL not committed.** The actual `GOOGLE_SHEETS_WEBHOOK_URL`
   value exists only in the server's `.env.production`. The repository's
   `.env.production.example` contains only the variable name and
   placeholder documentation.

---

## Problems Encountered and Solutions

| Problem | Solution |
|---------|----------|
| Google Apps Script redirects confusing curl | Used `--max-redirs 0` for verification; relied on Node `fetch` for integration testing |
| PM2 `env_file` not loading variables on Ubuntu 24.04 | Switched to Node `--env-file=.env.production` |
| Apps Script generating new URL per deployment | Documented in troubleshooting guide; URL stored server-side only |

---

## Open Items for Sprint 3

| Item | Priority | Description |
|------|----------|-------------|
| Connect forms to `submitLead` | High | Update `contacto.tsx`, `simulador.tsx`, `equipa.tsx` to use `useLeadSubmit` |
| WhatsApp redirect activation | Medium | Enable `whatsappUrl` in `FormSuccess` after successful submits |
| End-to-end validation per form type | High | Verify contact, proposal, and application flows end-to-end |
| Remove legacy Resend server functions | Medium | Delete `contact-form.ts`, `request-proposal.ts`, `job-application.ts` |
| Update `.env.example` | Low | Add `GOOGLE_SHEETS_WEBHOOK_URL` placeholder alongside Resend vars |