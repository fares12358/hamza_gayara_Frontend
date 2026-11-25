import { useState } from 'react';
import { BalanceSlab } from '../../components/ui/BalanceSlab';
import { Chart } from '../../components/ui/Chart';
import { Select } from '../../components/ui/Field';
import { Money } from '../../components/ui/Money';
import { SheetTable } from '../../components/ui/SheetTable';
import { monthName } from '../../lib/dates';
import type { ReportParams } from '../../types/reports';
import { ReportFrame, useReport } from './ReportFrame';

const amount = (v: number | undefined) => (v ? <Money value={v} /> : '—');

export function ExpensesTab() {
  const [params, setParams] = useState<ReportParams>({});
  const state = useReport('expenses', params);
  const [years, setYears] = useState<string[]>([]);
  const loaded = state.data?.options.years;
  if (loaded && loaded.join() !== years.join()) setYears(loaded);
  const year = params.year ?? state.data?.report.year ?? '';

  return (
    <ReportFrame
      reportKey="expenses"
      title="مصاريف الجيارة"
      state={state}
      fileName={(r) => `مصاريف الجياره ${r.year}`}
      exportParams={(r) => ({ year: r.year })}
      filters={years.length > 0 && <Select label="السنة" value={year} onValue={(y) => setParams({ year: y })} options={years.map((y) => ({ value: y, label: y }))} className="w-32" />}
    >
      {(r) => (
        <>
          <BalanceSlab label={`إجمالي مصاريف ${r.year}`} amount={r.total} stats={[{ label: 'عدد البنود', value: <span className="num">{r.rows.length}</span> }]} />
          <div className="grid items-start gap-4 xl:grid-cols-2">
            <Chart title="المصاريف كل شهر" labels={r.months.map(monthName)} series={[{ label: 'المصاريف', color: 'chart-1', values: r.months.map((m) => r.monthTotals[m]) }]} />
            <Chart title="المصاريف حسب البند" horizontal labels={r.rows.map((x) => x.category)} series={[{ label: 'المصاريف', color: 'chart-1', values: r.rows.map((x) => x.total) }]} />
          </div>
          <SheetTable
            caption={`مصاريف ${r.year}`}
            labelHeader="البند"
            headers={[...r.months.map(monthName), 'إجمالي البند']}
            rows={r.rows.map((row) => ({
              key: row.category,
              label: row.category,
              cells: [...r.months.map((m) => amount(row.values[m])), <Money value={row.total} className="font-bold" />],
            }))}
            footer={{ key: 'total', label: 'الاجمالي', cells: [...r.months.map((m) => amount(r.monthTotals[m])), amount(r.total)] }}
          />
        </>
      )}
    </ReportFrame>
  );
}
