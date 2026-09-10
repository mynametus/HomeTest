import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { useNow } from "../hooks/useNow";
import type { CalendarEvent, ContextMenuState, DialogState, DragMoveState, TimeSelection } from "../types";
import {
  DEFAULT_EVENT_MINUTES,
  GRID_HEIGHT,
  MIN_EVENT_MINUTES,
  atMinutes,
  clampEventToDay,
  eventOverlapsDay,
  getWeekDays,
  minutesToY,
  snapMinutes,
  startOfDay,
  yToMinutes,
} from "../utils/date";
import { CalendarHeader } from "./CalendarHeader";
import { ContextMenu } from "./ContextMenu";
import { DayColumn } from "./DayColumn";
import { EventFormDialog } from "./EventFormDialog";
import { EventViewDialog } from "./EventViewDialog";
import { HourLines } from "./HourLines";
import { TimeGutter } from "./TimeGutter";

const DRAG_THRESHOLD_PX = 5;

function minutesFromClientY(clientY: number, gridTop: number): number {
  return yToMinutes(clientY - gridTop);
}

function dayIndexFromClientX(clientX: number, gridLeft: number, gridWidth: number): number {
  const ratio = (clientX - gridLeft) / gridWidth;
  return Math.max(0, Math.min(6, Math.floor(ratio * 7)));
}

