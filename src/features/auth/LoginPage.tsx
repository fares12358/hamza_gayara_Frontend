import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { InstallCard } from '../../components/pwa/InstallCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username, password);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh bg-surface lg:grid-cols-2">
      <section className="slab flex flex-col justify-end gap-3 rounded-none border-0 p-6 pt-[calc(2.5rem+env(safe-area-inset-top))] lg:justify-center lg:p-16">
        <img src="/icon.svg" alt="" className="size-14 rounded-2xl border border-on-slab/20 lg:size-20" />
        <h1 className="text-5xl lg:text-7xl">الجيارة</h1>
        <p className="max-w-sm opacity-80 lg:text-lg">دفتر الحسابات: مديونيات العملاء، الخزنة، الشيكات وقائمة الدخل.</p>
      </section>
      <div className="flex flex-col items-center justify-start gap-6 p-6 lg:justify-center">
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full max-w-sm flex-col gap-4"
        >
          <h2 className="text-2xl">تسجيل الدخول</h2>
          <Input label="اسم المستخدم" value={username} onValue={setUsername} autoComplete="username" autoCapitalize="none" required dir="ltr" />
          <Input label="كلمة السر" type={show ? 'text' : 'password'} value={password} onValue={setPassword} autoComplete="current-password" required dir="ltr" />
          <label className="flex min-h-11 items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="size-5 accent-accent" />
            إظهار كلمة السر
          </label>
          {error && (
            <p role="alert" className="rounded-xl border border-danger px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" loading={busy} className="min-h-12 text-lg">
            دخول
          </Button>
        </motion.form>
        <InstallCard className="w-full max-w-sm" />
      </div>
    </main>
  );
}
