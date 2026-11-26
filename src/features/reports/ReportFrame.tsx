import { useState, type ReactNode } from 'react';
import { reportFilesApi } from '../../api/reportFiles';
import { Icon } from '../../components/layout/Icon';
import { Button } from '../../components/ui/Button';
import { AsyncView } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import type { ReportKey, ReportMap, ReportParams, ReportResponse } from '../../types/reports';

export function useReport<K extends ReportKey>(key: K, params: ReportParams) {
  return useApi(() => reportFilesApi.view(key, params), `report:${key}:${JSON.stringify(params)}`);
}

/** The same frame for every report: filters, Excel button, notes, then the content. */
export function ReportFrame<K extends ReportKey>({ reportKey, title, state, filters, fileName, exportParams, children }: {
  reportKey: K;
  title: string;
  state: { data?: ReportResponse<K>; error?: string; loading: boolean; reload: () => void };
  filters?: ReactNode;
  fileName: (report: ReportMap[K]) => string;
  /** The values shown on screen, so the file has exactly the same period. */
  exportParams: (report: ReportMap[K]) => ReportParams;
  children: (report: ReportMap[K], response: ReportResponse<K>) => ReactNode;
}) {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const report = state.error || state.loading ? undefined : state.data?.report;

  async function download() {
    if (!report) return;
    setExporting(true);
    try {
      await reportFilesApi.download(reportKey, exportParams(report), fileName(report));
      toast('تم تجهيز ملف الإكسل');
    } catch {
      toast('تنزيل الملف ماتمش، جرب تاني', 'error');
    } finally {
      setExporting(false);
    }
  }

  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-end gap-3">
          <h2 className="w-full text-xl">{title}</h2>
          {filters}
        </div>
        <Button variant="primary" onClick={download} loading={exporting} disabled={!report}>
          <Icon name="download" className="size-4" />
          تنزيل Excel
        </Button>
      </div>
      <AsyncView state={state}>
        {(data) => (
          <>
            {data.notes.length > 0 && (
              <ul className="space-y-1 rounded-xl border border-line bg-raised px-4 py-3 text-sm text-muted">
                {data.notes.map((note) => (
                  <li key={note} className="flex gap-2">
                    <Icon name="alert" className="mt-1 size-4" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            )}
            {children(data.report, data)}
          </>
        )}
      </AsyncView>
    </section>
  );
}
