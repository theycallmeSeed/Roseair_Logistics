# Lead Architecture — Final Implementation Plan

## Architecture (6 files, 0 interfaces, 0 placeholders)

```
src/
  server/
    submit-lead.ts              ← CREATE. Single server function. Replaces 3.

  lib/
    leads/
      schemas.ts                ← CREATE. Zod discriminated union + derived types.
      message.ts                ← CREATE. buildWhatsAppMessage(lead) pure function.
      hooks.ts                  ← CREATE. useLeadSubmit React hook.
      store.ts                  ← CREATE. saveLead: Google Sheets POST (dev fallback).
      index.ts                  ← CREATE. Barrel.

    rateLimit.ts                ← KEEP. Already exists, no changes.
    resend.ts                   ← KEEP (Phase 6). Not touched yet.

  server/
    contact-form.ts             ← REMOVE (Phase 5).
    request-proposal.ts         ← REMOVE (Phase 5).
    job-application.ts          ← REMOVE (Phase 5).

  lib/email/                    ← KEEP (Phase 6). Not touched yet.
  components/
    FormSuccess.tsx             ← MODIFY. Add optional `whatsappUrl` prop.

  routes/
    contacto.tsx                ← REFACTOR. Use useLeadSubmit + contactLeadSchema.
    simulador.tsx               ← REFACTOR. Use useLeadSubmit (keep manual useState).
    equipa.tsx                  ← REFACTOR. Use useLeadSubmit (keep manual useState).

  .env.example                  ← UPDATE. Add GOOGLE_SHEETS_WEBHOOK_URL.
```

---

## File-by-file specification

### 1. `lib/leads/schemas.ts`

**Responsibility:** Define all Zod validation schemas and derive TypeScript types from them.

- Shared base fields: name, email, phone, company, _hp_
- `contactLeadSchema`: type="contact", service, message, consent
- `proposalLeadSchema`: type="proposal", origin, destination, currency, cargoCategory, clearanceType, declaredFreight, all simulator numeric fields
- `applicationLeadSchema`: type="application", role, message
- `leadSchema`: `z.discriminatedUnion("type", [...])` for server validation
- Derived types: `Lead`, `LeadInput`, `SubmitResult`, `StoreResult`
- Client routes import the specific schema (`contactLeadSchema`, etc.) for their `zodResolver`
- Server imports `leadSchema` for `inputValidator`

### 2. `lib/leads/store.ts`

**Responsibility:** Persist a Lead to whichever backend is configured.

- Reads `process.env.GOOGLE_SHEETS_WEBHOOK_URL`
- If URL is set: `POST` lead JSON as `{ lead, submittedAt, type, ...allFields }`
- If URL is NOT set: `console.log("[Store] Lead:", lead)` + return `{ success: true }` (dev mode)
- Returns `StoreResult`: `{ success: true, id }` or `{ success: false, error }`
- No fetch error = success. Fetch error or non-ok status = `{ success: false, error }`.
- Export: `export async function saveLead(lead: Lead): Promise<StoreResult>`

### 3. `lib/leads/message.ts`

**Responsibility:** Format a Lead into a WhatsApp click-to-chat message string.

- Export: `export function buildWhatsAppMessage(lead: Lead): string`
- Builds wa.me-encoded string with lead details depending on type
- Contact: name, company, email, phone, service, message body
- Proposal: name, company, email, phone, origin, destination, cargo values, total
- Application: name, email, role, message
- Uses `encodeURIComponent` for the full message, with `%0A` for line breaks
- Pure function, no side effects, no dependencies on React

### 4. `lib/leads/hooks.ts`

**Responsibility:** Manage form submission lifecycle on the client side.

- Export: `export function useLeadSubmit()`
- State: `submitting` (boolean), `submitted` (boolean), `lastLead` (Lead | null)
- Ref: `hpRef` (honeypot input), exposed as `hpProps` (spreadable attribute object)
- `submit(formData)`: calls `submitLead({ data: formData })`, handles toast, sets submitted
- `reset()`: clears submitted state
- `whatsappUrl`: derived from `lastLead` via `buildWhatsAppMessage` + `SITE.whatsappUrl()`

### 5. `lib/leads/index.ts`

**Responsibility:** Clean public API surface.

- Re-exports: `useLeadSubmit` from hooks, all schemas from schemas, `saveLead` from store (for server)
- Routes import from `@/lib/leads`, never from individual files

### 6. `server/submit-lead.ts`

**Responsibility:** Server-side entry point for all form submissions.

```typescript
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { leadSchema } from "@/lib/leads/schemas";
import { saveLead } from "@/lib/leads/store";
import { checkRateLimit } from "@/lib/rateLimit";

const MESSAGES = {
  contact: "Mensagem enviada! A nossa equipa responderá em breve.",
  proposal: "Pedido enviado! Entraremos em contacto em breve.",
  application: "Candidatura enviada! Entraremos em contacto.",
};

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator(leadSchema)
  .handler(async ({ data }) => {
    const lead = { ...data, submittedAt: new Date().toISOString() } as Lead;

    if (lead._hp_) return { success: true, message: MESSAGES[lead.type] };

    const ip = getRequestIP() ?? "unknown";
    if (!checkRateLimit(ip).allowed) {
      return { success: false, message: "Muitas tentativas. Tente novamente mais tarde." };
    }

    const result = await saveLead(lead);
    if (!result.success) {
      console.error("[submitLead] save failed:", result.error);
      return { success: false, message: "Ocorreu um erro. Tente novamente mais tarde." };
    }

    return { success: true, message: MESSAGES[lead.type] };
  });
```

