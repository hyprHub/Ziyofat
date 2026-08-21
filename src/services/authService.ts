import type { User } from '../types';
import { api, setToken, clearToken } from '../lib/apiClient';
import { normalizeId } from '../lib/normalize';

interface LoginResponsePayload {
  token?: string;
  accessToken?: string;
  jwt?: string;
  access_token?: string;
  user?: Record<string, unknown>;
  currentUser?: Record<string, unknown>;
  [key: string]: unknown;
}

function extractToken(payload: LoginResponsePayload): string | null {
  return (
    payload.token || payload.accessToken || payload.jwt || payload.access_token || null
  );
}

function extractUser(payload: LoginResponsePayload): User | null {
  const raw =
    payload.user ||
    payload.currentUser ||
    // Ba'zi backendlar user maydonlarini javobning o'zida (token bilan bir qatorda) qaytaradi
    (payload.role ? payload : null);
  if (!raw) return null;
  const normalized = normalizeId(raw as Record<string, unknown>);
  return {
    id: normalized.id,
    name: (normalized.name as string) ?? (normalized.email as string) ?? '',
    email: (normalized.email as string) ?? '',
    password: '',
    role: normalized.role as User['role'],
    restaurantId: (normalized.restaurantId as string) ?? undefined,
  };
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: User } | null> {
    try {
      const payload = await api.post<LoginResponsePayload>('/auth/login', { email, password });
      const token = extractToken(payload);
      const user = extractUser(payload);
      if (!token || !user) {
        console.error('Login javobi kutilmagan formatda:', payload);
        return null;
      }
      setToken(token);
      return { user };
    } catch (err) {
      console.error('Login xatosi:', err);
      return null;
    }
  },

  async me(): Promise<User | null> {
    try {
      // api.get() javobni allaqachon ochib beradi: { "data": { user: {...} } } -> { user: {...} }
      // Shuning uchun bu yerni QAYTA o'rab bo'lmaydi — aks holda role/id/name topilmay,
      // currentUser.role = undefined bo'lib qolardi (bu /waiter kabi to'g'ridan-to'g'ri
      // sahifaga kirishda "Sahifa topilmadi" xatosining aynan sababi edi).
      const payload = await api.get<Record<string, unknown>>('/auth/me');
      return extractUser(payload);
    } catch {
      return null;
    }
  },

  /** Super-admin ro'yxatdan o'tkazish — backendda sozlangan maxfiy kalit (x-reg-key) talab qilinadi */
  async register(data: {
    name: string;
    email: string;
    password: string;
    regKey: string;
  }): Promise<{ ok: boolean; message?: string }> {
    try {
      await api.postWithHeaders(
        '/auth/register',
        { name: data.name, email: data.email, password: data.password, role: 'super-admin' },
        { 'x-reg-key': data.regKey }
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'unknown error' };
    }
  },

  logout() {
    clearToken();
  },
};
