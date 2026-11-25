import { BalanceSlab } from '../../components/ui/BalanceSlab';
import { Chart } from '../../components/ui/Chart';
import { Money } from '../../components/ui/Money';
import { SheetTable } from '../../components/ui/SheetTable';
import { formatDate, monthName } from '../../lib/dates';
import { ReportFrame, useReport } from './ReportFrame';

const amount = (v: number | null) => (v ? <Money value={v} /> : v === null ? 'غير معروف' : '—');
const label = (month: string) => `${monthName(month)} ${month.slice(0, 4)}`;

export function AgingTab() {
  const state = useReport('aging', {});

  return (
    <ReportFrame
      reportKey="aging"
      title="أعمار المديونية"
      state={state}
      fileName={(r) => `اعمار مديونيه الجياره ${formatDate(r.asOf).replaceAll('/', '-')}`}
      exportParams={() => ({})}
    >
      {(r) => {
        // On screen: only months with money. The Excel file has every month, like the example.
        const months = r.months.filter((m) => r.totals.months[m]);
        const columns = [...months, ...(r.hasOlder ? ['older'] : [])];
        const chartColumns = [...columns].reverse();
        const total = (m: string) => (m === 'older' ? r.totals.older : r.totals.months[m]);
        return (
          <>
            <BalanceSlab
              label={`صافي المديونية حتى ${formatDate(r.asOf)}`}
              amount={r.totals.total}
              stats={[
                { label: 'مستحق الدفع', value: <Money value={r.totals.due} /> },
                { label: 'غير مستحق الدفع', value: <Money value={r.totals.notDue} /> },
              ]}
            />
            <Chart title="المديونية حسب شهر الفاتورة" labels={chartColumns.map((m) => (m === 'older' ? 'أقدم' : label(m)))} series={[{ label: 'المديونية', color: 'chart-1', values: chartColumns.map(total) }]} />
            <SheetTable
              caption="أعمار المديونية"
              labelHeader="اسم العميل"
              headers={['إجمالي المديونية', 'غير مستحق الدفع', 'مستحق الدفع', ...columns.map((m) => (m === 'older' ? 'أقدم' : label(m)))]}
              rows={r.rows.map((row) => ({
                key: row.name,
                label: row.name,
                cells: [
                  <Money value={row.total} className="font-bold" />,
                  amount(row.notDue),
                  amount(row.due),
                  ...columns.map((m) => amount(m === 'older' ? row.older : row.months[m] ?? 0)),
                ],
              }))}
              footer={{
                key: 'total',
                label: 'الاجمالي',
                cells: [r.totals.total, r.totals.notDue, r.totals.due, ...columns.map(total)].map((v, i) => <Money key={i} value={v} />),
              }}
            />
          </>
        );
      }}
    </ReportFrame>
  );
}
