import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../components/layout/Icon';

type Tone = 'info' | 'error';
type ShowToast = (message: string, tone?: Tone) => void;

const ToastContext = createContext<ShowToast>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: Tone } | null>(null);
  const timer = useRef<number>(undefined);

  const show = useCallback<ShowToast>((message, tone = 'info') => {
    window.clearTimeout(timer.current);
    setToast({ message, tone });
    timer.current = window.setTimeout(() => setToast(null), tone === 'error' ? 7000 : 3000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-60 flex justify-center lg:bottom-6"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className={`flex max-w-md items-center gap-2 rounded-xl px-4 py-3 font-semibold shadow-lg ${
                toast.tone === 'error' ? 'border border-danger bg-surface text-danger' : 'bg-ink text-bg'
              }`}
            >
              <Icon name={toast.tone === 'error' ? 'alert' : 'check'} />
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
