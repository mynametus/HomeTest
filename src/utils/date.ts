export const HOUR_HEIGHT = 64;
export const TOTAL_HOURS = 24;
export const GRID_HEIGHT = HOUR_HEIGHT * TOTAL_HOURS;
export const SNAP_MINUTES = 15;
export const DEFAULT_EVENT_MINUTES = 30;
export const MIN_EVENT_MINUTES = 15;
export const WEEK_DAYS = 7;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getWeekDays(from: Date = new Date()): Date[] {
  const start = startOfDay(from);
  return Array.from({ length: WEEK_DAYS }, (_, index) => addDays(start, index));
}

export function minutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function atMinutes(day: Date, minutes: number): Date {
  const clamped = Math.max(0, Math.min(TOTAL_HOURS * 60, minutes));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, mins, 0, 0);
}

export function snapMinutes(minutes: number): number {
  const snapped = Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
  return Math.max(0, Math.min(TOTAL_HOURS * 60, snapped));
}

export function yToMinutes(y: number): number {
  return snapMinutes((y / HOUR_HEIGHT) * 60);
}

export function minutesToY(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

export function durationMinutes(start: Date, end: Date): number {
  return Math.max(MIN_EVENT_MINUTES, Math.round((end.getTime() - start.getTime()) / 60000));
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function eventOverlapsDay(event: { start: Date; end: Date }, day: Date): boolean {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  return event.start < dayEnd && event.end > dayStart;
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatWeekday(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

export function formatGmtOffset(date: Date = new Date()): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  return `GMT${sign}${hours}`;
}

export function toDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocalValue(value: string): Date {
  return new Date(value);
}

export function clampEventToDay(
  day: Date,
  startMinutes: number,
  duration: number,
): { start: Date; end: Date } {
  const maxStart = TOTAL_HOURS * 60 - duration;
  const clampedStart = Math.max(0, Math.min(maxStart, startMinutes));
  const start = atMinutes(day, clampedStart);
  const end = atMinutes(day, clampedStart + duration);
  return { start, end };
}

export function createId(): string {
  return crypto.randomUUID();
}
