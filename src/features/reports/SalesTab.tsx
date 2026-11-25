import { useState } from 'react';
import { BalanceSlab } from '../../components/ui/BalanceSlab';
import { Chart } from '../../components/ui/Chart';
import { DataTable, LedgerLine } from '../../components/ui/DataTable';
import { Money } from '../../components/ui/Money';
import { MonthStepper } from '../../components/ui/MonthStepper';
import { formatDate, formatLongDate, monthName } from '../../lib/dates';
import { formatMoney } from '../../lib/money';
import type { ReportParams } from '../../types/reports';
import { ReportFrame, useReport } from './ReportFrame';

export function SalesTab() {
  const [params, setParams] = useState<ReportParams>({});
  const state = useReport('sales', params);
  // Kept while another month loads, so the month control does not disappear.
  const [months, setMonths] = useState<string[]>([]);
  const loaded = state.data?.options.months;
  if (loaded && loaded.join() !== months.join()) setMonths(loaded);
  const month = params.month ?? state.data?.report.month ?? '';

  return (
    <ReportFrame
      reportKey="sales"
      title="مبيعات فرع الجيارة"
      state={state}
      fileName={(r) => `مبيعات فرع الجياره ${monthName(r.month)} ${r.month.slice(0, 4)}`}
      exportParams={(r) => ({ month: r.month })}
      filters={months.length > 0 && <MonthStepper months={months} value={month} onChange={(m) => setParams({ month: m })} />}
    >
      {(r) => {
        const lines = r.days.flatMap((day) => day.lines.map((line) => ({ ...line, date: day.date, dayTotal: day.total, key: `${day.date}:${line.cash}:${line.name}` })));
        const top = r.customers.slice(0, 10);
        return (
          <>
            <BalanceSlab
              label={`إجمالي مبيعات ${monthName(r.month)}`}
              amount={r.total}
              stats={[
                { label: 'بيع نقدي', value: <Money value={r.cashTotal} /> },
                { label: 'فواتير العملاء', value: <Money value={r.creditTotal} /> },
                { label: 'أيام فيها بيع', value: <span className="num">{r.days.length}</span> },
              ]}
            />
            <Chart
              title="المبيعات كل يوم"
              stacked
              labels={r.days.map((d) => d.date.slice(8, 10))}
              series={[
                { label: 'نقدي', color: 'chart-1', values: r.days.map((d) => d.cash) },
                { label: 'آجل', color: 'chart-2', values: r.days.map((d) => d.credit) },
              ]}
            />
            <Chart title="أكبر العملاء في الشهر (آجل)" horizontal labels={top.map((c) => c.name)} series={[{ label: 'الفواتير', color: 'chart-1', values: top.map((c) => c.amount) }]} />
            <DataTable
              key={r.month}
              caption="تفاصيل المبيعات"
              rows={lines}
              rowKey={(l) => l.key}
              groupBy={(l) => `${formatLongDate(l.date)} · إجمالي اليوم ${formatMoney(l.dayTotal)}`}
              empty="مفيش مبيعات في الشهر ده"
              mobileRow={(l) => <LedgerLine title={l.name} meta={l.cash ? 'نقدي' : 'آجل'} amount={<Money value={l.amount} />} />}
              columns={[
                { header: 'اليوم', cell: (l) => formatDate(l.date) },
                { header: 'اسم العميل', cell: (l) => <span className={l.cash ? 'font-semibold' : ''}>{l.name}</span> },
                { header: 'القيمة', numeric: true, cell: (l) => <Money value={l.amount} /> },
              ]}
            />
          </>
        );
      }}
    </ReportFrame>
  );
}
