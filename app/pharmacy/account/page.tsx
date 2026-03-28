import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { pharmacySidebarItems } from '@/components/layout/Sidebar';
import { UserProfileForm } from '@/components/profile/UserProfileForm';

export default function PharmacyAccountPage() {
  return (
    <DashboardLayout items={pharmacySidebarItems} title="Pharmacist Account">
      <UserProfileForm />
    </DashboardLayout>
  );
}
