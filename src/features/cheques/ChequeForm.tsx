import { useRef, useState, type FormEvent } from 'react';
import { chequesApi } from '../../api/cheques';
import { BalancePreview } from '../../components/ui/BalancePreview';
import { CustomerPicker } from '../../components/ui/CustomerPicker';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { EntryForm } from '../../components/ui/EntryForm';
import { DateField, Input, MoneyInput } from '../../components/ui/Field';
import { FormGrid } from '../../components/ui/Layouts';
import { AsyncView } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { useFields } from '../../hooks/useFields';
import { useSafeSubmit } from '../../hooks/useSafeSubmit';
import { formatLongDate, todayIso } from '../../lib/dates';
import { shrinkPhoto } from '../../lib/image';
import { parseMoney } from '../../lib/money';
import type { CustomerOption } from '../../types';

const EMPTY = { amount: '', number: '', bank: '', dueDate: '', note: '' };
const NO_CUSTOMERS: CustomerOption[] = [];

export function ChequeForm() {
  const toast = useToast();
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(todayIso);
  const fields = useFields(EMPTY);
  const form = fields.values;
  const [photoName, setPhotoName] = useState('');
  const photo = useRef<HTMLInputElement>(null);
  const { saving, submit, confirm } = useSafeSubmit();

  const customers = useApi(chequesApi.customerOptions, 'cheque-customers');
  const options = customers.data ?? NO_CUSTOMERS;
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
      { ...form, amount, customerId, date, image },
      (safe) => chequesApi.create({ ...form, amount, customerId, date, image, ...safe }),
      () => {
        fields.reset();
        setPhotoName('');
        if (photo.current) photo.current.value = '';
        toast('تم تسجيل الشيك وظهر في كشف الحساب');
      },
    );
  }

  return (
    <>
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
              <MoneyInput label="قيمة الشيك" value={form.amount} onValue={fields.set.amount} />
              <Input label="رقم الشيك" inputMode="numeric" value={form.number} onValue={fields.set.number} autoComplete="off" />
              <Input label="البنك (اختياري)" value={form.bank} onValue={fields.set.bank} autoComplete="off" />
              <DateField label="تاريخ التحصيل" value={date} onValue={setDate} />
              <Input label="تاريخ الاستحقاق (اختياري)" type="date" value={form.dueDate} onValue={fields.set.dueDate} hint={form.dueDate ? formatLongDate(form.dueDate) : undefined} />
              <Input label="ملاحظة (اختياري)" value={form.note} onValue={fields.set.note} autoComplete="off" />
            </FormGrid>
            <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-field bg-bg px-4 py-3 text-center text-sm font-semibold focus-within:outline-2 focus-within:outline-accent hover:bg-raised">
              <span className="min-w-0 break-all">{photoName || 'صوّر الشيك أو اختار صورته (اختياري)'}</span>
              <input ref={photo} type="file" accept="image/*" aria-label="رفع صورة الشيك" className="sr-only" onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? '')} />
            </label>
          </EntryForm>
        )}
      </AsyncView>
      <ConfirmDialog {...confirm} />
    </>
  );
}
