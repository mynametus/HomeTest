import { GRID_HEIGHT, HOUR_HEIGHT, TOTAL_HOURS, formatHourLabel, minutesFromMidnight, minutesToY } from "../utils/date";

type TimeGutterProps = {
  now: Date;
};

export function TimeGutter({ now }: TimeGutterProps) {
  const nowTop = minutesToY(minutesFromMidnight(now));

  return (
    <div className="relative w-[72px] shrink-0 border-r border-gray-200 bg-white" style={{ height: GRID_HEIGHT }}>
      {Array.from({ length: TOTAL_HOURS }, (_, hour) => (
        <div
          key={hour}
          className="absolute right-2 -translate-y-1/2 text-[11px] text-gray-400"
          style={{ top: hour * HOUR_HEIGHT }}
        >
          {hour === 0 ? "" : formatHourLabel(hour)}
        </div>
      ))}
      <div
        className="absolute right-0 z-20 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500"
        style={{ top: nowTop }}
      />
    </div>
  );
}
