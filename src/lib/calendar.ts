export interface CalendarEventInput {
  title: string;
  description: string;
  location?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes?: number;
  reminderMinutes?: readonly number[];
}

const pad = (value: number) => String(value).padStart(2, '0');

export function toLocalDate(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function formatIcsStamp(date: Date) {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    'T',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    'Z',
  ].join('');
}

export function buildGoogleCalendarUrl(input: CalendarEventInput) {
  const start = toLocalDate(input.date, input.time);
  const end = new Date(start.getTime() + (input.durationMinutes ?? 60) * 60_000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    details: input.description,
    location: input.location ?? '',
    dates: `${formatIcsStamp(start)}/${formatIcsStamp(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsDataUrl(input: CalendarEventInput) {
  const start = toLocalDate(input.date, input.time);
  const end = new Date(start.getTime() + (input.durationMinutes ?? 60) * 60_000);
  const escape = (value: string) =>
    value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');
  const reminders = (input.reminderMinutes ?? [1440, 60]).map(
    (minutes) => `BEGIN:VALARM\r\nTRIGGER:-PT${minutes}M\r\nACTION:DISPLAY\r\nDESCRIPTION:${escape(input.title)} reminder\r\nEND:VALARM`
  );
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HouseCall//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`,
    `DTSTAMP:${formatIcsStamp(new Date())}`,
    `DTSTART:${formatIcsStamp(start)}`,
    `DTEND:${formatIcsStamp(end)}`,
    `SUMMARY:${escape(input.title)}`,
    `DESCRIPTION:${escape(input.description)}`,
    input.location ? `LOCATION:${escape(input.location)}` : '',
    ...reminders,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
