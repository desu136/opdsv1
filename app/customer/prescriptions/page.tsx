'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, customerSidebarItems } from '@/components/layout/Sidebar';
import { 
  ClipboardList, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CustomerPrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await fetch('/api/prescriptions');
        if (res.ok) {
          setPrescriptions(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.role === 'CUSTOMER') fetchPrescriptions();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={customerSidebarItems} userRole="Customer" userName={user?.name || 'Customer'} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 text-slate-900">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold">My Prescriptions</h1>
            <p className="text-slate-500">History of your medical documents uploaded for orders.</p>
          </div>

          {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" /></div>
          ) : prescriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {prescriptions.map(px => (
                 <div key={px.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                <FileText className="h-6 w-6 text-indigo-600" />
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                px.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                px.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {px.status.split('_').join(' ')}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">Order #{px.order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-slate-500 mb-4">{px.order.pharmacy.name}</p>
                        <p className="text-xs text-slate-400">Uploaded on {new Date(px.order.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <Button variant="outline" size="sm" className="rounded-xl flex items-center gap-2" onClick={() => setSelectedImage(px.documentUrl)}>
                           <Eye className="h-4 w-4" /> View Document
                        </Button>
                        <span className="text-xs text-slate-400">ID: {px.id.slice(0, 6)}</span>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-slate-300">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <ClipboardList className="h-8 w-8" />
               </div>
               <h3 className="font-bold text-slate-900">No prescriptions found</h3>
               <p className="text-sm text-slate-500">Documents will appear here when you place an order that requires a prescription.</p>
            </div>
          )}

          {selectedImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
              <div className="bg-white rounded-3xl p-2 max-w-2xl w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Prescription Document</h3>
                  <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors font-bold text-slate-900">✕</button>
                </div>
                <div className="bg-slate-100 rounded-b-2xl overflow-hidden flex items-center justify-center min-h-[400px]">
                   <img src={selectedImage} alt="Prescription" className="max-w-full max-h-[70vh] object-contain" />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
