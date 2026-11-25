import { useState } from 'react';
import { BalanceSlab } from '../../components/ui/BalanceSlab';
import { Chart } from '../../components/ui/Chart';
import { Input } from '../../components/ui/Field';
import { Money } from '../../components/ui/Money';
import { SheetTable } from '../../components/ui/SheetTable';
import { formatDate, formatLongDate, todayIso } from '../../lib/dates';
import type { ReportParams } from '../../types/reports';
import { ReportFrame, useReport } from './ReportFrame';

const amount = (v: number) => (v ? <Money value={v} /> : '—');

export function DebtsTab() {
  const [params, setParams] = useState<ReportParams>({});
  const state = useReport('debts', params);
  const date = params.date ?? state.data?.report.date ?? '';

  return (
    <ReportFrame
      reportKey="debts"
      title="مديونيات عملاء فرع الجيارة"
      state={state}
      fileName={(r) => `مديونيات عملاء فرع الجياره ${formatDate(r.date).replaceAll('/', '-')}`}
      exportParams={(r) => ({ date: r.date })}
      filters={<Input label="يوم التقرير" type="date" value={date} max={todayIso()} onValue={(v) => setParams(v ? { date: v } : {})} hint={date ? formatLongDate(date) : undefined} />}
    >
      {(r) => {
        const debtors = r.rows.filter((row) => row.closing > 0).slice(0, 12);
        return (
          <>
            <BalanceSlab
              label={`صافي المديونية يوم ${formatDate(r.date)}`}
              amount={r.totals.closing}
              stats={[
                { label: `يوم ${formatDate(r.previousDate)}`, value: <Money value={r.totals.previous} /> },
                { label: 'البضاعة المستلمة', value: <Money value={r.totals.goods} /> },
                { label: 'دفعات العملاء', value: <Money value={r.totals.payments} /> },
              ]}
            />
            <Chart title="أكبر المديونيات في اليوم ده" horizontal labels={debtors.map((d) => d.name)} series={[{ label: 'المديونية', color: 'chart-1', values: debtors.map((d) => d.closing) }]} />
            <SheetTable
              caption="مديونيات العملاء"
              labelHeader="اسم العميل"
              headers={[`مديونية يوم ${formatDate(r.previousDate)}`, 'البضاعة المستلمة', 'دفعات العميل', `مديونية يوم ${formatDate(r.date)}`]}
              rows={r.rows.map((row) => ({
                key: row.name,
                label: row.name,
                cells: [<Money value={row.previous} />, amount(row.goods), amount(row.payments), <Money value={row.closing} className="font-bold" />],
              }))}
              footer={{ key: 'total', label: 'الاجمالي', cells: [r.totals.previous, r.totals.goods, r.totals.payments, r.totals.closing].map((v, i) => <Money key={i} value={v} />) }}
            />
          </>
        );
      }}
    </ReportFrame>
  );
}
