import { useState, type FormEvent } from 'react';
import { customersApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import { Input, MoneyInput } from '../../components/ui/Field';
import { Card, FormGrid } from '../../components/ui/Layouts';
import { useToast } from '../../context/ToastContext';
import { parseMoney } from '../../lib/money';

export function NewCustomerForm({ onSaved }: { onSaved: () => void }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [debt, setDebt] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const openingBalance = parseMoney(debt, { allowNegative: true });
    if (!name.trim()) return toast('اكتب اسم العميل', 'error');
    if (openingBalance === null) return toast('راجع رقم المديونية', 'error');
    setSaving(true);
    try {
      await customersApi.create({ name: name.trim(), openingBalance });
      toast('تم إضافة العميل');
      onSaved();
    } catch (e) {
      toast((e as Error).message, 'error');
      setSaving(false);
    }
  }

  return (
    <Card title="عميل جديد">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormGrid>
          <Input label="اسم العميل" value={name} onValue={setName} autoComplete="off" />
          <MoneyInput label="المديونية الحالية (لو في). بالسالب لو ليه فلوس" value={debt} onValue={setDebt} allowNegative />
        </FormGrid>
        <Button type="submit" variant="primary" loading={saving} className="self-start">
          حفظ العميل
        </Button>
      </form>
    </Card>
  );
}
