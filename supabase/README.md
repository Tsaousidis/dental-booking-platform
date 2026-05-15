# Supabase Setup

This folder contains the database foundation for the dental booking platform.

## Files

- `migrations/202605160001_initial_schema.sql` creates the initial schema, enums, indexes, triggers, and RLS policies.
- `seed.sql` inserts the default fictional clinic profile, appointment types, schedule, breaks, booking settings, and notification settings.

## Notes

- Appointment times are stored as `timestamptz` in UTC.
- The operational timezone is `Europe/Athens`.
- Patients do not have accounts.
- Admin access is handled through Supabase Auth.
- Public inserts for bookings are intentionally not exposed through RLS yet. Booking creation will use a server-side route with the service role key after server validation, captcha verification, and conflict checks.
