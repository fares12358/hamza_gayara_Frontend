import { lazy } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorState, Loading } from './components/ui/States';
import { useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LoginPage } from './features/auth/LoginPage';
import { CustomersPage } from './features/customers/CustomersPage';

// Each screen is downloaded when first opened (and cached by the PWA).
const ChequesPage = lazy(() => import('./features/cheques/ChequesPage').then((m) => ({ default: m.ChequesPage })));
const StatementPage = lazy(() => import('./features/customers/StatementPage').then((m) => ({ default: m.StatementPage })));
const IncomePage = lazy(() => import('./features/income/IncomePage').then((m) => ({ default: m.IncomePage })));
const InvoicePage = lazy(() => import('./features/invoices/InvoicePage').then((m) => ({ default: m.InvoicePage })));
const TreasuryPage = lazy(() => import('./features/treasury/TreasuryPage').then((m) => ({ default: m.TreasuryPage })));
const UsersPage = lazy(() => import('./features/users/UsersPage').then((m) => ({ default: m.UsersPage })));
const ReportsPage = lazy(() => import('./features/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const AuditPage = lazy(() => import('./features/audit/AuditPage').then((m) => ({ default: m.AuditPage })));

/** Screen protection only. The server checks every request again. */
function OwnerRoutes() {
  return useAuth().isOwner ? <Outlet /> : <Navigate to="/" replace />;
}

export function App() {
  const { status, user, retry } = useAuth();

  if (status !== 'ready') {
    return (
      <div className="mx-auto max-w-md p-6">
        {status === 'loading' ? <Loading /> : <ErrorState message="مش قادر أوصل للسيرفر" onRetry={retry} />}
      </div>
    );
  }
  if (!user) return <LoginPage />;

  return (
    // A new key per user: cached data never passes from one user to another.
    <DataProvider key={user.id}>
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CustomersPage />} />
        <Route path="customers/:id" element={<StatementPage />} />
        <Route path="cheques" element={<ChequesPage />} />
        <Route element={<OwnerRoutes />}>
          <Route path="invoices" element={<InvoicePage />} />
          <Route path="treasury" element={<TreasuryPage />} />
          <Route path="income" element={<IncomePage />} />
          <Route path="reports/:tab?" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </DataProvider>
  );
}
