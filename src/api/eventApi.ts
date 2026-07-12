import client from "./client";
import type {
  CreateEventPayload,
  EventFilters,
  EventSummary,
  Participant,
  UpdateEventPayload,
} from "../types/event.types";

export async function fetchEvents(
  weekStart: Date,
  weekEnd: Date,
  filters: EventFilters
): Promise<EventSummary[]> {
  const { data } = await client.get<EventSummary[]>("/event", {
    params: {
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
      ...(filters.status && { status: filters.status }),
      ...(filters.location && { location: filters.location }),
    },
  });
  return data;
}

export async function fetchEvent(eventId: string) {
  const { data } = await client.get(`/event/${eventId}`);
  return data;
}

export async function createEvent(
  payload: CreateEventPayload
): Promise<EventSummary> {
  const { data } = await client.post<EventSummary>("/event", payload);
  return data;
}

export async function updateEvent(
  id: string,
  payload: UpdateEventPayload
): Promise<EventSummary> {
  const { data } = await client.patch<EventSummary>(`/event/${id}`, payload);
  return data;
}

export async function publishEvent(id: string): Promise<EventSummary> {
  const { data } = await client.post<EventSummary>(`/event/${id}/publish`);
  return data;
}

export async function addParticipant(
  eventId: string,
  email: string
): Promise<Participant> {
  const { data } = await client.post<Participant>(
    `/event/${eventId}/participant`,
    { email }
  );
  return data;
}

export async function removeParticipant(
  eventId: string,
  participantId: string
): Promise<void> {
  await client.delete(`/event/${eventId}/participant/${participantId}`);
}

export async function editParticipant(
  eventId: string,
  participantId: string,
  email: string
): Promise<Participant> {
  const { data } = await client.patch<Participant>(
    `/event/${eventId}/participant/${participantId}`,
    { email }
  );
  return data;
}

export async function deleteEvent(eventId: string): Promise<void> {
  await client.delete(`/event/${eventId}`);
}

export async function fetchLocations(): Promise<string[]> {
  const { data } = await client.get<string[]>("/event/locations");
  return data;
}
