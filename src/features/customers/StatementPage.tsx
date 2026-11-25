import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { customersApi } from '../../api/customers';
import { Icon } from '../../components/layout/Icon';
import { BalanceSlab } from '../../components/ui/BalanceSlab';
import { Button } from '../../components/ui/Button';
import { CancelEntryButton } from '../../components/ui/CancelEntryButton';
import { ChequePhotoButton } from '../../components/ui/ChequePhotoButton';
import { DataTable, LedgerLine } from '../../components/ui/DataTable';
import { Dialog } from '../../components/ui/Dialog';
import { PageHeader } from '../../components/ui/Layouts';
import { Money } from '../../components/ui/Money';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { AsyncView } from '../../components/ui/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { formatDate, monthName } from '../../lib/dates';
import { SETTLED } from '../../lib/money';
import type { StatementRow } from '../../types';
import { statementText } from './statementText';
import { AdjustBalanceDialog } from './AdjustBalanceDialog';
import { EditCustomerDialog } from './EditCustomerDialog';

const amount = (value: number) => (value ? <Money value={value} /> : '');

const permit = (r: StatementRow) => {
  if (r.type === 'debt_add' || r.type === 'debt_reduce') return `تسوية: ${r.note ?? ''}`;
  return r.permitNo ? `${r.type === 'cheque' ? 'شيك' : 'إذن'} ${r.permitNo}` : '';
};

/** What a line is, for the phone view. Sheet rows have no type of their own. */
function movement(r: StatementRow) {
  if (r.type === 'debt_add') return { label: 'تسوية', value: r.invoiceAmount, sign: '+' as const };
  if (r.type === 'debt_reduce') return { label: 'تسوية', value: r.paymentAmount, sign: '−' as const };
  if (r.invoiceAmount) return { label: 'فاتورة', value: r.invoiceAmount, sign: '+' as const };
  if (r.paymentAmount) return { label: r.type === 'cheque' ? 'شيك' : 'دفعة', value: r.paymentAmount, sign: '−' as const };
  if (r.returnAmount) return { label: 'مرتجع', value: r.returnAmount, sign: '−' as const };
  return { label: 'حركة', value: 0, sign: '' as const };
}

