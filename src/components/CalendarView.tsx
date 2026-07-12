import { useCallback, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import huLocale from "@fullcalendar/core/locales/hu";
import type { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import { EventStatus, type EventSummary } from "../types/event.types";
import { fetchEvents } from "../api/eventApi";
import { useTheme } from "@mui/material/styles";
import { EventModal } from "./EventModal";

export function CalendarView() {
  const theme = useTheme();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const currentRange = useRef<{ start: Date; end: Date } | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNonce, setModalNonce] = useState(0);

  const loadEvents = useCallback(async (start: Date, end: Date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents(start, end, {});
      setEvents(data);
    } catch {
      setError("Nem sikerült betölteni az eseményeket.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDatesSet = (arg: DatesSetArg) => {
    currentRange.current = { start: arg.start, end: arg.end };
    void loadEvents(arg.start, arg.end);
  };

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedEventId(arg.event.id);
    setModalNonce((n) => n + 1);
    setModalOpen(true);
  };

  const handleNewEvent = () => {
    setSelectedEventId(null);
    setModalNonce((n) => n + 1);
    setModalOpen(true);
  };

  const handleSaved = () => {
    if (currentRange.current) {
      void loadEvents(currentRange.current.start, currentRange.current.end);
    }
  };

  return (
    <>
      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        locale={huLocale}
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "newEvent",
        }}
        customButtons={{
          newEvent: {
            text: "Új esemény",
            click: handleNewEvent,
          },
        }}
        events={events.map((e) => ({
          id: e.id,
          title: `${e.title} (${e.location})`,
          start: e.startDate,
          end: e.endDate,
          color:
            e.status === EventStatus.PUBLISHED
              ? theme.palette.success.main
              : theme.palette.grey[500],
        }))}
        datesSet={handleDatesSet}
        allDaySlot={false}
        height="auto"
        eventClick={handleEventClick}
      />
      <EventModal
        key={modalNonce}
        open={modalOpen}
        eventId={selectedEventId}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </>
  );
}
