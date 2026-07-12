import { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import huLocale from "@fullcalendar/core/locales/hu";
import type { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import {
  EventStatus,
  type EventFilters,
  type EventSummary,
} from "../types/event.types";
import { fetchEvents } from "../api/eventApi";
import { useTheme } from "@mui/material/styles";
import { EventModal } from "./EventModal";
import { Box } from "@mui/material";

interface CalendarViewProps {
  filters: EventFilters;
}

export function CalendarView({ filters }: CalendarViewProps) {
  const theme = useTheme();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const currentRange = useRef<{ start: Date; end: Date } | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNonce, setModalNonce] = useState(0);

  const loadEvents = useCallback(
    async (start: Date, end: Date) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEvents(start, end, filters);
        setEvents(data);
      } catch {
        setError("Nem sikerült betölteni az eseményeket.");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

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

  useEffect(() => {
    if (currentRange.current) {
      loadEvents(currentRange.current.start, currentRange.current.end);
    }
  }, [loadEvents]);

  return (
    <>
      <Box
        sx={{
          opacity: loading ? 0.4 : 1,
          transition: "opacity 0.2s",
          pointerEvents: loading ? "none" : "auto",
        }}
      >
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
      </Box>
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
