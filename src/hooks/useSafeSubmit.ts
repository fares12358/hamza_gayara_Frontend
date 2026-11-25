import { useRef, useState } from 'react';
import type { SafeWrite } from '../api/entries';
import { ApiRequestError } from '../api/client';
import { useToast } from '../context/ToastContext';

const newId = () => `${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(2)).join('')}`;

/**
 * Saving money records:
 * - one requestId per record, kept until the save succeeds, so retries cannot duplicate
 * - asks for confirmation when the date is inside the old sheet period
 */
export function useSafeSubmit() {
  const toast = useToast();
  const requestId = useRef(newId());
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<{ message: string; retry: () => void } | null>(null);

  async function submit(send: (safe: SafeWrite) => Promise<unknown>, onSaved: () => void, confirmBackdated = false) {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      await send({ requestId: requestId.current, confirmBackdated });
      requestId.current = newId();
      onSaved();
    } catch (caught) {
      const error = caught as ApiRequestError;
      if (error.code === 'BACKDATED') {
        setPending({ message: error.message, retry: () => void submit(send, onSaved, true) });
      } else {
        // The user has been told to check the records, so the next save is a new one.
        if (error.code === 'REQUEST_REUSED') requestId.current = newId();
        toast(error.message, 'error');
      }
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return {
    saving,
    submit,
    backdated: {
      open: pending !== null,
      message: pending?.message ?? '',
      onCancel: () => setPending(null),
      onConfirm: () => {
        const retry = pending?.retry;
        setPending(null);
        retry?.();
      },
    },
  };
}
