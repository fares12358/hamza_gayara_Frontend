import { useState, type ReactNode } from 'react';
import { reportsApi } from '../../api/reports';
import { BalanceSlab } from '../../components/ui/BalanceSlab';
import { DataTable, LedgerLine } from '../../components/ui/DataTable';
import { Card, PageHeader } from '../../components/ui/Layouts';
import { Money } from '../../components/ui/Money';
import { MonthStepper } from '../../components/ui/MonthStepper';
import { ShareBar } from '../../components/ui/ShareBar';
import { AsyncView } from '../../components/ui/States';
import { useApi } from '../../hooks/useApi';
import { formatDate, monthName } from '../../lib/dates';

function Line({ label, value, strong, minus }: { label: string; value: number; strong?: boolean; minus?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2.5 ${strong ? 'border-t-2! border-ink/30 font-bold' : ''}`}>
      <span className={strong ? '' : 'text-muted'}>{label}</span>
      <Money value={value} sign={minus && value > 0 ? '−' : ''} />
    </div>
  );
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card title={title}>
    <div className="divide-y divide-line">{children}</div>
  </Card>
);

export function IncomePage() {
  const [month, setMonth] = useState('');
  const state = useApi(() => reportsApi.income(month), month || 'current');
  // Kept while another month loads, so the month control does not disappear.
  const [months, setMonths] = useState<string[]>([]);
  if (state.data && state.data.months.join() !== months.join()) setMonths(state.data.months);
  const selected = month || state.data?.selected.month || '';

  return (
    <>
      <PageHeader
        title="قائمة الدخل"
        actions={months.length > 0 && <MonthStepper months={months} value={selected} onChange={setMonth} />}
      />
      <AsyncView state={state}>
        {({ selected: m, yearRows, year, cashAsOf }) => {
          const largestExpense = Math.max(0, ...m.expenses.map((x) => x.amount));
          const bestSales = Math.max(0, ...yearRows.map((r) => r.netSales));
          return (
            <>
              <BalanceSlab
                label={`الصافي بعد المصروفات - ${monthName(m.month)} ${m.month.slice(0, 4)}`}
                amount={m.net}
                hint={
                  <>
                    قبل تكلفة البضاعة لأنها مش موجودة في الشيتات.
                    {cashAsOf.slice(0, 7) === m.month && ` شيت الخزنة مسجل لحد ${formatDate(cashAsOf)}، وبعده من التطبيق بس.`}
                  </>
                }
                stats={[
                  { label: 'صافي المبيعات', value: <Money value={m.netSales} /> },
                  { label: 'إجمالي المصروفات', value: <Money value={m.expensesTotal} /> },
                ]}
              />
              <div className="grid items-start gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <Section title="المبيعات">
                    <Line label="بيع نقدي" value={m.cashSales} />
                    <Line label="بيع آجل (فواتير العملاء)" value={m.creditSales} />
                    <Line label="مرتجعات وفروق وزن" value={m.returns} minus />
                    <Line label="صافي المبيعات" value={m.netSales} strong />
                  </Section>
                  <Section title="حركة فلوس (مش جزء من الدخل)">
                    <Line label="تحصيلات من العملاء" value={m.collections} />
                    <Line label="تحصيلات بشيكات (من التطبيق)" value={m.chequeCollections} />
                    <Line label="تحويلات لفرع العبور" value={m.transfers} />
                  </Section>
                </div>
                <Card title="المصروفات (من الأكبر للأصغر)">
                  {m.expenses.length === 0 && <p className="text-muted">مفيش مصروفات مسجلة للشهر ده</p>}
                  <ul className="flex flex-col gap-3">
                    {m.expenses.map((x) => (
                      <li key={x.category}>
                        <div className="mb-1 flex justify-between gap-3 text-sm">
                          <span>{x.category}</span>
                          <Money value={x.amount} className="font-semibold" />
                        </div>
                        <ShareBar value={x.amount} max={largestExpense} />
                      </li>
                    ))}
                  </ul>
                  {m.expenses.length > 0 && (
                    <div className="mt-4 flex justify-between gap-4 border-t-2 border-ink/30 pt-3 font-bold">
                      <span>إجمالي المصروفات</span>
                      <Money value={m.expensesTotal} />
                    </div>
                  )}
                </Card>
              </div>
              <h2 className="mt-2 text-lg">ملخص سنة {year}</h2>
              <DataTable
                caption={`ملخص سنة ${year}`}
                rows={yearRows}
                rowKey={(r) => r.month}
                highlight={(r) => r.month === m.month}
                empty="مفيش بيانات للسنة دي"
                mobileRow={(r) => (
                  <LedgerLine
                    title={monthName(r.month)}
                    meta={<>مبيعات <Money value={r.netSales} /> · مصروفات <Money value={r.expensesTotal} /></>}
                    amount={<Money value={r.net} className={r.net < 0 ? 'text-danger' : ''} />}
                    below="الصافي"
                  />
                )}
                columns={[
                  { header: 'الشهر', cell: (r) => <button type="button" onClick={() => setMonth(r.month)} className="min-h-8 font-semibold text-accent underline-offset-4 hover:underline">{monthName(r.month)}</button> },
                  { header: 'مقارنة صافي المبيعات', cell: (r) => <div className="w-40 lg:w-64"><ShareBar value={r.netSales} max={bestSales} /></div> },
                  { header: 'صافي المبيعات', numeric: true, cell: (r) => <Money value={r.netSales} /> },
                  { header: 'المصروفات', numeric: true, cell: (r) => <Money value={r.expensesTotal} /> },
                  { header: 'الصافي', numeric: true, cell: (r) => <Money value={r.net} className={`font-bold ${r.net < 0 ? 'text-danger' : ''}`} /> },
                ]}
              />
            </>
          );
        }}
      </AsyncView>
    </>
  );
}
