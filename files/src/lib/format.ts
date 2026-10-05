// Dates use the UI language declared in index.html (<html lang>), so they match the UI texts.
const dateTimeFormat = new Intl.DateTimeFormat(document.documentElement.lang || undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Formats an ISO 8601 timestamp for display. */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

/** "1 note", "3 notes". */
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}
