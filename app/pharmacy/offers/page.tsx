'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { pharmacySidebarItems } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Plus, 
  Tag, 
  Calendar, 
  Trash2, 
  Edit2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Upload,
  Search,
  ChevronRight,
  ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SpecialOffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = async () => {
    if (!user?.pharmacy?.id) return;
    try {
      const [offersRes, invRes] = await Promise.all([
        fetch(`/api/offers?pharmacyId=${user.pharmacy.id}`),
        fetch(`/api/inventory?pharmacyId=${user.pharmacy.id}`)
      ]);
      
      if (offersRes.ok) setOffers(await offersRes.json());
      if (invRes.ok) setInventory(await invRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const body = {
      title: formData.get('title'),
      productId: formData.get('productId'),
      discountPct: formData.get('discountPct'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      imageUrl: formData.get('imageUrl') || editingOffer?.imageUrl || ''
    };

    try {
      const url = editingOffer ? `/api/offers/${editingOffer.id}` : '/api/offers';
      const method = editingOffer ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        showMessage('success', `Offer ${editingOffer ? 'updated' : 'created'} successfully`);
        setIsModalOpen(false);
        setEditingOffer(null);
        fetchData();
      } else {
        const err = await res.json();
        showMessage('error', err.message || 'Operation failed');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('success', 'Offer deleted');
        fetchData();
      }
    } catch (err) {
      showMessage('error', 'Delete failed');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'offers');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        if (editingOffer) {
          setEditingOffer({ ...editingOffer, imageUrl: data.url });
        } else {
          // Temporarily store in a state if adding new? 
          // Actually let's just use a hidden input or state
          (document.getElementById('offer-imageUrl') as HTMLInputElement).value = data.url;
          showMessage('success', 'Image uploaded');
        }
      }
    } catch (err) {
      showMessage('error', 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const isOfferActive = (endDate: string) => {
    return new Date(endDate) > new Date();
  };

  return (
    <DashboardLayout items={pharmacySidebarItems} title="Special Offers">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Offers</h1>
          <p className="text-slate-500 text-sm">Boost your sales with limited-time discounts.</p>
        </div>
        <Button 
          onClick={() => { setEditingOffer(null); setIsModalOpen(true); }} 
          className="rounded-2xl shadow-lg shadow-primary-500/20 px-6"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Offer
        </Button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium text-sm text-slate-900">{message.text}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-300">
            <Tag className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No active offers</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">Create your first special offer to attract more customers to your pharmacy.</p>
          <Button variant="ghost" className="mt-6 text-primary-600 font-bold" onClick={() => setIsModalOpen(true)}>Create Offer Now</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const active = isOfferActive(offer.endDate);
            return (
              <div key={offer.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overlow-hidden">
                <div className={`absolute top-4 right-4 z-10 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {active ? 'Active' : 'Expired'}
                </div>
                
                <div className="aspect-video w-full bg-slate-50 rounded-2xl mb-4 overflow-hidden relative border border-slate-100">
                  {offer.imageUrl ? (
                    <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg">-{offer.discountPct}% OFF</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-primary-600 transition-colors">{offer.title}</h3>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-tight">
                    <Tag className="h-3 w-3" />
                    <span className="truncate">{offer.product?.name}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                       <Calendar className="h-3 w-3" />
                       {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50" onClick={() => { setEditingOffer(offer); setIsModalOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(offer.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h2>
                <p className="text-xs text-slate-500 font-medium">Configure your medicine promotion</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center hover:bg-slate-200 rounded-full transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Offer Title</label>
                  <input name="title" required defaultValue={editingOffer?.title} type="text" className="w-full px-4 py-4 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900" placeholder="e.g. Immunity Booster Week" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Select Product</label>
                  <select name="productId" required defaultValue={editingOffer?.productId} className="w-full px-4 py-4 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900 appearance-none cursor-pointer">
                    <option value="" disabled>Select from inventory...</option>
                    {inventory.map(item => <option key={item.id} value={item.id}>{item.name} (-{item.price} ETB)</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Discount (%)</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input name="discountPct" required defaultValue={editingOffer?.discountPct} type="number" step="0.1" max="99" className="w-full pl-10 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl outline-none font-black text-rose-600" placeholder="20" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Banner Image</label>
                  <div className="relative">
                    <input id="offer-imageUrl" name="imageUrl" type="hidden" defaultValue={editingOffer?.imageUrl} />
                    <Button variant="ghost" type="button" className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:bg-primary-50 group transition-all relative">
                      {isUploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ImageIcon className="h-5 w-5 mr-2 group-hover:text-primary-600" />}
                      <span className="text-xs font-bold">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Start Date</label>
                  <input name="startDate" required defaultValue={editingOffer ? new Date(editingOffer.startDate).toISOString().split('T')[0] : ''} type="date" className="w-full px-4 py-4 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900" />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">End Date</label>
                  <input name="endDate" required defaultValue={editingOffer ? new Date(editingOffer.endDate).toISOString().split('T')[0] : ''} type="date" className="w-full px-4 py-4 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900" />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl font-bold h-14">Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSaving} className="flex-1 rounded-2xl font-black h-14 shadow-xl shadow-primary-200 uppercase tracking-widest">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : editingOffer ? 'Update Offer' : 'Launch Offer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
