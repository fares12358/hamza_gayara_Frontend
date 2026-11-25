import { useState, type FormEvent } from 'react';
import { customersApi } from '../../api/customers';
import { entriesApi, type CashInput } from '../../api/entries';
import { BalancePreview } from '../../components/ui/BalancePreview';
import { CustomerPicker } from '../../components/ui/CustomerPicker';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { EntryForm } from '../../components/ui/EntryForm';
import { DateField, Input, MoneyInput, Select } from '../../components/ui/Field';
import { FormGrid } from '../../components/ui/Layouts';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { useSafeSubmit } from '../../hooks/useSafeSubmit';
import { todayIso } from '../../lib/dates';
import { parseMoney } from '../../lib/money';

type Mode = CashInput['type'];

const SAVE_LABEL: Record<Mode, string> = {
  payment: 'حفظ التحصيل',
  cash_sale: 'حفظ المبيعات',
  expense: 'حفظ المصروف',
  transfer: 'حفظ التحويل',
};

export function CashForm({ cashBalance, onSaved }: { cashBalance: number; onSaved: () => void }) {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('payment');
  const [customerId, setCustomerId] = useState('');
  const [category, setCategory] = useState('مصروفات أخرى');
  const [date, setDate] = useState(todayIso);
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const { saving, submit, confirm } = useSafeSubmit();

  const customers = useApi(customersApi.list, 'customers');
  const categories = useApi(entriesApi.categories, 'categories');
  const options = customers.data?.customers ?? [];
  const customer = options.find((c) => c.id === customerId);
  const amount = parseMoney(amountText);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date) return toast('اكتب التاريخ', 'error');
    if (mode === 'payment' && !customer) return toast('اختار العميل من القائمة', 'error');
    if (!amount) return toast('اكتب المبلغ', 'error');

    const base = { date, amount, note };
    const input: CashInput =
      mode === 'payment' ? { ...base, type: mode, customerId }
      : mode === 'expense' ? { ...base, type: mode, category }
      : { ...base, type: mode };

    void submit(
      input,
      (safe) => entriesApi.createCash({ ...input, ...safe }),
      () => {
        setAmountText('');
        setNote('');
        toast('تم الحفظ');
        customers.reload();
        onSaved();
      },
    );
  }

  const moneyIn = mode === 'payment' || mode === 'cash_sale';
  const failed = customers.error ?? categories.error;

  return (
    <>
      <SegmentedControl<Mode>
        label="نوع الحركة"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'payment', label: 'تحصيل من عميل' },
          { value: 'cash_sale', label: 'مبيعات نقدية' },
          { value: 'expense', label: 'مصروف' },
          { value: 'transfer', label: 'تحويل لفرع العبور' },
        ]}
      />
      <EntryForm
        onSubmit={onSubmit}
        saving={saving}
        submitLabel={SAVE_LABEL[mode]}
        preview={
          <>
            <BalancePreview label="رصيد الخزنة" before={cashBalance} after={cashBalance + (moneyIn ? 1 : -1) * (amount ?? 0)} />
            {mode === 'payment' && customer && <BalancePreview label={`رصيد ${customer.name}`} before={customer.balance} after={customer.balance - (amount ?? 0)} />}
          </>
        }
      >
        {failed && <p role="alert" className="text-danger">{failed}</p>}
        {mode === 'payment' && <CustomerPicker customers={options} value={customerId} onChange={setCustomerId} />}
        <FormGrid>
          <MoneyInput label="المبلغ" value={amountText} onValue={setAmountText} />
          {mode === 'expense' && (
            <Select label="نوع المصروف" value={category} onValue={setCategory} options={(categories.data ?? []).map((c) => ({ value: c, label: c }))} />
          )}
          <DateField label="التاريخ" value={date} onValue={setDate} />
        </FormGrid>
        <Input label={mode === 'expense' ? 'البيان (مثال: فاتورة كهرباء)' : 'ملاحظة (اختياري)'} value={note} onValue={setNote} autoComplete="off" />
      </EntryForm>
      <ConfirmDialog {...confirm} />
    </>
  );
}