---

## Route refactoring

### contacto.tsx — Use react-hook-form with contactLeadSchema

```typescript
// BEFORE:
import { submitContactForm } from "@/server/contact-form";
// 45 lines of submitting/submitted/onSubmit/hpRef boilerplate

// AFTER:
import { useLeadSubmit, contactLeadSchema } from "@/lib/leads";
const { submit, submitting, submitted, setSubmitted, hpProps } = useLeadSubmit();

const schema = contactLeadSchema.omit({ type: true, _hp_: true });
type FormValues = z.infer<typeof schema>;

const onSubmit = async (data: FormValues) => {
  await submit({ ...data, type: "contact" });
};
```

The form field bindings (register, errors, etc.) and the `FormSuccess` rendering stay the same. The hook provides `submitting`/`submitted`/`setSubmitted`/`hpProps`.

**Change from current code:** `service` is a required field on `contactLeadSchema` — this is already required in the current code.

### simulador.tsx — Manual useState, swap submit function

```typescript
// BEFORE:
import { submitProposalRequest } from "@/server/request-proposal";
// submitProposal uses manual form state + submit function

// AFTER:
import { useLeadSubmit } from "@/lib/leads";
const { submit: submitLeadHook, submitting, submitted, setSubmitted, hpProps } = useLeadSubmit();

const submitProposal = async (e) => {
  e.preventDefault();
  // same validation, then:
  const response = await submitLeadHook({
    data: {
      type: "proposal",
      name: proposalForm.name,
      email: proposalForm.email,
      // ... all fields as before
    },
  });
};
```

The honeypot input gets `hpProps` instead of manual ref. The `proposalSubmitted`/`proposalSubmitting` state is replaced by the hook's `submitted`/`submitting`. The WhatsApp button in the dialog uses the hook's `whatsappUrl`.

### equipa.tsx — Manual useState, swap submit function

Same pattern as simulador — replace `submitApplication` import with `useLeadSubmit`, replace manual `submittingForm`/`submittedApp` state with hook's `submitting`/`submitted`.

---

## FormSuccess.tsx modification

**Add optional `whatsappUrl` prop:**

```typescript
interface FormSuccessProps {
  title?: string;
  message?: string;
  responseTime?: string;
  onClose?: () => void;
  whatsappUrl?: string;            // NEW: custom wa.me link with lead details
}
```

If `whatsappUrl` is provided, the WhatsApp link in the component uses it instead of `SITE.whatsappUrl()`. No existing behavior changes — routes that don't pass it get the default link.

---

## Deletion order (Phase 5)

After all routes are refactored and the new architecture works:

1. `src/server/contact-form.ts`
2. `src/server/request-proposal.ts`
3. `src/server/job-application.ts`

---

## Phase 6 (future, after validation)

1. Verify leads appear in Google Sheets
2. Remove `src/lib/resend.ts`
3. Remove `src/lib/email/` folder
4. Remove `resend` from `package.json`
5. Remove `RESEND_API_KEY`, `FROM_EMAIL` from `.env.example`
6. Keep `CONTACT_EMAIL` if still referenced elsewhere

---

## Implementation order

I will implement in this sequence (each step verifiable by `npm run build`):

1. Create `lib/leads/schemas.ts` (no dependencies on other new files)
2. Create `lib/leads/store.ts` (depends only on types from schemas)
3. Create `lib/leads/message.ts` (depends only on types from schemas)
4. Create `lib/leads/hooks.ts` (depends on schemas + message + server function — will be created in step 6)
5. Create `lib/leads/index.ts` (barrel)
6. Create `server/submit-lead.ts` (depends on schemas + store + rateLimit)
7. Refactor `routes/contacto.tsx` (swap to useLeadSubmit)
8. Refactor `routes/simulador.tsx` (swap to useLeadSubmit)
9. Refactor `routes/equipa.tsx` (swap to useLeadSubmit)
10. Modify `components/FormSuccess.tsx` (add whatsappUrl prop)
11. Update `.env.example` (add GOOGLE_SHEETS_WEBHOOK_URL)
12. Delete old server functions (after verifying new flow works)
13. `npm run build` — verify zero errors

---

## Data flow diagram (final)

```
[form submit]
    ↓
useLeadSubmit().submit(data)   ← hooks.ts
    ↓
submitLead({ data })            ← server/submit-lead.ts
    │
    ├─ Zod validation           ← schemas.ts (leadSchema)
    ├─ Honeypot check? → return fake success
    ├─ Rate limit check? → return error
    ├─ saveLead(lead)           ← store.ts
    │    ├─ No GOOGLE_SHEETS_WEBHOOK_URL → console.log (dev)
    │    └─ POST to webhook → Google Sheets (prod)
    └─ Return { success, message }
    ↓
hooks.ts: toast + setSubmitted(true) + store lastLead
    ↓
FormSuccess renders WhatsApp button
    │
    ├─ If custom whatsappUrl: wa.me with lead details
    └─ If default: wa.me with generic message
    ↓
User clicks → WhatsApp → conversation with company
```

## Migration to ASP.NET (future)

1. Create `lib/leads/store-aspnet.ts`
2. In `server/submit-lead.ts`, change import: `saveLead` from `@/lib/leads/store-aspnet`
3. No other changes needed — interfaces and providers are outside the scope of the current architecture
