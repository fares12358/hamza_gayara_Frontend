/** Small layout blocks shared by all pages. */
import type { ReactNode } from 'react';
import { useDataStore } from '../../context/DataContext';
import { Icon } from '../layout/Icon';
import { Button } from './Button';

/** Screens reuse loaded figures for a short time. This asks the server again now. */
function RefreshButton() {
  const store = useDataStore();
  return (
    <Button variant="ghost" size="icon" aria-label="تحديث الأرقام" title="تحديث الأرقام" onClick={() => store.invalidate()}>
      <Icon name="refresh" />
    </Button>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="ms-auto flex flex-wrap justify-end gap-2">
        {actions}
        <RefreshButton />
      </div>
    </header>
  );
}

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-4 sm:p-5 ${className}`}>
      {title && <h2 className="mb-4 text-lg">{title}</h2>}
      {children}
    </section>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