export function TimeBlockingCalendar() {
  const now = useNow();
  const todayStamp = startOfDay(now).getTime();
  const days = useMemo(() => getWeekDays(new Date(todayStamp)), [todayStamp]);
  const { events, createEvent, updateEvent, deleteEvent } = useCalendarEvents();

  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const selectionRef = useRef<TimeSelection | null>(null);
  const dragMoveRef = useRef<DragMoveState | null>(null);
  const dragEventRef = useRef<CalendarEvent | null>(null);

  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [selection, setSelection] = useState<TimeSelection | null>(null);
  const [dragMove, setDragMove] = useState<DragMoveState | null>(null);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    dragMoveRef.current = dragMove;
  }, [dragMove]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = Math.max(0, minutesToY(now.getHours() * 60 + now.getMinutes()) - 160);
  }, []);

  const closeOverlays = useCallback(() => {
    setDialog(null);
    setMenu(null);
  }, []);

  const getGridBox = useCallback(() => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { top: rect.top, left: rect.left, width: rect.width };
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const box = getGridBox();
      if (!box) return;

      const selectionState = selectionRef.current;
      if (selectionState) {
        const endMinutes = minutesFromClientY(event.clientY, box.top);
        setSelection({ ...selectionState, endMinutes });
        return;
      }

      const dragState = dragMoveRef.current;
      if (!dragState) return;

      const pointerMinutes = minutesFromClientY(event.clientY, box.top);
      const nextDayIndex = dayIndexFromClientX(event.clientX, box.left, box.width);
      const nextStart = snapMinutes(pointerMinutes - dragState.grabOffsetMinutes);
      setDragMove({
        ...dragState,
        dayIndex: nextDayIndex,
        startMinutes: nextStart,
      });
    };

    const onUp = (event: PointerEvent) => {
      const selectionState = selectionRef.current;
      if (selectionState) {
        const startMinutes = Math.min(selectionState.startMinutes, selectionState.endMinutes);
        const endMinutes = Math.max(selectionState.startMinutes, selectionState.endMinutes);
        const span = endMinutes - startMinutes;
        const duration = Math.max(MIN_EVENT_MINUTES, span === 0 ? DEFAULT_EVENT_MINUTES : span);
        const day = days[selectionState.dayIndex];
        setSelection(null);
        originRef.current = null;
        setDialog({
          type: "create",
          draft: {
            title: "",
            description: "",
            start: atMinutes(day, startMinutes),
            end: atMinutes(day, startMinutes + duration),
          },
        });
        return;
      }

      const dragState = dragMoveRef.current;
      const calendarEvent = dragEventRef.current;
      if (dragState && calendarEvent) {
        const origin = originRef.current;
        const pixelMoved =
          origin != null &&
          Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > DRAG_THRESHOLD_PX;
        if (pixelMoved) {
          const day = days[dragState.dayIndex];
          const next = clampEventToDay(day, dragState.startMinutes, dragState.durationMinutes);
          updateEvent(calendarEvent.id, { start: next.start, end: next.end });
        } else {
          setDialog({ type: "view", event: calendarEvent });
        }
      }

      setDragMove(null);
      dragEventRef.current = null;
      originRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [days, getGridBox, updateEvent]);

  const onGridPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, dayIndex: number) => {
      if (event.button !== 0 || dialog) return;
      if ((event.target as HTMLElement).closest("[data-event-block]")) return;

      const box = getGridBox();
      if (!box) return;

      const startMinutes = minutesFromClientY(event.clientY, box.top);
      originRef.current = { x: event.clientX, y: event.clientY };
      setSelection({ dayIndex, startMinutes, endMinutes: startMinutes + DEFAULT_EVENT_MINUTES });
      setMenu(null);
    },
    [dialog, getGridBox],
  );

  const onEventPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, calendarEvent: CalendarEvent) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      const box = getGridBox();
      if (!box) return;

      const pointerMinutes = minutesFromClientY(event.clientY, box.top);
      const eventStartMinutes = snapMinutes(calendarEvent.start.getHours() * 60 + calendarEvent.start.getMinutes());
      const duration = Math.round((calendarEvent.end.getTime() - calendarEvent.start.getTime()) / 60000);
      const dayIndex = days.findIndex((day) => eventOverlapsDay(calendarEvent, day));

      originRef.current = { x: event.clientX, y: event.clientY };
      dragEventRef.current = calendarEvent;
      setMenu(null);
      setDragMove({
        eventId: calendarEvent.id,
        durationMinutes: duration,
        grabOffsetMinutes: pointerMinutes - eventStartMinutes,
        dayIndex: Math.max(0, dayIndex),
        startMinutes: eventStartMinutes,
      });
    },
    [days, getGridBox],
  );

  const onEventContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>, calendarEvent: CalendarEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setDragMove(null);
      setSelection(null);
      dragEventRef.current = null;
      setMenu({ x: event.clientX, y: event.clientY, event: calendarEvent });
    },
    [],
  );

  const previewByDay = useMemo(() => {
    if (!dragMove) return new Map<number, CalendarEvent>();
    const source = events.find((item) => item.id === dragMove.eventId);
    if (!source) return new Map<number, CalendarEvent>();
    const day = days[dragMove.dayIndex];
    const next = clampEventToDay(day, dragMove.startMinutes, dragMove.durationMinutes);
    return new Map([[dragMove.dayIndex, { ...source, ...next }]]);
  }, [dragMove, events, days]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <CalendarHeader days={days} />
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
        <div className="relative flex" style={{ height: GRID_HEIGHT }}>
          <TimeGutter now={now} />
          <div className="relative min-w-0 flex-1">
            <HourLines />
            <div
              ref={gridRef}
              className="relative z-10 grid h-full"
              style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
            >
              {days.map((day, dayIndex) => (
                <DayColumn
                  key={day.toISOString()}
                  day={day}
                  dayIndex={dayIndex}
                  now={now}
                  events={events.filter((item) => eventOverlapsDay(item, day))}
                  selection={selection}
                  previewEvent={previewByDay.get(dayIndex) ?? null}
                  onGridPointerDown={onGridPointerDown}
                  onEventPointerDown={onEventPointerDown}
                  onEventContextMenu={onEventContextMenu}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {menu ? (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          onEdit={() => {
            setDialog({ type: "edit", event: menu.event });
            setMenu(null);
          }}
          onDelete={() => {
            deleteEvent(menu.event.id);
            setMenu(null);
          }}
        />
      ) : null}

      {dialog?.type === "create" ? (
        <EventFormDialog
          title="Create event"
          initial={dialog.draft}
          submitLabel="Create"
          onClose={closeOverlays}
          onSubmit={(draft) => {
            createEvent(draft);
            closeOverlays();
          }}
        />
      ) : null}

      {dialog?.type === "edit" ? (
        <EventFormDialog
          title="Edit event"
          initial={dialog.event}
          submitLabel="Save"
          onClose={closeOverlays}
          onSubmit={(draft) => {
            updateEvent(dialog.event.id, draft);
            closeOverlays();
          }}
        />
      ) : null}

      {dialog?.type === "view" ? <EventViewDialog event={dialog.event} onClose={closeOverlays} /> : null}
    </div>
  );
}
