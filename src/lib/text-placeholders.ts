// Replaces {yearsSince:YYYY} in seeded texts with the number of full calendar
// years since YYYY, so texts like "for 6 years" stay correct every year.
export function resolveTextPlaceholders(text: string, now: Date = new Date()): string {
  return text.replace(/\{yearsSince:(\d{4})\}/g, (_, year: string) => String(now.getFullYear() - Number(year)));
}
