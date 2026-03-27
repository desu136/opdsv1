'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CustomerAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    city: '',
    subCity: '',
    street: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
      } else {
        showMessage('error', 'Failed to add address');
      }
    } catch (err) {
      showMessage('error', 'Network error');
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
      } else {
        showMessage('error', 'Failed to delete address');
      }
    } catch (err) {
      showMessage('error', 'Network error');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe">
      <Navbar />
      <main className="flex-grow pt-6 pb-24 container mx-auto px-4 max-w-5xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Delivery Addresses</h1>
             <p className="text-slate-500">Manage your locations for faster checkout and delivery.</p>
           </div>
           <Button 
             variant={isAddingAddress ? "outline" : "primary"} 
             className="rounded-2xl flex items-center gap-2 shadow-lg h-12 px-6"
             onClick={() => setIsAddingAddress(!isAddingAddress)}
           >
             {isAddingAddress ? <Trash2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
             {isAddingAddress ? 'Cancel' : 'Add New Address'}
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

        {/* Add Address Form */}
        {isAddingAddress && (
          <div className="bg-primary-50 p-8 rounded-[2rem] border border-primary-100 shadow-sm mb-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-primary-900 mb-6 flex items-center gap-2">
               <MapPin className="h-5 w-5" /> Create New Saved Address
            </h3>
            <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary-700 px-1">City</label>
                <input 
                  type="text" 
                  value={newAddress.city}
                  onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-primary-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  placeholder="e.g. Addis Ababa"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary-700 px-1">Sub-City</label>
                <input 
                  type="text" 
                  value={newAddress.subCity}
                  onChange={e => setNewAddress({...newAddress, subCity: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-primary-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  placeholder="e.g. Bole / Kirkos"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-primary-700 px-1">Street / House No. / Landmark</label>
                <input 
                  type="text" 
                  value={newAddress.street}
                  onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-primary-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  placeholder="Detailed street info..."
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button variant="primary" size="lg" className="rounded-2xl px-12 shadow-md h-12" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Save New Location'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isFetching ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto" />
              <p className="mt-4 text-slate-500 font-medium">Loading your address book...</p>
            </div>
          ) : addresses.length > 0 ? addresses.map((addr: any) => (
            <div key={addr.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all group relative overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className={`h-14 w-14 rounded-3xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-primary-50 text-primary-600' : 'bg-slate-50 text-slate-400'}`}>
                    <MapPin className="h-7 w-7" />
                  </div>
                  {addr.isDefault && (
                    <span className="text-[10px] font-black bg-primary-600 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary-600/20">
                      Primary
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-slate-900 mb-2 truncate">
                    {addr.city}
                  </h4>
                  <p className="text-primary-600 font-bold text-sm mb-4 uppercase tracking-tighter">
                    {addr.subCity}
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                    {addr.street || 'No street details provided'}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex -space-x-1 opacity-40">
                      {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-200 border-2 border-white" />)}
                   </div>
                   <button 
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="flex items-center gap-2 text-slate-400 hover:text-rose-600 font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
              
              {/* Subtle accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${addr.isDefault ? 'bg-primary-600' : 'bg-slate-100'}`} />
            </div>
          )) : (
            <div className="col-span-full bg-slate-50 py-24 rounded-[3rem] border-2 border-dashed border-slate-200 text-center px-6">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                 <MapPin className="h-10 w-10 text-slate-300" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">No addresses saved yet</h3>
               <p className="text-slate-500 max-w-sm mx-auto mb-10">
                 Adding a delivery address helps us show you pharmacies closer to you and speeds up your ordering process.
               </p>
               <Button 
                variant="primary" 
                size="lg" 
                className="rounded-2xl px-12 shadow-xl"
                onClick={() => setIsAddingAddress(true)}
               >
                 Create First Address
               </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
