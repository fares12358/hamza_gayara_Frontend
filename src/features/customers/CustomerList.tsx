import { Link } from 'react-router-dom';
import { Icon } from '../../components/layout/Icon';
import { Balance, Money } from '../../components/ui/Money';
import { ShareBar } from '../../components/ui/ShareBar';
import { formatDate } from '../../lib/dates';
import { SETTLED } from '../../lib/money';
import type { CustomerSummary } from '../../types';

export function CustomerList({ customers, maxDebt }: { customers: CustomerSummary[]; maxDebt: number }) {
  return (
    <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
      {customers.map((c) => {
        const late = c.overdue ?? 0;
        return (
          <li key={c.id} className="border-b border-line last:border-b-0">
            <Link
              to={`/customers/${c.id}`}
              className="grid min-h-18 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 px-4 py-3 transition-colors hover:bg-raised md:grid-cols-[minmax(0,1fr)_minmax(8rem,16rem)_9rem_auto] md:gap-x-6"
            >
              <span className="min-w-0">
                <span className="block font-semibold break-words">{c.name}</span>
                <span className="block text-xs text-muted">
                  آخر حركة {formatDate(c.lastActivity)}
                </span>
                {late > SETTLED && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-danger">
                    <Icon name="alert" className="size-3.5" />
                    متأخر <Money value={late} />
                  </span>
                )}
              </span>
              {/* debt compared with the largest one */}
              <span className="hidden md:block">
                {c.balance > SETTLED && <ShareBar value={c.balance} max={maxDebt} late={late} />}
              </span>
              <span className="flex justify-end"><Balance value={c.balance} /></span>
              <Icon name="left" className="size-4 text-muted" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
