import { http } from './client';
import type { Entry, EntryType } from '../types';

/** requestId makes a retry safe: the server saves it only once. */
export interface SafeWrite {
  requestId: string;
  confirmBackdated: boolean;
  confirmUnusual: boolean;
}

export interface AdjustmentInput {
  customerId: string;
  direction: 'add' | 'reduce';
  amount: number;
  date: string;
  note: string;
}

export interface InvoiceInput {
  customerId: string;
  date: string;
  permitNo: string;
  amount: number;
  returnAmount: number;
  paidAmount: number;
  note: string;
}

export type CashInput = { date: string; amount: number; note: string } & (
  | { type: 'payment'; customerId: string }
  | { type: 'cash_sale' }
  | { type: 'expense'; category: string }
  | { type: 'transfer' }
);

export const entriesApi = {
  categories: () => http.get<{ categories: string[] }>('/entries/categories').then((r) => r.data.categories),
  recent: (types: EntryType[], limit = 10) =>
    http.get<{ entries: Entry[] }>('/entries', { params: { types: types.join(','), limit } }).then((r) => r.data.entries),
  createInvoice: (body: InvoiceInput & SafeWrite) => http.post('/entries/invoice', body),
  createCash: (body: CashInput & SafeWrite) => http.post('/entries/cash', body),
  createAdjustment: (body: AdjustmentInput & SafeWrite) => http.post('/entries/adjustment', body),
  cancel: (id: string, reason = '') => http.post(`/entries/${id}/void`, { reason }),
};
