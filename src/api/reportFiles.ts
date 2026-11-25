import { http } from './client';
import type { ReportKey, ReportParams, ReportResponse } from '../types/reports';

export const reportFilesApi = {
  view: <K extends ReportKey>(key: K, params: ReportParams) =>
    http.get<ReportResponse<K>>(`/reports/${key}`, { params }).then((r) => r.data),

  /** Downloads the Excel file the server builds from the same data as the screen. */
  async download(key: ReportKey, params: ReportParams, filename: string) {
    const { data } = await http.get<Blob>(`/reports/${key}/export`, { params, responseType: 'blob', timeout: 60_000 });
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    document.body.append(link);
    link.click();
    link.remove();
    // Some browsers start the download a moment later.
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  },
};
