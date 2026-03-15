'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, pharmacySidebarItems } from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  ShoppingCart,
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
        // Refresh local state
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          items={pharmacySidebarItems} 
          userRole="Pharmacy" 
          userName={user?.name || 'Pharmacy Staff'} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Order Queue</h1>
               <p className="text-slate-500">Manage incoming and active orders for your pharmacy.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                  type="text" 
                  placeholder="Search by ID or Customer..." 
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
               <Button variant="outline" className="relative p-2 rounded-xl" onClick={fetchOrders}>
                 <Loader2 className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
               </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'PENDING', label: 'Pending RX' },
              { id: 'PLACED', label: 'New' },
              { id: 'PREPARING', label: 'Preparing' },
              { id: 'READY', label: 'Ready' },
              { id: 'COMPLETED', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === tab.id 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Orders List */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                     <th className="p-4 pl-6 whitespace-nowrap">Order ID</th>
                     <th className="p-4 whitespace-nowrap">Customer</th>
                     <th className="p-4 whitespace-nowrap">Date</th>
                     <th className="p-4 whitespace-nowrap">Payment</th>
                     <th className="p-4 whitespace-nowrap">Items</th>
                     <th className="p-4 whitespace-nowrap">Total</th>
                     <th className="p-4 whitespace-nowrap">Status</th>
                     <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {isLoading ? (
                     <tr>
                       <td colSpan={8} className="p-12 text-center">
                         <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
                         <p className="text-slate-500">Loading orders...</p>
                       </td>
                     </tr>
                   ) : filteredOrders.length > 0 ? (
                     filteredOrders.map((order) => (
                       <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="p-4 pl-6 font-bold text-slate-900">#{order.id.slice(-6).toUpperCase()}</td>
                         <td className="p-4 text-slate-700">{order.customer?.name}</td>
                         <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                         <td className="p-4 text-slate-600">
                           <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs font-medium">
                             {order.paymentMethod}
                           </span>
                         </td>
                         <td className="p-4 text-slate-500">{order.items?.length || 0} Items</td>
                         <td className="p-4 font-semibold text-slate-900">{order.totalAmount.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</td>
                         <td className="p-4">
                            {getStatusBadge(order.status)}
                         </td>
                         <td className="p-4 pr-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                             {order.status === 'PLACED' && (
                               <Button 
                                onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                                variant="primary" size="sm" className="rounded-lg h-8 px-3 text-xs"
                               >
                                Accept
                               </Button>
                             )}
                             {order.status === 'PREPARING' && (
                               <Button 
                                onClick={() => handleStatusUpdate(order.id, 'READY')}
                                variant="outline" size="sm" className="rounded-lg h-8 px-3 text-xs border-primary-200 text-primary-700 bg-primary-50"
                               >
                                Mark Ready
                               </Button>
                             )}
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50">
                               <Eye className="h-4 w-4" />
                             </Button>
                           </div>
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan={8} className="p-8 text-center text-slate-500">
                         <div className="flex flex-col items-center justify-center">
                           <ShoppingCart className="h-10 w-10 text-slate-300 mb-2" />
                           <p>No orders found matching this filter.</p>
                         </div>
                       </td>
                     </tr>
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
