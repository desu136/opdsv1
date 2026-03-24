'use client';

import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/components/providers/AuthProvider';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  title: string;
}

export const DashboardHeader = ({ onMenuClick, title }: DashboardHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-40 md:w-64 transition-all" 
          />
        </div>

        <NotificationBell />

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3 pl-1">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.role}</span>
          </div>
          <div className="h-9 w-9 bg-primary-100 rounded-xl overflow-hidden flex items-center justify-center text-primary-700 font-bold border border-primary-200 shadow-sm shrink-0">
            {user?.image ? (
              <img src={user.image} alt={user.name || 'User Avatar'} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0) || <User className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
