import { useCallback, useState } from "react";
import type { CalendarEvent, EventDraft } from "../types";
import { addDays, atMinutes, createId, startOfDay } from "../utils/date";

function seedEvents(): CalendarEvent[] {
  const today = startOfDay(new Date());
  return [
    {
      id: createId(),
      title: "Task A2",
      description: "Deep work block",
      start: atMinutes(addDays(today, 3), 2 * 60 + 15),
      end: atMinutes(addDays(today, 3), 3 * 60 + 15),
    },
    {
      id: createId(),
      title: "Task A1",
      description: "Planning and notes",
      start: atMinutes(addDays(today, 2), 5 * 60),
      end: atMinutes(addDays(today, 2), 6 * 60 + 15),
    },
    {
      id: createId(),
      title: "Task A3",
      description: "Follow-up tasks",
      start: atMinutes(addDays(today, 4), 6 * 60),
      end: atMinutes(addDays(today, 4), 7 * 60 + 15),
    },
  ];
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(seedEvents);

  const createEvent = useCallback((draft: EventDraft) => {
    setEvents((current) => [
      ...current,
      {
        id: createId(),
        title: draft.title.trim() || "Untitled",
        description: draft.description.trim(),
        start: draft.start,
        end: draft.end,
      },
    ]);
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<Omit<CalendarEvent, "id">>) => {
    setEvents((current) =>
      current.map((event) => (event.id === id ? { ...event, ...patch } : event)),
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((current) => current.filter((event) => event.id !== id));
  }, []);

  return { events, createEvent, updateEvent, deleteEvent };
}
