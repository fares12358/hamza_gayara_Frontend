import { http } from './client';
import type { CashLedger, IncomeReport } from '../types';

export const treasuryApi = {
  balance: () => http.get<{ balance: number }>('/treasury/balance').then((r) => r.data.balance),
  ledger: (from: string) => http.get<CashLedger>('/treasury', { params: { from } }).then((r) => r.data),
};

export const reportsApi = {
  income: (month: string) =>
    http.get<IncomeReport>('/reports/income', { params: month ? { month } : {} }).then((r) => r.data),
};
