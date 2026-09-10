import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import type { CalendarEvent, TimeSelection } from "../types";
import { GRID_HEIGHT, isSameDay, minutesFromMidnight, minutesToY } from "../utils/date";
import { EventBlock } from "./EventBlock";

type DayColumnProps = {
  day: Date;
  dayIndex: number;
  now: Date;
  events: CalendarEvent[];
  selection: TimeSelection | null;
  previewEvent: CalendarEvent | null;
  onGridPointerDown: (event: ReactPointerEvent<HTMLDivElement>, dayIndex: number) => void;
  onEventPointerDown: (event: ReactPointerEvent<HTMLDivElement>, calendarEvent: CalendarEvent) => void;
  onEventContextMenu: (event: ReactMouseEvent<HTMLDivElement>, calendarEvent: CalendarEvent) => void;
};

export function DayColumn({
  day,
  dayIndex,
  now,
  events,
  selection,
  previewEvent,
  onGridPointerDown,
  onEventPointerDown,
  onEventContextMenu,
}: DayColumnProps) {
  const showNowLine = isSameDay(day, now);
  const selectionForDay =
    selection && selection.dayIndex === dayIndex
      ? {
          top: minutesToY(Math.min(selection.startMinutes, selection.endMinutes)),
          height: minutesToY(Math.abs(selection.endMinutes - selection.startMinutes) || 15),
        }
      : null;

  return (
    <div
      data-day-index={dayIndex}
      className="relative border-r border-gray-200 last:border-r-0"
      style={{ height: GRID_HEIGHT }}
      onPointerDown={(event) => onGridPointerDown(event, dayIndex)}
    >
      {showNowLine ? (
        <div
          className="pointer-events-none absolute left-0 right-0 z-20 h-px bg-red-500"
          style={{ top: minutesToY(minutesFromMidnight(now)) }}
        />
      ) : null}

      {selectionForDay ? (
        <div
          className="pointer-events-none absolute left-1 right-1 z-10 rounded-md bg-blue-500/20 ring-1 ring-blue-400"
          style={{ top: selectionForDay.top, height: selectionForDay.height }}
        />
      ) : null}

      {events.map((event) =>
        previewEvent?.id === event.id ? null : (
          <EventBlock
            key={event.id}
            event={event}
            onPointerDown={onEventPointerDown}
            onContextMenu={onEventContextMenu}
          />
        ),
      )}

      {previewEvent ? (
        <EventBlock
          event={previewEvent}
          isPreview
          onPointerDown={onEventPointerDown}
          onContextMenu={onEventContextMenu}
        />
      ) : null}
    </div>
  );
}
