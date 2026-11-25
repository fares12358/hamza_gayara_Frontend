import { Link } from 'react-router-dom';
import { Money } from '../../components/ui/Money';
import { ShareBar } from '../../components/ui/ShareBar';
import { SETTLED } from '../../lib/money';
import type { CustomerSummary } from '../../types';

const TOP = 5;

/** Who holds most of the debt, and how much of it is late. */
export function DebtLeaders({ customers, totalDebt }: { customers: CustomerSummary[]; totalDebt: number }) {
  const debtors = customers.filter((c) => c.balance > SETTLED).sort((a, b) => b.balance - a.balance);
  if (!debtors.length) return null;
  const top = debtors.slice(0, TOP);
  const share = (value: number) => Math.round((value / totalDebt) * 100);

  return (
    <section className="flex flex-col rounded-3xl border border-line bg-surface p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg">أكبر المديونيات</h2>
        <p className="flex gap-3 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-late" />متأخر</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-accent" />غير متأخر أو غير معروف</span>
        </p>
      </header>
      <ol className="mt-2">
        {top.map((c) => (
          <li key={c.id}>
            <Link to={`/customers/${c.id}`} className="-mx-2 block rounded-xl px-2 py-2 hover:bg-raised">
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-semibold">{c.name}</span>
                <Money value={c.balance} className="shrink-0 font-bold" />
              </span>
              <span className="my-1 block">
                <ShareBar value={c.balance} max={top[0].balance} late={c.overdue ?? 0} />
              </span>
              <span className="flex justify-between gap-3 text-xs text-muted">
                <span><span className="num">{share(c.balance)}%</span> من الإجمالي</span>
                {c.overdue === null ? (
                  <span>التأخير غير معروف</span>
                ) : (
                  c.overdue > SETTLED && <span className="text-danger">متأخر <Money value={c.overdue} /></span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {debtors.length > TOP && (
        <p className="mt-auto border-t border-line pt-2 text-sm text-muted">
          أكبر {TOP} عليهم <span className="num font-bold text-ink">{share(top.reduce((s, c) => s + c.balance, 0))}%</span> من المديونية، والباقي على {debtors.length - TOP} عملاء.
        </p>
      )}
    </section>
  );
}
