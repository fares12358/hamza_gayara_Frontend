/** The API address from VITE_API_BASE_URL, without a slash at the end. */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL?.trim() || '/api').replace(/\/+$/, '');
