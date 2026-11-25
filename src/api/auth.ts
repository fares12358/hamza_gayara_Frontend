import { http } from './client';
import type { User } from '../types';

export const authApi = {
  me: () => http.get<{ user: User }>('/auth/me').then((r) => r.data.user),
  login: (username: string, password: string) =>
    http.post<{ user: User }>('/auth/login', { username, password }).then((r) => r.data.user),
  logout: () => http.post('/auth/logout'),
  changePassword: (currentPassword: string, newPassword: string) =>
    http.patch('/auth/password', { currentPassword, newPassword }),
};
