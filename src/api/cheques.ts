import { http } from './client';
import { API_BASE_URL } from './config';
import type { SafeWrite } from './entries';
import type { CustomerOption, Entry } from '../types';

export interface ChequeInput {
  customerId: string;
  date: string;
  amount: number;
  number: string;
  bank: string;
  dueDate: string;
  note: string;
  image: string;
}

export const chequesApi = {
  list: (limit: number) =>
    http.get<{ cheques: Entry[]; total: number }>('/cheques', { params: { limit } }).then((r) => r.data),
  customerOptions: () =>
    http.get<{ customers: CustomerOption[] }>('/cheques/customer-options').then((r) => r.data.customers),
  create: (body: ChequeInput & SafeWrite) => http.post('/cheques', body, { timeout: 60_000 }),
  imageUrl: (id: string) => `${API_BASE_URL}/cheques/images/${id}`,
};
