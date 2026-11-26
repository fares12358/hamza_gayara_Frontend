import { useState, type FormEvent } from 'react';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Field';
import { useToast } from '../../context/ToastContext';
import { useFields } from '../../hooks/useFields';

const EMPTY = { current: '', next: '', again: '' };

export function ChangePasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const fields = useFields(EMPTY);
  const form = fields.values;
  const [saving, setSaving] = useState(false);
  const close = () => {
    fields.reset();
    onClose();
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (form.next.length < 8) return toast('كلمة السر الجديدة لازم 8 حروف على الأقل', 'error');
    if (form.next !== form.again) return toast('كلمة السر الجديدة مش متطابقة', 'error');
    setSaving(true);
    try {
      await authApi.changePassword(form.current, form.next);
      toast('تم تغيير كلمة السر، والأجهزة التانية اتعملها خروج');
      close();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const field = (key: keyof typeof EMPTY, label: string, autoComplete: string) => (
    <Input label={label} type="password" dir="ltr" required autoComplete={autoComplete} value={form[key]} onValue={fields.set[key]} />
  );

  return (
    <Dialog open={open} onClose={close} title="تغيير كلمة السر">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {field('current', 'كلمة السر الحالية', 'current-password')}
        {field('next', 'كلمة السر الجديدة (8 على الأقل)', 'new-password')}
        {field('again', 'كلمة السر الجديدة تاني', 'new-password')}
        <div className="flex justify-end gap-2">
          <Button onClick={close}>رجوع</Button>
          <Button type="submit" variant="primary" loading={saving}>تغيير كلمة السر</Button>
        </div>
      </form>
    </Dialog>
  );
}
