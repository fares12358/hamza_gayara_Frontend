import { PageHeader } from '../../components/ui/Layouts';
import { ChequeForm } from './ChequeForm';
import { ChequeList } from './ChequeList';

export function ChequesPage() {
  return (
    <>
      <PageHeader title="الشيكات المحصّلة" description="سجّل الشيك وارفع صورته، وبينزل في كشف حساب العميل على طول." />
      <ChequeForm />
      <ChequeList />
    </>
  );
}