export function StatementPage() {
  const { id = '' } = useParams();
  const { isOwner } = useAuth();
  const toast = useToast();
  const [range, setRange] = useState('90');
  const [copyFallback, setCopyFallback] = useState('');
  const [dialog, setDialog] = useState<'edit' | 'adjust' | null>(null);
  const navigate = useNavigate();
  const state = useApi(() => customersApi.statement(id, Number(range)), `${id}:${range}`);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast('تم نسخ الكشف');
    } catch {
      setCopyFallback(text);
    }
  }

  async function restore() {
    try {
      await customersApi.update(id, { archived: false });
      toast('رجع العميل من الأرشيف');
      state.reload();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  }

  const actions = (r: StatementRow) => {
    const canCancel = isOwner && r.source === 'app' && !state.data?.customer.archived;
    if (!r.imageId && !canCancel) return null;
    return (
      <span className="inline-flex gap-1">
        {r.imageId && <ChequePhotoButton imageId={r.imageId} />}
        {canCancel && <CancelEntryButton id={r.id} isInvoice={r.type === 'invoice'} onDone={state.reload} />}
      </span>
    );
  };

  return (
    <>
      <Link to="/" className="-mb-3 inline-flex min-h-11 items-center gap-1 self-start font-semibold text-accent">
        <Icon name="right" className="size-4" />
        كل العملاء
      </Link>
      <AsyncView state={state}>
        {(data) => {
          const { customer, totals } = data;
          const late = customer.overdue ?? 0;
          const newestFirst = [...data.rows].reverse();
          return (
            <>
              <PageHeader
                title={customer.name}
                description={`آخر حركة ${formatDate(customer.lastActivity)}`}
                actions={
                  <>
                    <Button onClick={() => copy(statementText(data))}>
                      <Icon name="copy" className="size-4" />
                      نسخ الكشف للواتساب
                    </Button>
                    {isOwner && !customer.archived && (
                      <>
                        <Button onClick={() => setDialog('adjust')}>تسوية رصيد</Button>
                        <Button onClick={() => setDialog('edit')}>تعديل العميل</Button>
                      </>
                    )}
                  </>
                }
              />
              {customer.archived && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-raised px-4 py-3">
                  <p>العميل ده في الأرشيف.</p>
                  {isOwner && <Button onClick={restore}>رجّعه من الأرشيف</Button>}
                </div>
              )}
              {dialog === 'edit' && (
                <EditCustomerDialog
                  customer={customer}
                  onClose={() => setDialog(null)}
                  onSaved={() => {
                    setDialog(null);
                    state.reload();
                  }}
                  onArchived={() => navigate('/')}
                />
              )}
              {dialog === 'adjust' && (
                <AdjustBalanceDialog
                  customer={customer}
                  onClose={() => setDialog(null)}
                  onSaved={() => {
                    setDialog(null);
                    state.reload();
                  }}
                />
              )}
              <BalanceSlab
                label={Math.abs(customer.balance) < SETTLED ? 'الحساب خالص' : customer.balance > 0 ? 'الرصيد الحالي (عليه)' : 'الرصيد الحالي (له)'}
                amount={Math.abs(customer.balance)}
                hint={
                  customer.overdue === null
                    ? 'التأخير غير معروف: مفيش حركات للعميل في الشيت.'
                    : late > SETTLED && <>منه متأخر أكتر من {data.overdueDays} أيام: <Money value={late} className="font-bold" /></>
                }
                stats={[
                  { label: 'فواتير الفترة', value: <Money value={totals.invoices} /> },
                  { label: 'مرتجعات', value: <Money value={totals.returns} /> },
                  { label: 'مدفوعات وشيكات', value: <Money value={totals.payments} /> },
                ]}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg">كشف الحساب <span className="text-sm font-normal text-muted">(الأحدث فوق)</span></h2>
                <SegmentedControl
                  label="الفترة"
                  value={range}
                  onChange={setRange}
                  options={[
                    { value: '30', label: '30 يوم' },
                    { value: '90', label: '3 شهور' },
                    { value: '180', label: '6 شهور' },
                    { value: '0', label: 'الكل' },
                  ]}
                />
              </div>
              <DataTable
                key={range}
                caption="كشف حساب العميل"
                rows={newestFirst}
                rowKey={(r) => r.id}
                highlight={(r) => r.source === 'app'}
                groupBy={(r) => `${monthName(r.date)} ${r.date.slice(0, 4)}`}
                empty="مفيش حركات في الفترة دي. جرب فترة أطول."
                mobileRow={(r) => {
                  const m = movement(r);
                  return (
                    <LedgerLine
                      title={<>{m.label} {m.value > 0 && <Money value={m.value} sign={m.sign} />}</>}
                      meta={[formatDate(r.date), r.outOfOrder ? 'اتسجلت بتاريخ قديم' : '', permit(r), r.invoiceAmount && r.returnAmount ? 'فيها مرتجع' : '', r.type === 'debt_add' || r.type === 'debt_reduce' ? '' : r.note].filter(Boolean).join(' · ')}
                      amount={<Money value={r.balance} />}
                      below="الرصيد"
                      actions={actions(r)}
                    />
                  );
                }}
                columns={[
                  {
                    header: 'التاريخ',
                    cell: (r) => (
                      <>
                        {formatDate(r.date)}
                        {r.outOfOrder && <span className="block text-xs text-muted">اتسجلت بتاريخ قديم</span>}
                      </>
                    ),
                  },
                  { header: 'رقم الإذن', cell: (r) => permit(r) },
                  { header: 'فاتورة', numeric: true, cell: (r) => amount(r.invoiceAmount) },
                  { header: 'مرتجع', numeric: true, cell: (r) => amount(r.returnAmount) },
                  { header: 'دفعة', numeric: true, cell: (r) => amount(r.paymentAmount) },
                  { header: 'الرصيد', numeric: true, cell: (r) => <Money value={r.balance} className="font-bold" /> },
                  { header: '', numeric: true, cell: actions },
                ]}
              />
              {data.previousBalance !== null ? (
                <p className="rounded-xl bg-raised px-4 py-3 text-sm text-muted">
                  رصيد سابق قبل {formatDate(data.from)}: <Money value={data.previousBalance} className="font-bold text-ink" />
                </p>
              ) : (
                customer.source === 'app' && (
                  <p className="rounded-xl bg-raised px-4 py-3 text-sm text-muted">
                    رصيد افتتاحي: <Money value={data.openingBalance} className="font-bold text-ink" />
                  </p>
                )
              )}
            </>
          );
        }}
      </AsyncView>
      <Dialog open={Boolean(copyFallback)} onClose={() => setCopyFallback('')} title="انسخ الكشف">
        <textarea readOnly value={copyFallback} onFocus={(e) => e.target.select()} className="h-64 w-full rounded-xl border border-field bg-bg p-3 text-sm" />
      </Dialog>
    </>
  );
}
