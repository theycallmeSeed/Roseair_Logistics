# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

TanStack Start v1 + React 19 + Vite 7 + Tailwind v4 + shadcn/ui (new-york) + Framer Motion + React Hook Form + Zod.

Language: Portuguese (PT). EN toggle scaffolded but not populated.

## Commands

| Action           | Command                            |
| ---------------- | ----------------------------------- |
| Dev server       | `npm run dev`                       |
| Build (prod)     | `npm run build`                     |
| Build (dev mode) | `npm run build:dev`                 |
| Preview build    | `npm run preview`                   |
| Start prod server| `npm run start` (runs `node ./server.js`, requires `npm run build` first) |
| Lint             | `npm run lint` (ESLint)             |
| Format           | `npm run format` (Prettier)         |

No `test` script is defined in package.json, but `vitest` is a devDependency and real test files exist under `src/lib/__tests__/*.test.ts` (testing the customs calculation engine). Run them directly with `npx vitest run` or `npx vitest` (watch mode); there is no `vitest.config.*`, so it relies on Vite's own config discovery.

## Architecture

- **File-based routing** under `src/routes/`. Each route file exports a Route via `createFileRoute` with its own `head()` for meta/SEO. `src/routeTree.gen.ts` is auto-generated — never edit it; run dev/build to regenerate.
- **Server functions** live in `src/server/*.ts` and use `createServerFn({ method: "POST" })` from TanStack Start.
- **Lead capture pipeline:** all 3 forms (contacto, equipa, simulador) submit via `src/server/submit-lead.ts` → Google Sheets webhook (`GOOGLE_SHEETS_WEBHOOK_URL`, posted from `src/lib/leads/store.ts`). A single `useLeadSubmit()` hook in `src/lib/leads/hooks.ts` centralizes submission logic; validation schemas live in `src/lib/leads/schemas.ts`.
- **WhatsApp auto-open** uses synchronous popup pre-creation: call `window.open("", "_blank")` *before* the `await`, then set `popup.location.href` on success. Falls back to a manual link in `FormSuccess` when the popup is blocked.
- **Rate limiting** is in-memory (`src/lib/rateLimit.ts`), 5 req/min per IP, applied to the submit-lead endpoint.
- **Customs calculation engine** (`src/lib/calculation-engine.ts` + `src/lib/customs-categories.ts`) powers the `simulador` route/tool. This is business logic with dedicated tests (`src/lib/__tests__/*.test.ts`) — treat changes here as needing test verification, not just visual checks.
- **Centralized company data** in `src/lib/site.ts` (address, phones, nav links, client list).
- **shadcn components** live in `src/components/ui/`, aliased via `@/`. Add new ones with `npx shadcn@latest add <component>`.
- **Tailwind v4** uses CSS-based config (`src/styles.css` with `@theme`, `@import "tailwindcss" source(none)`, custom CSS vars for brand colors) — there is no `tailwind.config.js`.
- **Deploy targets:** Vercel (`vercel.json`) and/or Cloudflare Workers (`wrangler.jsonc`), plus a self-hosted Node/PM2/Nginx target (see Deployment below).

### vite.config.ts

Uses the `@lovable.dev/vite-tanstack-config` wrapper, which already bundles `tanstackStart`, `viteReact`, `tailwindcss`, `tsConfigPaths`, `cloudflare` (build-only), `componentTagger` (dev-only), `VITE_*` env injection, the `@` path alias, React/TanStack dedupe, error logger plugins, and sandbox port/host detection. **Do not** manually add any of those plugins — it will break with duplicates. Pass extra Vite config via `defineConfig({ vite: { ... } })`.

### Legacy Resend email pipeline

The previous Resend-based email pipeline has been fully replaced by the Google Sheets lead pipeline above. The legacy files are intentionally kept for rollback purposes — **do not edit or import them in new code**. Each carries a `LEGACY IMPLEMENTATION — Deprecated` doc block and `@deprecated` JSDoc on exports:

