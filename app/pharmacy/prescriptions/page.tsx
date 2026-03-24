'use client';

import React, { useState, useEffect } from 'react';
import { pharmacySidebarItems } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PharmacyPrescriptionsPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchOrders = async () => {
    if (!user?.pharmacy?.id) return;
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        const withRx = data.filter((o: any) => o.prescription);
        setOrders(withRx);
      }
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const handleVerify = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionStatus: status })
      });
      if (res.ok) {
        alert(`Prescription ${status.toLowerCase()} successfully`);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRx = orders.filter(o => {
    const rx = o.prescription;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         o.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = rx.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStats = (status: string) => orders.filter(o => o.prescription.status === status).length;

  return (
    <DashboardLayout items={pharmacySidebarItems} title="Prescription Verification">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
          <div>
             <h1 className="text-2xl font-bold">Verification Queue</h1>
             <p className="text-slate-500">Review patient prescriptions to approve medicine orders.</p>
          </div>
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search..." 
               className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full" 
             />
          </div>
        </div>

        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar text-slate-900">
          {[
            { id: 'PENDING_REVIEW', label: `Pending (${getStats('PENDING_REVIEW')})` },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedOrder(null); }}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-900">
          <div className="lg:col-span-4 space-y-3 h-[calc(100vh-350px)] overflow-y-auto pr-2 no-scrollbar">
             {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 font-bold italic"><Loader2 className="h-8 w-8 animate-spin mb-2" /> Loading...</div>
             ) : filteredRx.map(o => (
               <div 
                 key={o.id} 
                 onClick={() => setSelectedOrder(o)}
                 className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${selectedOrder?.id === o.id ? 'border-primary-500 shadow-md' : 'border-slate-100'}`}
               >
                  <div className="flex justify-between items-start mb-1">
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">#{o.id.slice(-6).toUpperCase()}</span>
                     <span className="text-[10px] font-bold text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-black text-slate-900 text-sm mb-1">{o.customer?.name}</p>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">ETB {o.totalAmount.toLocaleString()}</p>
               </div>
             ))}
             {!isLoading && filteredRx.length === 0 && (
               <div className="p-12 text-center text-slate-400 italic text-xs">No prescriptions found.</div>
             )}
          </div>

          <div className="lg:col-span-8 bg-slate-50 rounded-3xl border border-slate-200 h-[calc(100vh-350px)] flex flex-col overflow-hidden relative group">
             {selectedOrder ? (
               <>
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase">Prescription View</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedOrder.customer?.phone}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-[10px] font-black uppercase"><MessageSquare className="h-3 w-3 mr-2" /> Contact</Button>
                 </div>
                 
                 <div className="flex-1 p-8 bg-slate-900 flex items-center justify-center overflow-hidden">
                    {selectedOrder.prescription.documentUrl ? (
                       <img src={selectedOrder.prescription.documentUrl} alt="RX" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                    ) : (
                       <div className="text-white/20 text-center"><FileText className="h-16 w-16 mx-auto mb-2" /> No Document Image</div>
                    )}
                 </div>

                 <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                       <FileText className="h-3 w-3" /> {selectedOrder.items.length} Medicines requested
                    </div>
                    <div className="flex gap-2">
                      {selectedOrder.prescription.status === 'PENDING_REVIEW' && (
                        <>
                          <Button 
                            variant="outline" 
                            className="h-9 px-4 rounded-xl text-[10px] font-black uppercase border-rose-100 text-rose-600 bg-rose-50"
                            onClick={() => handleVerify('REJECTED')}
                            disabled={isProcessing}
                          >Reject</Button>
                          <Button 
                            variant="primary" 
                            className="h-9 px-6 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-primary-200"
                            onClick={() => handleVerify('APPROVED')}
                            disabled={isProcessing}
                          >Approve</Button>
                        </>
                      )}
                    </div>
                 </div>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-300 font-black uppercase text-xs tracking-widest"><FileText className="h-16 w-16 mb-4 opacity-10" /> Select an item</div>
             )}
          </div>
        </div>
    </DashboardLayout>
  );
}
