# Google Sheets Integration — Deployment Guide

## Infrastructure Status

| Item | Status |
|------|--------|
| Spreadsheet | ✅ Completed |
| Apps Script | ✅ Completed |
| Deployment | ✅ Completed |
| Production Web App | ✅ Completed |
| Node connectivity | ✅ Completed |
| Environment configuration | ✅ Completed |
| Website integration | ⬜ Pending (Sprint 3) |
| WhatsApp integration | ⬜ Pending (Sprint 3) |
| Remove Resend | ⬜ Pending (Sprint 3+) |

## Prerequisites

- A Google account with access to Google Sheets and Google Apps Script
- `GOOGLE_SHEETS_WEBHOOK_URL` will be added to the deployment environment
- Node.js 20+ runtime for the web application

## Step 1: Create the Spreadsheet

1. Open Google Sheets
2. Create a new spreadsheet named `Roseair Leads`
3. Share the spreadsheet with the Google account that will run Apps Script
   (typically the same account)

## Step 2: Create Worksheets

Create one worksheet per lead type plus utility sheets:

| Worksheet | Purpose |
|-----------|---------|
| `Leads` | All leads — master table |
| `Contactos` | Contact form submissions only |
| `Propostas` | Proposal submissions only |
| `Candidaturas` | Job application submissions only |
| `Erros` | Failed POST payloads for manual inspection |
| `Config` | Environment values, webhook health state |

### Column headers — Leads (master)

| Column | Header | Type | Description |
|--------|--------|------|-------------|
| A | `id` | string | UUID generated in Apps Script |
| B | `submittedAt` | string | ISO 8601 timestamp |
| C | `type` | string | `contact`, `proposal`, or `application` |
| D | `name` | string | Submitter name |
| E | `email` | string | Submitter email |
| F | `phone` | string | Submitter phone (may be empty for applications) |
| G | `company` | string | Company name (optional) |
| H | `service` | string | Service of interest (contact only) |
| I | `message` | string | Message body |
| J | `role` | string | Desired role (application only) |
| K | `origin` | string | Origin (proposal only) |
| L | `destination` | string | Destination (proposal only) |
| M | `currency` | string | Currency code (proposal only) |
| N | `cargoCategory` | string | Cargo type (proposal only) |
| O | `clearanceType` | string | Clearance type (proposal only) |
| P | `declaredFreight` | string | Declared freight value (proposal only) |
| Q | `preselectedService` | string | Pre-selected service (proposal only) |
| R | `exchangeRate` | number | Exchange rate (proposal only) |
| S | `fob` | number | FOB value (proposal only) |
| T | `freight` | number | Freight cost (proposal only) |
| U | `insurance` | number | Insurance cost (proposal only) |
| V | `cif` | number | CIF value (proposal only) |
| W | `cifMt` | number | CIF in MZN (proposal only) |
| X | `da` | number | DA value (proposal only) |
| Y | `ice` | number | ICE value (proposal only) |
| Z | `iva` | number | IVA value (proposal only) |
| AA | `sobretaxa` | number | Surcharge (proposal only) |
| AB | `fee` | number | Fee (proposal only) |
| AC | `totalTaxes` | number | Total taxes (proposal only) |
| AD | `total` | number | Total (proposal only) |
| AE | `consent` | boolean | GDPR consent flag (contact only) |

### Column headers — Contactos (subset)

| Column | Header |
|--------|--------|
| A | `submittedAt` |
| B | `name` |
| C | `email` |
| D | `phone` |
| E | `company` |
| F | `service` |
| G | `message` |
| H | `consent` |

### Column headers — Propostas (subset)

| Column | Header |
|--------|--------|
| A | `submittedAt` |
| B | `name` |
| C | `email` |
| D | `phone` |
| E | `company` |
| F–W | All proposal fields in the order shown in Leads |

### Column headers — Candidaturas (subset)

| Column | Header |
|--------|--------|
| A | `submittedAt` |
| B | `name` |
| C | `email` |
| D | `role` |
| E | `message` |

### Column headers — Erros

| Column | Header | Description |
|--------|--------|-------------|
| A | `receivedAt` | Timestamp of failed POST |
| B | `payload` | Raw JSON payload |
| C | `errorDetail` | Parsing or validation error |

### Column headers — Config

| Column | Header | Description |
|--------|--------|-------------|
| A | `key` | Configuration key |
| B | `value` | Configuration value |

## Step 3: Naming Conventions

- **Spreadsheet:** `Roseair Leads`
- **Worksheets:** Portuguese names matching the lead type
  (`Contactos`, `Propostas`, `Candidaturas`)
- **Column headers:** camelCase matching the Zod schema field names exactly
  (e.g. `cargoCategory`, `preselectedService`, `clearanceType`, `submittedAt`,
  `_hp_`)

## Step 4: Create the Apps Script Project

1. In the spreadsheet, navigate to **Extensions > Apps Script**
2. Name the project `Roseair Lead Webhook`
3. The script editor opens with a default `Code.gs` file

## Step 5: Publish as Web App

1. In Apps Script, click **Deploy > New deployment**
2. Type: **Web app**
3. Description: `Roseair lead capture webhook`
4. Execute as: **Me**
5. Who has access: **Anyone** (the server calls this URL, not end users)
6. Click **Deploy**
7. Copy the generated Web App URL — this is your `GOOGLE_SHEETS_WEBHOOK_URL`

## Step 6: Permissions

