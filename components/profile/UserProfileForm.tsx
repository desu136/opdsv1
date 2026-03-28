'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { User, Mail, Phone, Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const UserProfileForm = () => {
  const { user, checkSession } = useAuth();
  const [data, setData] = useState({
    name: '',
    email: '',
    phone: '',
    image: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/profile');
        if (res.ok) {
          const profile = await res.json();
          setData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            image: profile.image || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        showMessage('success', 'Profile updated successfully.');
        await checkSession(); // Refresh the global Auth user
      } else {
        const error = await res.json();
        showMessage('error', error.error || 'Update failed');
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

    if (file.size > 5 * 1024 * 1024) return showMessage('error', 'File size must be less than 5MB');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return showMessage('error', 'Only JPG, PNG and WEBP allowed');

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'profiles');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await res.json();
      if (uploadData.url) {
        setData(prev => ({ ...prev, image: uploadData.url }));
        showMessage('success', 'Profile image uploaded successfully.');
      }
    } catch (err) {
      showMessage('error', 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Personal Profile</h1>
          <p className="text-slate-500 text-sm">Manage your personal account settings and preferences.</p>
        </div>
        <Button 
          onClick={handleUpdate} 
          disabled={isSaving}
          className="rounded-2xl shadow-lg shadow-primary-500/20 px-8 h-12"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
             <div className="relative group w-32 h-32 mb-6">
                <div className="w-full h-full rounded-3xl overflow-hidden bg-slate-100 shadow-inner border border-slate-200">
                  {data.image ? (
                    <img src={data.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                    </div>
                  )}
                  
                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <Camera className="h-6 w-6 text-white mb-1" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
             </div>
             
             <h3 className="font-bold text-slate-900 text-lg mb-1">{data.name || 'Your Name'}</h3>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">Account Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <input 
                    type="text" 
                    required
                    value={data.name}
                    onChange={e => setData({...data, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:border-primary-100 outline-none transition-all font-bold text-slate-900"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <input 
                    type="email" 
                    value={data.email}
                    onChange={e => setData({...data, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:border-primary-100 outline-none transition-all font-medium text-slate-900"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <input 
                    type="tel" 
                    value={data.phone}
                    onChange={e => setData({...data, phone: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:border-primary-100 outline-none transition-all font-medium text-slate-900"
                    placeholder="+251..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
