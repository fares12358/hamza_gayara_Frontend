import { http } from './client';
import type { CustomerList, Statement } from '../types';

export const customersApi = {
  list: () => http.get<CustomerList>('/customers').then((r) => r.data),
  statement: (id: string, range: number) =>
    http.get<Statement>(`/customers/${id}/statement`, { params: { range } }).then((r) => r.data),
  update: (id: string, body: Partial<{ name: string; aliases: string[]; archived: boolean }>) =>
    http.patch(`/customers/${id}`, body),
  archived: () => http.get<{ customers: { id: string; name: string }[] }>('/customers/archived').then((r) => r.data.customers),
  create: (body: { name: string; openingBalance: number }) => http.post('/customers', body),
};
