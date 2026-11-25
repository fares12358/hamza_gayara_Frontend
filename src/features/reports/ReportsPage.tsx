import { motion } from 'framer-motion';
import { Navigate, NavLink, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/ui/Layouts';
import { AgingTab } from './AgingTab';
import { CashboxTab } from './CashboxTab';
import { DebtsTab } from './DebtsTab';
import { ExpensesTab } from './ExpensesTab';
import { LateTab } from './LateTab';
import { SalesTab } from './SalesTab';

const TABS = [
  { id: 'cashbox', label: 'حركة الخزنة', view: CashboxTab },
  { id: 'sales', label: 'المبيعات', view: SalesTab },
  { id: 'debts', label: 'مديونيات العملاء', view: DebtsTab },
  { id: 'aging', label: 'أعمار المديونية', view: AgingTab },
  { id: 'late', label: 'الفواتير المتأخرة', view: LateTab },
  { id: 'expenses', label: 'المصاريف', view: ExpensesTab },
];

/** The selection bar keeps the chosen report in the address, so refresh and links keep it. */
export function ReportsPage() {
  const { tab } = useParams();
  const current = TABS.find((t) => t.id === tab);
  if (!current) return <Navigate to={`/reports/${TABS[0].id}`} replace />;
  const View = current.view;

  return (
    <>
      <PageHeader title="التقارير" description="التقارير بتتحسب من بيانات النظام، وللقراءة والتنزيل بس." />
      <nav aria-label="أنواع التقارير" className="grid grid-cols-2 gap-1 rounded-2xl bg-raised p-1 sm:grid-cols-3 xl:grid-cols-6">
        {TABS.map((t) => (
          <NavLink
            key={t.id}
            to={`/reports/${t.id}`}
            replace
            className={({ isActive }) =>
              `relative grid min-h-12 place-items-center rounded-xl px-2 text-center text-sm font-semibold ${isActive ? 'text-on-accent' : 'text-muted hover:text-ink'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="report-tab" transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }} className="absolute inset-0 rounded-xl bg-accent" />}
                <span className="relative">{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <View key={current.id} />
    </>
  );
}
