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
/** saved: the server saved it. unknown: no clear answer, it may have been saved. */
export type DataChange = 'saved' | 'unknown';

const changesData = (method = 'get', url = '') => method !== 'get' && url !== '/auth/login' && url !== '/auth/logout';
const announce = (detail: DataChange) => window.dispatchEvent(new CustomEvent<DataChange>(DATA_CHANGED_EVENT, { detail }));

export const http = axios.create({ baseURL: API_BASE_URL, timeout: 45_000, withCredentials: true });

http.interceptors.response.use(
  (response) => {
    if (changesData(response.config.method, response.config.url)) announce('saved');
    return response;
  },
  (error: AxiosError<{ error?: { code: string; message: string } }>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data?.error;
    if ((status === 0 || status >= 500) && changesData(error.config?.method, error.config?.url)) announce('unknown');
    if (status === 401 && !error.config?.url?.startsWith('/auth/')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    const fallback = status
      ? 'حصل خطأ، جرب تاني'
      : 'مفيش اتصال بالسيرفر. لو كنت بتحفظ، اضغط حفظ تاني من غير ما تغيّر البيانات.';
    return Promise.reject(new ApiRequestError(body?.message ?? fallback, body?.code ?? 'NETWORK', status));
  },
);
