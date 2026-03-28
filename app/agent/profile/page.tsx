import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { agentSidebarItems } from '@/components/layout/Sidebar';
import { UserProfileForm } from '@/components/profile/UserProfileForm';

export default function AgentProfilePage() {
  return (
    <DashboardLayout items={agentSidebarItems} title="Agent Profile">
      <UserProfileForm />
    </DashboardLayout>
  );
}
