import { useState } from 'react';
import { auditApi } from '../../api/audit';
import { Button } from '../../components/ui/Button';
import { DataTable, LedgerLine } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/Layouts';
import { Money } from '../../components/ui/Money';
import { ENTRY_LABELS } from '../../components/ui/RecentEntries';
import { AsyncView } from '../../components/ui/States';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../lib/dates';
import type { AuditRecord, EntryType } from '../../types';

const ACTIONS: Record<string, string> = { create: 'إضافة', update: 'تعديل', void: 'إلغاء', import: 'استيراد', password: 'تغيير كلمة سر' };
const ENTITIES: Record<string, string> = { entry: 'حركة', customer: 'عميل', user: 'مستخدم', sheets: 'بيانات الشيتات' };

const when = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Cairo' }).format(new Date(iso));

const what = (r: AuditRecord) =>
  `${ACTIONS[r.action] ?? r.action} ${r.entity === 'entry' ? ENTRY_LABELS[r.data.type as EntryType] ?? 'حركة' : ENTITIES[r.entity] ?? r.entity}`;

const details = (r: AuditRecord) =>
  [
    r.data.customerName || r.data.name || r.data.username,
    r.data.date && formatDate(r.data.date),
    r.data.category,
    r.data.note,
    r.data.reason && `السبب: ${r.data.reason}`,
    r.data.passwordChanged && 'تغيير كلمة السر',
  ]
    .filter(Boolean)
    .join(' · ');

const amount = (r: AuditRecord) => (typeof r.data.amount === 'number' ? <Money value={r.data.amount} /> : '');

/** Who did what, and when. Read only. */
export function AuditPage() {
  const [limit, setLimit] = useState(100);
  const state = useApi(() => auditApi.list(limit), `audit:${limit}`, { keepPrevious: true });

  return (
    <>
      <PageHeader title="سجل العمليات" description="مين عمل إيه وإمتى. السجل مش بيتعدل ولا بيتمسح من التطبيق." />
      <AsyncView state={state}>
        {({ records, total }) => (
          <>
            <DataTable
              caption="سجل العمليات"
              rows={records}
              rowKey={(r) => r.id}
              pageSize={2000}
              empty="مفيش عمليات متسجلة"
              mobileRow={(r) => (
                <LedgerLine title={what(r)} meta={[when(r.at), r.userName, details(r)].filter(Boolean).join(' · ')} amount={amount(r)} />
              )}
              columns={[
                { header: 'الوقت', cell: (r) => <span className="num">{when(r.at)}</span> },
                { header: 'المستخدم', cell: (r) => r.userName },
                { header: 'العملية', cell: (r) => <span className="font-semibold">{what(r)}</span> },
                { header: 'التفاصيل', cell: details },
                { header: 'المبلغ', numeric: true, cell: amount },
              ]}
            />
            {records.length < total && limit < 1000 && <Button onClick={() => setLimit((n) => Math.min(1000, n + 100))}>عرض عمليات أقدم</Button>}
          </>
        )}
      </AsyncView>
    </>
  );
}
