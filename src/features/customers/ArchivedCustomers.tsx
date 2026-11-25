import { Link } from 'react-router-dom';
import { customersApi } from '../../api/customers';
import { AsyncView, EmptyState } from '../../components/ui/States';
import { useApi } from '../../hooks/useApi';

export function ArchivedCustomers() {
  const state = useApi(customersApi.archived, 'archived-customers');
  return (
    <AsyncView state={state}>
      {(customers) =>
        customers.length ? (
          <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
            {customers.map((c) => (
              <li key={c.id} className="border-b border-line last:border-b-0">
                <Link to={`/customers/${c.id}`} className="flex min-h-12 items-center px-4 py-2 font-semibold hover:bg-raised">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>مفيش عملاء في الأرشيف</EmptyState>
        )
      }
    </AsyncView>
  );
}
