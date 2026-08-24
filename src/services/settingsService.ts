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
  },
};
