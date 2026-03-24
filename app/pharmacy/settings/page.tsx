'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { pharmacySidebarItems } from '@/components/layout/Sidebar';
import { 
  Building2, 
  User, 
  Shield, 
  Lock,
  Loader2,
  CheckCircle2,
  Camera,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function PharmacySettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pharmacy'); // pharmacy, profile, password
  
  // Pharmacy Profile State
  const [pharmacyData, setPharmacyData] = useState<any>(null);
  
  // Personal Profile State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  
  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchPharmacyProfile = async () => {
    if (!user?.pharmacy?.id) return;
    try {
      const res = await fetch(`/api/pharmacies/${user.pharmacy.id}`);
      if (res.ok) {
        const data = await res.json();
        setPharmacyData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        image: (user as any).image || '',
      });
      fetchPharmacyProfile();
    }
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdatePersonalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          image: profileData.image
        })
      });
      if (res.ok) {
        showMessage('success', 'Personal profile updated');
      } else {
        showMessage('error', 'Update failed');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePharmacyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyData) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pharmacies/${pharmacyData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pharmacyData.name,
          email: pharmacyData.email,
          phone: pharmacyData.phone,
          address: pharmacyData.address,
          lat: pharmacyData.lat,
          lng: pharmacyData.lng
        })
      });
      if (res.ok) {
        showMessage('success', 'Pharmacy profile updated');
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Update failed');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showMessage('error', 'Passwords do not match');
    }
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (res.ok) {
        showMessage('success', 'Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Failed to change password');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); 

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setProfileData((prev: any) => ({ ...prev, image: data.url }));
        await fetch(`/api/users/${user?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: data.url })
        });
        showMessage('success', 'Avatar updated');
      }
    } catch (err) {
      showMessage('error', 'Image upload failed');
    } finally {
      setIsUploading(false);
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
    <DashboardLayout items={pharmacySidebarItems} title="Pharmacy Settings">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
           <h1 className="text-2xl font-bold text-slate-900">Pharmacy & Account Settings</h1>
           <p className="text-slate-500">Manage your pharmacy store profile and your personal account settings.</p>
        </div>

        {/* Status Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <div className="text-center mb-8 relative group">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary-50 border-4 border-white shadow-md overflow-hidden relative">
                  {profileData.image ? (
                    <img src={profileData.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-600 text-3xl font-bold">
                      {user?.name?.charAt(0) || 'P'}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{user?.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Pharmacist</p>
              </div>

              <div className="space-y-1">
                {[
                  { id: 'pharmacy', label: 'Store Profile', icon: Building2 },
                  { id: 'profile', label: 'Personal Info', icon: User },
                  { id: 'password', label: 'Password & Security', icon: Lock },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === tab.id 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="lg:w-3/4">
            
            {/* Pharmacy Profile Tab */}
            {activeTab === 'pharmacy' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                    <Building2 className="h-6 w-6 text-primary-600" /> Pharmacy Information
                  </h2>
                  
                  <form onSubmit={handleUpdatePharmacyProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700">Official Pharmacy Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input 
                            type="text" 
                            value={pharmacyData?.name || ''}
                            onChange={e => setPharmacyData({...pharmacyData, name: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="Pharmacy Name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input 
                            type="tel" 
                            value={pharmacyData?.phone || ''}
                            onChange={e => setPharmacyData({...pharmacyData, phone: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="+251 ..."
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input 
                            type="email" 
                            value={pharmacyData?.email || ''}
                            onChange={e => setPharmacyData({...pharmacyData, email: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="pharmacy@example.com"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700">Physical Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <textarea 
                            value={pharmacyData?.address || ''}
                            onChange={e => setPharmacyData({...pharmacyData, address: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px]"
                            placeholder="Detailed address..."
                          />
                        </div>
                      </div>

                      <div className="space-y-4 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-slate-700">Exact Store Coordinates</label>
                          <button 
                            type="button"
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  (pos) => {
                                    setPharmacyData({
                                      ...pharmacyData,
                                      lat: parseFloat(pos.coords.latitude.toFixed(6)),
                                      lng: parseFloat(pos.coords.longitude.toFixed(6))
                                    });
                                    showMessage('success', 'Location detected!');
                                  },
                                  (err) => showMessage('error', 'Location access denied')
                                );
                              }
                            }}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors border border-primary-100"
                          >
                            <MapPin className="h-3 w-3" /> Detect My Location
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">Latitude</label>
                            <input 
                              type="number" 
                              step="any"
                              value={pharmacyData?.lat || ''}
                              onChange={e => setPharmacyData({...pharmacyData, lat: parseFloat(e.target.value)})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                              placeholder="e.g. 9.0249"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">Longitude</label>
                            <input 
                              type="number" 
                              step="any"
                              value={pharmacyData?.lng || ''}
                              onChange={e => setPharmacyData({...pharmacyData, lng: parseFloat(e.target.value)})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                              placeholder="e.g. 38.7468"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic">Coordinates are used to calculate accurate distance for customers.</p>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button variant="primary" size="lg" className="rounded-2xl px-10 shadow-lg" type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Update Pharmacy profile'}
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Verification Status</h2>
                  <div className={`flex items-center gap-4 p-4 rounded-2xl ${pharmacyData?.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${pharmacyData?.status === 'ACTIVE' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      <ShieldCheck className={`h-6 w-6 ${pharmacyData?.status === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-bold leading-tight ${pharmacyData?.status === 'ACTIVE' ? 'text-emerald-900' : 'text-amber-900'}`}>
                        {pharmacyData?.status === 'ACTIVE' ? 'MOH Verified Pharmacy' : 'Compliance Review'}
                      </h3>
                      <p className={`text-sm mt-1 ${pharmacyData?.status === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        License {pharmacyData?.licenseNumber} is {pharmacyData?.status === 'ACTIVE' ? 'fully verified' : 'under active review'}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                  <User className="h-6 w-6 text-primary-600" /> Personal Information
                </h2>
                
                <form onSubmit={handleUpdatePersonalProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2 opacity-60">
                      <label className="text-sm font-bold text-slate-700">Email Address</label>
                      <input 
                        type="email" 
                        value={profileData.email}
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button variant="primary" size="lg" className="rounded-2xl px-10 shadow-lg" type="submit" disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                  <Shield className="h-6 w-6 text-primary-600" /> Password & Security
                </h2>
                
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="password" 
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="password" 
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        placeholder="New Password"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="password" 
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        placeholder="Confirm Password"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="primary" size="lg" className="w-full rounded-2xl shadow-lg" type="submit" disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
