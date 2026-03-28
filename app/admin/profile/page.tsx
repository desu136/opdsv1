import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminSidebarItems } from '@/components/layout/Sidebar';
import { UserProfileForm } from '@/components/profile/UserProfileForm';

export default function AdminProfilePage() {
  return (
    <DashboardLayout items={adminSidebarItems} title="Admin Profile">
      <UserProfileForm />
    </DashboardLayout>
  );
}
