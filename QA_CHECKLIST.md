# QA Checklist

Use this checklist before applying the final design and again after the design is
integrated.

## Public Website

- [ ] `/el` loads without errors
- [ ] `/en` loads without errors
- [ ] Language switcher routes between matching EL/EN pages
- [ ] Header and footer links work
- [ ] Sticky mobile booking CTA appears on mobile widths
- [ ] Legal pages load: `/el/privacy`, `/en/privacy`, `/el/cookies`, `/en/cookies`
- [ ] Cookie banner can accept, reject, and open manage view
- [ ] SEO routes load: `/sitemap.xml`, `/robots.txt`

## Booking Flow

- [ ] `/el/booking` loads appointment types
- [ ] `/en/booking` loads appointment types
- [ ] Selecting treatment refreshes available days
- [ ] Selecting day shows available time slots
- [ ] Details step requires name, email, and phone
- [ ] Turnstile appears when keys are configured
- [ ] Booking submit creates a Supabase appointment
- [ ] Existing appointment blocks the same slot
- [ ] Buffer time affects availability
- [ ] Booking horizon affects visible dates
- [ ] Min notice blocks very near appointment times
- [ ] Manual blocked slots remove matching availability
- [ ] Repeated submissions eventually return `429` after rate limit migration

## Emails

- [ ] Patient confirmation email sends when enabled
- [ ] Doctor new booking email sends when enabled
- [ ] Patient cancellation email sends when enabled
- [ ] Doctor cancellation email sends when enabled
- [ ] Patient reschedule email sends when enabled
- [ ] Doctor reschedule email sends when enabled
- [ ] Reminder endpoint sends patient reminder when enabled
- [ ] Reminder endpoint sends doctor reminder when enabled
- [ ] Reminder endpoint marks sent timestamps
- [ ] Disabled notification settings prevent matching emails

## Google Calendar

- [ ] Admin can connect Google Calendar
- [ ] New booking creates a calendar event
- [ ] Calendar title shows treatment and patient name
- [ ] Calendar description includes patient details
- [ ] Reschedule updates the existing calendar event
- [ ] Cancellation removes or updates the calendar event

## Admin

- [ ] `/admin/login` signs in with Supabase Auth
- [ ] Protected admin pages redirect when signed out
- [ ] `/admin/settings` loads existing settings
- [ ] Clinic profile saves
- [ ] Working hours save
- [ ] Breaks save and delete
- [ ] Appointment types save
- [ ] Booking rules save
- [ ] Notification settings save
- [ ] Blocked slots save and delete
- [ ] Google Calendar connection status appears
- [ ] `/admin/appointments` shows upcoming and past appointments
- [ ] Appointment status changes save
- [ ] `/admin/insights` shows booking metrics

## Technical Checks

- [ ] Supabase migrations are applied in order
- [ ] `supabase/seed.sql` can seed a fresh project
- [ ] `.env.local` contains all required local variables
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Design Regression Checks

- [ ] No text overlaps on mobile
- [ ] Booking flow remains step-by-step
- [ ] Admin remains Greek-only
- [ ] Public pages remain bilingual
- [ ] Buttons and forms remain keyboard accessible
- [ ] No design change breaks booking, email, calendar, or admin flows
