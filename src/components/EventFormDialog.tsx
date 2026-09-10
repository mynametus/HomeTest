import { useEffect, useState, type FormEvent } from "react";
import type { EventDraft } from "../types";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "../utils/date";
import { Dialog } from "./Dialog";

type EventFormDialogProps = {
  title: string;
  initial: EventDraft;
  submitLabel: string;
  onSubmit: (draft: EventDraft) => void;
  onClose: () => void;
};

export function EventFormDialog({
  title,
  initial,
  submitLabel,
  onSubmit,
  onClose,
}: EventFormDialogProps) {
  const [formTitle, setFormTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [startValue, setStartValue] = useState(toDateTimeLocalValue(initial.start));
  const [endValue, setEndValue] = useState(toDateTimeLocalValue(initial.end));
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const start = fromDateTimeLocalValue(startValue);
    const end = fromDateTimeLocalValue(endValue);

    if (!formTitle.trim()) {
      setError("Title is required.");
      return;
    }
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Start and end time are required.");
      return;
    }
    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    onSubmit({
      title: formTitle.trim(),
      description: description.trim(),
      start,
      end,
    });
  };

  return (
    <Dialog
      title={title}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-form"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {submitLabel}
          </button>
        </>
      }
    >
      <form id="event-form" className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Title</span>
          <input
            autoFocus
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Event title"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Optional notes"
          />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Start</span>
            <input
              type="datetime-local"
              value={startValue}
              onChange={(e) => setStartValue(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">End</span>
            <input
              type="datetime-local"
              value={endValue}
              onChange={(e) => setEndValue(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </label>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </Dialog>
  );
}
