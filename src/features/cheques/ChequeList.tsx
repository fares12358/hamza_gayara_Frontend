import { useState } from 'react';
import { chequesApi } from '../../api/cheques';
import { Button } from '../../components/ui/Button';
import { CancelEntryButton } from '../../components/ui/CancelEntryButton';
import { ChequePhotoButton } from '../../components/ui/ChequePhotoButton';
import { DataTable, LedgerLine } from '../../components/ui/DataTable';
import { Money } from '../../components/ui/Money';
import { AsyncView } from '../../components/ui/States';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../lib/dates';
import type { Entry } from '../../types';

/** Apart from the form, so typing a cheque does not redraw this long list. */
export function ChequeList() {
  const { isOwner } = useAuth();
  const [limit, setLimit] = useState(50);
  const cheques = useApi(() => chequesApi.list(limit), `cheques:${limit}`, { keepPrevious: true });

  const actions = (c: Entry) =>
    c.cheque?.imageId || isOwner ? (
      <span className="inline-flex gap-1">
        {c.cheque?.imageId && <ChequePhotoButton imageId={c.cheque.imageId} />}
        {isOwner && <CancelEntryButton id={c.id} />}
      </span>
    ) : null;

  return (
    <>
      <h2 className="mt-2 text-lg">آخر الشيكات</h2>
      <AsyncView state={cheques}>
        {({ cheques: list, total }) => (
          <>
          <DataTable
            caption="آخر الشيكات"
            pageSize={2000}
            rows={list}
            rowKey={(c) => c.id}
            empty="لسه مفيش شيكات اتسجلت"
            mobileRow={(c) => (
              <LedgerLine
                title={c.customerName}
                meta={[formatDate(c.date), c.cheque?.number && `شيك ${c.cheque.number}`, c.cheque?.bank, c.cheque?.dueDate && `استحقاق ${formatDate(c.cheque.dueDate)}`].filter(Boolean).join(' · ')}
                amount={<Money value={c.amount} />}
                actions={actions(c)}
              />
            )}
            columns={[
              { header: 'العميل', cell: (c) => <span className="font-semibold">{c.customerName}</span> },
              { header: 'التحصيل', cell: (c) => formatDate(c.date) },
              { header: 'رقم الشيك', cell: (c) => c.cheque?.number ?? '' },
              { header: 'البنك', cell: (c) => c.cheque?.bank ?? '' },
              { header: 'الاستحقاق', cell: (c) => (c.cheque?.dueDate ? formatDate(c.cheque.dueDate) : '') },
              { header: 'القيمة', numeric: true, cell: (c) => <Money value={c.amount} className="font-bold" /> },
              { header: '', numeric: true, cell: actions },
            ]}
          />
          {list.length < total && limit < 2000 && (
            <Button onClick={() => setLimit((n) => Math.min(2000, n + 50))}>
              عرض شيكات أقدم (<span className="num">{list.length}</span> من <span className="num">{total}</span>)
            </Button>
          )}
          </>
        )}
      </AsyncView>
    </>
  );
}
