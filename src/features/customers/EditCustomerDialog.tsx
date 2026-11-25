import { useState, type FormEvent } from 'react';
import { customersApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog, Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Field';
import { useToast } from '../../context/ToastContext';
import { SETTLED } from '../../lib/money';
import type { Statement } from '../../types';

/** Rename, other spellings, archive. Mounted only while open, so it starts with current data. */
export function EditCustomerDialog({ customer, onClose, onSaved, onArchived }: {
  customer: Statement['customer'];
  onClose: () => void;
  onSaved: () => void;
  onArchived: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(customer.name);
  const [aliases, setAliases] = useState(customer.aliases.join('، '));
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const settled = Math.abs(customer.balance) < SETTLED;

  async function run(changes: Parameters<typeof customersApi.update>[1], message: string, then: () => void) {
    setSaving(true);
    try {
      await customersApi.update(customer.id, changes);
      toast(message);
      then();
    } catch (e) {
      toast((e as Error).message, 'error');
      setSaving(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return toast('اكتب اسم العميل', 'error');
    const list = aliases.split(/[،,\n]/).map((a) => a.trim()).filter(Boolean);
    void run({ name: name.trim(), aliases: list }, 'تم حفظ بيانات العميل', onSaved);
  }

  return (
    <>
      <Dialog open onClose={onClose} title="تعديل العميل">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input label="اسم العميل" value={name} onValue={setName} autoComplete="off" />
          <Input label="أسماء تانية للبحث (افصل بينها بفاصلة)" value={aliases} onValue={setAliases} autoComplete="off" />
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>رجوع</Button>
            <Button type="submit" variant="primary" loading={saving}>حفظ البيانات</Button>
          </div>
          <div className="border-t border-line pt-3">
            <Button variant="danger" disabled={!settled || saving} onClick={() => setConfirming(true)}>نقل للأرشيف</Button>
            <p className="mt-1 text-xs text-muted">
              {settled ? 'العميل هيختفي من القوايم، وسجله هيفضل محفوظ.' : 'الأرشفة متاحة لما رصيد العميل يبقى خالص.'}
            </p>
          </div>
        </form>
      </Dialog>
      <ConfirmDialog
        open={confirming}
        title="نقل للأرشيف؟"
        message={`${customer.name} هيختفي من القوايم. تقدر ترجّعه من "العملاء المؤرشفين".`}
        confirmLabel="نقل للأرشيف"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          void run({ archived: true }, 'تم نقل العميل للأرشيف', onArchived);
        }}
      />
    </>
  );
}
