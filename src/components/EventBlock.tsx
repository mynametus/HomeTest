import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import type { CalendarEvent } from "../types";
import { durationMinutes, formatRange, minutesFromMidnight, minutesToY } from "../utils/date";

type EventBlockProps = {
  event: CalendarEvent;
  isPreview?: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>, calendarEvent: CalendarEvent) => void;
  onContextMenu: (event: ReactMouseEvent<HTMLDivElement>, calendarEvent: CalendarEvent) => void;
};

export function EventBlock({ event, isPreview = false, onPointerDown, onContextMenu }: EventBlockProps) {
  const top = minutesToY(minutesFromMidnight(event.start));
  const height = Math.max(22, minutesToY(durationMinutes(event.start, event.end)));

  return (
    <div
      data-event-block="true"
      className={`absolute left-1 right-1 z-10 cursor-grab overflow-hidden rounded-md px-2 py-1 text-left shadow-sm ${
        isPreview ? "cursor-grabbing bg-amber-300/80 ring-2 ring-amber-500" : "bg-amber-400 hover:bg-amber-500"
      }`}
      style={{ top, height }}
      onPointerDown={(pointerEvent) => {
        pointerEvent.preventDefault();
        onPointerDown(pointerEvent, event);
      }}
      onContextMenu={(pointerEvent) => {
        pointerEvent.preventDefault();
        onContextMenu(pointerEvent, event);
      }}
    >
      <p className="truncate text-[12px] font-semibold leading-4 text-white">{event.title}</p>
      {height >= 36 ? (
        <p className="truncate text-[11px] leading-4 text-white/90">{formatRange(event.start, event.end)}</p>
      ) : null}
    </div>
  );
}
