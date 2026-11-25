import { useState } from 'react';
import { customersApi } from '../../api/customers';
import { Icon } from '../../components/layout/Icon';
import { BalanceSlab } from '../../components/ui/BalanceSlab';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { PageHeader } from '../../components/ui/Layouts';
import { Money } from '../../components/ui/Money';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { AsyncView, EmptyState } from '../../components/ui/States';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { matchesName } from '../../lib/arabic';
import { formatDate } from '../../lib/dates';
import { SETTLED } from '../../lib/money';
import type { CustomerSummary } from '../../types';
import { ArchivedCustomers } from './ArchivedCustomers';
import { CustomerList } from './CustomerList';
import { DebtLeaders } from './DebtLeaders';
import { NewCustomerForm } from './NewCustomerForm';

type Filter = 'all' | 'debt' | 'late';
type Sort = 'balance' | 'late' | 'name' | 'recent';

const FILTERS: Record<Filter, (c: CustomerSummary) => boolean> = {
  all: () => true,
  debt: (c) => c.balance > SETTLED,
  late: (c) => (c.overdue ?? 0) > SETTLED,
};

const SORTS: Record<Sort, (a: CustomerSummary, b: CustomerSummary) => number> = {
  balance: (a, b) => b.balance - a.balance,
  late: (a, b) => (b.overdue ?? 0) - (a.overdue ?? 0),
  name: (a, b) => a.name.localeCompare(b.name, 'ar'),
  recent: (a, b) => b.lastActivity.localeCompare(a.lastActivity),
};

export function CustomersPage() {
  const { isOwner } = useAuth();
  const state = useApi(customersApi.list, 'customers');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('balance');
  const [adding, setAdding] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  return (
    <>
      <PageHeader
        title="العملاء"
        description={state.data?.ledgerAsOf ? `بيانات الشيتات لحد ${formatDate(state.data.ledgerAsOf)}، والحركات الجديدة بتتحسب فوقها.` : undefined}
        actions={
          isOwner && (
            <Button variant={adding ? 'secondary' : 'primary'} onClick={() => setAdding((v) => !v)}>
              <Icon name={adding ? 'close' : 'plus'} className="size-4" />
              {adding ? 'إغلاق' : 'عميل جديد'}
            </Button>
          )
        }
      />
      {adding && (
        <NewCustomerForm
          onSaved={() => {
            setAdding(false);
            state.reload();
          }}
        />
      )}
      <AsyncView state={state}>
        {({ customers, totals, overdueDays }) => {
          const shown = customers
            .filter((c) => matchesName(search, c.name, ...c.aliases) && FILTERS[filter](c))
            .sort(SORTS[sort]);
          const maxDebt = Math.max(0, ...customers.map((c) => c.balance));
          const count = (f: Filter) => customers.filter(FILTERS[f]).length;

          return (
            <>
              <div className={`grid gap-4 ${totals.debt > 0 ? 'xl:grid-cols-2' : ''}`}>
                <BalanceSlab
                  className="justify-center!"
                  label="إجمالي مديونيات العملاء"
                  amount={totals.debt}
                  stats={[
                    { label: 'عملاء عليهم مديونية', value: <span className="num">{totals.debtors}</span> },
                    { label: `متأخر أكتر من ${overdueDays} أيام`, value: <Money value={totals.overdue} /> },
                  ]}
                />
                <DebtLeaders customers={customers} totalDebt={totals.debt} />
              </div>

              <section className="flex flex-col gap-3">
                <h2 className="text-lg">كل العملاء</h2>
                <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_12rem] lg:grid-cols-[minmax(0,1fr)_12rem_auto]">
                  <Input label="ابحث باسم العميل" type="search" icon="search" placeholder="مثلاً: احمد" value={search} onValue={setSearch} />
                  <Select
                    label="الترتيب"
                    value={sort}
                    onValue={(v) => setSort(v as Sort)}
                    options={[
                      { value: 'balance', label: 'أعلى رصيد' },
                      { value: 'late', label: 'أكبر متأخرات' },
                      { value: 'recent', label: 'أحدث حركة' },
                      { value: 'name', label: 'الاسم' },
                    ]}
                  />
                  <SegmentedControl<Filter>
                    label="تصفية العملاء"
                    value={filter}
                    onChange={setFilter}
                    options={[
                      { value: 'all', label: `الكل (${count('all')})` },
                      { value: 'debt', label: `المديونيات (${count('debt')})` },
                      { value: 'late', label: `المتأخرين (${count('late')})` },
                    ]}
                  />
                </div>
                {shown.length ? (
                  <CustomerList customers={shown} maxDebt={maxDebt} />
                ) : (
                  <EmptyState>{customers.length ? 'مفيش عملاء مطابقين. امسح البحث أو اختار "الكل".' : 'لسه مفيش عملاء'}</EmptyState>
                )}
              </section>
            </>
          );
        }}
      </AsyncView>
      {isOwner && (
        <>
          <Button variant="ghost" className="self-start" aria-expanded={showArchived} onClick={() => setShowArchived((v) => !v)}>
            {showArchived ? 'إخفاء العملاء المؤرشفين' : 'العملاء المؤرشفين'}
          </Button>
          {showArchived && <ArchivedCustomers />}
        </>
      )}
    </>
  );
}
