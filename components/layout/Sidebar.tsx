'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { motion } from 'framer-motion';
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
  Truck,
  ChevronLeft,
  ChevronRight,
  X,
  Pill
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  items: SidebarItem[];
  userRole: 'Customer' | 'Pharmacy' | 'Admin' | 'Agent';
  userName: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
  className?: string;
}

export const Sidebar = ({ 
  items, 
  userRole, 
  userName, 
  isCollapsed = false, 
  onToggleCollapse,
  isMobile = false,
  onClose,
  className
}: SidebarProps) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside 
      className={cn(
        "bg-white border-r border-slate-200 h-screen flex flex-col transition-all duration-300 relative",
        isMobile ? "w-full" : isCollapsed ? "w-20" : "w-72",
        className
      )}
    >
      {/* Brand / Logo Section */}
      <div className={cn(
        "p-6 flex items-center gap-3 border-b border-slate-50",
        isCollapsed && !isMobile ? "justify-center" : "justify-between"
      )}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-primary-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
            <Pill className="h-6 w-6 text-white" />
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              EthioPharma
            </span>
          )}
        </Link>
        {isMobile && (
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User Info Section (Only when expanded) */}
      {(!isCollapsed || isMobile) && (
        <div className="px-6 py-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
            {userRole} Portal
          </p>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center text-primary-600 font-bold shrink-0">
               {(user as any)?.image ? (
                 <img src={(user as any).image} alt={userName} className="h-full w-full object-cover" />
               ) : (
                 userName.charAt(0)
               )}
             </div>
             <div className="min-w-0">
               <p className="font-bold text-slate-900 truncate text-sm">{userName}</p>
               <p className="text-xs text-slate-500 truncate">active</p>
             </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-4 scrollbar-hide">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-2xl font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary-600",
                isCollapsed && !isMobile && "justify-center px-0"
              )}
              title={isCollapsed ? item.name : undefined}
              onClick={() => isMobile && onClose && onClose()}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-primary-500")} />
              {(!isCollapsed || isMobile) && (
                <span className="truncate">{item.name}</span>
              )}
              {isActive && !isCollapsed && (
                <motion.div 
                  layoutId="active-pill" 
                  className="absolute right-2 w-1.5 h-6 bg-white/30 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle Section */}
      <div className="p-4 mt-auto border-t border-slate-100 space-y-2">
        <button 
          onClick={() => {
            handleLogout();
            if (isMobile && onClose) onClose();
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-2xl font-medium text-red-600 hover:bg-red-50 w-full transition-all group",
            isCollapsed && !isMobile && "justify-center px-0"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:rotate-12 transition-transform" />
          {(!isCollapsed || isMobile) && <span>Logout Account</span>}
        </button>

        {!isMobile && onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-full py-2 text-slate-400 hover:text-primary-600 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : (
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                <ChevronLeft className="h-4 w-4" /> 
                Collapse Sidebar
              </div>
            )}
          </button>
        )}
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
