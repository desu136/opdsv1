'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { pharmacySidebarItems } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Image as ImageIcon, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Camera,
  Store,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PharmacyProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null); // 'logo' or 'cover'
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProfile = async () => {
    if (!user?.pharmacy?.id) return;
    try {
      const res = await fetch(`/api/pharmacies/${user.pharmacy.id}`);
      if (res.ok) {
        const profile = await res.json();
        setData(profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pharmacies/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          address: data.address,
          description: data.description,
          workingHours: data.workingHours,
          logoUrl: data.logoUrl,
          coverImageUrl: data.coverImageUrl,
          lat: data.lat,
          lng: data.lng
        })
      });

      if (res.ok) {
        showMessage('success', 'Pharmacy profile updated successfully');
      } else {
        const error = await res.json();
        showMessage('error', error.message || 'Update failed');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and type
    if (file.size > 5 * 1024 * 1024) return showMessage('error', 'File size must be less than 5MB');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return showMessage('error', 'Only JPG, PNG and WEBP allowed');

    setIsUploading(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'branding');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await res.json();
      if (uploadData.url) {
        setData((prev: any) => ({ 
          ...prev, 
          [type === 'logo' ? 'logoUrl' : 'coverImageUrl']: uploadData.url 
        }));
        showMessage('success', `${type === 'logo' ? 'Logo' : 'Cover image'} uploaded`);
      }
    } catch (err) {
      showMessage('error', 'Upload failed');
    } finally {
      setIsUploading(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout items={pharmacySidebarItems} title="Pharmacy Branding">
        <div className="flex items-center justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout items={pharmacySidebarItems} title="Pharmacy Branding">
      <div className="max-w-4xl mx-auto pb-12">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Pharmacy Profile</h1>
            <p className="text-slate-500 text-sm">Manage how your pharmacy appears to customers.</p>
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

        {/* Status Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-8">
          
          {/* Cover & Logo Section */}
          <div className="relative">
            {/* Cover Image Upload */}
            <div className="relative h-64 md:h-80 w-full bg-slate-100 rounded-[2.5rem] overflow-hidden group border border-slate-200">
              {data.coverImageUrl ? (
                <img src={data.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                  <ImageIcon className="h-12 w-12" />
                  <span className="text-sm font-bold uppercase tracking-widest">No Cover Image</span>
                </div>
              )}
              {isUploading === 'cover' && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              )}
              <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <Camera className="h-8 w-8 text-white mb-2" />
                <span className="text-white text-xs font-bold uppercase tracking-widest">Change Cover Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
              </label>
            </div>

            {/* Logo Upload (Floating) */}
            <div className="absolute -bottom-8 left-8 md:left-12">
              <div className="relative h-32 w-32 md:h-40 md:w-40 bg-white rounded-3xl p-1.5 shadow-2xl group border border-slate-100">
                <div className="w-full h-full rounded-[1.2rem] overflow-hidden bg-slate-50 relative border border-slate-50">
                  {data.logoUrl ? (
                    <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-400">
                      <Store className="h-12 w-12" />
                    </div>
                  )}
                  {isUploading === 'logo' && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <Camera className="h-6 w-6 text-white mb-1" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-tighter">Edit Logo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
            
            {/* Left Column: Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">General Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Official Pharmacy Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <input 
                        type="text" 
                        value={data.name || ''}
                        onChange={e => setData({...data, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white border border-transparent focus:border-primary-100 outline-none transition-all font-bold text-slate-900"
                        placeholder="Pharmacy Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Description / About</label>
                    <textarea 
                      value={data.description || ''}
                      onChange={e => setData((prev: any) => ({...prev, description: e.target.value}))}
                      rows={5}
                      className="w-full p-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white border border-transparent focus:border-primary-100 outline-none transition-all font-medium text-slate-700 leading-relaxed"
                      placeholder="Tell customers about your pharmacy, specialties, and experience..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Physical Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                      <textarea 
                        value={data.address || ''}
                        onChange={e => setData({...data, address: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white border border-transparent focus:border-primary-100 outline-none transition-all font-medium text-slate-700 min-h-[100px]"
                        placeholder="Detailed physical address..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Operations & Location */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">Availability</h3>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Working Hours
                  </label>
                  <input 
                    type="text" 
                    value={data.workingHours || ''}
                    onChange={e => setData({...data, workingHours: e.target.value})}
                    className="w-full px-4 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white border border-transparent focus:border-primary-100 outline-none transition-all font-bold text-slate-900"
                    placeholder="e.g. Mon-Sat: 8AM-10PM"
                  />
                  <p className="mt-2 text-[10px] text-slate-400 font-medium">Displayed prominently on your store page.</p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <h3 className="text-lg font-black text-slate-900">Map Location</h3>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setData({...data, lat: pos.coords.latitude, lng: pos.coords.longitude});
                            showMessage('success', 'Exact location updated!');
                          },
                          () => showMessage('error', 'Location access denied')
                        );
                      }
                    }}
                    className="h-8 w-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={data.lat || ''}
                      onChange={e => setData({...data, lat: parseFloat(e.target.value)})}
                      className="w-full px-3 py-3 bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={data.lng || ''}
                      onChange={e => setData({...data, lng: parseFloat(e.target.value)})}
                      className="w-full px-3 py-3 bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic leading-tight">Accurate coordinates ensure customers can find you and calculate delivery time.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
