import { useState, type FormEvent } from 'react';
import { customersApi } from '../../api/customers';
import { entriesApi } from '../../api/entries';
import { BalancePreview } from '../../components/ui/BalancePreview';
import { CustomerPicker } from '../../components/ui/CustomerPicker';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { EntryForm } from '../../components/ui/EntryForm';
import { DateField, Input, MoneyInput } from '../../components/ui/Field';
import { FormGrid, PageHeader } from '../../components/ui/Layouts';
import { Money } from '../../components/ui/Money';
import { RecentEntries } from '../../components/ui/RecentEntries';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { AsyncView } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { useFields } from '../../hooks/useFields';
import { useSafeSubmit } from '../../hooks/useSafeSubmit';
import { todayIso } from '../../lib/dates';
import { parseMoney } from '../../lib/money';
import type { CustomerSummary } from '../../types';

type Mode = 'credit' | 'cash';
const EMPTY = { amount: '', returned: '', paid: '', permitNo: '', note: '' };
const NO_CUSTOMERS: CustomerSummary[] = [];
const MODES: { value: Mode; label: string }[] = [{ value: 'credit', label: 'آجل لعميل' }, { value: 'cash', label: 'بيع نقدي' }];

function InvoiceForm() {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('credit');
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(todayIso);
  const fields = useFields(EMPTY);
  const form = fields.values;
  const { saving, submit, confirm } = useSafeSubmit();

  const customers = useApi(customersApi.list, 'customers');

  const options = customers.data?.customers ?? NO_CUSTOMERS;
  const customer = options.find((c) => c.id === customerId);
  const amount = parseMoney(form.amount);
  const returned = parseMoney(form.returned);
  const paid = parseMoney(form.paid);
  const net = (amount ?? 0) - (returned ?? 0);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date) return toast('اكتب التاريخ', 'error');
    if (mode === 'credit' && !customer) return toast('اختار العميل من القائمة', 'error');
    if (!amount) return toast('اكتب إجمالي الفاتورة', 'error');
    if (mode === 'credit') {
      if (returned === null || paid === null) return toast('راجع الأرقام المكتوبة', 'error');
      if (returned > amount) return toast('المرتجع أكبر من الفاتورة', 'error');
    }
    void submit(
      [mode, mode === 'cash' ? '' : customerId, date, amount, returned, paid, form.permitNo, form.note],
      (safe) =>
        mode === 'cash'
          ? entriesApi.createCash({ type: 'cash_sale', date, amount, note: form.note, ...safe })
          : entriesApi.createInvoice({
              customerId, date, amount, returnAmount: returned!, paidAmount: paid!,
              permitNo: form.permitNo, note: form.note, ...safe,
            }),
      () => {
        fields.reset();
        toast('تم حفظ الفاتورة');
      },
    );
  }

  const preview =
    mode === 'cash' ? (
      <p className="rounded-xl bg-raised px-4 py-3 text-sm text-muted">
        هيدخل الخزنة
        <Money value={amount ?? 0} currency className="mt-1 block font-display text-2xl font-bold text-ink" />
      </p>
    ) : (
      <>
        <p className="flex justify-between gap-3 text-sm text-muted">
          صافي الفاتورة <Money value={net} className="font-bold text-ink" />
        </p>
        {customer ? (
          <BalancePreview label={`رصيد ${customer.name}`} before={customer.balance} after={customer.balance + net - (paid ?? 0)} />
        ) : (
          <p className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted">اختار العميل عشان تشوف رصيده بعد الفاتورة.</p>
        )}
        {(paid ?? 0) > 0 && (
          <p className="flex justify-between gap-3 text-sm text-muted">
            دفعة هتدخل الخزنة <Money value={paid!} className="font-bold text-ink" />
          </p>
        )}
      </>
    );

  return (
    <>
      <SegmentedControl<Mode> label="نوع الفاتورة" value={mode} onChange={setMode} options={MODES} />
      <AsyncView state={customers}>
        {() => (
          <EntryForm onSubmit={onSubmit} saving={saving} preview={preview} submitLabel={mode === 'credit' ? 'حفظ الفاتورة' : 'حفظ البيع النقدي'}>
            {mode === 'credit' && <CustomerPicker customers={options} value={customerId} onChange={setCustomerId} />}
            <FormGrid>
              <MoneyInput label="إجمالي الفاتورة" value={form.amount} onValue={fields.set.amount} />
              {mode === 'credit' && <MoneyInput label="مرتجع / فرق وزن" value={form.returned} onValue={fields.set.returned} />}
              {mode === 'credit' && <MoneyInput label="دفعة مع الفاتورة" value={form.paid} onValue={fields.set.paid} />}
            </FormGrid>
            <FormGrid>
              <DateField label="التاريخ" value={date} onValue={setDate} />
              {mode === 'credit' && <Input label="رقم الإذن" inputMode="numeric" value={form.permitNo} onValue={fields.set.permitNo} autoComplete="off" />}
              <Input label="ملاحظة (اختياري)" value={form.note} onValue={fields.set.note} autoComplete="off" />
            </FormGrid>
          </EntryForm>
        )}
      </AsyncView>
      <ConfirmDialog {...confirm} />
    </>
  );
}

function RecentInvoices() {
  const recent = useApi(() => entriesApi.recent(['invoice', 'cash_sale']), 'recent-invoices');
  return (
    <AsyncView state={recent}>
      {(entries) => <RecentEntries title="آخر الفواتير اللي اتسجلت من التطبيق" entries={entries} />}
    </AsyncView>
  );
}

export function InvoicePage() {
  return (
    <>
      <PageHeader title="فاتورة جديدة" description="الفاتورة الآجلة بتزود مديونية العميل، والبيع النقدي بيدخل الخزنة على طول." />
      <InvoiceForm />
      <RecentInvoices />
    </>
  );
}
