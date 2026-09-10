export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
};

export type EventDraft = {
  title: string;
  description: string;
  start: Date;
  end: Date;
};

export type DialogState =
  | { type: "create"; draft: EventDraft }
  | { type: "view"; event: CalendarEvent }
  | { type: "edit"; event: CalendarEvent };

export type ContextMenuState = {
  x: number;
  y: number;
  event: CalendarEvent;
};

export type TimeSelection = {
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
};

export type DragMoveState = {
  eventId: string;
  durationMinutes: number;
  grabOffsetMinutes: number;
  dayIndex: number;
  startMinutes: number;
};
