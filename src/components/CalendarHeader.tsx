import { formatGmtOffset, formatWeekday, isSameDay } from "../utils/date";

type CalendarHeaderProps = {
  days: Date[];
};

export function CalendarHeader({ days }: CalendarHeaderProps) {
  const today = new Date();

  return (
    <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: "72px repeat(7, minmax(0, 1fr))" }}>
      <div className="flex items-end justify-center pb-3 text-[11px] font-medium text-gray-400">
        {formatGmtOffset()}
      </div>
      {days.map((day) => {
        const isToday = isSameDay(day, today);
        return (
          <div key={day.toISOString()} className="flex flex-col items-center gap-1 py-3">
            <span className="text-[11px] font-semibold tracking-wide text-gray-400">
              {formatWeekday(day)}
            </span>
            <span
              className={
                isToday
                  ? "flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white"
                  : "flex h-8 w-8 items-center justify-center text-sm font-semibold text-gray-900"
              }
            >
              {day.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
