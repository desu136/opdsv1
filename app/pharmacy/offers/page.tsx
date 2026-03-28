'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { pharmacySidebarItems } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { Tag, Plus, Upload, X, Loader2, Calendar, Pill, CheckCircle2, Clock, Trash, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function PromotionsPage() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('GENERAL');
  const [productId, setProductId] = useState('');
  const [discountPct, setDiscountPct] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'PHARMACIST') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [promosRes, invRes] = await Promise.all([
        fetch('/api/pharmacy/offers'),
        fetch('/api/inventory')
      ]);
      if (promosRes.ok) setPromotions(await promosRes.json());
      if (invRes.ok) setInventory(await invRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setImageFile(file);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
      } else if (res.ok && data.secure_url) {
        setImageUrl(data.secure_url);
      }
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/pharmacy/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          productId: type === 'MEDICINE' ? productId : null,
          discountPct: Number(discountPct),
          startDate,
          endDate,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1550572017-edb3f54d6fb2?w=800&q=80', // Fallback
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create promotion');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setType('GENERAL');
    setProductId('');
    setDiscountPct(10);
    setStartDate('');
    setEndDate('');
    setImageFile(null);
    setImageUrl('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    try {
      const res = await fetch(`/api/pharmacy/offers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await fetch(`/api/pharmacy/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusDisplay = (offer: any) => {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);

    if (offer.status === 'INACTIVE') {
      return <span className="px-2 py-1 text-xs font-bold bg-slate-100 text-slate-500 rounded-lg flex items-center gap-1"><X className="h-3 w-3"/> Inactive</span>;
    }
    if (now > end) {
      return <span className="px-2 py-1 text-xs font-bold bg-red-50 text-red-600 rounded-lg flex items-center gap-1"><Clock className="h-3 w-3"/> Expired</span>;
    }
    if (now < start) {
      return <span className="px-2 py-1 text-xs font-bold bg-amber-50 text-amber-600 rounded-lg flex items-center gap-1"><Calendar className="h-3 w-3"/> Scheduled</span>;
    }
    return <span className="px-2 py-1 text-xs font-bold bg-green-50 text-green-600 rounded-lg flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Active</span>;
  };

  if (!user || isLoading) {
    return (
      <DashboardLayout items={pharmacySidebarItems} title="Promotions">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout items={pharmacySidebarItems} title="Promotions Management">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Active Promotions</h1>
          <p className="text-slate-500 text-sm mt-1">Manage marketing banners and discounts for your pharmacy.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="rounded-xl px-5 h-11 shrink-0">
          <Plus className="h-5 w-5 mr-2" />
          Create Promotion
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((offer) => (
          <div key={offer.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col group relative">
            <div className="h-40 w-full relative overflow-hidden bg-slate-100">
              <img src={offer.imageUrl || 'https://images.unsplash.com/photo-1550572017-edb3f54d6fb2?w=800'} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700 tabular-nums">
                {offer.discountPct}% OFF
              </div>
              <div className="absolute top-3 right-3">
                {getStatusDisplay(offer)}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">{offer.title}</h3>
              {offer.productId && offer.product ? (
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mb-4">
                  <Pill className="h-4 w-4" /> {offer.product.name}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mb-4">
                  <Store className="h-4 w-4" /> Store-wide Promotion
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-4 border-t border-slate-100">
                <span>{new Date(offer.startDate).toLocaleDateString()}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{new Date(offer.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Hover Actions Layer */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
               <button onClick={() => toggleStatus(offer.id, offer.status)} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-50 transition-colors">
                 {offer.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
               </button>
               <button onClick={() => handleDelete(offer.id)} className="bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition-colors">
                 <Trash className="h-5 w-5" />
               </button>
            </div>
          </div>
        ))}
        {promotions.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
            <Tag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No promotions found.</p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)} className="mt-4 rounded-xl">Create your first promotion</Button>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create Promotion</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
               {/* Image Upload Area */}
               <div className="relative group cursor-pointer" onClick={() => document.getElementById('promo-image-upload')?.click()}>
                 <div className={`w-full h-40 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${imageUrl ? 'border-primary-500 bg-white' : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/50'}`}>
                   {imageUrl ? (
                     <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                     <div className="text-center p-4 flex flex-col items-center">
                       {isUploading ? <Loader2 className="h-8 w-8 text-primary-500 animate-spin mb-2" /> : <Upload className="h-8 w-8 text-slate-400 mb-2 group-hover:text-primary-500 group-hover:-translate-y-1 transition-all" />}
                       <p className="text-sm font-bold text-slate-600 group-hover:text-primary-700">Upload Banner Image</p>
                       <p className="text-xs text-slate-400 mt-1">16:9 aspect ratio recommended</p>
                     </div>
                   )}
                   <input type="file" id="promo-image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>
               </div>

               <div className="space-y-1">
                 <label className="text-sm font-semibold text-slate-700">Promotion Title</label>
                 <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Wellness Discount" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-sm font-semibold text-slate-700">Type</label>
                   <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-medium">
                     <option value="GENERAL">General Pharmacy</option>
                     <option value="MEDICINE">Specific Medicine</option>
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-sm font-semibold text-slate-700">Discount Percentage</label>
                   <div className="relative">
                     <input type="number" min="1" max="100" required value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10" />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                   </div>
                 </div>
               </div>

               {type === 'MEDICINE' && (
                 <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                   <label className="text-sm font-semibold text-slate-700">Select Medicine</label>
                   <select required value={productId} onChange={e => setProductId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-medium">
                     <option value="">-- Choose a Product --</option>
                     {inventory.map(item => (
                       <option key={item.id} value={item.id}>{item.name} (${item.price})</option>
                     ))}
                   </select>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-sm font-semibold text-slate-700">Start Date</label>
                   <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-sm font-semibold text-slate-700">End Date</label>
                   <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                 </div>
               </div>

               <div className="pt-4 mt-6 border-t border-slate-100 flex gap-3 pb-8">
                 <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl h-12">Cancel</Button>
                 <Button type="submit" variant="primary" className="flex-1 rounded-xl h-12" disabled={isSubmitting || isUploading}>
                   {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Saving...</> : 'Publish Promotion'}
                 </Button>
               </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
