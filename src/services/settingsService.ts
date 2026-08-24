<<<<<<< HEAD
import type { PlatformSettings } from '../types';
import { api } from '../lib/apiClient';

export const settingsService = {
  async get(): Promise<PlatformSettings> {
    const raw = await api.get<Record<string, unknown>>('/settings');
    return raw ?? {};
  },

  async update(patch: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const raw = await api.patch<Record<string, unknown>>('/settings', patch);
    return raw ?? {};
=======
import { api } from '../lib/apiClient';

export interface PlatformSettings {
  [key: string]: unknown;
}

export const settingsService = {
  /** GET /settings (super-admin, ceo) */
  async get(): Promise<PlatformSettings | null> {
    try {
      return await api.get<PlatformSettings>('/settings');
    } catch (err) {
      console.error('Sozlamalarni olib bo\'lmadi:', err);
      return null;
    }
  },

  /** PATCH /settings */
  async update(patch: Record<string, unknown>): Promise<PlatformSettings | undefined> {
    try {
      return await api.patch<PlatformSettings>('/settings', patch);
    } catch (err) {
      console.error('Sozlamalarni yangilab bo\'lmadi:', err);
      return undefined;
    }
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  },
};
