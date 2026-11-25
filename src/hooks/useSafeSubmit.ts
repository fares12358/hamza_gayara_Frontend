import { useRef, useState } from 'react';
import type { SafeWrite } from '../api/entries';
import { ApiRequestError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { fingerprint, forgetPending, pendingId, rememberPending } from '../lib/pendingSaves';

const newId = () => `${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(2)).join('')}`;

type Flags = Pick<SafeWrite, 'confirmBackdated' | 'confirmUnusual'>;

const QUESTIONS: Record<string, { flag: keyof Flags; title: string }> = {
  BACKDATED: { flag: 'confirmBackdated', title: 'تاريخ قديم' },
  UNUSUAL: { flag: 'confirmUnusual', title: 'راجع قبل الحفظ' },
};

/**
 * Saving money records:
 * - one requestId per record, kept until the result is known, so retries cannot duplicate
 * - asks for confirmation when the server finds an old date or an unusual amount
 */
export function useSafeSubmit() {
  const toast = useToast();
  const requestId = useRef(newId());
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [question, setQuestion] = useState<{ title: string; message: string; retry: () => void } | null>(null);

  /** "payload" is what the user entered. It identifies a retry of the same record. */
  async function submit(
    payload: unknown,
    send: (safe: SafeWrite) => Promise<unknown>,
    onSaved: () => void,
    flags: Flags = { confirmBackdated: false, confirmUnusual: false },
  ) {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    const print = fingerprint(payload);
    const id = pendingId(print) ?? requestId.current;
    const done = () => {
      forgetPending(id);
      if (id === requestId.current) requestId.current = newId();
    };
    try {
      await send({ requestId: id, ...flags });
      done();
      onSaved();
    } catch (caught) {
      const error = caught as ApiRequestError;
      const ask = QUESTIONS[error.code];
      if (ask) {
        setQuestion({
          title: ask.title,
          message: error.message,
          retry: () => void submit(payload, send, onSaved, { ...flags, [ask.flag]: true }),
        });
      } else {
        // No answer or a server failure: the record may have been saved.
        if (error.status === 0 || error.status >= 500) rememberPending(print, id);
        // The user has been told to check the records, so the next save is a new one.
        if (error.code === 'REQUEST_REUSED') done();
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
    /** Spread on <ConfirmDialog/>. */
    confirm: {
      open: question !== null,
      title: question?.title ?? '',
      message: question?.message ?? '',
      confirmLabel: 'أيوه، سجّل',
      onCancel: () => setQuestion(null),
      onConfirm: () => {
        const retry = question?.retry;
        setQuestion(null);
        retry?.();
      },
    },
  };
}
