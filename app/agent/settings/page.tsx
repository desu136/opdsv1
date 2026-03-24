'use client';

import React, { useState, useEffect } from 'react';
import { agentSidebarItems } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  User, 
  Phone, 
  CheckCircle2,
  Bell,
  Navigation,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
    <DashboardLayout items={agentSidebarItems} title="Agent Settings">
      <div className="max-w-2xl mx-auto py-8 px-4 text-slate-900">
         
         <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center mb-8">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-700 font-black text-3xl border-4 border-white shadow-md">
               {user?.name?.[0] || 'A'}
            </div>
            <h2 className="font-black text-slate-900 text-xl">{user?.name}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Verified Delivery Partner</p>
         </div>

         <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Personal Details</h3>
               
               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                     <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm font-bold" 
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone Number</label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm font-bold" 
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Job Preferences</h3>
               
               <div className="space-y-2">
                 <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><Bell className="h-5 w-5" /></div>
                       <span className="text-sm font-black text-slate-700 uppercase">Push Notifications</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-6 h-6 rounded-lg border-slate-200 text-primary-600 focus:ring-primary-500 transition-all" />
                 </label>

                 <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform"><Navigation className="h-5 w-5" /></div>
                       <span className="text-sm font-black text-slate-700 uppercase">Real-time Location</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-6 h-6 rounded-lg border-slate-200 text-primary-600 focus:ring-primary-500 transition-all" />
                 </label>
               </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
               {isSaved && (
                 <p className="text-emerald-600 text-[10px] font-black uppercase flex items-center gap-1.5 animate-in zoom-in-95">
                    <CheckCircle2 className="h-4 w-4" /> Profile updated successfully
                 </p>
               )}
               <Button variant="primary" size="lg" className="w-full h-14 rounded-2xl shadow-xl shadow-primary-200 text-sm font-black uppercase tracking-widest" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Profile Changes'}
               </Button>
               <Button variant="ghost" className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600" onClick={(e) => { e.preventDefault(); window.history.back(); }}>
                 Return to Dashboard
               </Button>
            </div>
         </form>
      </div>
    </DashboardLayout>
  );
}
