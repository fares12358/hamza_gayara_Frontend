import { useEffect, useState } from 'react';

/** Tells the user when there is no internet. */
export function StatusBanners() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online) return null;
  return (
    <div role="alert" className="border-b border-danger bg-surface px-4 py-2 text-center text-sm text-danger">
      مفيش إنترنت. الحفظ مش هيشتغل، والأرقام الظاهرة ممكن تكون قديمة.
    </div>
  );
}
