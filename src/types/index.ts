/** All money values are whole piasters. All dates are YYYY-MM-DD. */
export type Role = 'owner' | 'staff';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  active: boolean;
}

export type EntryType = 'invoice' | 'payment' | 'cheque' | 'cash_sale' | 'expense' | 'transfer';

export interface Entry {
  id: string;
  type: EntryType;
  date: string;
  amount: number;
  returnAmount: number;
  customerId: string | null;
  customerName: string;
  permitNo: string;
  category: string;
  note: string;
  createdAt: string;
  cheque?: { number: string; bank: string; dueDate: string; imageId: string };
}

export interface CustomerSummary {
  id: string;
  name: string;
  aliases: string[];
  balance: number;
  /** null: cannot be calculated */
  overdue: number | null;
  lastActivity: string;
}

export interface CustomerList {
  customers: CustomerSummary[];
  totals: { debt: number; debtors: number; overdue: number };
  ledgerAsOf: string;
  overdueDays: number;
}

export interface CustomerOption {
  id: string;
  name: string;
  balance: number;
}

export interface StatementRow {
  id: string;
  source: 'sheet' | 'app';
  type: EntryType | 'sheet';
  date: string;
  permitNo: string;
  returnAmount: number;
  invoiceAmount: number;
  paymentAmount: number;
  balance: number;
  note?: string;
  imageId?: string;
}

export interface Statement {
  customer: CustomerSummary & { source: 'sheet' | 'app' };
  openingBalance: number;
  previousBalance: number | null;
  from: string;
  overdueDays: number;
  rows: StatementRow[];
  totals: { invoices: number; returns: number; payments: number };
}

export interface CashLedgerRow {
  id: string;
  source: 'sheet' | 'app';
  date: string;
  description: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CashLedger {
  balance: number;
  cashAsOf: string;
  rows: CashLedgerRow[];
  totals: { income: number; expense: number };
}

export interface MonthIncome {
  month: string;
  cashSales: number;
  creditSales: number;
  returns: number;
  collections: number;
  chequeCollections: number;
  transfers: number;
  expenses: { category: string; amount: number }[];
  netSales: number;
  expensesTotal: number;
  net: number;
}

export interface IncomeReport {
  months: string[];
  selected: MonthIncome;
  year: string;
  yearRows: { month: string; netSales: number; expensesTotal: number; net: number }[];
  cashAsOf: string;
}
