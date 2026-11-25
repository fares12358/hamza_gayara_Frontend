import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DATA_CHANGED_EVENT } from '../../api/client';
import { treasuryApi } from '../../api/reports';
import { useApi } from '../../hooks/useApi';
import { Money } from '../ui/Money';

/**
 * The cash box balance on every screen (owner only), as in the old app.
 * Reloads after each save and screen change. Shows "—" rather than an old figure if loading fails.
 */
export function CashChip({ className = '' }: { className?: string }) {
  const { pathname } = useLocation();
  const { data, error, reload } = useApi(treasuryApi.balance, 'cash-chip');

  useEffect(() => reload(), [pathname, reload]);
  useEffect(() => {
    window.addEventListener(DATA_CHANGED_EVENT, reload);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, reload);
  }, [reload]);

  return (
    <Link to="/treasury" className={`block rounded-xl border border-line bg-raised px-3 py-1.5 ${className}`}>
      <span className="block text-xs text-muted">رصيد الخزنة</span>
      <span className="block font-display text-lg leading-6 font-bold">
        {error || data === undefined ? '—' : <Money value={data} />}
      </span>
    </Link>
  );
}
