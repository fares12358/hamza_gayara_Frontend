import type { ReactNode } from 'react';

export interface SheetRow {
  key: string;
  label: ReactNode;
  cells: ReactNode[];
}

/**
 * A table laid out like the spreadsheet: it scrolls sideways when it has many
 * columns, and the name column stays visible.
 */
export function SheetTable({ caption, labelHeader, headers, rows, footer }: {
  caption: string;
  labelHeader: string;
  headers: ReactNode[];
  rows: SheetRow[];
  footer?: SheetRow;
}) {
  const sticky = 'sticky start-0 z-10 min-w-36 max-w-56 px-3 py-2.5 text-start whitespace-normal';
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface" tabIndex={0} role="region" aria-label={caption}>
      <table className="w-full border-separate border-spacing-0 text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="text-xs text-muted">
          <tr>
            <th scope="col" className={`${sticky} border-b border-ink/20 bg-raised font-semibold`}>{labelHeader}</th>
            {headers.map((h, i) => (
              <th key={i} scope="col" className="border-b border-ink/20 bg-raised px-3 py-3 text-end font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className={`${sticky} border-t border-line bg-surface font-semibold`}>{row.label}</th>
              {row.cells.map((cell, i) => (
                <td key={i} className="border-t border-line px-3 py-2.5 text-end whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot className="font-bold">
            <tr>
              <th scope="row" className={`${sticky} border-t-2 border-ink/30 bg-raised`}>{footer.label}</th>
              {footer.cells.map((cell, i) => (
                <td key={i} className="border-t-2 border-ink/30 bg-raised px-3 py-3 text-end whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
