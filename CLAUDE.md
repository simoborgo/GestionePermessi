# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Gestione Permessi — internal web app for Modar S.p.A. to manage employee time-off requests (`PERMESSO` = hourly leave, `FERIE` = vacation days). Italian-language codebase: variable/function names, UI copy, and commit messages are all in Italian — match that convention in new code.

## Commands

```bash
npm install          # install deps
npm run dev          # dev server (Next.js)
npm run build        # production build
npm run start        # run production build
npm run lint         # eslint (eslint-config-next core-web-vitals + typescript)

npm run db:push      # push prisma/schema.prisma to the DB (no migration files, dev workflow)
npm run db:migrate   # prisma migrate dev (creates migration files)
npm run db:seed      # seeds one RESPONSABILE user: admin@modar.it / PIN 12345
npm run db:studio    # Prisma Studio
```

There is no test suite/framework in this repo (no test files, no test script).

Required env vars (see `.env`, not committed): `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `N8N_WEBHOOK_RICHIESTA_INVIATA`, `N8N_WEBHOOK_RICHIESTA_APPROVATA`, `N8N_WEBHOOK_RICHIESTA_RIFIUTATA`, plus `RIEPILOGO_SECRET` (guards the cron-style summary endpoint) and `SECURE_COOKIES` (set `"true"` behind HTTPS).

## Architecture

**Stack**: Next.js 16 App Router, React 19, PostgreSQL via Prisma, custom JWT auth (`jose`) — no NextAuth/Clerk despite the `NEXTAUTH_*` env var naming (leftover convention, not actually using next-auth for sessions). Tailwind v4 for utility classes, but colors/spacing/radius are driven by CSS custom properties in `src/app/globals.css` (Modar brand tokens) and applied via inline `style={{ ... }}` throughout — follow this pattern (`var(--color-primary)`, `var(--radius-button)`, etc.) rather than hardcoding hex values or adding Tailwind color classes.

**Auth flow**: Login is email + 5-digit numeric PIN (bcrypt-hashed), not a password. `src/lib/auth.ts` issues an 8h JWT stored in an httpOnly `auth-token` cookie. `src/proxy.ts` is this project's Next.js 16 route-protection layer (the `middleware.ts`/`proxy.ts` rename in Next 16) — it gates `/admin`, `/dashboard`, `/nuova-richiesta` and redirects DIPENDENTE users away from `/admin`. This is a coarse first line of defense only: every page (server component) and every API route independently re-checks `getSession()` and `ruolo` — that redundancy is intentional defense-in-depth, preserve it when adding new protected routes/pages rather than relying on the proxy alone.

**Roles**: two roles, `DIPENDENTE` and `RESPONSABILE` (`Ruolo` enum in `prisma/schema.prisma`). Hierarchy is flat/single-level: `User.responsabileId` points to one manager; a RESPONSABILE's team is just `User.findMany({ where: { responsabileId: session.userId } })` — there is no recursive org tree.

**Data model** (`prisma/schema.prisma`): `User` and `Richiesta` (request). `Richiesta.stato` moves `PENDING → APPROVATA|RIFIUTATA`. `Richiesta.legge104` flags Legge 104/92 absences (recently added — check the field is threaded through anywhere a request is created, displayed, or sent to n8n if extending request fields further).

**n8n integration**: request creation and approval/rejection fire-and-forget POST a webhook (`notificaN8n` helper duplicated in `src/app/api/richieste/route.ts` and `src/app/api/richieste/[id]/route.ts`) which triggers Gmail notifications on the n8n side. Errors are caught and logged only, never block the API response. `src/app/api/riepilogo-giornaliero/route.ts` is a separate pull-style endpoint (guarded by `RIEPILOGO_SECRET` instead of session auth) meant to be called by an external n8n cron, not by the app's own UI.

**Calendar**: `src/components/CalendarioClient.tsx` is a hand-rolled month-grid component — despite the README mentioning FullCalendar.js, that library is not a dependency and is not used. The event-shaping logic (turning a `Richiesta` into `{start, end, allDay, color}`, with FERIE end-dates made exclusive by adding one day) is duplicated between `src/app/api/calendario/route.ts` and `src/app/admin/calendario/page.tsx` — if you change one, change both (or take the opportunity to unify them).

**Component split**: pages under `src/app/**/page.tsx` are server components that fetch via Prisma directly and pass serialized data (dates as ISO strings) into `"use client"` components in `src/components/` (`GestioneRichieste`, `GestioneUtenti`, `CalendarioClient`) for interactivity. `BadgeStato` (status pill) is duplicated identically in `src/app/dashboard/page.tsx` and `src/components/GestioneRichieste.tsx`.

## Notes for changes

- Server-side validation on request fields (e.g. `dataFine >= dataInizio`) is currently only enforced client-side in `src/app/nuova-richiesta/page.tsx` for FERIE — the API route does not re-check it.
- User creation/PIN reset endpoints return the plaintext PIN (`pinInCiaro`) in the JSON response by design, so the RESPONSABILE can hand it to the employee — there's no separate secure delivery channel.
