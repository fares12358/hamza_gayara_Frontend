import { useRef, useState, type FormEvent } from 'react';
import { chequesApi } from '../../api/cheques';
import { BalancePreview } from '../../components/ui/BalancePreview';
import { CancelEntryButton } from '../../components/ui/CancelEntryButton';
import { ChequePhotoButton } from '../../components/ui/ChequePhotoButton';
import { CustomerPicker } from '../../components/ui/CustomerPicker';
import { DataTable, LedgerLine } from '../../components/ui/DataTable';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { EntryForm } from '../../components/ui/EntryForm';
import { DateField, Input, MoneyInput } from '../../components/ui/Field';
import { FormGrid, PageHeader } from '../../components/ui/Layouts';
import { Money } from '../../components/ui/Money';
import { AsyncView } from '../../components/ui/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { useSafeSubmit } from '../../hooks/useSafeSubmit';
import { formatDate, formatLongDate, todayIso } from '../../lib/dates';
import { shrinkPhoto } from '../../lib/image';
import { parseMoney } from '../../lib/money';
import type { Entry } from '../../types';

const EMPTY = { amount: '', number: '', bank: '', dueDate: '', note: '' };

export function ChequesPage() {
  const { isOwner } = useAuth();
  const toast = useToast();
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(todayIso);
  const [form, setForm] = useState(EMPTY);
  const [photoName, setPhotoName] = useState('');
  const photo = useRef<HTMLInputElement>(null);
  const { saving, submit, backdated } = useSafeSubmit();

  const customers = useApi(chequesApi.customerOptions, 'cheque-customers');
  const cheques = useApi(chequesApi.list, 'cheques');
  const reload = () => {
    customers.reload();
    cheques.reload();
  };
  const set = (key: keyof typeof EMPTY) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const options = customers.data ?? [];
  const customer = options.find((c) => c.id === customerId);
  const amount = parseMoney(form.amount);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!customer) return toast('اختار العميل من القائمة', 'error');
    if (!date) return toast('اكتب التاريخ', 'error');
    if (!amount) return toast('اكتب قيمة الشيك', 'error');

    let image = '';
    const file = photo.current?.files?.[0];
    if (file) {
      try {
        image = await shrinkPhoto(file);
      } catch {
        return toast('مقدرتش أقرا الصورة، جرب صورة تانية', 'error');
      }
    }
    void submit(
      (safe) => chequesApi.create({ ...form, amount, customerId, date, image, ...safe }),
      () => {
        setForm(EMPTY);
        setPhotoName('');
        if (photo.current) photo.current.value = '';
        toast('تم تسجيل الشيك وظهر في كشف الحساب');
        reload();
      },
    );
  }

  const actions = (c: Entry) =>
    c.cheque?.imageId || isOwner ? (
      <span className="inline-flex gap-1">
        {c.cheque?.imageId && <ChequePhotoButton imageId={c.cheque.imageId} />}
        {isOwner && <CancelEntryButton id={c.id} onDone={reload} />}
      </span>
    ) : null;

  return (
    <>
      <PageHeader title="الشيكات المحصّلة" description="سجّل الشيك وارفع صورته، وبينزل في كشف حساب العميل على طول." />
      <AsyncView state={customers}>
        {() => (
          <EntryForm
            onSubmit={onSubmit}
            saving={saving}
            submitLabel="حفظ الشيك"
            preview={
              <>
                {customer ? (
                  <BalancePreview label={`رصيد ${customer.name}`} before={customer.balance} after={customer.balance - (amount ?? 0)} />
                ) : (
                  <p className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted">اختار العميل عشان تشوف رصيده بعد الشيك.</p>
                )}
                <p className="text-xs text-muted">الشيك بينقّص مديونية العميل، ومش بيدخل الخزنة.</p>
              </>
            }
          >
            <CustomerPicker customers={options} value={customerId} onChange={setCustomerId} />
            <FormGrid>
              <MoneyInput label="قيمة الشيك" value={form.amount} onValue={set('amount')} />
              <Input label="رقم الشيك" inputMode="numeric" value={form.number} onValue={set('number')} autoComplete="off" />
              <Input label="البنك (اختياري)" value={form.bank} onValue={set('bank')} autoComplete="off" />
              <DateField label="تاريخ التحصيل" value={date} onValue={setDate} />
              <Input label="تاريخ الاستحقاق (اختياري)" type="date" value={form.dueDate} onValue={set('dueDate')} hint={form.dueDate ? formatLongDate(form.dueDate) : undefined} />
              <Input label="ملاحظة (اختياري)" value={form.note} onValue={set('note')} autoComplete="off" />
            </FormGrid>
            <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-bg px-4 py-3 text-center text-sm font-semibold focus-within:outline-2 focus-within:outline-accent hover:bg-raised">
              <span className="min-w-0 break-all">{photoName || 'صوّر الشيك أو اختار صورته (اختياري)'}</span>
              <input ref={photo} type="file" accept="image/*" aria-label="صورة الشيك" className="sr-only" onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? '')} />
            </label>
          </EntryForm>
        )}
      </AsyncView>
      <h2 className="mt-2 text-lg">آخر الشيكات</h2>
      <AsyncView state={cheques}>
        {(list) => (
          <DataTable
            caption="آخر الشيكات"
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
        )}
      </AsyncView>
      <ConfirmDialog title="تاريخ قديم" confirmLabel="أيوه، سجّله" {...backdated} />
    </>
  );
}
