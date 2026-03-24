'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminSidebarItems } from '@/components/layout/Sidebar';
import { 
  User, 
  Settings, 
  Shield, 
  Lock,
  Loader2,
  CheckCircle2,
  Camera,
  AlertCircle,
  Globe,
  CreditCard,
  Bell,
  Link as LinkIcon,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('platform'); // platform, profile, password
  
  // Profile State
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

  // Platform State (Mock)
  const [platformData, setPlatformData] = useState({
    platformName: 'EthioPharma Delivery Network',
    baseFee: '50',
    commission: '5',
    autoApproval: false,
    maintenanceMode: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        image: (user as any).image || '',
      });
    }
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
        showMessage('success', 'Profile updated successfully');
      } else {
        showMessage('error', 'Failed to update profile');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showMessage('error', 'Passwords do not match');
    }
    
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleSavePlatform = async () => {
    setIsLoading(true);
    // Simulate API call for platform settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    showMessage('success', 'Platform settings saved successfully');
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
        // Also update immediately in DB
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

  if (!user) return null;

  return (
    <DashboardLayout items={adminSidebarItems} title="Platform Admin Settings">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
           <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
           <p className="text-slate-500">Configure global platform rules, integrations, and your admin account.</p>
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
                      {user?.name?.charAt(0) || 'A'}
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
                <h3 className="mt-4 font-bold text-slate-900">{user.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Super Administrator</p>
              </div>

              <div className="space-y-1">
                {[
                  { id: 'platform', label: 'Platform Settings', icon: Globe },
                  { id: 'profile', label: 'Admin Profile', icon: User },
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
                
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Internal Tools</p>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 text-sm hover:text-primary-600 transition-colors">
                    <Database className="h-4 w-4" /> Database Backup
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 text-sm hover:text-primary-600 transition-colors">
                    <CreditCard className="h-4 w-4" /> Payment Logs
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="lg:w-3/4">
            
            {/* Platform Settings Tab */}
            {activeTab === 'platform' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                  <Globe className="h-6 w-6 text-primary-600" /> Platform Configuration
                </h2>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Platform Name</label>
                       <input 
                         type="text" 
                         value={platformData.platformName}
                         onChange={e => setPlatformData({...platformData, platformName: e.target.value})}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Base Delivery Fee (ETB)</label>
                       <input 
                         type="number" 
                         value={platformData.baseFee}
                         onChange={e => setPlatformData({...platformData, baseFee: e.target.value})}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Platform Commission (%)</label>
                       <input 
                         type="number" 
                         value={platformData.commission}
                         onChange={e => setPlatformData({...platformData, commission: e.target.value})}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
                       />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Features Control</h3>
                    
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Allow Automatic Pharmacy Approval</p>
                        <p className="text-xs text-slate-500">New pharmacies will bypass manual Admin review if license is verified.</p>
                      </div>
                      <div className="relative inline-flex items-center">
                        <input 
                          type="checkbox" 
                          checked={platformData.autoApproval}
                          onChange={e => setPlatformData({...platformData, autoApproval: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Platform Maintenance Mode</p>
                        <p className="text-xs text-slate-500">Temporarily block customer ordering for system upgrades.</p>
                      </div>
                      <div className="relative inline-flex items-center">
                        <input 
                          type="checkbox" 
                          checked={platformData.maintenanceMode}
                          onChange={e => setPlatformData({...platformData, maintenanceMode: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </div>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button variant="primary" size="lg" className="rounded-2xl px-10 shadow-lg" onClick={handleSavePlatform} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Save Platform Settings'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                  <User className="h-6 w-6 text-primary-600" /> Admin Personal Information
                </h2>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
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
                      <label className="text-sm font-bold text-slate-700">Admin Email</label>
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
                    <Button variant="primary" size="lg" className="rounded-2xl px-10 shadow-lg" type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Save Admin Profile'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                  <Shield className="h-6 w-6 text-primary-600" /> Administrative Security
                </h2>
                
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Current Admin Password</label>
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
                    <label className="text-sm font-bold text-slate-700">New Admin Password</label>
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
                    <Button variant="primary" size="lg" className="w-full rounded-2xl shadow-lg" type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Update Admin Password'}
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
