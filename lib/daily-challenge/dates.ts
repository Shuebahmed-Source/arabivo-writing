/** UTC calendar date key (YYYY-MM-DD). */
export function utcDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Whole UTC days since Unix epoch — stable index for rotating the word pool. */
export function utcDayNumber(date: Date = new Date()): number {
  return Math.floor(date.getTime() / 86_400_000);
}

export function addUtcDays(dateKey: string, deltaDays: number): string {
  const ms = Date.parse(`${dateKey}T00:00:00.000Z`) + deltaDays * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}
