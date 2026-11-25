import { Fragment, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { EmptyState } from './States';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** Number columns are aligned to the end. */
  numeric?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Rows added in the app are marked. */
  highlight?: (row: T) => boolean;
  /** One compact ledger line on phones. */
  mobileRow: (row: T) => ReactNode;
  /** Puts a heading above each run of rows with the same group, e.g. a month. */
  groupBy?: (row: T) => string;
  pageSize?: number;
  empty: string;
  caption: string;
}

/** A ledger: table on wide screens, compact lines on phones. Long lists open in pages. */
export function DataTable<T>({ columns, rows, rowKey, highlight, mobileRow, groupBy, pageSize = 60, empty, caption }: Props<T>) {
  const [limit, setLimit] = useState(pageSize);
  if (!rows.length) return <EmptyState>{empty}</EmptyState>;

  const shown = rows.slice(0, limit);
  const heading = (i: number) => {
    if (!groupBy) return null;
    const group = groupBy(shown[i]);
    return i === 0 || groupBy(shown[i - 1]) !== group ? group : null;
  };
  const mark = (row: T) => (highlight?.(row) ? 'shadow-[inset_-3px_0_0_var(--accent)]' : '');

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="text-xs text-muted">
            <tr className="border-b border-ink/20">
              {columns.map((c, i) => (
                <th key={i} scope="col" className={`px-4 py-3 font-semibold ${c.numeric ? 'text-end' : 'text-start'}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, index) => (
              <Fragment key={rowKey(row)}>
                {heading(index) && (
                  <tr>
                    <th colSpan={columns.length} scope="colgroup" className="bg-raised px-4 py-1.5 text-start text-xs font-semibold text-muted">
                      {heading(index)}
                    </th>
                  </tr>
                )}
                <tr className="border-t border-line hover:bg-raised/60">
                  {columns.map((c, i) => (
                    <td key={i} className={`px-4 py-2.5 ${c.numeric ? 'text-end' : 'text-start'} ${i === 0 ? mark(row) : ''}`}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-line bg-surface md:hidden" aria-label={caption}>
        {shown.map((row, index) => (
          <Fragment key={rowKey(row)}>
            {heading(index) && <li className="bg-raised px-4 py-1.5 text-xs font-semibold text-muted">{heading(index)}</li>}
            <li className={`border-t border-line px-4 py-3 first:border-t-0 ${mark(row)}`}>{mobileRow(row)}</li>
          </Fragment>
        ))}
      </ul>

      {rows.length > limit && (
        <Button onClick={() => setLimit((n) => n + pageSize)}>
          عرض أكتر (<span className="num">{shown.length}</span> من <span className="num">{rows.length}</span>)
        </Button>
      )}
    </div>
  );
}

/** The usual phone line: what happened on one side, the money on the other. */
export function LedgerLine({ title, meta, amount, below, actions }: {
  title: ReactNode;
  meta?: ReactNode;
  amount: ReactNode;
  below?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold break-words">{title}</div>
          {meta && <div className="text-xs text-muted">{meta}</div>}
        </div>
        <div className="shrink-0 text-end">
          <div className="font-semibold">{amount}</div>
          {below && <div className="text-xs text-muted">{below}</div>}
        </div>
      </div>
      {actions && <div className="mt-1 flex justify-end gap-1">{actions}</div>}
    </div>
  );
}
