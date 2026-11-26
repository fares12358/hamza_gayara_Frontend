import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../api/users';
import { Button } from '../../components/ui/Button';
import { DataTable, LedgerLine } from '../../components/ui/DataTable';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Field';
import { Card, FormGrid, PageHeader } from '../../components/ui/Layouts';
import { Select } from '../../components/ui/Select';
import { AsyncView } from '../../components/ui/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { useFields } from '../../hooks/useFields';
import type { Role, User } from '../../types';

const ROLE_LABEL: Record<Role, string> = { owner: 'مالك (كل الصلاحيات)', staff: 'موظف (عملاء وشيكات)' };
const ROLE_OPTIONS = Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }));
const EMPTY = { name: '', username: '', password: '', role: 'staff' };

/** A save that tells the user the result. The list reloads by itself after it. */
function useRun() {
  const toast = useToast();
  return async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast(success);
      return true;
    } catch (e) {
      toast((e as Error).message, 'error');
      return false;
    }
  };
}

function NewUserForm() {
  const run = useRun();
  const form = useFields(EMPTY);

  async function add(event: FormEvent) {
    event.preventDefault();
    const body = { ...form.values, role: form.values.role as Role };
    if (await run(() => usersApi.create(body), 'تم إضافة المستخدم')) form.reset();
  }

  return (
    <Card title="مستخدم جديد">
      <form onSubmit={add} className="flex flex-col gap-4">
        <FormGrid>
          <Input label="الاسم" value={form.values.name} onValue={form.set.name} />
          <Input label="اسم المستخدم (إنجليزي)" dir="ltr" autoCapitalize="none" autoComplete="off" value={form.values.username} onValue={form.set.username} />
          <Input label="كلمة السر (8 على الأقل)" type="password" dir="ltr" autoComplete="new-password" value={form.values.password} onValue={form.set.password} />
          <Select label="الصلاحية" value={form.values.role} onValue={form.set.role} options={ROLE_OPTIONS} />
        </FormGrid>
        <Button type="submit" variant="primary" className="sm:self-start">إضافة المستخدم</Button>
      </form>
    </Card>
  );
}

/** Mounted only while open, so the box starts empty each time. */
function ResetPasswordDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const run = useRun();
  const [password, setPassword] = useState('');

  async function reset(event: FormEvent) {
    event.preventDefault();
    if (await run(() => usersApi.update(user.id, { password }), 'تم تغيير كلمة السر')) onClose();
  }

  return (
    <Dialog open onClose={onClose} title={`كلمة سر جديدة: ${user.name}`}>
      <form onSubmit={reset} className="flex flex-col gap-4">
        <Input label="كلمة السر الجديدة" type="password" dir="ltr" autoComplete="new-password" minLength={8} required value={password} onValue={setPassword} />
        <Button type="submit" variant="primary">حفظ كلمة السر</Button>
      </form>
    </Dialog>
  );
}

export function UsersPage() {
  const { user: me } = useAuth();
  const state = useApi(usersApi.list, 'users');
  const [resetting, setResetting] = useState<User | null>(null);
  const run = useRun();

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
      <NewUserForm />
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
      {resetting && <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} />}
    </>
  );
}
