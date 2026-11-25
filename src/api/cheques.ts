import { http } from './client';
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
  list: () => http.get<{ cheques: Entry[] }>('/cheques').then((r) => r.data.cheques),
  customerOptions: () =>
    http.get<{ customers: CustomerOption[] }>('/cheques/customer-options').then((r) => r.data.customers),
  create: (body: ChequeInput & SafeWrite) => http.post('/cheques', body, { timeout: 60_000 }),
  imageUrl: (id: string) => `/api/cheques/images/${id}`,
};
