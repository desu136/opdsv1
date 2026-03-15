'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, customerSidebarItems } from '@/components/layout/Sidebar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Lock,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CustomerSettingsPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone
        })
      });
      if (res.ok) {
        setIsSaved(true);
        // In a real app, you might want to refresh the auth context
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={customerSidebarItems} userRole="Customer" userName={user?.name || 'Customer'} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 text-slate-900">
          
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
               <h1 className="text-2xl font-bold">Account Settings</h1>
               <p className="text-slate-500">Manage your profile information and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="col-span-1 space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
                     <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-700 font-bold text-2xl">
                        {user?.name?.[0] || 'C'}
                     </div>
                     <h2 className="font-bold text-slate-900">{user?.name}</h2>
                     <p className="text-xs text-slate-500 mb-4">{user?.role}</p>
                     <Button variant="outline" size="sm" className="w-full rounded-xl">Change Avatar</Button>
                  </div>
                  
                  <nav className="space-y-1">
                     <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-700 font-bold rounded-xl border border-primary-100">
                        <User className="h-5 w-5" /> Profile info
                     </button>
                     <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white rounded-xl font-medium transition-colors">
                        <Lock className="h-5 w-5 text-slate-400" /> Password
                     </button>
                     <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white rounded-xl font-medium transition-colors">
                        <MapPin className="h-5 w-5 text-slate-400" /> Saved Addresses
                     </button>
                  </nav>
               </div>

               <div className="col-span-1 md:col-span-2 space-y-6">
                  <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                     <h2 className="text-lg font-bold mb-6 border-b border-slate-100 pb-4">Personal Details</h2>
                     <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-semibold text-slate-700">Full Name</label>
                           <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none" 
                                placeholder="Enter your name"
                              />
                           </div>
                        </div>

                        <div className="flex flex-col gap-1.5 opacity-60">
                           <label className="text-sm font-semibold text-slate-700">Email Address (Read-Only)</label>
                           <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <input 
                                type="email" 
                                value={formData.email}
                                disabled
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed" 
                              />
                           </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                           <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none" 
                                placeholder="+251 ..."
                              />
                           </div>
                        </div>
                     </div>

                     <div className="mt-8 flex items-center justify-between">
                        {isSaved ? (
                          <p className="text-emerald-600 text-sm font-bold flex items-center gap-1">
                             <CheckCircle2 className="h-4 w-4" /> Changes saved successfully
                          </p>
                        ) : <span></span>}
                        <Button variant="primary" size="lg" className="rounded-2xl px-8 shadow-md" type="submit" disabled={isLoading}>
                           {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Update Profile'}
                        </Button>
                     </div>
                  </form>

                  <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100">
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shrink-0 shadow-sm">
                           <Shield className="h-5 w-5" />
                        </div>
                        <div>
                           <h3 className="font-bold text-rose-900">Delete Account</h3>
                           <p className="text-sm text-rose-700 mb-4">Once you delete your account, all your data will be permanently removed. This action cannot be undone.</p>
                           <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-100 rounded-xl font-bold">Request Deletion</Button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
