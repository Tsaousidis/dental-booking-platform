import "server-only";

import { google } from "googleapis";

import { createAdminClient } from "@/lib/supabase/admin";

import { createGoogleOAuthClient, hasGoogleCalendarEnv } from "./client";

type CalendarConnection = {
  id: string;
  access_token: string | null;
  refresh_token: string | null;
  expiry_date: string | null;
  calendar_id: string | null;
  is_connected: boolean;
};

export type CalendarAppointmentInput = {
  appointmentId: string;
  appointmentTypeName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientNote?: string | null;
  startAt: string;
  endAt: string;
};

export async function createCalendarEvent(input: CalendarAppointmentInput) {
  const connection = await getActiveCalendarConnection();

  if (!connection) {
    return null;
  }

  const calendar = getCalendarClient(connection);
  const response = await calendar.events.insert({
    calendarId: connection.calendar_id ?? "primary",
    requestBody: buildEvent(input),
  });

  return response.data.id ?? null;
}

export async function updateCalendarEvent({
  eventId,
  ...input
}: CalendarAppointmentInput & { eventId: string | null }) {
  const connection = await getActiveCalendarConnection();

  if (!connection || !eventId) {
    return;
  }

  const calendar = getCalendarClient(connection);
  await calendar.events.update({
    calendarId: connection.calendar_id ?? "primary",
    eventId,
    requestBody: buildEvent(input),
  });
}

export async function deleteCalendarEvent(eventId: string | null) {
  const connection = await getActiveCalendarConnection();

  if (!connection || !eventId) {
    return;
  }

  const calendar = getCalendarClient(connection);
  await calendar.events.delete({
    calendarId: connection.calendar_id ?? "primary",
    eventId,
  });
}

async function getActiveCalendarConnection() {
  if (!hasGoogleCalendarEnv()) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("google_calendar_connections")
    .select("id,access_token,refresh_token,expiry_date,calendar_id,is_connected")
    .eq("is_connected", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CalendarConnection;
}

function getCalendarClient(connection: CalendarConnection) {
  const auth = createGoogleOAuthClient();
  auth.setCredentials({
    access_token: connection.access_token ?? undefined,
    refresh_token: connection.refresh_token ?? undefined,
    expiry_date: connection.expiry_date
      ? new Date(connection.expiry_date).getTime()
      : undefined,
  });

  return google.calendar({ version: "v3", auth });
}

function buildEvent(input: CalendarAppointmentInput) {
  return {
    summary: `Dental Appointment - ${input.appointmentTypeName}`,
    description: [
      `Patient: ${input.patientName}`,
      `Email: ${input.patientEmail}`,
      `Phone: ${input.patientPhone}`,
      input.patientNote ? `Note: ${input.patientNote}` : null,
      `Appointment ID: ${input.appointmentId}`,
    ]
      .filter(Boolean)
      .join("\n"),
    start: {
      dateTime: input.startAt,
      timeZone: "Europe/Athens",
    },
    end: {
      dateTime: input.endAt,
      timeZone: "Europe/Athens",
    },
  };
}
