'use client';

import React, { useState, useEffect } from 'react';
import { adminSidebarItems } from '@/components/layout/Sidebar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Store, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Filter,
  Loader2
} from 'lucide-react';

const mockPharmacies = [
  { id: 'PHARM-892', name: 'Kenema Pharmacy Bole', email: 'bole@kenema.com', phone: '+251 911 234 567', joined: 'Oct 12, 2023', status: 'Active', orders: 1245 },
  { id: 'PHARM-891', name: 'TenaCare Pharmacy Kazanchis', email: 'contact@tenacarekaz.com', phone: '+251 922 345 678', joined: 'Nov 05, 2023', status: 'Active', orders: 840 },
  { id: 'PHARM-890', name: 'HealthPlus Meds Piassa', email: 'info@healthplus.com', phone: '+251 933 456 789', joined: 'Nov 18, 2023', status: 'Pending Review', orders: 0 },
  { id: 'PHARM-889', name: 'Addis Pharmacy Network', email: 'hello@addispharmacy.com', phone: '+251 944 567 890', joined: 'Dec 01, 2023', status: 'Suspended', orders: 231 },
];

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedLicenseUrl, setSelectedLicenseUrl] = useState<string | null>(null);

  const fetchPharmacies = async () => {
    try {
      const res = await fetch('/api/pharmacies?status=' + (activeTab === 'all' ? '' : activeTab === 'pending' ? 'PENDING_REVIEW' : 'ACTIVE'));
      if (res.ok) {
        setPharmacies(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPharmacies();
  }, [activeTab]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/pharmacies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchPharmacies();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to approve: ${errData.error || res.statusText}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Network error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout items={adminSidebarItems} title="Manage Pharmacies">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
          <div>
             <h1 className="text-2xl font-bold">Registered Pharmacies</h1>
             <p className="text-slate-500">Manage pharmacy partners and approve new registrations.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button onClick={() => setActiveTab('all')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>All</button>
          <button onClick={() => setActiveTab('pending')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Pending Review</button>
          <button onClick={() => setActiveTab('active')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-green-500 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Active</button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-slate-900">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                   <th className="p-4 pl-6 whitespace-nowrap">Pharmacy & Owner</th>
                   <th className="p-4 whitespace-nowrap">Contact</th>
                   <th className="p-4 whitespace-nowrap">License</th>
                   <th className="p-4 whitespace-nowrap">Status</th>
                   <th className="p-4 pr-6 text-right whitespace-nowrap">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {isLoading ? (
                   <tr><td colSpan={5} className="p-8 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                 ) : pharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center shrink-0"><Store className="h-5 w-5" /></div>
                            <div>
                              <p className="font-bold text-slate-900">{pharmacy.name}</p>
                              <p className="text-xs text-slate-500">{pharmacy.owner?.name || 'No Owner'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-4 text-sm">
                         <p className="text-slate-700">{pharmacy.email}</p>
                         <p className="text-slate-500">{pharmacy.phone}</p>
                      </td>
                      <td className="p-4">
                         {pharmacy.licenseDocumentUrl ? (
                           <button onClick={() => setSelectedLicenseUrl(pharmacy.licenseDocumentUrl)} className="text-xs font-bold text-primary-600 underline">View License</button>
                         ) : <span className="text-xs text-slate-400">None</span>}
                      </td>
                      <td className="p-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${pharmacy.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {pharmacy.status}
                         </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                         <div className="flex justify-end gap-2 text-slate-900">
                           {pharmacy.status === 'PENDING_REVIEW' && (
                             <Button size="sm" className="rounded-lg h-8 px-3" onClick={() => handleStatusUpdate(pharmacy.id, 'ACTIVE')} disabled={updatingId === pharmacy.id}>
                                Approve
                             </Button>
                           )}
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                         </div>
                      </td>
                    </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {selectedLicenseUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLicenseUrl(null)}>
            <div className="bg-white rounded-3xl p-2 max-w-2xl w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-100 flex justify-between items-center text-slate-900">
                <h3 className="font-bold">Pharmacy License</h3>
                <button onClick={() => setSelectedLicenseUrl(null)}><XCircle className="h-6 w-6 text-slate-400" /></button>
              </div>
              <div className="bg-slate-100 min-h-[300px] rounded-b-2xl overflow-hidden flex items-center justify-center">
                 <img src={selectedLicenseUrl} alt="License" className="max-w-full max-h-[70vh] object-contain" />
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
