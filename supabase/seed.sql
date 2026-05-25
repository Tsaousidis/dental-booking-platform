insert into public.doctor_profile (
  doctor_name,
  clinic_name,
  email,
  phone,
  address,
  city,
  timezone
) values (
  'Dr. Eleni Markou',
  'Athenian Dental Studio',
  'clinic@example.com',
  '+30 210 0000000',
  'Κουμπάρη 1, Αθήνα 106 74, Ελλάδα',
  'Αθήνα 106 74',
  'Europe/Athens'
);

insert into public.appointment_types (
  name_el,
  name_en,
  duration_minutes,
  is_active,
  sort_order
) values
  ('Εμφυτεύματα', 'Implants', 60, true, 10),
  ('Λεύκανση', 'Whitening', 45, true, 20),
  ('Όψεις πορσελάνης', 'Veneers', 60, true, 30),
  ('Invisalign', 'Invisalign', 45, true, 40),
  ('Καθαρισμός', 'Cleaning', 30, true, 50),
  ('Άλλο', 'Other', 30, true, 60);

insert into public.doctor_schedule (
  day_of_week,
  is_working,
  start_time,
  end_time
) values
  (0, false, null, null),
  (1, true, '09:00', '17:00'),
  (2, true, '09:00', '17:00'),
  (3, true, '09:00', '17:00'),
  (4, true, '09:00', '17:00'),
  (5, true, '09:00', '15:00'),
  (6, false, null, null);

insert into public.schedule_breaks (
  day_of_week,
  start_time,
  end_time
) values
  (1, '13:00', '14:00'),
  (2, '13:00', '14:00'),
  (3, '13:00', '14:00'),
  (4, '13:00', '14:00'),
  (5, '12:30', '13:00');

insert into public.booking_settings (
  booking_horizon_days,
  buffer_minutes,
  min_notice_hours,
  timezone
) values (
  60,
  15,
  12,
  'Europe/Athens'
);

insert into public.notification_settings (
  reminder_hours_before
) values (
  24
);
