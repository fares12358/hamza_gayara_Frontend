import { useState, type FormEvent } from 'react';
import { entriesApi } from '../../api/entries';
import { BalancePreview } from '../../components/ui/BalancePreview';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog, Dialog } from '../../components/ui/Dialog';
import { DateField, Input, MoneyInput } from '../../components/ui/Field';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { useToast } from '../../context/ToastContext';
import { useSafeSubmit } from '../../hooks/useSafeSubmit';
import { todayIso } from '../../lib/dates';
import { parseMoney } from '../../lib/money';
import type { Statement } from '../../types';

type Direction = 'add' | 'reduce';

/** Corrects a debt with a new record and a reason. Old records are never edited. */
export function AdjustBalanceDialog({ customer, onClose, onSaved }: {
  customer: Statement['customer'];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [direction, setDirection] = useState<Direction>('reduce');
  const [amountText, setAmountText] = useState('');
  const [date, setDate] = useState(todayIso);
  const [note, setNote] = useState('');
  const { saving, submit, confirm } = useSafeSubmit();
  const amount = parseMoney(amountText);
  const after = customer.balance + (direction === 'add' ? 1 : -1) * (amount ?? 0);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!amount) return toast('اكتب المبلغ', 'error');
    if (note.trim().length < 3) return toast('اكتب سبب التسوية', 'error');
    const input = { customerId: customer.id, direction, amount, date, note: note.trim() };
    void submit(
      ['adjustment', input],
      (safe) => entriesApi.createAdjustment({ ...input, ...safe }),
      () => {
        toast('تم حفظ التسوية');
        onSaved();
      },
    );
  }

  return (
    <>
      <Dialog open onClose={onClose} title="تسوية رصيد العميل">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-muted">لتصحيح غلطة في المديونية. التسوية مش بتدخل الخزنة ولا قائمة الدخل.</p>
          <SegmentedControl<Direction>
            label="نوع التسوية"
            value={direction}
            onChange={setDirection}
            options={[{ value: 'reduce', label: 'تقليل المديونية' }, { value: 'add', label: 'زيادة المديونية' }]}
          />
          <MoneyInput label="المبلغ" value={amountText} onValue={setAmountText} />
          <DateField label="التاريخ" value={date} onValue={setDate} />
          <Input label="سبب التسوية (مطلوب)" value={note} onValue={setNote} autoComplete="off" />
          <BalancePreview label="رصيد العميل" before={customer.balance} after={after} />
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>رجوع</Button>
            <Button type="submit" variant="primary" loading={saving}>حفظ التسوية</Button>
          </div>
        </form>
      </Dialog>
      <ConfirmDialog {...confirm} />
    </>
  );
}
