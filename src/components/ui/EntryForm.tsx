import type { FormEvent, ReactNode } from 'react';
import { Button } from './Button';

/**
 * Layout of every money form: the fields, and beside them (below on phones)
 * what will change and the save button.
 */
export function EntryForm({ onSubmit, children, preview, submitLabel, saving }: {
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
  preview: ReactNode;
  submitLabel: string;
  saving: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="grid rounded-2xl border border-line bg-surface lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="flex flex-col gap-4 p-4 sm:p-6">{children}</div>
      <div className="flex flex-col gap-3 border-t border-line p-4 sm:p-6 lg:border-t-0 lg:border-s">
        <p className="text-sm font-bold">بعد الحفظ</p>
        <div aria-live="polite" className="flex flex-col gap-3">
          {preview}
        </div>
        <Button type="submit" variant="primary" loading={saving} className="mt-auto min-h-12 text-lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
