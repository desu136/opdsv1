'use client';

import React, { useState, useEffect } from 'react';
import { adminSidebarItems } from '@/components/layout/Sidebar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Search, 
  MoreVertical,
  Loader2,
  Calendar,
  CreditCard,
  Building2,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  return (
    <DashboardLayout items={adminSidebarItems} title="Global Orders">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
          <div>
             <h1 className="text-2xl font-bold">System-wide Orders</h1>
             <p className="text-slate-500">Overview of all active and completed transactions.</p>
          </div>
          <div className="flex bg-slate-100 rounded-xl p-1 shrink-0">
             {['all', 'PENDING', 'COMPLETED'].map(status => (
               <button 
                key={status}
                onClick={() => setStatusFilter(status)} 
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${statusFilter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
               </button>
             ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-slate-900">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                   <th className="p-4 pl-6 whitespace-nowrap">Order ID</th>
                   <th className="p-4 whitespace-nowrap">Customer</th>
                   <th className="p-4 whitespace-nowrap">Pharmacy</th>
                   <th className="p-4 whitespace-nowrap">Date</th>
                   <th className="p-4 whitespace-nowrap">Total</th>
                   <th className="p-4 whitespace-nowrap">Status</th>
                   <th className="p-4 pr-6 text-right whitespace-nowrap">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {isLoading ? (
                   <tr><td colSpan={7} className="p-12 text-center text-slate-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading orders...</td></tr>
                 ) : filteredOrders.length > 0 ? (
                   filteredOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 text-sm font-mono text-slate-500">#{order.id.slice(0, 8)}</td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><UserIcon className="h-4 w-4 text-slate-400" /></div>
                              <span className="text-sm font-bold text-slate-900">{order.customer?.name || 'Guest'}</span>
                           </div>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-700 font-medium">{order.pharmacy?.name}</span>
                           </div>
                        </td>
                        <td className="p-4 text-sm text-slate-500 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                           <div className="flex items-center gap-1">
                              <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center"><CreditCard className="h-3 w-3 text-emerald-600" /></div>
                              <span className="text-sm font-black text-slate-900">ETB {order.totalAmount}</span>
                           </div>
                        </td>
                        <td className="p-4">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                             order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                             order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                             'bg-blue-100 text-blue-700'
                           }`}>
                              {order.status}
                           </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                   ))
                 ) : (
                   <tr><td colSpan={7} className="p-12 text-center text-slate-400">No orders found.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
    </DashboardLayout>
  );
}
