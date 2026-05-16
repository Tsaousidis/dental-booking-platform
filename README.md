# Dental Booking Platform

Premium bilingual dental website and booking platform built with Next.js,
TypeScript, TailwindCSS, Supabase, Resend, Google Calendar, and Cloudflare
Turnstile.

The project is designed as a rebrandable single-tenant system for one dentist or
clinic per deployment.

## Current MVP Scope

- Public bilingual website: `/el` and `/en`
- Step-by-step booking flow
- Availability engine with working hours, breaks, blocked slots, buffer time,
  booking horizon, and Europe/Athens timezone handling
- Supabase PostgreSQL schema, Auth, server-side service role operations, and RLS
- Admin login, settings, appointments, and insights pages
- Dynamic appointment types
- Resend transactional emails
- Google Calendar OAuth and event sync
- Secure cancellation and reschedule links
- Reminder email endpoint for external cron
- Cloudflare Turnstile captcha support
- Supabase-backed booking rate limiting
- SEO metadata, sitemap, robots, hreflang, and Dentist JSON-LD
- Cookie consent banner

## Local Setup

Install dependencies:

```bash
npm install
```

Copy the env template:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/el
http://localhost:3000/en
http://localhost:3000/admin/login
```

Restart the dev server every time a `NEXT_PUBLIC_*` variable changes.

## Environment Variables

Required for the core local app:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Email:

```env
RESEND_API_KEY=
EMAIL_FROM=
```

Google Calendar:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
```

Captcha:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

For local development, Cloudflare Turnstile test keys are recommended:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Reminder cron:

```env
CRON_SECRET=
```

## Supabase Setup

Run the migrations in Supabase SQL editor in order:

```text
supabase/migrations/202605160001_initial_schema.sql
supabase/migrations/202605160002_api_rate_limits.sql
```

Then run:

```text
supabase/seed.sql
```

Create one doctor/admin user in Supabase Auth. Patients do not have accounts.

## Google Calendar Local Setup

In Google Cloud Console:

- Create OAuth client credentials for a web app
- Add redirect URI:

```text
http://localhost:3000/api/google/callback
```

- Add your Google account as a test user if the OAuth consent screen is in
  testing mode
- Enable the Google Calendar API

Then go to:

```text
http://localhost:3000/admin/settings
```

and connect Google Calendar from the settings page.

## Reminder Endpoint

Endpoint:

```text
POST /api/emails/reminder
```

Required header:

```text
Authorization: Bearer YOUR_CRON_SECRET
```

This endpoint is intended to be called by an external cron service later. It is
implemented locally but production scheduling is intentionally not configured yet.

## Local QA Checklist

Before moving to design, test these flows locally:

- Public pages load in `/el` and `/en`
- Language switcher changes routes correctly
- Cookie banner accepts, rejects, and opens manage panel
- Admin login works
- Admin settings save clinic profile, appointment types, working hours, breaks,
  booking rules, notification settings, and blocked slots
- Booking page loads active appointment types
- Availability changes after editing working hours, breaks, buffer, horizon, and
  blocked slots
- Booking submit creates an appointment in Supabase
- Booking confirmation email is sent when enabled
- Doctor new booking email is sent when enabled
- Google Calendar event is created with treatment and patient name in the title
- Secure cancel link updates status, sends enabled emails, and removes/updates
  calendar event
- Secure reschedule link updates appointment time, sends enabled emails, and
  updates calendar event
- Admin appointments page shows upcoming/past appointments and status changes
- Admin insights page updates after bookings/cancellations/reschedules
- Reminder endpoint sends reminders for eligible appointments and marks them as
  sent
- Captcha appears with Turnstile keys and booking fails if captcha is required
  but incomplete
- Rate limit migration is applied and repeated booking attempts eventually return
  `429`
- `npm run lint` passes
- `npm run build` passes

## Design Handoff Notes

The current UI is a functional scaffold. The next major phase is applying the
Google Stitch design.

Keep these boundaries when implementing the design:

- Preserve existing routes and backend logic
- Keep admin Greek-only
- Keep public site bilingual
- Keep booking as step-by-step UX, not modal-heavy
- Reuse config files for brand, clinic details, colors, and copy where possible
- Do not change database schema for purely visual updates

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
