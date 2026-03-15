'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, pharmacySidebarItems } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Search,
  Plus,
  Filter,
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
  const [formError, setFormError] = useState<string | null>(null);

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

  React.useEffect(() => {
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          items={pharmacySidebarItems} 
          userRole="Pharmacy" 
          userName={user?.pharmacy?.name || user?.name || 'Pharmacist'} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
               <p className="text-slate-500">Manage your products, stock levels, and pricing.</p>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="primary" className="rounded-xl shadow-sm" onClick={() => setIsAddModalOpen(true)}>
                 <Plus className="h-4 w-4 mr-2" /> Add Product
               </Button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>All Products</button>
              <button onClick={() => setActiveTab('low')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'low' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white text-slate-600 border border-slate-200'}`}>
                <AlertTriangle className="h-4 w-4" /> Low Stock (2)
              </button>
            </div>

            <div className="flex items-center gap-2">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Search inventory..." 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <Button variant="outline" className="relative p-2 rounded-xl bg-white hidden sm:flex">
                 <Filter className="h-5 w-5 text-slate-600" />
               </Button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                     <th className="p-4 pl-6 whitespace-nowrap">Product Name</th>
                     <th className="p-4 whitespace-nowrap">Category</th>
                     <th className="p-4 whitespace-nowrap">Price (ETB)</th>
                     <th className="p-4 whitespace-nowrap">Stock Level</th>
                     <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
                   </tr>
                 </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm font-medium">Loading items...</p>
                        </td>
                      </tr>
                    ) : filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400">
                          <p className="text-sm font-medium">No items found.</p>
                        </td>
                      </tr>
                    ) : filteredItems.map((item) => {
                      const status = item.stock > 10 ? 'In Stock' : item.stock > 0 ? 'Low Stock' : 'Out of Stock';
                      return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 uppercase">No Image</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.name}</p>
                              <div className="flex gap-2 mt-1">
                                <p className="text-xs text-slate-500">{item.id.slice(0, 8)}</p>
                                {item.requiresPrescription && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 font-bold">Rx</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 text-sm">{item.category}</td>
                        <td className="p-4 font-semibold text-slate-900">{item.price.toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.stock > 10 ? 'bg-green-500' : item.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                            <span className="font-medium text-slate-700">{item.stock}</span>
                            <span className="text-xs text-slate-500 ml-1">({status})</span>
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="h-8 px-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                               onClick={() => openEditModal(item)}
                             >
                               Edit
                             </Button>
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                               onClick={() => handleDelete(item.id, item.name)}
                               disabled={isDeleting === item.id}
                             >
                               {isDeleting === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
                             </Button>
                          </div>
                        </td>
                      </tr>
                    )})}
                 </tbody>
               </table>
             </div>
             
             {/* Pagination Footer */}
             <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
               <span>Showing {filteredItems.length} products</span>
               <div className="flex gap-1">
                 <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
                 <button className="px-3 py-1 border border-slate-200 rounded-md bg-primary-50 text-primary-700 font-medium">1</button>
                 <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
               </div>
             </div>
          </div>

          {/* Add Product Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
              <div 
                className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
                    <p className="text-sm text-slate-500">Enter medicine details and upload image.</p>
                  </div>
                  <button onClick={() => { setIsAddModalOpen(false); setFormError(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                {formError && (
                  <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2 duration-300">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{formError}</p>
                  </div>
                )}

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
                  setFormError(null);
                  try {
                    let imageUrl = '';
                    if (fileInput.files[0]) {
                      const formData = new FormData();
                      formData.append('file', fileInput.files[0]);
                      formData.append('folder', 'products');
                      
                      const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                      });
                      if (!uploadRes.ok) {
                        const errorData = await uploadRes.json();
                        throw new Error(errorData.error || 'Image upload failed');
                      }
                      const uploadData = await uploadRes.json();
                      imageUrl = uploadData.url;
                    }

                    const res = await fetch('/api/inventory', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name, category, price, stock, requiresPrescription: requiresRx, imageUrl
                      })
                    });

                    if (res.ok) {
                      setIsAddModalOpen(false);
                      fetchInventory();
                      // Clear form
                      target.reset();
                    } else {
                      const errorData = await res.json();
                      setFormError(errorData.error || errorData.details || 'Failed to add product');
                    }
                  } catch (err: any) {
                    console.error(err);
                    setFormError(err.message || 'An unexpected error occurred');
                  } finally {
                    setIsLoading(false);
                  }
                }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Medicine Name</label>
                      <input name="name" required type="text" placeholder="e.g. Paracetamol 500mg" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Category</label>
                      <select name="category" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none">
                        <option>Pain Relief</option>
                        <option>Antibiotics</option>
                        <option>Supplements</option>
                        <option>Allergy</option>
                        <option>First Aid</option>
                        <option>Skin Care</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Price (ETB)</label>
                      <input name="price" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Initial Stock</label>
                      <input name="stock" required type="number" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none" />
                    </div>
                    <div className="flex items-center gap-3 py-4">
                      <input name="requiresRx" type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Requires Prescription</label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Product Image</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-all relative group cursor-pointer">
                      <input name="image" type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                      <div className="space-y-1">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Click to upload photo</p>
                        <p className="text-xs text-slate-400">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-3">
                    <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isLoading} className="flex-1 rounded-xl shadow-lg shadow-primary-200">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Product'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Product Modal */}
          {isEditModalOpen && editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
              <div 
                className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Edit Product</h2>
                    <p className="text-sm text-slate-500">Update medicine details and stock levels.</p>
                  </div>
                  <button onClick={() => { setIsEditModalOpen(false); setFormError(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                {formError && (
                  <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2 duration-300">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{formError}</p>
                  </div>
                )}

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
                  setFormError(null);
                  try {
                    let imageUrl = editingItem.imageUrl;
                    if (fileInput.files[0]) {
                      const formData = new FormData();
                      formData.append('file', fileInput.files[0]);
                      formData.append('folder', 'products');
                      
                      const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                      });
                      if (!uploadRes.ok) {
                        const errorData = await uploadRes.json();
                        throw new Error(errorData.error || 'Image upload failed');
                      }
                      const uploadData = await uploadRes.json();
                      imageUrl = uploadData.url;
                    }

                    const res = await fetch(`/api/inventory/${editingItem.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name, category, price, stock, requiresPrescription: requiresRx, imageUrl
                      })
                    });

                    if (res.ok) {
                      setIsEditModalOpen(false);
                      setEditingItem(null);
                      fetchInventory();
                    } else {
                      const errorData = await res.json();
                      setFormError(errorData.error || errorData.details || 'Failed to update product');
                    }
                  } catch (err: any) {
                    console.error(err);
                    setFormError(err.message || 'An unexpected error occurred');
                  } finally {
                    setIsLoading(false);
                  }
                }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Medicine Name</label>
                      <input name="name" defaultValue={editingItem.name} required type="text" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Category</label>
                      <select name="category" defaultValue={editingItem.category} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none">
                        <option>Pain Relief</option>
                        <option>Antibiotics</option>
                        <option>Supplements</option>
                        <option>Allergy</option>
                        <option>First Aid</option>
                        <option>Skin Care</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Price (ETB)</label>
                      <input name="price" defaultValue={editingItem.price} required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Update Stock</label>
                      <input name="stock" defaultValue={editingItem.stock} required type="number" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none" />
                    </div>
                    <div className="flex items-center gap-3 py-4">
                      <input name="requiresRx" defaultChecked={editingItem.requiresPrescription} type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Requires Prescription</label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Product Image (Optional)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-all relative group cursor-pointer">
                      <input name="image" type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                      {editingItem.imageUrl && (
                        <div className="absolute top-2 right-2 w-12 h-12 rounded-lg border border-slate-100 overflow-hidden shadow-sm">
                          <img src={editingItem.imageUrl} alt="Current" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Change photo</p>
                        <p className="text-xs text-slate-400">Leave blank to keep current photo</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-3">
                    <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isLoading} className="flex-1 rounded-xl shadow-lg shadow-primary-200">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Product'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
