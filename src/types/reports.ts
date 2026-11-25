/** Money is in piasters, dates are YYYY-MM-DD, months are YYYY-MM. */
export interface CashboxReport {
  from: string;
  to: string;
  opening: number;
  closing: number;
  income: number;
  expense: number;
  rows: { date: string; description: string; income: number; expense: number; balance: number; misdated: boolean }[];
}

export interface SalesReport {
  month: string;
  total: number;
  cashTotal: number;
  creditTotal: number;
  days: { date: string; cash: number; credit: number; total: number; lines: { name: string; amount: number; cash: boolean }[] }[];
  customers: { name: string; amount: number }[];
}

export interface DebtsReport {
  date: string;
  previousDate: string;
  rows: { name: string; previous: number; goods: number; payments: number; closing: number }[];
  totals: { previous: number; goods: number; payments: number; closing: number };
}

export interface AgingReport {
  asOf: string;
  overdueDays: number;
  months: string[];
  hasOlder: boolean;
  rows: { name: string; total: number; due: number | null; notDue: number | null; months: Record<string, number>; older: number }[];
  totals: { total: number; due: number; notDue: number; older: number; months: Record<string, number> };
}

export interface LateReport {
  asOf: string;
  overdueDays: number;
  blocks: { name: string; late: number; total: number; lines: { date: string; invoice: number | null; late: number }[] }[];
  totals: { late: number; debt: number };
}

export interface ExpensesReport {
  year: string;
  months: string[];
  rows: { category: string; values: Record<string, number>; total: number }[];
  monthTotals: Record<string, number>;
  total: number;
}

export interface ReportMap {
  cashbox: CashboxReport;
  sales: SalesReport;
  debts: DebtsReport;
  aging: AgingReport;
  late: LateReport;
  expenses: ExpensesReport;
}

export type ReportKey = keyof ReportMap;

export type ReportParams = Partial<Record<'from' | 'to' | 'date' | 'month' | 'year', string>>;

export interface ReportResponse<K extends ReportKey> {
  report: ReportMap[K];
  notes: string[];
  options: { months?: string[]; years?: string[] };
}
