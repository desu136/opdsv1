'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  ClipboardList, 
  Users,
  MapPin,
  Store,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  items: SidebarItem[];
  userRole: 'Customer' | 'Pharmacy' | 'Admin' | 'Agent';
  userName: string;
}

export const Sidebar = ({ items, userRole, userName }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Assuming logout redirects to /login, but AuthProvider router.push does that.
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16 hidden md:flex flex-col">
      <div className="p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          {userRole} Portal
        </h2>
        <p className="font-semibold text-slate-800 truncate">{userName}</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer",
                isActive 
                  ? "bg-primary-50 text-primary-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-primary-600" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 w-full transition-colors">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

// Preset configurations for different roles
export const customerSidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
  { name: 'My Orders', href: '/customer/orders', icon: ShoppingCart },
  { name: 'Prescriptions', href: '/customer/prescriptions', icon: ClipboardList },
  { name: 'Addresses', href: '/customer/addresses', icon: MapPin },
  { name: 'Settings', href: '/customer/settings', icon: Settings },
];

export const pharmacySidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/pharmacy/dashboard', icon: LayoutDashboard },
  { name: 'Order Queue', href: '/pharmacy/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/pharmacy/inventory', icon: Package },
  { name: 'Prescriptions', href: '/pharmacy/prescriptions', icon: ClipboardList },
  { name: 'Settings', href: '/pharmacy/settings', icon: Settings },
];

export const adminSidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pharmacies', href: '/admin/pharmacies', icon: Store },
  { name: 'Agents', href: '/admin/agents', icon: Truck },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'All Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const agentSidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
  { name: 'Settings', href: '/agent/settings', icon: Settings },
];
