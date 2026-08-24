/**
 * Real backend bilan ishlash uchun HTTP client.
 *
 * Bu qatlam avvalgi `db.ts` (localStorage) o'rnini bosadi: JWT tokenni saqlaydi,
 * har bir so'rovga Authorization header qo'shadi, xatoliklarni birxil formatga keltiradi.
 *
 * Backend: Rayhon Restaurant OS API (Swagger: /api-docs)
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://ziyofat-backend-production-5557.up.railway.app/api';

const TOKEN_KEY = 'rayhon_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** multipart/form-data yuborish kerak bo'lsa (masalan rasm yuklash) */
  formData?: FormData;
}

/**
 * Backend javobini bir xil ko'rinishga keltiradi.
 * Ba'zi backendlar { success, data } bilan, ba'zilari to'g'ridan-to'g'ri obyekt bilan javob beradi —
 * ikkalasini ham qo'llab-quvvatlaymiz.
 */
function unwrap<T>(json: unknown): T {
  if (json && typeof json === 'object' && 'data' in (json as Record<string, unknown>)) {
    return (json as Record<string, unknown>).data as T;
  }
  return json as T;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, formData } = options;
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  const finalHeaders: Record<string, string> = { ...headers };
  const token = getToken();
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  let fetchBody: BodyInit | undefined;
  if (formData) {
    fetchBody = formData;
    // Content-Type ni qo'lda qo'ymaymiz — brauzer o'zi to'g'ri boundary bilan qo'yadi
  } else if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, { method, headers: finalHeaders, body: fetchBody });
  } catch {
    throw new ApiError(0, 'network.error');
  }

  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    const message =
      (json && typeof json === 'object' && 'message' in (json as Record<string, unknown>)
        ? String((json as Record<string, unknown>).message)
        : null) || `HTTP ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return unwrap<T>(json);
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => request<T>(path, { method: 'POST', formData }),
  /** Maxsus header (masalan x-reg-key) bilan so'rov yuborish uchun */
  postWithHeaders: <T>(path: string, body: unknown, headers: Record<string, string>) =>
    request<T>(path, { method: 'POST', body, headers }),
};

export { unwrap };
