import type { MultilingualText } from '../types';

/**
 * Backend ba'zan `_id` (Mongo), ba'zan `id` qaytarishi mumkin — ikkalasini ham qo'llab-quvvatlaymiz.
 */
export function normalizeId<T extends Record<string, unknown>>(obj: T): T & { id: string } {
  const anyObj = obj as Record<string, unknown>;
  const id = (anyObj.id ?? anyObj._id) as string;
  return { ...obj, id: String(id) } as T & { id: string };
}

/** ISO string yoki Date qiymatini xavfsiz Date obyektiga aylantiradi */
export function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

export function toDateOrUndefined(value: unknown): Date | undefined {
  if (value === null || value === undefined) return undefined;
  return toDate(value);
}

/**
 * Backend nomni oddiy string qilib qaytarishi mumkin (masalan "Osh"), frontend esa
 * {uz, ru, en} ko'p tilli obyekt kutadi. Ikkalasini ham qo'llab-quvvatlaymiz.
 */
export function toMultilingual(value: unknown): MultilingualText {
  if (value && typeof value === 'object' && 'en' in (value as object)) {
    const v = value as Partial<MultilingualText>;
    return { uz: v.uz ?? '', ru: v.ru ?? '', en: v.en ?? '' };
  }
  const str = typeof value === 'string' ? value : '';
  return { uz: str, ru: str, en: str };
}

/** Ko'p tilli matnni backendga yuborishdan oldin — agar backend oddiy string kutsa (en varianti) */
export function fromMultilingual(value: MultilingualText): string {
  return value.en || value.uz || value.ru || '';
}
