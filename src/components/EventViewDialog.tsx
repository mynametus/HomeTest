import { useEffect } from "react";
import type { CalendarEvent } from "../types";
import { formatRange } from "../utils/date";
import { Dialog } from "./Dialog";

type EventViewDialogProps = {
  event: CalendarEvent;
  onClose: () => void;
};

export function EventViewDialog({ event, onClose }: EventViewDialogProps) {
  useEffect(() => {
    const onKey = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Dialog
      title="Event details"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Close
        </button>
      }
    >
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Title</p>
          <p className="text-base font-semibold text-gray-900">{event.title}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Time</p>
          <p className="text-sm text-gray-800">{formatRange(event.start, event.end)}</p>
          <p className="text-xs text-gray-500">
            {event.start.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Description</p>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {event.description || "No description"}
          </p>
        </div>
      </div>
    </Dialog>
  );
}
