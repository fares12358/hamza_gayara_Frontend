import { BalanceSlab } from '../../components/ui/BalanceSlab';
import { Chart } from '../../components/ui/Chart';
import { Money } from '../../components/ui/Money';
import { SheetTable } from '../../components/ui/SheetTable';
import { EmptyState } from '../../components/ui/States';
import { formatDate } from '../../lib/dates';
import { ReportFrame, useReport } from './ReportFrame';

export function LateTab() {
  const state = useReport('late', {});

  return (
    <ReportFrame
      reportKey="late"
      title="فواتير المديونية المتأخرة"
      state={state}
      fileName={(r) => `فواتير المديونيه المتاخره لعملاء الجياره ${formatDate(r.asOf).replaceAll('/', '-')}`}
      exportParams={() => ({})}
    >
      {(r) => (
        <>
          <BalanceSlab
            label={`إجمالي المتأخر أكتر من ${r.overdueDays} أيام`}
            amount={r.totals.late}
            stats={[
              { label: 'عملاء متأخرين', value: <span className="num">{r.blocks.length}</span> },
              { label: 'إجمالي مديونيتهم', value: <Money value={r.totals.debt} /> },
            ]}
          />
          <Chart title="المتأخر لكل عميل" horizontal labels={r.blocks.map((b) => b.name)} series={[{ label: 'المتأخر', color: 'late', values: r.blocks.map((b) => b.late) }]} />
          {r.blocks.length === 0 && <EmptyState>مفيش فواتير متأخرة</EmptyState>}
          <div className="grid items-start gap-4 xl:grid-cols-2">
            {r.blocks.map((block) => (
              <article key={block.name} className="min-w-0">
                <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg">{block.name}</h3>
                  <p className="text-sm text-muted">
                    المتأخر <Money value={block.late} className="font-bold text-danger" /> · إجمالي المديونية <Money value={block.total} className="font-bold text-ink" />
                  </p>
                </header>
                <SheetTable
                  caption={`فواتير ${block.name} المتأخرة`}
                  labelHeader="التاريخ"
                  headers={['إجمالي الفاتورة', 'المتأخر منها']}
                  rows={block.lines.map((line, i) => ({
                    key: `${line.date}:${i}`,
                    label: line.date ? formatDate(line.date) : 'رصيد أقدم',
                    cells: [line.invoice === null ? '—' : <Money value={line.invoice} />, <Money value={line.late} />],
                  }))}
                />
              </article>
            ))}
          </div>
        </>
      )}
    </ReportFrame>
  );
}
