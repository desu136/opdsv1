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
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  useEffect(() => {
    fetchInventory();
  }, [user]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
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
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>All Products</button>
            <button onClick={() => setActiveTab('low')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'low' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
              <AlertTriangle className="h-3 w-3" /> Low Stock
            </button>
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
                   <th className="p-4 pl-6 whitespace-nowrap">Product Name</th>
                   <th className="p-4 whitespace-nowrap">Price</th>
                   <th className="p-4 whitespace-nowrap">Stock</th>
                   <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
                 </tr>
               </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-400"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading...</td></tr>
                  ) : filteredItems.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">No items found.</td></tr>
                  ) : filteredItems.map((item) => {
                    const lowStock = item.stock < 10;
                    return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">{item.category}</p>
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

        {/* Add Product Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Add Product</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
              </div>

              <form className="p-6 space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const target = e.target as any;
                const name = target.name.value;
                const category = target.category.value;
                const price = target.price.value;
                const stock = target.stock.value;
                const requiresRx = target.requiresRx.checked;
                const fileInput = target.image;
                
                setIsLoading(true);
                try {
                  let imageUrl = '';
                  if (fileInput.files[0]) {
                    const formData = new FormData();
                    formData.append('file', fileInput.files[0]);
                    formData.append('folder', 'products');
                    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                    const uploadData = await uploadRes.json();
                    imageUrl = uploadData.url;
                  }

                  const res = await fetch('/api/inventory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, category, price, stock, requiresPrescription: requiresRx, imageUrl })
                  });

                  if (res.ok) {
                    setIsAddModalOpen(false);
                    fetchInventory();
                    target.reset();
                  }
                } catch (err) { console.error(err); } finally { setIsLoading(false); }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Full Name</label>
                    <input name="name" required type="text" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Category</label>
                      <select name="category" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl outline-none text-slate-900">
                        {['Pain Relief', 'Antibiotics', 'Supplements', 'Allergy', 'First Aid'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Price (ETB)</label>
                      <input name="price" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl outline-none text-slate-900" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Stock Count</label>
                    <input name="stock" required type="number" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl outline-none text-slate-900" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input name="requiresRx" type="checkbox" className="w-4 h-4 rounded" />
                    <label className="text-xs font-bold text-slate-600">Requires Prescription</label>
                  </div>
                  <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl text-center group cursor-pointer relative">
                    <input name="image" type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="h-6 w-6 text-slate-300 mx-auto mb-1 group-hover:text-primary-500 transition-colors" />
                    <p className="text-[10px] font-black uppercase text-slate-400">Click to upload photo</p>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 rounded-xl font-bold">Cancel</Button>
                  <Button variant="primary" type="submit" disabled={isLoading} className="flex-1 rounded-xl font-bold shadow-lg shadow-primary-200">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Save Product'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
