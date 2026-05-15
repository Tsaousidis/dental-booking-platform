import { NextResponse } from "next/server";
import { z } from "zod";

import { getAvailabilityForAppointmentType } from "@/lib/booking/availability-data";
import { createAdminClient } from "@/lib/supabase/admin";

const createBookingSchema = z.object({
  appointmentTypeId: z.string().uuid(),
  startAt: z.string().datetime(),
  patientName: z.string().trim().min(2).max(120),
  patientEmail: z.string().trim().email().max(180),
  patientPhone: z.string().trim().min(6).max(40),
  patientNote: z.string().trim().max(1000).optional().default(""),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const result = createBookingSchema.safeParse(json);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid booking details." },
      { status: 400 },
    );
  }

  const input = result.data;
  const availableDays = await getAvailabilityForAppointmentType(input.appointmentTypeId);
  const selectedSlot = availableDays
    .flatMap((day) => day.slots)
    .find((slot) => slot.startAt === input.startAt);

  if (!selectedSlot) {
    return NextResponse.json(
      { error: "This appointment time is no longer available." },
      { status: 409 },
    );
  }

  const supabase = createAdminClient();
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      appointment_type_id: input.appointmentTypeId,
      patient_name: input.patientName,
      patient_email: input.patientEmail,
      patient_phone: input.patientPhone,
      patient_note: input.patientNote || null,
      start_at: selectedSlot.startAt,
      end_at: selectedSlot.endAt,
      status: "confirmed",
    })
    .select("id,start_at,end_at")
    .single();

  if (appointmentError) {
    return NextResponse.json(
      { error: "Could not create appointment." },
      { status: 500 },
    );
  }

  await supabase.from("analytics_events").insert({
    event_type: "booking_completed",
    metadata: {
      appointment_id: appointment.id,
      appointment_type_id: input.appointmentTypeId,
      start_at: appointment.start_at,
      end_at: appointment.end_at,
    },
  });

  return NextResponse.json({
    appointment: {
      id: appointment.id,
      startAt: appointment.start_at,
      endAt: appointment.end_at,
    },
  });
}
