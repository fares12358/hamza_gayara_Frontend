import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '../ui/Button';

/** Tells the user when there is no internet or a new app version. */
export function StatusBanners() {
  const [online, setOnline] = useState(navigator.onLine);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return (
    <>
      {!online && (
        <div role="alert" className="border-b border-danger bg-surface px-4 py-2 text-center text-sm text-danger">
          مفيش إنترنت. الحفظ مش هيشتغل، والأرقام الظاهرة ممكن تكون قديمة.
        </div>
      )}
      {needRefresh && (
        <div className="flex items-center justify-center gap-3 border-b border-line bg-raised px-4 py-2 text-sm">
          فيه نسخة جديدة من التطبيق.
          <Button variant="primary" onClick={() => updateServiceWorker(true)}>
            تحديث
          </Button>
        </div>
      )}
    </>
  );
}
