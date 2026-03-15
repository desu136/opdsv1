'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, agentSidebarItems } from '@/components/layout/Sidebar';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Lock,
  Loader2,
  CheckCircle2,
  Bell,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AgentSettingsPage() {
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans max-w-md mx-auto shadow-2xl relative border-x border-slate-200">
      
      <header className="bg-white p-4 border-b border-slate-100 sticky top-0 z-30">
        <h1 className="font-bold text-slate-900 text-lg">Agent Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 text-slate-900">
         
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-700 font-bold text-2xl border-4 border-white shadow-sm">
               {user?.name?.[0] || 'A'}
            </div>
            <h2 className="font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Verified Delivery Partner</p>
         </div>

         <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
               <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-2">Profile Details</h3>
               
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 ml-1">Full Name</label>
                  <div className="relative">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <input 
                       type="text" 
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm font-medium" 
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 ml-1">Phone Number</label>
                  <div className="relative">
                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <input 
                       type="tel" 
                       value={formData.phone}
                       onChange={e => setFormData({...formData, phone: e.target.value})}
                       className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm font-medium" 
                     />
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
               <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-2">Preferences</h3>
               
               <label className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Bell className="h-4 w-4" /></div>
                     <span className="text-sm font-bold text-slate-700">Push Notifications</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500" />
               </label>

               <label className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><Navigation className="h-4 w-4" /></div>
                     <span className="text-sm font-bold text-slate-700">Real-time Tracking</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500" />
               </label>
            </div>

            <div className="pt-4 px-2">
               {isSaved && (
                 <p className="text-emerald-600 text-xs font-bold text-center mb-4 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Profile updated successfully
                 </p>
               )}
               <Button variant="primary" size="lg" className="w-full h-14 rounded-2xl shadow-lg shadow-primary-200 text-lg font-bold" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Save Changes'}
               </Button>
            </div>
         </form>

      </main>

      {/* Simple Mobile Nav for Settings page (Back button) */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 p-4 z-40">
         <Button variant="outline" className="w-full rounded-2xl h-12 font-bold" onClick={() => window.history.back()}>
            Back to Dashboard
         </Button>
      </footer>

    </div>
  );
}
