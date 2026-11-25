import type { IconName } from './Icon';

export interface NavItem {
  to: string;
  label: string;
  short: string;
  icon: IconName;
  ownerOnly?: boolean;
}

export const NAV: NavItem[] = [
  { to: '/', label: 'العملاء', short: 'العملاء', icon: 'customers' },
  { to: '/invoices', label: 'فاتورة جديدة', short: 'فاتورة', icon: 'invoice', ownerOnly: true },
  { to: '/treasury', label: 'الخزنة', short: 'الخزنة', icon: 'treasury', ownerOnly: true },
  { to: '/cheques', label: 'الشيكات', short: 'شيكات', icon: 'cheque' },
  { to: '/income', label: 'قائمة الدخل', short: 'الدخل', icon: 'income', ownerOnly: true },
];

export const USERS_NAV: NavItem = { to: '/users', label: 'المستخدمين', short: 'المستخدمين', icon: 'users', ownerOnly: true };
export const AUDIT_NAV: NavItem = { to: '/audit', label: 'سجل العمليات', short: 'السجل', icon: 'history', ownerOnly: true };
