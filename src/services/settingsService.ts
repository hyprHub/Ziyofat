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
  },
};
