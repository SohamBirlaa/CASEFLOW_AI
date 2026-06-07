/**
 * Formats a UTC-like timestamp into the localized IST (Asia/Kolkata) string format.
 *
 * @param value The raw date string from the backend.
 * @param dateOnly If true, omits the time portion (useful for due dates).
 * @returns Formatted date string or a fallback placeholder.
 */
export function formatDateTime(value?: string | null, dateOnly: boolean = false): string {
  if (!value) return "Never";

  // Append 'Z' if missing to ensure native Date parses it as UTC
  const utcString = value.endsWith("Z") ? value : `${value}Z`;
  const date = new Date(utcString);

  if (isNaN(date.getTime())) return "Invalid Date";

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
  };

  // Add timeStyle only if we want the full timestamp
  if (!dateOnly) {
    options.timeStyle = "short";
  }

  return new Intl.DateTimeFormat("en-IN", options).format(date);
}