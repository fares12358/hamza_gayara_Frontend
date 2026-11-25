import { useState } from 'react';
import { BalanceSlab } from '../../components/ui/BalanceSlab';
import { Button } from '../../components/ui/Button';
import { Chart } from '../../components/ui/Chart';
import { DataTable, LedgerLine } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Field';
import { Money } from '../../components/ui/Money';
import { formatDate, formatLongDate, monthName, todayIso } from '../../lib/dates';
import type { CashboxReport, ReportParams } from '../../types/reports';
import { ReportFrame, useReport } from './ReportFrame';

/** One point per day, or per month for long periods. */
function periods(report: CashboxReport) {
  const byMonth = new Set(report.rows.map((r) => r.date.slice(0, 7))).size > 2;
  const map = new Map<string, { income: number; expense: number; balance: number }>();
  let key = '';
  for (const row of report.rows) {
    // A mistyped date stays with the rows around it.
    if (!row.misdated) key = row.date.slice(0, byMonth ? 7 : 10);
    const point = map.get(key) ?? { income: 0, expense: 0, balance: 0 };
    point.income += row.income;
    point.expense += row.expense;
    point.balance = row.balance;
    map.set(key, point);
  }
  const keys = [...map.keys()];
  return {
    byMonth,
    labels: keys.map((k) => (byMonth ? monthName(k) : k.slice(8, 10) + '/' + k.slice(5, 7))),
    points: keys.map((k) => map.get(k)!),
  };
}

export function CashboxTab() {
  const [params, setParams] = useState<ReportParams>({});
  const state = useReport('cashbox', params);
  const shown = state.data?.report;
  const from = params.from ?? shown?.from ?? '';
  const to = params.to ?? shown?.to ?? '';
  const set = (key: 'from' | 'to') => (value: string) => setParams({ from, to, [key]: value || undefined });
  const today = todayIso();

  return (
    <ReportFrame
      reportKey="cashbox"
      title="حركة خزنة الجيارة"
      state={state}
      fileName={(r) => `حركه خزنه الجياره ${formatDate(r.from).replaceAll('/', '-')} الى ${formatDate(r.to).replaceAll('/', '-')}`}
      exportParams={(r) => ({ from: r.from, to: r.to })}
      filters={
        <>
          <Input label="من" type="date" value={from} max={today} onValue={set('from')} hint={from ? formatLongDate(from) : undefined} />
          <Input label="إلى" type="date" value={to} max={today} onValue={set('to')} hint={to ? formatLongDate(to) : undefined} />
          <Button onClick={() => setParams({ from: `${today.slice(0, 4)}-01-01`, to: today })}>السنة كلها</Button>
        </>
      }
    >
      {(r) => {
        const chart = periods(r);
        const every = chart.byMonth ? 'كل شهر' : 'كل يوم';
        return (
          <>
            <BalanceSlab
              label="الرصيد في آخر الفترة"
              amount={r.closing}
              stats={[
                { label: 'رصيد مرحل', value: <Money value={r.opening} /> },
                { label: 'الإيراد', value: <Money value={r.income} /> },
                { label: 'المصروف (مع التحويلات)', value: <Money value={r.expense} /> },
              ]}
            />
            <div className="grid gap-4 xl:grid-cols-2">
              <Chart
                title={`الإيراد والمصروف ${every}`}
                labels={chart.labels}
                series={[
                  { label: 'إيراد', color: 'chart-1', values: chart.points.map((p) => p.income) },
                  { label: 'مصروف', color: 'chart-2', values: chart.points.map((p) => p.expense) },
                ]}
              />
              <Chart title={`رصيد الخزنة آخر ${chart.byMonth ? 'كل شهر' : 'كل يوم'}`} type="line" labels={chart.labels} series={[{ label: 'الرصيد', color: 'chart-1', values: chart.points.map((p) => p.balance) }]} />
            </div>
            <DataTable
              key={`${r.from}:${r.to}`}
              caption="حركة الخزنة"
              rows={r.rows.map((row, index) => ({ ...row, index }))}
              rowKey={(row) => String(row.index)}
              empty="مفيش حركات في الفترة دي"
              mobileRow={(row) => (
                <LedgerLine
                  title={row.description || '—'}
                  meta={<>{formatDate(row.date)} · الرصيد <Money value={row.balance} /></>}
                  amount={row.income ? <Money value={row.income} sign="+" /> : <Money value={row.expense} sign="−" />}
                  below={row.income ? 'إيراد' : 'مصروف'}
                />
              )}
              columns={[
                { header: 'التاريخ', cell: (row) => formatDate(row.date) },
                { header: 'اسم العميل / البيان', cell: (row) => row.description },
                { header: 'إيراد', numeric: true, cell: (row) => (row.income ? <Money value={row.income} /> : '') },
                { header: 'مصروف', numeric: true, cell: (row) => (row.expense ? <Money value={row.expense} /> : '') },
                { header: 'الرصيد', numeric: true, cell: (row) => <Money value={row.balance} className="font-bold" /> },
              ]}
            />
          </>
        );
      }}
    </ReportFrame>
  );
}
