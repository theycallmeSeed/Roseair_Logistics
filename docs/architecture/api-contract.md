# Lead API Contract

## Purpose

This document defines the public contract between the frontend forms and the
lead submission API. It is implementation-independent — any backend satisfying
this contract can replace the current implementation without frontend changes.

## Endpoint

```
POST /_server/...
Content-Type: application/json
```

The exact URL path is managed by TanStack Start's `createServerFn`. The
frontend calls `submitLead({ data })` which resolves to this endpoint at
build time.

There is no version prefix in the URL. Versioning is schema-driven (see
Versioning Strategy below).

## Supported Form Types

Three form types are supported, distinguished by the `type` field in the
request body.

### Contact

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `type` | `"contact"` | yes | literal value |
| `name` | string | yes | 2–100 chars, trimmed |
| `email` | string | yes | valid email, max 255 chars |
| `phone` | string | yes | 6–40 chars, trimmed |
| `company` | string | no | max 120 chars, trimmed |
| `service` | string | yes | non-empty |
| `message` | string | yes | 10–1000 chars, trimmed |
| `consent` | `true` | yes | must be boolean `true` |
| `_hp_` | string | no | honeypot, silently discarded |

```json
{
  "type": "contact",
  "name": "Ana Silva",
  "email": "ana@exemplo.com",
  "phone": "+258 84 123 4567",
  "company": "Exemplo Lda",
  "service": "Transporte Marítimo",
  "message": "Gostaria de solicitar um orçamento para transporte marítimo de contentor de 20 pés.",
  "consent": true
}
```

### Proposal

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `type` | `"proposal"` | yes | literal value |
| `name` | string | yes | 2–100 chars, trimmed |
| `email` | string | yes | valid email, max 255 chars |
| `phone` | string | yes | 6–40 chars, trimmed |
| `company` | string | no | max 120 chars, trimmed |
| `origin` | string | no | free text |
| `destination` | string | no | free text |
| `currency` | string | no | free text |
| `cargoCategory` | string | no | free text |
| `clearanceType` | string | no | free text |
| `declaredFreight` | string | no | free text |
| `preselectedService` | string | no | free text |
| `exchangeRate` | number | no | number |
| `fob` | number | no | number |
| `freight` | number | no | number |
| `insurance` | number | no | number |
| `cif` | number | no | number |
| `cifMt` | number | no | number |
| `da` | number | no | number |
| `ice` | number | no | number |
| `iva` | number | no | number |
| `sobretaxa` | number | no | number |
| `fee` | number | no | number |
| `totalTaxes` | number | no | number |
| `total` | number | no | number |
| `_hp_` | string | no | honeypot, silently discarded |

```json
{
  "type": "proposal",
  "name": "Carlos Mondlane",
  "email": "carlos@exemplo.com",
  "phone": "+258 82 987 6543",
  "company": "Mondlane Import",
  "origin": "Xangai, China",
  "destination": "Maputo, Moçambique",
  "cargoCategory": "Contentor 40 pés",
  "currency": "USD",
  "fob": 15000,
  "freight": 3200,
  "insurance": 450,
  "cif": 18650,
  "iva": 3357,
  "total": 22007
}
```

### Application

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `type` | `"application"` | yes | literal value |
| `name` | string | yes | 2–100 chars, trimmed |
| `email` | string | yes | valid email, max 255 chars |
| `role` | string | no | max 120 chars, trimmed |
| `message` | string | no | max 2000 chars, trimmed |
| `_hp_` | string | no | honeypot, silently discarded |

```json
{
  "type": "application",
  "name": "Maria João",
  "email": "maria@exemplo.com",
  "role": "Logística",
  "message": "Tenho 5 anos de experiência em logística internacional.",
  "_hp_": ""
}
```

## Response Contract

All responses are JSON. The structure varies by outcome.

### Success

```
Status: 200 OK
```

```json
{
  "success": true,
  "message": "Mensagem enviada! A nossa equipa responderá em breve."
}
```

The `message` value is localised (Portuguese) and varies by lead type:

| Type | Message |
|------|---------|
| contact | "Mensagem enviada! A nossa equipa responderá em breve." |
| proposal | "Pedido enviado! Entraremos em contacto em breve." |
| application | "Candidatura enviada! Entraremos em contacto." |

### Validation Error

```
Status: 400 Bad Request
```

The server function uses TanStack Start's `inputValidator` with a Zod
discriminated union. Validation errors follow the framework's error shape:

```json
{
  "error": "Validation Error",
  "issues": [
    {
      "code": "too_small",
      "minimum": 2,
      "type": "string",
      "inclusive": true,
      "message": "String must contain at least 2 character(s)",
      "path": ["name"]
    }
  ]
}
```

### Business Error (rate limit, storage failure)

```
Status: 200 OK
```

Business logic errors are returned with 200 OK to distinguish them from
validation errors. The frontend checks `success` before evaluating the
response.

```json
{
  "success": false,
  "message": "Muitas tentativas. Tente novamente mais tarde."
}
```

**Rate limit message:** "Muitas tentativas. Tente novamente mais tarde."

**Storage error message:** "Ocorreu um erro. Tente novamente mais tarde."

### Honeypot (silent discard)

```
Status: 200 OK
```

When the `_hp_` field is populated (bot submission), the server returns a
normal success response indistinguishable from a real success:

```json
{
  "success": true,
  "message": "Mensagem enviada! A nossa equipa responderá em breve."
}
```

This prevents bots from learning that their input was detected.

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success or business error | All expected outcomes |
| 400 | Validation error | Zod schema validation failure |
| 429 | Rate limit (future) | Currently returns 200 in body |
| 500 | Server error | Uncaught exception |

## Environment Configuration

The API contract is independent of the persistence mechanism. The current
production configuration is:

| Variable | Status | Purpose |
|----------|--------|---------|
| `GOOGLE_SHEETS_WEBHOOK_URL` | **Active** | Primary persistence — Apps Script Web App URL |
| `RESEND_API_KEY` | Legacy | Email delivery — retained for rollback only |
| `CONTACT_EMAIL` | Legacy | Email recipient — retained for rollback only |
| `FROM_EMAIL` | Legacy | Verified sender domain — retained for rollback only |

### Server-side communication

The webhook URL is called exclusively from the server process (`store.ts`
→ `saveLead()` → `fetch`). It is never exposed to the browser, never
appears in client-side JavaScript, and is not accessible from browser
developer tools. The browser communicates only with the TanStack Start
server function endpoint (`/_server/...`).

### Configuration loading

Environment variables are loaded at Node.js runtime via `--env-file`:

```
node --env-file=.env.production server.js
```

This approach replaced PM2's `env_file` after it proved unreliable on the
target deployment environment (Ubuntu 24.04, Node 20 LTS).

The API has no URL version prefix. Versioning is managed at the schema level:

- **New optional fields** can be added at any time — clients that omit them
  continue to work.
- **Existing field validation** never tightens. If a field was optional it
  stays optional; if it allowed 100 chars it stays at 100+.
- **New lead types** can be added by extending the discriminated union with a
  new literal `type` value. Existing clients are unaffected.
- **Breaking changes** (removing a required field, changing a type) require a
  new discriminated union variant, e.g. `type: "contact-v2"`. The frontend
  is updated to send the new variant, and old variants are deprecated with a
  sunset period.

This strategy is viable because all clients are web browsers that receive
updates on every deployment. No third-party API consumers exist.
