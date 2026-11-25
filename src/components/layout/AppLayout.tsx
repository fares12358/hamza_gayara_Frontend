import { motion } from 'framer-motion';
import { Suspense, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Loading } from '../ui/States';
import { ChangePasswordDialog } from '../../features/account/ChangePasswordDialog';
import { CashChip } from './CashChip';
import { Icon } from './Icon';
import { AUDIT_NAV, NAV, USERS_NAV } from './nav';
import { StatusBanners } from './StatusBanners';

function Brand() {
  return (
    <span className="flex items-center gap-2">
      <img src="/icon.svg" alt="" className="size-9 rounded-lg" />
      <span className="font-display text-2xl font-bold">الجيارة</span>
    </span>
  );
}

function AccountButtons() {
  const { logout } = useAuth();
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const [changing, setChanging] = useState(false);
  return (
    <>
      <Button variant="ghost" size="icon" aria-label="تغيير كلمة السر" onClick={() => setChanging(true)}>
        <Icon name="key" />
      </Button>
      <ChangePasswordDialog open={changing} onClose={() => setChanging(false)} />
      <Button variant="ghost" size="icon" onClick={toggle} aria-label={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}>
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      </Button>
      <Button variant="ghost" size="icon" aria-label="تسجيل الخروج" onClick={() => logout().catch((e: Error) => toast(e.message, 'error'))}>
        <Icon name="logout" />
      </Button>
    </>
  );
}

/** Side rail on wide screens; top bar and bottom bar on phones and tablets. */
export function AppLayout() {
  const { user, isOwner } = useAuth();
  const { pathname } = useLocation();
  const items = NAV.filter((n) => isOwner || !n.ownerOnly);

  return (
    <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-accent focus:p-3 focus:text-on-accent">
        روح للمحتوى
      </a>

      <aside className="sticky top-0 hidden h-dvh flex-col gap-5 overflow-y-auto border-e border-line bg-surface p-4 lg:flex">
        <Brand />
        {isOwner && <CashChip />}
        <nav aria-label="القائمة الرئيسية" className="flex flex-col gap-1">
          {[...items, ...(isOwner ? [USERS_NAV, AUDIT_NAV] : [])].map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold transition-colors ${isActive ? 'bg-accent text-on-accent' : 'text-muted hover:bg-raised hover:text-ink'}`
              }
            >
              <Icon name={n.icon} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-1 border-t border-line pt-3">
          <p className="me-auto min-w-0">
            <span className="block truncate text-sm font-semibold">{user?.name}</span>
            <span className="block text-xs text-muted">{isOwner ? 'مالك' : 'موظف'}</span>
          </p>
          <AccountButtons />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-surface pt-[env(safe-area-inset-top)] lg:hidden">
          <div className="flex items-center gap-1 px-4 py-2">
            <span className="me-auto"><Brand /></span>
            {isOwner && (
              <NavLink to="/users" aria-label="المستخدمين" className="grid size-11 place-items-center rounded-xl text-muted hover:bg-raised">
                <Icon name="users" />
              </NavLink>
            )}
            <AccountButtons />
          </div>
        </header>
        <StatusBanners />

        <main id="main" className="mx-auto max-w-6xl px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:pt-8 lg:pb-12">
          {/* On phones the cash balance scrolls with the page, to leave room for the ledger. */}
          {isOwner && pathname !== '/treasury' && <CashChip className="mb-4 flex! items-center justify-between lg:hidden!" />}
          <motion.div key={pathname.startsWith('/reports') ? '/reports' : pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>

      <nav aria-label="القائمة الرئيسية" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        {items.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold ${isActive ? 'text-accent' : 'text-muted'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative px-4 py-1">
                  {isActive && <motion.span layoutId="bottom-nav" className="absolute inset-0 rounded-full bg-raised" />}
                  <Icon name={n.icon} className="relative size-5" />
                </span>
                {n.short}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
