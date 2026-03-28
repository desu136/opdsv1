'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ClipboardList, User } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export const BottomNav = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Do not show BottomNav for auth pages, or if user is a staff member interacting with dashboards
  if (
    pathname.includes('/login') || 
    pathname.includes('/register') || 
    pathname.includes('/admin') ||
    pathname.includes('/agent') ||
    pathname.includes('/pharmacy/dashboard') ||
    pathname.includes('/pharmacy/orders') ||
    pathname.includes('/pharmacy/inventory') ||
    pathname.includes('/pharmacy/prescriptions') ||
    pathname.includes('/pharmacy/settings')
  ) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Search', icon: Search, path: '/products' },
    { label: 'Orders', icon: ClipboardList, path: '/customer/orders' },
    { label: 'Profile', icon: User, path: '/customer/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link 
              key={item.label} 
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                active ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all duration-300 ${active ? 'bg-primary-50 scale-110' : ''}`}>
                <Icon className={`h-6 w-6 ${active ? 'fill-primary-100/50' : ''}`} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium tracking-tight ${active ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
