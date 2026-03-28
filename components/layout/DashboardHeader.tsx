'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  title: string;
}

export const DashboardHeader = ({ onMenuClick, title }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine profile link based on role
  const getProfileLink = () => {
    switch (user?.role) {
      case 'ADMIN': return '/admin/profile';
      case 'PHARMACIST': return '/pharmacy/account';
      case 'DELIVERY_AGENT': return '/agent/profile';
      default: return '/';
    }
  };

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

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Account Menu"
            className="flex items-center gap-3 pl-1 hover:bg-slate-50 p-1.5 rounded-xl transition-colors cursor-pointer text-left"
          >
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.role}</span>
            </div>
            <div className={`h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center font-bold shadow-sm shrink-0 transition-all border ${isDropdownOpen ? 'ring-2 ring-primary-500/30 border-primary-500 bg-primary-100 text-primary-700' : 'border-primary-200 bg-primary-50 text-primary-600'}`}>
              {user?.image ? (
                <img src={user.image} alt={user.name || 'User Avatar'} className="h-full w-full object-cover" />
              ) : (
                user?.name?.charAt(0) || <User className="h-5 w-5" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 py-2"
              >
                <div className="px-4 py-3 border-b border-slate-50 mb-1 lg:hidden">
                   <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                   <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                
                <Link 
                  href={getProfileLink()} 
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  Profile Settings
                </Link>
                
                <div className="h-px bg-slate-50 my-1 mx-4"></div>
                
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
