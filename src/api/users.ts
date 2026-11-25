import { http } from './client';
import type { Role, User } from '../types';

export const usersApi = {
  list: () => http.get<{ users: User[] }>('/users').then((r) => r.data.users),
  create: (body: { name: string; username: string; password: string; role: Role }) => http.post('/users', body),
  update: (id: string, body: Partial<{ name: string; role: Role; active: boolean; password: string }>) =>
    http.patch(`/users/${id}`, body),
};
