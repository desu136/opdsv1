'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, pharmacySidebarItems } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Lock,
  Bell,
  Loader2
} from 'lucide-react';

export default function PharmacySettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const fetchProfile = async () => {
    if (!user?.pharmacy?.id) return;
    try {
      const res = await fetch(`/api/pharmacies/${user.pharmacy.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pharmacies/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address
        })
      });
      if (res.ok) {
        alert('Settings updated successfully!');
        window.location.reload(); // Refresh to update sidebar/navbar
      } else {
        const data = await res.json();
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          items={pharmacySidebarItems} 
          userRole="Pharmacy" 
          userName={user?.pharmacy?.name || user?.name || 'Pharmacist'} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
               <h1 className="text-2xl font-bold text-slate-900">Pharmacy Settings</h1>
               <p className="text-slate-500">Manage your branch profile, operating hours, and system preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Settings Nav */}
              <div className="col-span-1 space-y-2">
                 <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-primary-700 font-bold rounded-xl shadow-sm border border-slate-200">
                   <Building2 className="h-5 w-5" /> Store Profile
                 </button>
                 <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white font-medium rounded-xl transition-colors">
                   <Clock className="h-5 w-5 text-slate-400" /> Operating Hours
                 </button>
                 <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white font-medium rounded-xl transition-colors">
                   <Bell className="h-5 w-5 text-slate-400" /> Notifications
                 </button>
                 <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white font-medium rounded-xl transition-colors">
                   <Lock className="h-5 w-5 text-slate-400" /> Security & Access
                 </button>
              </div>

              {/* Settings Form Area */}
              <div className="col-span-2 space-y-6">
                 
                 <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Store Information</h2>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700">Official Pharmacy Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input 
                            type="text" 
                            value={profile?.name || ''} 
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-700">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input 
                              type="text" 
                              value={profile?.phone || ''} 
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" 
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-700">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input 
                              type="email" 
                              value={profile?.email || ''} 
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700">Physical Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <textarea 
                            rows={3} 
                            value={profile?.address || ''} 
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            placeholder="Store location..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                       <Button variant="primary" size="lg" className="rounded-xl px-8 shadow-md" disabled={isSaving}>
                         {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
                       </Button>
                    </div>
                 </form>

                 <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Verification Status</h2>
                    <div className={`flex items-center gap-4 p-4 rounded-2xl ${profile?.status === 'ACTIVE' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                       <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${profile?.status === 'ACTIVE' ? 'bg-green-100' : 'bg-amber-100'}`}>
                         <ShieldCheck className={`h-6 w-6 ${profile?.status === 'ACTIVE' ? 'text-green-600' : 'text-amber-600'}`} />
                       </div>
                       <div>
                         <h3 className={`font-bold leading-tight ${profile?.status === 'ACTIVE' ? 'text-green-900' : 'text-amber-900'}`}>
                           {profile?.status === 'ACTIVE' ? 'Ministry of Health Verified' : 'Under Review'}
                         </h3>
                         <p className={`text-sm mt-1 ${profile?.status === 'ACTIVE' ? 'text-green-700' : 'text-amber-700'}`}>
                           License {profile?.licenseNumber} is {profile?.status === 'ACTIVE' ? 'active' : 'being verified by the admin'}.
                         </p>
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
