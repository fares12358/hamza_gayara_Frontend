import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../api/users';
import { Button } from '../../components/ui/Button';
import { DataTable, LedgerLine } from '../../components/ui/DataTable';
import { Dialog } from '../../components/ui/Dialog';
import { Input, Select } from '../../components/ui/Field';
import { Card, FormGrid, PageHeader } from '../../components/ui/Layouts';
import { AsyncView } from '../../components/ui/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import type { Role, User } from '../../types';

const ROLE_LABEL: Record<Role, string> = { owner: 'مالك (كل الصلاحيات)', staff: 'موظف (عملاء وشيكات)' };
const EMPTY = { name: '', username: '', password: '', role: 'staff' as Role };

export function UsersPage() {
  const toast = useToast();
  const { user: me } = useAuth();
  const state = useApi(usersApi.list, 'users');
  const [form, setForm] = useState(EMPTY);
  const [resetting, setResetting] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      toast(success);
      state.reload();
      return true;
    } catch (e) {
      toast((e as Error).message, 'error');
      return false;
    }
  }

  async function add(event: FormEvent) {
    event.preventDefault();
    if (await run(() => usersApi.create(form), 'تم إضافة المستخدم')) setForm(EMPTY);
  }

  async function reset(event: FormEvent) {
    event.preventDefault();
    if (resetting && (await run(() => usersApi.update(resetting.id, { password: newPassword }), 'تم تغيير كلمة السر'))) {
      setResetting(null);
      setNewPassword('');
    }
  }

  const actions = (u: User) => (
    <span className="inline-flex flex-wrap justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => setResetting(u)}>كلمة السر</Button>
      {u.id !== me?.id && (
        <Button variant={u.active ? 'danger' : 'ghost'} size="sm" onClick={() => run(() => usersApi.update(u.id, { active: !u.active }), 'تم التعديل')}>
          {u.active ? 'إيقاف' : 'تشغيل'}
        </Button>
      )}
    </span>
  );

  return (
    <>
      <PageHeader
        title="المستخدمين"
        actions={<Link to="/audit" className="inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-4 font-semibold hover:bg-raised">سجل العمليات</Link>}
      />
      <Card title="مستخدم جديد">
        <form onSubmit={add} className="flex flex-col gap-4">
          <FormGrid>
            <Input label="الاسم" value={form.name} onValue={(name) => setForm({ ...form, name })} />
            <Input label="اسم المستخدم (إنجليزي)" dir="ltr" autoCapitalize="none" autoComplete="off" value={form.username} onValue={(username) => setForm({ ...form, username })} />
            <Input label="كلمة السر (8 على الأقل)" type="password" dir="ltr" autoComplete="new-password" value={form.password} onValue={(password) => setForm({ ...form, password })} />
            <Select label="الصلاحية" value={form.role} onValue={(role) => setForm({ ...form, role: role as Role })} options={Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }))} />
          </FormGrid>
          <Button type="submit" variant="primary" className="sm:self-start">إضافة المستخدم</Button>
        </form>
      </Card>
      <AsyncView state={state}>
        {(users) => (
          <DataTable
            caption="المستخدمين"
            rows={users}
            rowKey={(u) => u.id}
            empty="مفيش مستخدمين"
            mobileRow={(u) => (
              <LedgerLine title={u.name} meta={`${u.username} · ${ROLE_LABEL[u.role]}`} amount={u.active ? 'شغال' : <span className="text-danger">موقوف</span>} actions={actions(u)} />
            )}
            columns={[
              { header: 'الاسم', cell: (u) => <span className="font-semibold">{u.name}</span> },
              { header: 'اسم المستخدم', cell: (u) => <span className="num">{u.username}</span> },
              { header: 'الصلاحية', cell: (u) => ROLE_LABEL[u.role] },
              { header: 'الحالة', cell: (u) => (u.active ? 'شغال' : <span className="text-danger">موقوف</span>) },
              { header: '', numeric: true, cell: actions },
            ]}
          />
        )}
      </AsyncView>
      <Dialog open={resetting !== null} onClose={() => setResetting(null)} title={`كلمة سر جديدة: ${resetting?.name ?? ''}`}>
        <form onSubmit={reset} className="flex flex-col gap-4">
          <Input label="كلمة السر الجديدة" type="password" dir="ltr" autoComplete="new-password" minLength={8} required value={newPassword} onValue={setNewPassword} />
          <Button type="submit" variant="primary">حفظ كلمة السر</Button>
        </form>
      </Dialog>
    </>
  );
}
