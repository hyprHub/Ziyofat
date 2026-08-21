/**
 * Localstorage-backed "database" layer.
 *
 * Bu qatlam localStorage ustida real CRUD va async API xatti-harakatini simulyatsiya qiladi:
 * tarmoq kechikishi, JSON serialize/deserialize, Date maydonlarini tiklash va bitta joyda
 * xatoliklarni boshqarish. Kelajakda backend tayyor bo'lganda, faqat shu faylni (yoki har bir
 * `collection()` chaqiruvini) `fetch('/api/...')` ga almashtirish kifoya — servis va context
 * qatlamlari o'zgarishsiz qoladi.
 */

const NAMESPACE = 'rayhon_db_v1';
const DATE_FIELDS = new Set(['createdAt', 'updatedAt', 'paidAt']);

/** Tarmoq kechikishini simulyatsiya qilish (real backend hissi uchun) */
export function delay<T>(value: T, ms = 250 + Math.random() * 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function reviveDates(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reviveDates);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (DATE_FIELDS.has(key) && typeof val === 'string') {
        out[key] = new Date(val);
      } else {
        out[key] = reviveDates(val);
      }
    }
    return out;
  }
  return value;
}

function readRaw<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${NAMESPACE}:${key}`);
    if (!raw) return null;
    return reviveDates(JSON.parse(raw)) as T;
  } catch {
    return null;
  }
}

function writeRaw<T>(key: string, value: T): void {
  localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
}

export interface Entity {
  id: string;
}

/**
 * Bitta "jadval"ni (collection) boshqaradigan generic CRUD ombori.
 * Birinchi marta ishga tushganda `seed` bilan to'ldiriladi, keyingi safar
 * localStorage'dagi saqlangan holat ishlatiladi (real persistensiya).
 */
export function collection<T extends Entity>(key: string, seed: T[]) {
  function load(): T[] {
    const existing = readRaw<T[]>(key);
    if (existing) return existing;
    writeRaw(key, seed);
    return seed;
  }

  function save(items: T[]): void {
    writeRaw(key, items);
  }

  return {
    async getAll(): Promise<T[]> {
      return delay([...load()]);
    },

    async getById(id: string): Promise<T | undefined> {
      const items = load();
      return delay(items.find((item) => item.id === id));
    },

    async create(item: T): Promise<T> {
      const items = load();
      const next = [...items, item];
      save(next);
      return delay(item);
    },

    async update(id: string, patch: Partial<T>): Promise<T | undefined> {
      const items = load();
      let updated: T | undefined;
      const next = items.map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...patch };
        return updated;
      });
      save(next);
      return delay(updated);
    },

    async remove(id: string): Promise<boolean> {
      const items = load();
      const next = items.filter((item) => item.id !== id);
      save(next);
      return delay(next.length !== items.length);
    },

    async replaceAll(items: T[]): Promise<T[]> {
      save(items);
      return delay(items);
    },

    /** Sinxron o'qish kerak bo'lgan holatlar uchun (masalan boshlang'ich state) */
    peekAll(): T[] {
      return [...load()];
    },
  };
}

/** Demo/dasturchi rejimida barcha saqlangan ma'lumotlarni tozalab, qayta seedlash */
export function resetDatabase(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`${NAMESPACE}:`))
    .forEach((k) => localStorage.removeItem(k));
}
