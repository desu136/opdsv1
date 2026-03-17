'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { customerSidebarItems } from '@/components/layout/Sidebar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Lock,
  Loader2,
  CheckCircle2,
  Trash2,
  Plus,
  Camera,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CustomerSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // profile, password, addresses
  
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
  
  // Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    city: '',
    subCity: '',
    street: '',
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
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

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

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress)
      });
      if (res.ok) {
        await fetchAddresses();
        setIsAddingAddress(false);
        setNewAddress({ city: '', subCity: '', street: '' });
        showMessage('success', 'Address added successfully');
      }
    } catch (err) {
      showMessage('error', 'Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAddresses(prev => prev.filter((a: any) => a.id !== id));
        showMessage('success', 'Address deleted');
      }
    } catch (err) {
      showMessage('error', 'Failed to delete address');
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
    <DashboardLayout items={customerSidebarItems} title="Settings">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
           <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
           <p className="text-slate-500">Manage your profile, security, and addresses.</p>
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
                      {user.name.charAt(0)}
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
                <p className="text-xs text-slate-500 uppercase tracking-wider">{user.role}</p>
              </div>

              <div className="space-y-1">
                {[
                  { id: 'profile', label: 'Personal Info', icon: User },
                  { id: 'password', label: 'Password & Security', icon: Lock },
                  { id: 'addresses', label: 'Address Book', icon: MapPin },
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
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User className="h-6 w-6 text-primary-600" /> Personal Information
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
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2 opacity-60">
                      <label className="text-sm font-bold text-slate-700">Email Address (Persistent)</label>
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
                        placeholder="+251 ..."
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button variant="primary" size="lg" className="rounded-2xl px-10 shadow-lg" type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in duration-500">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
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
                    <Button variant="primary" size="lg" className="w-full rounded-2xl shadow-lg" type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary-600" /> Delivery Addresses
                  </h2>
                  <Button variant="outline" size="sm" className="rounded-xl flex items-center gap-2" onClick={() => setIsAddingAddress(!isAddingAddress)}>
                    {isAddingAddress ? <Trash2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isAddingAddress ? 'Cancel' : 'Add New'}
                  </Button>
                </div>

                {isAddingAddress && (
                  <div className="bg-primary-50 p-6 rounded-3xl border border-primary-100 shadow-sm animate-in zoom-in-95 duration-200">
                    <h3 className="font-bold text-primary-900 mb-4">Add New Address</h3>
                    <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-primary-700 px-1">City</label>
                        <input 
                          type="text" 
                          value={newAddress.city}
                          onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                          placeholder="Addis Ababa"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-primary-700 px-1">Sub-City</label>
                        <input 
                          type="text" 
                          value={newAddress.subCity}
                          onChange={e => setNewAddress({...newAddress, subCity: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                          placeholder="Bole / Kirkos"
                          required
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-primary-700 px-1">Street / House No.</label>
                        <input 
                          type="text" 
                          value={newAddress.street}
                          onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                          placeholder="Street name, landmark..."
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Button variant="primary" className="rounded-xl px-8" type="submit" disabled={isLoading}>
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Save Address'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {addresses.length > 0 ? addresses.map((addr: any) => (
                    <div key={addr.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                          <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h4 className="font-bold text-slate-900">{addr.city}, {addr.subCity}</h4>
                             {addr.isDefault && <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">Default</span>}
                          </div>
                          <p className="text-sm text-slate-500">{addr.street || 'No street details provided'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )) : (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 border-dashed text-center">
                       <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                       <h3 className="font-bold text-slate-900 mb-1">No addresses saved</h3>
                       <p className="text-sm text-slate-500">Add a delivery address to speed up your checkout flow.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
