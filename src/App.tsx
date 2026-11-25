import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorState, Loading } from './components/ui/States';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { ChequesPage } from './features/cheques/ChequesPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { StatementPage } from './features/customers/StatementPage';
import { IncomePage } from './features/income/IncomePage';
import { InvoicePage } from './features/invoices/InvoicePage';
import { TreasuryPage } from './features/treasury/TreasuryPage';
import { UsersPage } from './features/users/UsersPage';

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
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CustomersPage />} />
        <Route path="customers/:id" element={<StatementPage />} />
        <Route path="cheques" element={<ChequesPage />} />
        <Route element={<OwnerRoutes />}>
          <Route path="invoices" element={<InvoicePage />} />
          <Route path="treasury" element={<TreasuryPage />} />
          <Route path="income" element={<IncomePage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
