'use client';

import React, { useState, useEffect, useRef } from 'react';
import { adminSidebarItems } from '@/components/layout/Sidebar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import * as XLSX from 'xlsx';
import { 
  Search, 
  CheckCircle,
  XCircle,
  Loader2,
  Image as ImageIcon,
  Clock,
  ShieldCheck,
  Ban,
  Trash2,
  Plus,
  AlertCircle,
  Upload,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING_APPROVAL');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkPreviewOpen, setIsBulkPreviewOpen] = useState(false);

  const [medicineToEdit, setMedicineToEdit] = useState<any>(null);
  const [medicineToDelete, setMedicineToDelete] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    name: '', genericName: '', category: '', description: '', requiresPrescription: false, imageUrl: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [bulkSummary, setBulkSummary] = useState({ total: 0, valid: 0, invalid: 0 });

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const catParam = selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
      const res = await fetch(`/api/medicines?status=${activeTab}&page=${currentPage}&limit=10${searchParam}${catParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.meta) {
          setMedicines(data.data);
          setTotalPages(data.meta.totalPages || 1);
        } else {
          setMedicines(data);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [activeTab, selectedCategory, currentPage, searchQuery]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchMedicines();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update medicine status');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
         fetchMedicines();
         setIsAddModalOpen(false);
         setFormData(initialForm);
      } else {
         const data = await res.json();
         alert(data.error || 'Failed to add medicine');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (med: any) => {
    setMedicineToEdit(med);
    setFormData({
      name: med.name,
      genericName: med.genericName || '',
      category: med.category || '',
      description: med.description || '',
      requiresPrescription: med.requiresPrescription || false,
      imageUrl: med.imageUrl || ''
    });
    setIsEditModalOpen(true);
  };

  const submitEditMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineToEdit) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/medicines/${medicineToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
         fetchMedicines();
         setIsEditModalOpen(false);
         setMedicineToEdit(null);
         setFormData(initialForm);
      } else {
         const data = await res.json();
         alert(data.error || 'Failed to update medicine');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedicine = async () => {
    if (!medicineToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/medicines/${medicineToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
         fetchMedicines();
         setIsDeleteModalOpen(false);
         setMedicineToDelete(null);
      } else {
         const data = await res.json();
         alert(data.error || 'Failed to delete medicine');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        let valid = 0;
        let invalid = 0;
        const parsedData = data.map((row: any) => {
          const name = row.name || row.Name || row.NAME;
          const category = row.category || row.Category || row.CATEGORY;
          const isValid = !!name && !!category;
          
          if (isValid) valid++; else invalid++;
          
          const rx = row.requires_prescription || row.RequiresPrescription || row.requiresPrescription;
          const isRx = rx === true || rx === 'true' || rx === 'Yes' || rx === 'yes' || rx === 1;

          return {
            name,
            genericName: row.generic_name || row.GenericName || row.genericName || '',
            category,
            description: row.description || row.Description || '',
            requiresPrescription: isRx,
            imageUrl: row.image_url || row.ImageUrl || row.imageUrl || '',
            isValid
          };
        });

        setBulkData(parsedData);
        setBulkSummary({ total: parsedData.length, valid, invalid });
        setIsBulkPreviewOpen(true);
      } catch (err) {
        alert('Failed to parse file. Please ensure it is a valid CSV or Excel file.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = async () => {
    const validMedicines = bulkData.filter(m => m.isValid);
    if (validMedicines.length === 0) {
      alert('No valid medicines to upload.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/medicines/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines: validMedicines })
      });
      if (res.ok) {
        const result = await res.json();
        alert(`Bulk upload complete! Success: ${result.success}, Failed: ${result.failed}`);
        setIsBulkPreviewOpen(false);
        setBulkData([]);
        fetchMedicines();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
       console.error(error);
       alert('Upload failed due to network or server error.');
    } finally {
       setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PENDING_APPROVAL': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'REJECTED': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <DashboardLayout items={adminSidebarItems} title="Medicine Catalog">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
          <div>
             <h1 className="text-2xl font-bold">Global Medicine Catalog</h1>
             <p className="text-slate-500">Manage medicines, process bulk uploads, and review pharmacist requests.</p>
          </div>
          <div className="flex items-center gap-3">
             <input 
               type="file" 
               accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
               className="hidden"
               ref={fileInputRef}
               onChange={handleFileUpload}
             />
             <Button variant="outline" className="rounded-xl h-11 px-4 border-slate-200 hover:bg-slate-50 text-slate-700" onClick={() => fileInputRef.current?.click()}>
               <Upload className="h-5 w-5 mr-2" /> Bulk Upload
             </Button>
             <Button variant="primary" className="rounded-xl shadow-sm h-11 px-4" onClick={() => { setFormData(initialForm); setIsAddModalOpen(true); }}>
               <Plus className="h-5 w-5 mr-2" /> Add Medicine
             </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 text-slate-900">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <button onClick={() => { setActiveTab('PENDING_APPROVAL'); setCurrentPage(1); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700 border border-amber-100 shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
              <Clock className="h-3 w-3" /> Pending Requests
            </button>
            <button onClick={() => { setActiveTab('APPROVED'); setCurrentPage(1); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'APPROVED' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
              <ShieldCheck className="h-3 w-3" /> Approved
            </button>
            <button onClick={() => { setActiveTab('REJECTED'); setCurrentPage(1); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-100 shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
              <Ban className="h-3 w-3" /> Rejected
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none font-medium h-full min-w-[140px]"
              >
                <option value="All">All Categories</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="First Aid">First Aid</option>
                <option value="Cold & Flu">Cold & Flu</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Supplements">Supplements</option>
                <option value="Skin Care">Skin Care</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="relative w-full sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search catalog..." 
                  className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-slate-900 min-h-[400px] flex flex-col">
           <div className="overflow-x-auto flex-1">
             <table className="w-full text-left border-collapse min-w-[700px]">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                   <th className="p-4 pl-6 whitespace-nowrap w-2/5">Medicine Information</th>
                   <th className="p-4 whitespace-nowrap text-center">Status</th>
                   <th className="p-4 whitespace-nowrap text-center">Requested On</th>
                   <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {isLoading ? (
                   <tr><td colSpan={4} className="p-12 text-center text-slate-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading catalog...</td></tr>
                 ) : medicines.length > 0 ? (
                   medicines.map((med: any) => (
                      <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden shrink-0">
                                 {med.imageUrl ? <img src={med.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{med.name} {med.requiresPrescription && <span className="inline-block align-top ml-1" title="Prescription Required"><ShieldCheck className="h-3 w-3 text-rose-500 inline" /></span>}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">{med.category}</p>
                                {med.genericName && <p className="text-[10px] text-slate-400 truncate w-48 mt-0.5">{med.genericName}</p>}
                              </div>
                           </div>
                        </td>
                        <td className="p-4 text-center align-middle">
                           <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(med.status)}`}>
                             {med.status.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600 font-medium text-center align-middle">
                           {new Date(med.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 pr-6 text-right align-middle">
                           <div className="flex items-center justify-end gap-2">
                             {med.status === 'PENDING_APPROVAL' && (
                               <>
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   onClick={() => handleStatusUpdate(med.id, 'APPROVED')}
                                   disabled={isUpdating === med.id}
                                   className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                                 >
                                   <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                                 </Button>
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   onClick={() => handleStatusUpdate(med.id, 'REJECTED')}
                                   disabled={isUpdating === med.id}
                                   className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                                 >
                                   <XCircle className="h-4 w-4 mr-1.5" /> Reject
                                 </Button>
                               </>
                             )}
                             {med.status === 'APPROVED' && (
                               <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100" onClick={() => openEditModal(med)} title="Edit">
                                 <Edit2 className="h-4 w-4" />
                               </Button>
                             )}
                             {(med.status === 'APPROVED' || med.status === 'REJECTED') && (
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 className="text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100"
                                 onClick={() => { setMedicineToDelete(med); setIsDeleteModalOpen(true); }}
                                 title="Delete"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             )}
                           </div>
                        </td>
                      </tr>
                   ))
                 ) : (
                   <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">No medicines found matching the criteria.</td></tr>
                 )}
               </tbody>
             </table>
           </div>

           {/* Pagination */}
           {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 bg-slate-50 shrink-0">
                <p className="font-medium">Page {currentPage} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="bg-white hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="bg-white hover:bg-slate-50"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && medicineToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 overflow-hidden">
               <div className="flex items-center gap-4 text-rose-600 mb-4">
                 <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                   <AlertCircle className="h-6 w-6 text-rose-600" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-slate-900">Delete Medicine?</h3>
                   <p className="text-sm text-slate-500">This action cannot be undone.</p>
                 </div>
               </div>
               <p className="text-slate-600 text-sm mb-6">
                 Are you sure you want to delete <span className="font-bold text-slate-900">{medicineToDelete.name}</span> from the global catalog?
               </p>
               <div className="flex gap-3 justify-end">
                 <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                 <Button variant="primary" className="bg-rose-600 hover:bg-rose-700" onClick={handleDeleteMedicine} disabled={isSubmitting}>
                   {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Medicine'}
                 </Button>
               </div>
            </div>
          </div>
        )}

        {/* Shared Form Component for Add and Edit */}
        {((isAddModalOpen) || (isEditModalOpen && medicineToEdit)) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-slate-900">{isEditModalOpen ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="medicine-form" onSubmit={isEditModalOpen ? submitEditMedicine : handleAddMedicine} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        placeholder="e.g. Paracetamol 500mg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generic Name</label>
                      <input 
                        type="text" 
                        value={formData.genericName}
                        onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        placeholder="e.g. Acetaminophen"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category *</label>
                      <select 
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                      >
                        <option value="">Select Category</option>
                        <option value="Pain Relief">Pain Relief</option>
                        <option value="Antibiotics">Antibiotics</option>
                        <option value="First Aid">First Aid</option>
                        <option value="Cold & Flu">Cold & Flu</option>
                        <option value="Vitamins">Vitamins</option>
                        <option value="Supplements">Supplements</option>
                        <option value="Skin Care">Skin Care</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
                      <input 
                        type="url" 
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                      placeholder="Enter a description of this medicine..."
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                     <div className="flex items-center h-5">
                       <input
                         type="checkbox"
                         id="requires-rx"
                         checked={formData.requiresPrescription}
                         onChange={(e) => setFormData({...formData, requiresPrescription: e.target.checked})}
                         className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 shrink-0"
                       />
                     </div>
                     <label htmlFor="requires-rx" className="flex flex-col cursor-pointer">
                       <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary-500" /> Requires Prescription</span>
                       <span className="text-xs text-slate-500">Check this if a doctor's prescription is required to purchase this medicine.</span>
                     </label>
                  </div>
                  
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end shrink-0 bg-slate-50 rounded-b-3xl">
                <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} disabled={isSubmitting}>Cancel</Button>
                <Button variant="primary" type="submit" form="medicine-form" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditModalOpen ? <Edit2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)}
                  {isEditModalOpen ? 'Save Changes' : 'Add Medicine'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Upload Preview Modal */}
        {isBulkPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                   <h2 className="text-xl font-bold text-slate-900">Bulk Upload Preview</h2>
                   <p className="text-sm text-slate-500 mt-1">Found {bulkSummary.total} rows ({bulkSummary.valid} valid, {bulkSummary.invalid} invalid)</p>
                </div>
                <button onClick={() => setIsBulkPreviewOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-0 bg-slate-50/50">
                 <table className="w-full text-left text-sm border-collapse">
                   <thead className="bg-white shadow-sm sticky top-0 z-10 border-b border-slate-200">
                     <tr className="text-slate-600 font-bold tracking-wide uppercase text-xs">
                       <th className="p-4 pl-6">Status</th>
                       <th className="p-4">Name</th>
                       <th className="p-4">Category</th>
                       <th className="p-4">Rx Required</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 bg-white">
                     {bulkData.map((row, idx) => (
                       <tr key={idx} className={row.isValid ? 'hover:bg-slate-50 transition-colors' : 'bg-rose-50/50 text-rose-700'}>
                         <td className="p-4 pl-6">
                           {row.isValid ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <span title="Missing required fields"><XCircle className="h-4 w-4 text-rose-500" /></span>}
                         </td>
                         <td className={`p-4 font-medium ${!row.name && 'text-rose-500 font-bold'}`}>{row.name || 'Missing Name'}</td>
                         <td className={`p-4 ${!row.category && 'text-rose-500 font-bold'}`}>{row.category || 'Missing'}</td>
                         <td className="p-4">{row.requiresPrescription ? 'Yes' : 'No'}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
              <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0 bg-slate-50 rounded-b-3xl">
                 <div className="text-sm text-slate-500 flex items-center gap-2">
                   <AlertCircle className="h-4 w-4" /> Only valid rows will be imported. Duplicates will be skipped.
                 </div>
                 <div className="flex gap-3">
                   <Button variant="outline" onClick={() => setIsBulkPreviewOpen(false)} disabled={isSubmitting}>Cancel</Button>
                   <Button variant="primary" onClick={handleBulkSubmit} disabled={isSubmitting || bulkSummary.valid === 0}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                      Import {bulkSummary.valid} Medicines
                   </Button>
                 </div>
              </div>
            </div>
          </div>
        )}

    </DashboardLayout>
  );
}
