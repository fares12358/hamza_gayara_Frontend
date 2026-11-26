import { useState } from 'react';
import { treasuryApi } from '../../api/reports';
import { BalanceSlab } from '../../components/ui/BalanceSlab';
import { CancelEntryButton } from '../../components/ui/CancelEntryButton';
import { DataTable, LedgerLine } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/Layouts';
import { Money } from '../../components/ui/Money';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { AsyncView } from '../../components/ui/States';
import { useApi } from '../../hooks/useApi';
import { daysAgoIso, formatDate, formatLongDate, todayIso } from '../../lib/dates';
import type { CashLedgerRow } from '../../types';
import { CashForm } from './CashForm';

type Range = 'week' | 'month' | 'days30' | 'year' | 'all';

const RANGES: { value: Range; label: string }[] = [
  { value: 'week', label: '7 أيام' },
  { value: 'month', label: 'الشهر ده' },
  { value: 'days30', label: '30 يوم' },
  { value: 'year', label: 'السنة دي' },
  { value: 'all', label: 'الكل' },
];

const fromDate: Record<Range, () => string> = {
  week: () => daysAgoIso(7),
  month: () => `${todayIso().slice(0, 8)}01`,
  days30: () => daysAgoIso(30),
  year: () => `${todayIso().slice(0, 4)}-01-01`,
  all: () => '',
};

export function TreasuryPage() {
  const [range, setRange] = useState<Range>('month');
  const from = fromDate[range]();
  const state = useApi(() => treasuryApi.ledger(from), `treasury:${from}`);

  return (
    <>
      <PageHeader title="الخزنة" description="سجّل حركات اليوم، والرصيد بيتحدث على طول." />
      <AsyncView state={state}>
        {(ledger) => {
          const cancel = (r: CashLedgerRow) => (r.source === 'app' ? <CancelEntryButton id={r.id} /> : null);
          return (
            <>
              <BalanceSlab
                label="رصيد الخزنة"
                amount={ledger.balance}
                hint={ledger.cashAsOf && `شيت الخزنة مسجل لحد ${formatDate(ledger.cashAsOf)}`}
                stats={[
                  { label: 'إيرادات الفترة المختارة', value: <Money value={ledger.totals.income} /> },
                  { label: 'مصروفات الفترة المختارة', value: <Money value={ledger.totals.expense} /> },
                ]}
              />
              <CashForm cashBalance={ledger.balance} />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg">حركة الخزنة <span className="text-sm font-normal text-muted">(الأحدث فوق)</span></h2>
                <SegmentedControl<Range>
                  label="فترة حركة الخزنة"
                  value={range}
                  onChange={setRange}
                  options={RANGES}
                />
              </div>
              <DataTable
                key={range}
                caption="حركة الخزنة"
                rows={[...ledger.rows].reverse()}
                rowKey={(r) => r.id}
                highlight={(r) => r.source === 'app'}
                groupBy={(r) => formatLongDate(r.date)}
                empty="مفيش حركات في الفترة دي. اختار فترة أطول أو سجّل أول حركة."
                mobileRow={(r) => (
                  <LedgerLine
                    title={r.description || '—'}
                    meta={<>الرصيد <Money value={r.balance} /></>}
                    amount={
                      r.income ? <Money value={r.income} sign="+" />
                      : <Money value={r.expense} sign="−" className="text-danger" />
                    }
                    below={r.income ? 'إيراد' : 'مصروف'}
                    actions={cancel(r)}
                  />
                )}
                columns={[
                  { header: 'البيان', cell: (r) => r.description },
                  { header: 'إيراد', numeric: true, cell: (r) => (r.income ? <Money value={r.income} /> : '') },
                  { header: 'مصروف', numeric: true, cell: (r) => (r.expense ? <Money value={r.expense} className="text-danger" /> : '') },
                  { header: 'الرصيد', numeric: true, cell: (r) => <Money value={r.balance} className="font-bold" /> },
                  { header: '', numeric: true, cell: cancel },
                ]}
              />
            </>
          );
        }}
      </AsyncView>
    </>
  );
}
