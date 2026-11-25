import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../layout/Icon';
import { Button } from '../ui/Button';

const CHECK_EVERY_MS = 30 * 60 * 1000;
const BUILD_KEY = 'gayara-build';

/**
 * New versions of the app. Mounted once for the whole app (also on the login screen),
 * because it also registers the service worker.
 * The page never reloads by itself: typed data would be lost.
 */
export function UpdateCard() {
  const toast = useToast();
  const registration = useRef<ServiceWorkerRegistration>(undefined);
  const [later, setLater] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [brokenPage, setBrokenPage] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, found) {
      registration.current = found;
    },
  });

  // An app left open for days must still learn about new versions.
  useEffect(() => {
    const check = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) registration.current?.update().catch(() => {});
    };
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('online', check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('online', check);
    };
  }, []);

  // A screen of an older version can no longer be downloaded after a new release.
  useEffect(() => {
    const onMissing = (event: Event) => {
      event.preventDefault();
      setBrokenPage(true);
      setLater(false);
    };
    window.addEventListener('vite:preloadError', onMissing);
    return () => window.removeEventListener('vite:preloadError', onMissing);
  }, []);

  // Tell the user once after the new version is running.
  useEffect(() => {
    try {
      const before = localStorage.getItem(BUILD_KEY);
      if (before && before !== __APP_BUILD__) toast('تم تحديث التطبيق لأحدث نسخة');
      localStorage.setItem(BUILD_KEY, __APP_BUILD__);
    } catch {
      /* storage blocked: no message */
    }
  }, [toast]);

  function update() {
    setUpdating(true);
    if (needRefresh) {
      void updateServiceWorker(true);
      // Some browsers do not reload by themselves.
      window.setTimeout(() => window.location.reload(), 4000);
    } else window.location.reload();
  }

  const available = needRefresh || brokenPage;

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex justify-center lg:inset-x-auto lg:end-6 lg:bottom-6">
      <AnimatePresence>
        {available && !later && (
          <motion.section
            role="alertdialog"
            aria-label="تحديث جديد"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="slab pointer-events-auto w-full max-w-sm rounded-2xl p-4 shadow-2xl"
          >
            <p className="font-display text-lg font-bold">فيه تحديث جديد للتطبيق</p>
            <p className="mt-1 text-sm opacity-80">
              {brokenPage ? 'لازم تحدّث عشان الصفحة دي تفتح.' : 'لو بتكتب حركة، احفظها الأول وبعدين حدّث.'}
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setLater(true)} className="min-h-11 rounded-xl px-4 font-semibold opacity-80 hover:bg-on-slab/10">
                بعدين
              </button>
              <button type="button" onClick={update} disabled={updating} className="min-h-11 rounded-xl bg-on-slab px-4 font-semibold text-black disabled:opacity-60">
                {updating ? 'بيحدّث…' : 'تحديث دلوقتي'}
              </button>
            </div>
          </motion.section>
        )}
        {available && later && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-auto ms-auto">
            <Button variant="primary" className="rounded-full shadow-lg" onClick={() => setLater(false)}>
              <Icon name="download" className="size-4" />
              تحديث متاح
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
