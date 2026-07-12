export enum EventStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export interface EventSummary {
  id: string;
  title: string;
  status: EventStatus;
  location: string;
  startDate: string;
  endDate: string;
}

export interface Participant {
  id: string;
  email: string;
}

export interface EventDetail extends EventSummary {
  participants: Participant[];
}

export interface EventFilters {
  status?: EventStatus;
  location?: string;
}

export interface CreateEventPayload {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface UpdateEventPayload {
  title?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}
