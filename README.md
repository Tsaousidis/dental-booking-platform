# Dental Booking Platform

Premium bilingual dental website and booking platform built with Next.js,
TypeScript, TailwindCSS, Supabase, Resend, and Google Calendar.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

Copy `.env.example` to `.env.local` and fill in the values for Supabase,
Resend, Google Calendar, and Turnstile as each integration is enabled.

## Scripts

```bash
npm run lint
npm run build
```

## Current Phase

Phase 1 foundation is in place:

- Next.js App Router with TypeScript and TailwindCSS
- Locale routes for `/el` and `/en`
- Rebrandable config files
- Supabase helper scaffolding
- Protected admin route scaffolding
- Public/admin route placeholders

## Database

Supabase schema files live in `supabase/`.

- `supabase/migrations/202605160001_initial_schema.sql`
- `supabase/seed.sql`
