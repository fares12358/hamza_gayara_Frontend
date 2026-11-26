import { useState } from 'react';
import { entriesApi } from '../../api/entries';
import { useToast } from '../../context/ToastContext';
import { Button } from './Button';
import { ConfirmDialog } from './Dialog';

/** Cancels a record after confirmation. The record stays in the database. */
export function CancelEntryButton({ id, isInvoice }: { id: string; isInvoice?: boolean }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  async function cancel() {
    setOpen(false);
    try {
      await entriesApi.cancel(id);
      toast('تم إلغاء الحركة'); // the lists reload by themselves after a save
    } catch (error) {
      toast((error as Error).message, 'error');
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        إلغاء
      </Button>
      <ConfirmDialog
        open={open}
        title="إلغاء الحركة؟"
        message={
          isInvoice
            ? 'هتتلغي الفاتورة، ولو كان معاها دفعة هتتلغي كمان. الأرصدة هتتعدل.'
            : 'الأرصدة هتتعدل، والحركة هتفضل محفوظة في السجل كملغية.'
        }
        confirmLabel="إلغاء الحركة"
        onConfirm={cancel}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