- The web app is public by necessity (the Node server needs to POST without
  OAuth) but is protected by:
  - **Secrecy of the URL** — the URL contains a random hash
  - **Server-side call only** — the URL is never exposed to the browser
  - **Optional origin check** — the Apps Script can verify the
    `X-Requested-With` header or a shared secret

## Step 7: Configure the Application (Completed)

The environment variable must be loaded at Node.js runtime via the `--env-file`
flag, not through PM2's `env_file`.

1. Set the variable in `.env.production` (server-side only, never committed):

```bash
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/...
```

2. The Node process loads it via:

```
node --env-file=.env.production server.js
```

3. In PM2, configure the startup command to include the flag:

```bash
pm2 start server.js --env-file .env.production --name roseair
```

**Note:** PM2's `env_file` in `ecosystem.config.cjs` (`env_file: ".env.production"`)
proved unreliable in this deployment. Node's built-in `--env-file` support is
the authoritative loading mechanism. Do not rely solely on PM2's `env_file`.

## Step 8: Testing with curl

### Successful submission

```bash
curl -X POST "$GOOGLE_SHEETS_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contact",
    "name": "Teste API",
    "email": "teste@exemplo.com",
    "phone": "+258 84 000 0000",
    "service": "Teste",
    "message": "Teste de integração do webhook.",
    "consent": true,
    "submittedAt": "2026-07-16T10:00:00.000Z"
  }'
```

### Expected response

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```

The response body from Google Apps Script is typically `text/html` containing
the return value from `doPost()`.

## Step 9: Testing with Postman

1. Create a new request: **POST**
2. URL: `{{GOOGLE_SHEETS_WEBHOOK_URL}}`
3. Headers: `Content-Type: application/json`
4. Body → raw → JSON: use one of the example payloads from the API contract
5. Send and verify the row appears in the spreadsheet

## Step 10: Verify End-to-End

Run the full flow through the web application:

1. Start the development server
2. Open the contact form in a browser
3. Submit with valid data
4. Verify the row appears in the spreadsheet within seconds
5. Repeat for proposal and application forms

## Lessons Learned

1. **PM2 `env_file` is unreliable on Ubuntu 24.04.** Variables set via
   `env_file: ".env.production"` in `ecosystem.config.cjs` were inconsistently
   loaded, causing `GOOGLE_SHEETS_WEBHOOK_URL` to be unavailable at runtime.
   Node's built-in `--env-file=.env.production` flag proved reliable and is
   now the official configuration strategy. This approach also improves
   portability — it works identically with `pm2`, `systemd`, Docker, or
   direct `node` invocation.

2. **Google Apps Script redirects can confuse curl.** The webhook URL
   performs an HTTP redirect during the `doPost()` lifecycle. A naive
   `curl -X POST <url>` may follow the redirect and return HTML rather than
   the expected response. Use `curl -X POST --max-redirs 0 <url>` to verify
   the initial response code, then test with the application's
   `fetch` (which handles redirects transparently).

3. **Node `fetch` validates the integration more reliably than curl.**
   The `store.ts` module uses the built-in Node `fetch`, which handles
   redirects and content negotiation correctly. Testing with the actual
   application code (`saveLead()`) provides a more accurate integration
   test than standalone curl commands.

4. **Apps Script deployments produce new URLs on each version.** Each
   deployment in Apps Script generates a new URL. The spreadsheet and
   script remain stable, but the webhook URL can change. Store the
   URL in the version-controlled `.env.production.example` as a
   placeholder and keep the actual value only in the server's `.env.production`.

5. **Webhook does not require authentication for this threat model.**
   The URL contains a random hash and is called exclusively from the
   server process (never from the browser). Combined with the
   application's rate limit (5 req/min per IP), this provides adequate
   protection without OAuth complexity.

## Rollback Strategy

If the webhook fails in production:

1. **Immediate:** Set `GOOGLE_SHEETS_WEBHOOK_URL` to an empty string
   (`pm2 restart roseair`) — the system returns a user-facing error and
   existing Resend infrastructure continues to work.
2. **Short-term:** Create a new deployment in Apps Script (fix the bug, deploy
   a new version, update the URL).
3. **Long-term:** Maintain two Google Sheets workspaces — `Roseair Leads`
   (active) and `Roseair Leads Standby` — and swap the URL in the env var.

## Troubleshooting

### Webhook returns 401 / 403

- Check that the web app is deployed with **Anyone** access
- Redeploy — URL changes on redeployment
- Verify the URL does not have trailing `/exec` vs `/dev` confusion
  (always use `/exec` for production)

### Rows appear but data is empty

- Column headers in the script must match the JSON key names exactly
  (camelCase)
- Check for leading/trailing whitespace in column headers
- Verify `submittedAt` is included in the POST body

### Spreadsheet not updating

- Open the Apps Script project and check **Executions** for error logs
- Common issue: script throws an exception on a malformed field — check
  the `Erros` worksheet
- Google Apps Script has a 6-minute execution timeout

### CORS errors in browser

- The webhook URL is called server-side by `store.ts`, not from the browser.
  CORS should not be relevant. If testing from a browser dev tool directly,
  use a CORS proxy or Apps Script's `ContentService`.

### Rate limiting from Google

- Apps Script web apps can be called ~30 times per minute per user
- Our application rate limit (5 req/min per IP) is well within this bound
- If rate-limited by Google, the response returns with HTTP 429 or
  `Service invoked too many times`

### Environment variable not picked up

- Verify the variable is in the correct `.env` file
- Restart PM2 after changing env vars: `pm2 restart roseair` (not just reload)
- Check PM2 logs: `pm2 logs roseair --lines 50`
