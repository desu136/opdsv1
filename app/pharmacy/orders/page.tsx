'use client';

import React, { useState, useEffect } from 'react';
import { pharmacySidebarItems } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Search,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PharmacyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error updating status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'ALL' || order.status === activeFilter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">PENDING RX</span>;
      case 'PLACED': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">NEW</span>;
      case 'PREPARING': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">PREPARING</span>;
      case 'READY': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700">READY</span>;
      case 'IN_TRANSIT': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">IN TRANSIT</span>;
      case 'COMPLETED': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">COMPLETED</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">CANCELLED</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <DashboardLayout items={pharmacySidebarItems} title="Pharmacy Orders">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-slate-900">
          <div>
             <h1 className="text-2xl font-bold">Order Queue</h1>
             <p className="text-slate-500">Manage incoming and active orders for your pharmacy.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             <Button variant="outline" className="p-2 rounded-xl" onClick={fetchOrders}>
               <Loader2 className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
             </Button>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar text-slate-900">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING', label: 'Pending RX' },
            { id: 'PLACED', label: 'New' },
            { id: 'PREPARING', label: 'Preparing' },
            { id: 'READY', label: 'Ready' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === tab.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 text-rose-700 p-4 rounded-2xl flex items-center gap-2 text-sm font-medium border border-rose-100">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-slate-900">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                   <th className="p-4 pl-6 whitespace-nowrap">Order ID</th>
                   <th className="p-4 whitespace-nowrap">Customer</th>
                   <th className="p-4 whitespace-nowrap">Total</th>
                   <th className="p-4 whitespace-nowrap">Status</th>
                   <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {isLoading ? (
                   <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /> Loading orders...</td></tr>
                 ) : filteredOrders.length > 0 ? (
                   filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-900">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="p-4">
                           <p className="text-sm font-bold text-slate-900">{order.customer?.name}</p>
                           <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4 font-black text-slate-900 text-sm">ETB {order.totalAmount.toLocaleString()}</td>
                        <td className="p-4">{getStatusBadge(order.status)}</td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {order.status === 'PLACED' && (
                              <Button onClick={() => handleStatusUpdate(order.id, 'PREPARING')} variant="primary" size="sm" className="rounded-lg h-8 px-3 text-[10px] font-bold">Accept</Button>
                            )}
                            {order.status === 'PREPARING' && (
                              <Button onClick={() => handleStatusUpdate(order.id, 'READY')} variant="outline" size="sm" className="rounded-lg h-8 px-3 text-[10px] font-bold border-primary-100 bg-primary-50 text-primary-700">Ready</Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><Eye className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                   ))
                 ) : (
                   <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">No orders found.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
    </DashboardLayout>
  );
}
