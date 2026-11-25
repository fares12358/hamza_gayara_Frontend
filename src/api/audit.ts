import { http } from './client';
import type { AuditRecord } from '../types';

export const auditApi = {
  list: (limit: number) =>
    http.get<{ records: AuditRecord[]; total: number }>('/audit', { params: { limit } }).then((r) => r.data),
};
