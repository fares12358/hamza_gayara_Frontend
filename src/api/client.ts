import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './config';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}

export const UNAUTHORIZED_EVENT = 'gayara:unauthorized';

export const DATA_CHANGED_EVENT = 'gayara:data-changed';

export const http = axios.create({ baseURL: API_BASE_URL, timeout: 45_000, withCredentials: true });

http.interceptors.response.use(
  (response) => {
    const { method = 'get', url = '' } = response.config;
    if (method !== 'get' && !url.startsWith('/auth/')) window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
    return response;
  },
  (error: AxiosError<{ error?: { code: string; message: string } }>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data?.error;
    if (status === 401 && !error.config?.url?.startsWith('/auth/')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    const fallback = status
      ? 'حصل خطأ، جرب تاني'
      : 'مفيش اتصال بالسيرفر. لو كنت بتحفظ، اضغط حفظ تاني من غير ما تغيّر البيانات.';
    return Promise.reject(new ApiRequestError(body?.message ?? fallback, body?.code ?? 'NETWORK', status));
  },
);
