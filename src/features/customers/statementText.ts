import type { Statement } from '../../types';
import { formatDate } from '../../lib/dates';
import { formatMoney } from '../../lib/money';

/** Plain text of the last 25 shown rows, for WhatsApp. */
export function statementText({ customer, rows }: Statement) {
  const lines = rows.slice(-25).map((r) =>
    [
      formatDate(r.date),
      r.permitNo && (r.type === 'cheque' ? `شيك ${r.permitNo}` : `إذن ${r.permitNo}`),
      r.invoiceAmount && `${r.type === 'debt_add' ? 'تسوية بالزيادة' : 'فاتورة'} ${formatMoney(r.invoiceAmount)}`,
      r.returnAmount && `مرتجع ${formatMoney(r.returnAmount)}`,
      r.paymentAmount && `${r.type === 'debt_reduce' ? 'تسوية بالخصم' : 'دفعة'} ${formatMoney(r.paymentAmount)}`,
      `الرصيد ${formatMoney(r.balance)}`,
    ]
      .filter(Boolean)
      .join(' | '),
  );
  return [`كشف حساب ${customer.name}`, ...lines, `الرصيد الحالي: ${formatMoney(customer.balance)} ج.م`].join('\n');
}
