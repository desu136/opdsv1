'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { 
  ClipboardList, 
  MapPin, 
  Settings, 
  LogOut, 
  ChevronRight,
  User
} from 'lucide-react';

export default function CustomerProfilePage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    { name: 'My Prescriptions', href: '/customer/prescriptions', icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Delivery Addresses', href: '/customer/addresses', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Account Settings', href: '/customer/settings', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe">
      <Navbar />

      <main className="flex-grow pt-6 pb-24 container mx-auto px-4 max-w-lg">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 mb-8">
          <div className="h-16 w-16 bg-primary-100 rounded-2xl flex items-center justify-center shrink-0 border border-primary-200">
            {(user as any)?.image ? (
              <img src={(user as any).image} alt={user?.name || ''} className="h-full w-full object-cover rounded-2xl" />
            ) : (
              <User className="h-8 w-8 text-primary-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-900 truncate">{user?.name || 'Customer'}</h1>
            <p className="text-sm text-slate-500 truncate mt-0.5">{user?.email || 'No email provided'}</p>
          </div>
        </div>

        <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-4 px-2">Account Hub</h2>

        {/* Menu Links */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors active:bg-slate-100 ${
                  index !== menuItems.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <div className={`h-12 w-12 ${item.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <span className="flex-1 font-bold text-slate-800 text-lg">{item.name}</span>
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl p-5 shadow-sm border border-red-100 flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors active:scale-[0.98]"
        >
          <LogOut className="h-6 w-6" />
          <span className="font-bold text-lg">Log Out</span>
        </button>

      </main>
    </div>
  );
}
