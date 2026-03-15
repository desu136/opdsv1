'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, pharmacySidebarItems } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Eye,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock Data
const prescriptionQueue = [
  { id: 'RX-10042', orderId: 'ORD-8920', patient: 'Yosef Alemu', doctor: 'Dr. Tadesse', date: '2023-11-20', status: 'Pending Review', urgency: 'High' },
  { id: 'RX-10041', orderId: 'ORD-8919', patient: 'Lielt Girma', doctor: 'Dr. Kebede', date: '2023-11-20', status: 'Pending Review', urgency: 'Normal' },
  { id: 'RX-10040', orderId: 'ORD-8915', patient: 'Abebe Bekele', doctor: 'Dr. Almaz', date: '2023-11-19', status: 'Approved', urgency: 'Normal' },
  { id: 'RX-10039', orderId: 'ORD-8910', patient: 'Mekdes Haile', doctor: 'Dr. Samuel', date: '2023-11-19', status: 'Rejected', urgency: 'Normal' },
];

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
        // Filter for orders with prescriptions
        const withRx = data.filter((o: any) => o.prescription);
        setOrders(withRx);
      }
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
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
               <h1 className="text-2xl font-bold text-slate-900">Prescription Verification</h1>
               <p className="text-slate-500">Review uploaded patient prescriptions to approve orders.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search by RX ID or Patient..." 
                   className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64" 
                 />
               </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-200 mb-6 w-full">
            {[
              { id: 'PENDING_REVIEW', label: `Pending Review (${getStats('PENDING_REVIEW')})` },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected / Needs Info' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                   setActiveTab(tab.id);
                   setSelectedOrder(null);
                }}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex-1 sm:flex-none text-center ${
                  activeTab === tab.id 
                    ? 'border-primary-600 text-primary-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List */}
            <div className="lg:col-span-1 space-y-4 h-[600px] overflow-y-auto pr-2">
               {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading queue...</p>
                  </div>
               ) : filteredRx.map(o => (
                 <div 
                   key={o.id} 
                   onClick={() => setSelectedOrder(o)}
                   className={`bg-white p-4 rounded-xl border transition-colors cursor-pointer shadow-sm ${selectedOrder?.id === o.id ? 'border-primary-500 ring-1 ring-primary-500' : 'border-slate-200 hover:border-primary-300'}`}
                 >
                    <div className="flex justify-between items-start mb-2">
                       <span className="font-bold text-slate-900">{o.id.slice(0, 8)}</span>
                       <span className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{o.customer?.name}</p>
                    <p className="text-xs text-slate-500 mb-3">Order Total: {o.totalAmount} ETB</p>
                    <div className="flex justify-between items-center">
                       {o.prescription.status === 'PENDING_REVIEW' && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Pending</span>}
                       {o.prescription.status === 'APPROVED' && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Approved</span>}
                       {o.prescription.status === 'REJECTED' && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Rejected</span>}
                    </div>
                 </div>
               ))}
               
               {!isLoading && filteredRx.length === 0 && (
                 <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-500 flex flex-col items-center">
                   <CheckCircle2 className="h-8 w-8 text-slate-300 mb-2" />
                   <p>No prescriptions in this queue.</p>
                 </div>
               )}
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 h-[600px] flex flex-col overflow-hidden">
               {selectedOrder ? (
                 <>
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary-600" />
                          Verification: {selectedOrder.id.slice(0, 8)}
                        </h2>
                        <p className="text-sm text-slate-500">Patient: {selectedOrder.customer?.name} • Contact: {selectedOrder.customer?.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white"><MessageSquare className="h-4 w-4 mr-2" />Contact Patient</Button>
                      </div>
                   </div>
                   
                   <div className="flex-1 p-6 relative bg-slate-900 flex items-center justify-center overflow-hidden">
                      {selectedOrder.prescription.documentUrl ? (
                         <img 
                           src={selectedOrder.prescription.documentUrl} 
                           alt="Prescription" 
                           className="max-w-full max-h-full object-contain shadow-2xl" 
                         />
                      ) : (
                         <div className="text-white text-center">
                           <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                           <p>No document image available</p>
                         </div>
                      )}
                      
                      <div className="absolute top-4 right-4 group">
                         <Button variant="primary" className="rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => window.open(selectedOrder.prescription.documentUrl)}>
                           <Eye className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>

                   <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                      <div className="text-sm max-w-[60%] truncate">
                        <span className="font-semibold text-slate-700">Rx Items:</span>
                        <span className="ml-2 text-slate-600">
                          {selectedOrder.items.map((i: any) => i.product.name).join(', ')}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {selectedOrder.prescription.status === 'PENDING_REVIEW' && (
                          <>
                            <Button 
                              variant="outline" 
                              className="border-red-200 text-red-600 hover:bg-red-50 px-6 rounded-xl"
                              onClick={() => handleVerify('REJECTED')}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Reject
                            </Button>
                            <Button 
                              variant="primary" 
                              className="px-8 rounded-xl"
                              onClick={() => handleVerify('APPROVED')}
                              disabled={isProcessing}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                            </Button>
                          </>
                        )}
                      </div>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50">
                    <FileText className="h-16 w-16 text-slate-200 mb-4" />
                    <p className="text-lg font-medium text-slate-500">Select a prescription</p>
                    <p className="text-sm mt-1">Click on a prescription from the queue to view details.</p>
                 </div>
               )}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
