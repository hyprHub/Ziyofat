/**
 * Backenddan JSON orqali kelgan sana maydonlarini (string) haqiqiy `Date` obyektiga aylantiradi.
 * Hem mock (localStorage) DB, hem ham real API javoblari uchun ishlatiladi.
 */
const DATE_FIELDS = new Set(['createdAt', 'updatedAt', 'paidAt']);

export function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (DATE_FIELDS.has(key) && typeof val === 'string') {
        out[key] = new Date(val);
      } else {
        out[key] = reviveDates(val as unknown);
      }
    }
    return out as T;
  }
  return value;
}