- `src/server/contact-form.ts`
- `src/server/request-proposal.ts`
- `src/server/job-application.ts`
- `src/lib/resend.ts`
- `src/lib/email/templates.ts`
- `src/lib/email/sendProposalEmail.ts`
- `src/lib/email/sendContactEmail.ts`
- `src/lib/email/sendApplicationEmail.ts`

Once the Google Sheets rollout has been stable in production, these can be removed in a future cleanup sprint.

## Key conventions

- `@/` path alias maps to `src/`.
- `cn()` helper from `@/lib/utils` for className merging.
- Inter font preloaded in `__root.tsx`.
- Forms use `react-hook-form` + `zod` + `createServerFn`. Include a honeypot `_hp_` field for spam prevention.
- Mobile-first responsive design: 48px tap targets, no inputs smaller than 16px font on mobile (prevents iOS zoom).
- Image assets go in `src/assets/`.
- Prettier: 100 print width, double quotes, trailing commas everywhere.
- ESLint: `@typescript-eslint/no-unused-vars` is **off**; `react-refresh/only-export-components` is a warning, not an error.

## Deployment

Production runs on a self-hosted Ubuntu 24.04 / Node 20 / PM2 / Nginx / Certbot stack (see `DEPLOY.md` for the full runbook). Key facts relevant to code changes:

- `server.js` is a hand-rolled Node HTTP server (no Express) that serves static assets from `dist/client`, exposes a `/health` JSON endpoint, and proxies everything else into the TanStack Start SSR fetch handler from `dist/server/index.js`. It requires a prior `npm run build`.
- Deploys are release-based (`/opt/roseair/releases/<timestamp>` symlinked from `current`), driven by `deploy/deploy.sh`, with automatic rollback via `deploy/rollback.sh` on failed health checks.
- CI (`.github/workflows/ci.yml`) runs on every push/PR to `main`/`develop`: `npm ci` → `npm run lint` → `npm run build` → verify `dist/client`/`dist/server` exist.
- Deploy (`.github/workflows/deploy.yml`) reruns CI as a `verify` job, then SSHes into production to run `deploy/deploy.sh`, health-checks `/health`, and auto-rolls back on failure. See `GITHUB_ACTIONS.md` for required secrets and full flow.
- `ecosystem.config.cjs` (PM2) runs a single fork-mode instance — the app keeps in-memory state (rate limiter), so it is **not** safe to switch to PM2 cluster mode without changing the rate limiter to a shared store.

## Environment variables

- `GOOGLE_SHEETS_WEBHOOK_URL` — required for the active lead pipeline (`src/lib/leads/store.ts`).
- `RESEND_API_KEY`, `CONTACT_EMAIL`, `FROM_EMAIL` — only used by the legacy/deprecated email pipeline above.
- `HOST`, `PORT`, `NODE_ENV` — set directly in `ecosystem.config.cjs`'s `env` block; used by `server.js` in production.
- Secrets (`GOOGLE_SHEETS_WEBHOOK_URL`, etc.) are loaded by `server.js` itself via `dotenv.config({ path: resolve(rootDir, ".env.production") })`, where `rootDir` is derived from `import.meta.url` — **not** `process.cwd()`. This is deliberate: PM2's `cwd` resolution for the spawned process isn't guaranteed to match the release directory deploy.sh symlinks `.env.production` into, so the dotenv path must be anchored to `server.js`'s own location instead. PM2 has no native `env_file` option — don't reintroduce one in `ecosystem.config.cjs`, it's silently ignored.

## Workflow

Antes de qualquer alteração:

1. compreender a arquitetura

2. identificar dependências

3. procurar reutilização

4. explicar impacto

5. propor plano

6. aguardar confirmação

Depois de implementar:

- verificar TypeScript

- verificar lint

- verificar build

- verificar regressões

Nunca criar código duplicado.

Nunca alterar contratos públicos sem aprovação.