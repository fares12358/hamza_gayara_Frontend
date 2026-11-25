import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';

/** Native <dialog>: keeps focus inside and closes with Escape. */
export function Dialog({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
  }, [open]);

  if (!open) return null;
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(32rem,calc(100%-2rem))] bg-transparent p-0 text-ink backdrop:bg-black/70"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="max-h-[85dvh] overflow-y-auto rounded-3xl border border-line bg-surface p-5"
      >
        <h2 className="mb-3 text-lg">{title}</h2>
        {children}
      </motion.div>
    </dialog>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <p className="mb-5 leading-7 text-muted">{message}</p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button onClick={onCancel}>رجوع</Button>
        <Button variant="primary" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
