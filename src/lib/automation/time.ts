export function makassarDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export function daysUntil(dateOnly: string, today = makassarDateKey()) {
  const target = Date.parse(`${dateOnly}T00:00:00+08:00`);
  const base = Date.parse(`${today}T00:00:00+08:00`);
  return Math.round((target - base) / 86_400_000);
}
