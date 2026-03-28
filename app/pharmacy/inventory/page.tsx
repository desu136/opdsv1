'use client';

import React, { useState, useEffect } from 'react';
import { pharmacySidebarItems } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Search,
  Plus,
  MoreVertical,
  AlertTriangle,
  Loader2,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PharmacyInventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Catalog Add Flow State
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogResults, setCatalogResults] = useState<any[]>([]);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [isCreatingNewMedicine, setIsCreatingNewMedicine] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchInventory = async () => {
    if (!user?.pharmacy?.id) return;
    try {
      const res = await fetch(`/api/inventory?pharmacyId=${user.pharmacy.id}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/medicines?creatorId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchRequests();
  }, [user]);

  const filteredItems = items.filter(item => {
    const medicineName = item.medicine?.name || '';
    const genericName = item.medicine?.genericName || '';
    const matchesSearch = medicineName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'low' && item.stock < 10);
    return matchesSearch && matchesTab;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInventory();
        fetchRequests();
      } else {
        const data = await res.json();
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    if (!catalogSearchQuery.trim()) {
      setCatalogResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsSearchingCatalog(true);
      try {
        const res = await fetch(`/api/medicines?search=${encodeURIComponent(catalogSearchQuery)}`);
        if (res.ok) setCatalogResults(await res.json());
      } catch (err) { } finally { setIsSearchingCatalog(false); }
    }, 500);
    setDebounceTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [catalogSearchQuery]);

  return (
    <DashboardLayout items={pharmacySidebarItems} title="Inventory Management">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
          <div>
             <h1 className="text-2xl font-bold">Medicine Stock</h1>
             <p className="text-slate-500">Manage your products, availability, and pricing.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="primary" className="rounded-xl shadow-sm h-11 px-4" onClick={() => setIsAddModalOpen(true)}>
               <Plus className="h-4 w-4 mr-2" /> Add New
             </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 text-slate-900">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>All Products</button>
            <button onClick={() => setActiveTab('low')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'low' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
              <AlertTriangle className="h-3 w-3" /> Low Stock
            </button>
            <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'requests' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>My Requests</button>
          </div>

          <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-slate-900">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                   {activeTab === 'requests' ? (
                     <>
                       <th className="p-4 pl-6 whitespace-nowrap">Medicine Name</th>
                       <th className="p-4 whitespace-nowrap">Category</th>
                       <th className="p-4 whitespace-nowrap">Status</th>
                     </>
                   ) : (
                     <>
                       <th className="p-4 pl-6 whitespace-nowrap">Product Name</th>
                       <th className="p-4 whitespace-nowrap">Price</th>
                       <th className="p-4 whitespace-nowrap">Stock</th>
                       <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
                     </>
                   )}
                 </tr>
               </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-400"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading...</td></tr>
                  ) : activeTab === 'requests' ? (
                    requests.length === 0 ? (
                      <tr><td colSpan={3} className="p-12 text-center text-slate-400 italic">No medicinal requests found.</td></tr>
                    ) : requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-900 text-sm">{req.name}</td>
                        <td className="p-4 text-[10px] text-slate-500 font-black tracking-widest uppercase">{req.category}</td>
                        <td className="p-4">
                           <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${
                             req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                             req.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                             'bg-amber-50 text-amber-600 border border-amber-100'
                           }`}>
                             {req.status === 'PENDING_APPROVAL' ? 'PENDING' : req.status}
                           </span>
                        </td>
                      </tr>
                    ))
                  ) : filteredItems.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">No items found.</td></tr>
                  ) : filteredItems.map((item) => {
                    const lowStock = item.stock < 10;
                    return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                            {item.medicine?.imageUrl ? (
                              <img src={item.medicine.imageUrl} alt={item.medicine.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.medicine?.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">{item.medicine?.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm">ETB {item.price.toFixed(2)}</td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${lowStock ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                          {item.stock} in stock
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-primary-600" onClick={() => openEditModal(item)}><MoreVertical className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  )})}
               </tbody>
             </table>
           </div>
        </div>

        {/* Add Product Modal - Global Catalog Integration */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-black text-slate-900">
                  {selectedMedicine ? 'Add to Inventory' : isCreatingNewMedicine ? 'Request New Medicine' : 'Find Medicine'}
                </h2>
                <button onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedMedicine(null);
                  setIsCreatingNewMedicine(false);
                  setCatalogSearchQuery('');
                }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
              </div>

              <div className="overflow-y-auto w-full no-scrollbar">

              {/* VIEW 1: Search Global Catalog */}
              {!selectedMedicine && !isCreatingNewMedicine && (
                <div className="p-8 space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search global medicine catalog..." 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none font-bold text-slate-900"
                      value={catalogSearchQuery}
                      onChange={(e) => setCatalogSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="space-y-3 min-h-[200px]">
                    {isSearchingCatalog ? (
                      <div className="flex justify-center items-center h-32 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : catalogResults.length > 0 ? (
                      catalogResults.map((med) => (
                        <div key={med.id} onClick={() => setSelectedMedicine(med)} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                           <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                              {med.imageUrl ? <img src={med.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5 text-slate-400" />}
                           </div>
                           <div className="flex-1">
                             <h4 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{med.name}</h4>
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{med.category}</p>
                           </div>
                           <Plus className="h-5 w-5 text-slate-300 group-hover:text-primary-600" />
                        </div>
                      ))
                    ) : catalogSearchQuery.length > 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-slate-500 font-medium mb-4">No matching medicines found in catalog.</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-slate-400 font-medium">Type a medicine name to search the global catalog.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-center">
                    <Button variant="ghost" onClick={() => setIsCreatingNewMedicine(true)} className="text-primary-600 font-bold w-full h-12 rounded-2xl">
                      Can't find it? Add New Medicine
                    </Button>
                  </div>
                </div>
              )}

              {/* VIEW 2: Set Price and Stock for Selected Medicine */}
              {selectedMedicine && !isCreatingNewMedicine && (
                <form className="p-8 space-y-6 flex flex-col" onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  setIsLoading(true);
                  try {
                    const res = await fetch('/api/inventory', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        medicineId: selectedMedicine.id, 
                        price: target.price.value, 
                        stock: target.stock.value 
                      })
                    });
                    if (res.ok) {
                      setIsAddModalOpen(false);
                      setSelectedMedicine(null);
                      fetchInventory();
                    } else {
                      const data = await res.json();
                      alert(data.error || 'Failed to add to inventory');
                    }
                  } catch (err) { console.error(err); } finally { setIsLoading(false); }
                }}>
                  <div className="flex items-center gap-4 p-4 bg-primary-50 text-primary-900 rounded-2xl border border-primary-100 mb-2">
                     <div className="w-12 h-12 rounded-xl bg-white flex flex-col justify-center shrink-0 border border-primary-100 overflow-hidden">
                       {selectedMedicine.imageUrl ? <img src={selectedMedicine.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5 text-primary-300 mx-auto" />}
                     </div>
                     <div>
                       <h3 className="font-bold">{selectedMedicine.name}</h3>
                       <p className="text-xs font-semibold opacity-70">{selectedMedicine.category}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Price (ETB)</label>
                      <input name="price" required type="number" step="0.01" className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Initial Stock</label>
                      <input name="stock" required type="number" className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900" />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4 mt-auto">
                    <Button variant="ghost" type="button" onClick={() => setSelectedMedicine(null)} className="flex-1 rounded-2xl font-bold h-12">Back</Button>
                    <Button variant="primary" type="submit" disabled={isLoading} className="flex-1 rounded-2xl font-black h-12 shadow-lg tracking-widest">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'ADD TO STOCK'}
                    </Button>
                  </div>
                </form>
              )}

              {/* VIEW 3: Request New Medicine */}
              {isCreatingNewMedicine && (
                <form className="p-8 space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  setIsLoading(true);
                  try {
                    // 1. Create Medicine (PENDING)
                    const medRes = await fetch('/api/medicines', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        name: target.name.value, 
                        category: target.category.value, 
                        requiresPrescription: target.requiresRx.checked, 
                        imageUrl: target.imageUrl.value 
                      })
                    });
                    
                    if (medRes.ok) {
                      const newMed = await medRes.json();
                      // 2. Add to Inventory
                      await fetch('/api/inventory', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          medicineId: newMed.id, 
                          price: target.price.value, 
                          stock: target.stock.value 
                        })
                      });
                      setIsAddModalOpen(false);
                      setIsCreatingNewMedicine(false);
                      fetchInventory();
                      fetchRequests();
                    } else {
                       const data = await medRes.json();
                       alert(data.error || 'Failed to request new medicine');
                    }
                  } catch (err) { console.error(err); } finally { setIsLoading(false); }
                }}>
                   <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl text-xs font-bold border border-amber-100 flex items-start gap-3">
                     <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                     <p>Requested medicines require admin approval before being fully visible to customers. Your stock will be saved in the meantime.</p>
                   </div>

                   <div className="flex justify-center mb-4">
                    <div className="relative group">
                       <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                          <input type="hidden" name="imageUrl" id="request-product-imageUrl" />
                          <div id="request-product-preview" className="w-full h-full hidden">
                             <img alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <ImageIcon id="request-product-placeholder" className="h-6 w-6 text-slate-300" />
                       </div>
                       <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                          <Upload className="h-4 w-4 text-white" />
                          <input type="file" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const data = await res.json();
                            if (data.url) {
                              (document.getElementById('request-product-imageUrl') as HTMLInputElement).value = data.url;
                              const preview = document.getElementById('request-product-preview') as HTMLDivElement;
                              const img = preview.querySelector('img') as HTMLImageElement;
                              img.src = data.url;
                              preview.classList.remove('hidden');
                              document.getElementById('request-product-placeholder')?.classList.add('hidden');
                            }
                          }} />
                       </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Medicine Name</label>
                    <input name="name" required type="text" defaultValue={catalogSearchQuery} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none font-bold text-slate-900" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Category</label>
                      <select name="category" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900 text-sm">
                        {['Pain Relief', 'Antibiotics', 'Supplements', 'Allergy', 'First Aid', 'Vitamins', 'Baby Care', 'Heart Care'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col justify-end pb-3 pl-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input name="requiresRx" type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-primary-600 focus:ring-primary-500" />
                        <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">Requires Rx</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Initial Inventory</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input name="price" required type="number" step="0.01" placeholder="Price (ETB)" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900" />
                      </div>
                      <div>
                        <input name="stock" required type="number" placeholder="Stock" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-4">
                    <Button variant="ghost" type="button" onClick={() => setIsCreatingNewMedicine(false)} className="flex-1 rounded-2xl font-bold h-12">Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isLoading} className="flex-1 rounded-2xl font-black h-12 shadow-lg tracking-wide shrink-0">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'SUBMIT REQUEST'}
                    </Button>
                  </div>
                </form>
              )}

              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {isEditModalOpen && editingItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                   <h2 className="text-xl font-black text-slate-900 tracking-tight">Edit Medicine</h2>
                   <p className="text-xs text-slate-500 font-medium">Update details for {editingItem.medicine?.name}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
              </div>

              <form className="p-8 space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                const target = e.target as any;
                const price = target.price.value;
                const stock = target.stock.value;
                
                setIsLoading(true);
                try {
                  const res = await fetch(`/api/inventory/${editingItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ price, stock })
                  });

                  if (res.ok) {
                    setIsEditModalOpen(false);
                    fetchInventory();
                  }
                } catch (err) { console.error(err); } finally { setIsLoading(false); }
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Price (ETB)</label>
                      <input name="price" required defaultValue={editingItem.price} type="number" step="0.01" className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Stock Count</label>
                      <input name="stock" required defaultValue={editingItem.stock} type="number" className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-2xl outline-none font-bold text-slate-900" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-2xl font-bold h-12">Cancel</Button>
                  <Button variant="primary" type="submit" disabled={isLoading} className="flex-1 rounded-2xl font-black h-12 shadow-lg shadow-primary-200 uppercase tracking-widest">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Update Inventory'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}

