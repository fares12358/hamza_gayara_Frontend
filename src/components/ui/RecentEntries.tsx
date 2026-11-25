import type { Entry, EntryType } from '../../types';
import { formatDate } from '../../lib/dates';
import { CancelEntryButton } from './CancelEntryButton';
import { DataTable, LedgerLine } from './DataTable';
import { Money } from './Money';

export const ENTRY_LABELS: Record<EntryType, string> = {
  invoice: 'فاتورة',
  payment: 'تحصيل',
  cheque: 'شيك',
  cash_sale: 'بيع نقدي',
  expense: 'مصروف',
  transfer: 'تحويل للعبور',
  debt_add: 'تسوية بالزيادة',
  debt_reduce: 'تسوية بالخصم',
};

const describe = (e: Entry) =>
  [ENTRY_LABELS[e.type], e.customerName || e.category, e.permitNo && `إذن ${e.permitNo}`, e.note].filter(Boolean).join(' · ');

export function RecentEntries({ title, entries, onChanged }: { title: string; entries: Entry[]; onChanged: () => void }) {
  const cancel = (e: Entry) => <CancelEntryButton id={e.id} isInvoice={e.type === 'invoice'} onDone={onChanged} />;
  return (
    <section>
      <h2 className="mb-3 text-lg">{title}</h2>
      <DataTable
        caption={title}
        rows={entries}
        rowKey={(e) => e.id}
        empty="لسه مفيش حاجة اتسجلت من هنا. أول حركة تحفظها هتظهر هنا."
        mobileRow={(e) => (
          <LedgerLine title={describe(e)} meta={formatDate(e.date)} amount={<Money value={e.amount} />} actions={cancel(e)} />
        )}
        columns={[
          { header: 'التاريخ', cell: (e) => formatDate(e.date) },
          { header: 'البيان', cell: describe },
          { header: 'المبلغ', numeric: true, cell: (e) => <Money value={e.amount} className="font-semibold" /> },
          { header: '', numeric: true, cell: cancel },
        ]}
      />
    </section>
  );
}
