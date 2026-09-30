# SisCalc — Payroll Calculation System

## Overview
Brazilian payroll calculation app ("SisCalc"). Next.js 15 (App Router) + TypeScript + Tailwind CSS + PostgreSQL (Prisma ORM).

## Architecture
- **Frontend + API**: Next.js App Router, single service on port 3000
- **Database**: PostgreSQL via Prisma, schema synced with `prisma db push` (no migration files)
- **Payroll logic**: `lib/payroll.ts` — Brazilian INSS/IRRF/FGTS calculation (2024 tables)
- **Seed data**: `prisma/seed.ts` runs on every container start (idempotent upserts)

## Dev Environment
- Run: `docker compose -f docker-compose.base44.yml up -d`
- Compose installs deps, generates Prisma client, pushes schema, seeds, then starts `next dev`
- Live reload: Next.js dev server with file watching (bind-mounted source)
- DB credentials are local infra (compose `environment:`), not external secrets

## Key Files
- `lib/payroll.ts` — payroll calculation engine (INSS, IRRF, FGTS)
- `lib/prisma.ts` — Prisma client singleton
- `app/api/employees/` — CRUD API routes
- `app/payroll/` — payroll overview page (calculates on the fly)
- `app/payslips/[id]/` — individual payslip view
