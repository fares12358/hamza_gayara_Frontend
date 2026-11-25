import { motion } from 'framer-motion';
import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useInstall } from '../../lib/pwaInstall';
import { Icon } from '../layout/Icon';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

function IosSteps({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} title="تثبيت التطبيق على الآيفون أو الآيباد">
      <ol className="list-inside list-decimal space-y-3 leading-7">
        <li>
          افتح الصفحة في <span className="font-bold">Safari</span>.
        </li>
        <li>
          اضغط زر المشاركة <Icon name="share" className="inline size-5 align-middle" /> (Share).
        </li>
        <li>
          اختار <span className="font-bold">إضافة إلى الشاشة الرئيسية</span> (Add to Home Screen).
        </li>
        <li>
          اضغط <span className="font-bold">إضافة</span>. هتلاقي أيقونة الجيارة جنب التطبيقات.
        </li>
      </ol>
      <Button variant="primary" className="mt-5 w-full" onClick={onClose}>
        تمام
      </Button>
    </Dialog>
  );
}

/** Opens the browser's install window, or shows the iPhone steps. */
export function useInstallAction() {
  const { mode, install } = useInstall();
  const toast = useToast();
  const [steps, setSteps] = useState(false);
  return {
    available: mode !== 'none',
    mode,
    start: async () => {
      if (mode === 'ios') return setSteps(true);
      if (await install()) toast('تم تثبيت التطبيق');
    },
    dialog: steps ? <IosSteps onClose={() => setSteps(false)} /> : null,
  };
}

/** A suggestion to install the app. "Later" hides it for 14 days. */
export function InstallCard({ className = '' }: { className?: string }) {
  const { snoozed, snooze } = useInstall();
  const action = useInstallAction();
  if (!action.available || snoozed) return action.dialog;

  return (
    <>
      <motion.aside
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        aria-label="تثبيت التطبيق"
        className={`flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4 ${className}`}
      >
        <img src="/icon.svg" alt="" className="size-12 rounded-xl" />
        <div className="min-w-0 flex-1 basis-56">
          <p className="font-display text-lg font-bold">نزّل تطبيق الجيارة</p>
          <p className="text-sm text-muted">
            يفتح من أيقونة على الموبايل أو الكمبيوتر، في شاشة لوحده. الحفظ محتاج إنترنت.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={snooze}>بعدين</Button>
          <Button variant="primary" onClick={action.start}>
            <Icon name="download" className="size-4" />
            {action.mode === 'ios' ? 'طريقة التثبيت' : 'تثبيت'}
          </Button>
        </div>
      </motion.aside>
      {action.dialog}
    </>
  );
}
