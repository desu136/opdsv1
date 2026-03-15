'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, adminSidebarItems } from '@/components/layout/Sidebar';
import { 
  Search, 
  Filter, 
  MoreVertical,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    try {
      const url = filterStatus === 'all' ? '/api/orders' : `/api/orders?status=${filterStatus}`;
      const res = await fetch(url);
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
  }, [filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'PREPARING': return 'bg-blue-100 text-blue-700';
      case 'READY': return 'bg-indigo-100 text-indigo-700';
      case 'IN_TRANSIT': return 'bg-primary-100 text-primary-700';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={adminSidebarItems} userRole="Admin" userName="Super Admin" />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Platform Orders</h1>
               <p className="text-slate-500">Monitor all transactions and delivery statuses across the platform.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                 {['all', 'PENDING', 'PREPARING', 'READY', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'].map(s => (
                   <button 
                    key={s} 
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === s ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                   >
                     {s.split('_').join(' ')}
                   </button>
                 ))}
               </div>
               <div className="relative w-full md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input type="text" placeholder="Search orders..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-0 transition-all" />
               </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                     <th className="p-4 pl-6">Order ID</th>
                     <th className="p-4">Customer</th>
                     <th className="p-4">Pharmacy</th>
                     <th className="p-4">Amount</th>
                     <th className="p-4">Status</th>
                     <th className="p-4 pr-6 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr><td colSpan={6} className="p-12 text-center text-slate-400"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading platform orders...</td></tr>
                    ) : orders.length > 0 ? orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 font-mono text-xs font-bold text-slate-400">#{order.id.slice(0, 8)}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900 text-sm">{order.customer.name}</p>
                          <p className="text-xs text-slate-500">{order.customer.phone}</p>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-700">{order.pharmacy.name}</td>
                        <td className="p-4 text-sm font-bold text-slate-900">ETB {order.totalAmount.toLocaleString()}</td>
                        <td className="p-4">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                             {order.status}
                           </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <Link href={`/tracking/${order.id}`}>
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50">
                               <Eye className="h-4 w-4" />
                             </Button>
                           </Link>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="p-12 text-center text-slate-400">No orders found matching criteria.</td></tr>
                    )}
                 </tbody>
               </table>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
