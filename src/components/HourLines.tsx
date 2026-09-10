import { GRID_HEIGHT, HOUR_HEIGHT, TOTAL_HOURS } from "../utils/date";

export function HourLines() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" style={{ height: GRID_HEIGHT }}>
      {Array.from({ length: TOTAL_HOURS }, (_, hour) => (
        <div
          key={hour}
          className="absolute left-0 right-0 border-t border-gray-200"
          style={{ top: hour * HOUR_HEIGHT }}
        />
      ))}
    </div>
  );
}
