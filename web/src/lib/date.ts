export class InvalidTimeError extends Error {
  constructor(public minutes: number) {
    super(`Invalid minutes: ${minutes}`);
    this.name = "InvalidTimeError";
  }
}

/**
 * Converts minutes since midnight to a time string in "h:mm a" format
 * @param minutes - Minutes since midnight (0-1439)
 * @returns Time string in format "h:mm a" (e.g., "8:30 AM", "2:15 PM")
 */
export function minutesToTimeString(minutes: number): string {
  if (minutes < 0 || minutes >= 1440) throw new InvalidTimeError(minutes);

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // Convert to 12-hour format using modulo operation
  const period = hours < 12 ? "AM" : "PM";
  const moddedHours = hours % 12;
  const displayHours = moddedHours === 0 ? 12 : moddedHours;

  // Format with leading zero for minutes if needed
  const formattedMinutes = mins.toString().padStart(2, "0");
  return `${displayHours}:${formattedMinutes} ${period}`;
}

/**
 * Formats a time range from start and end minutes
 * @param startMinutes - Start time in minutes since midnight
 * @param endMinutes - End time in minutes since midnight
 * @returns Formatted time range string (e.g., "8:30 AM - 9:45 AM")
 */
export function formatTimeRange(startMinutes: number, endMinutes: number): string {
  const startTime = minutesToTimeString(startMinutes);
  const endTime = minutesToTimeString(endMinutes);
  return `${startTime} – ${endTime}`;
}
