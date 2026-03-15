'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, customerSidebarItems } from '@/components/layout/Sidebar';
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Loader2,
  Search,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    if (user?.role === 'CUSTOMER') fetchOrders();
  }, [user]);

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
        <Sidebar items={customerSidebarItems} userRole="Customer" userName={user?.name || 'Customer'} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
               <p className="text-slate-500">View and track all your medicine orders.</p>
            </div>
            <Link href="/products">
               <Button variant="primary" className="rounded-xl px-6">New Order</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-4" />
               <p className="text-slate-500">Retrieving your order history...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
               {orders.map(order => (
                 <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                             <Package className="h-6 w-6 text-primary-600" />
                          </div>
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                   {order.status}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">#{order.id.slice(0, 8)}</span>
                             </div>
                             <h3 className="font-bold text-slate-900">{order.items.length} Items from {order.pharmacy.name}</h3>
                             <p className="text-sm text-slate-500">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                          <div className="text-right">
                             <p className="text-xs text-slate-500 font-medium">Total Amount</p>
                             <p className="font-bold text-slate-900 text-lg">ETB {order.totalAmount.toLocaleString()}</p>
                          </div>
                          <Link href={`/tracking/${order.id}`}>
                             <Button variant="outline" className="rounded-xl flex items-center gap-2 group">
                                Track <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                             </Button>
                          </Link>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-slate-300">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="h-10 w-10 text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
               <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't placed any orders yet. Start exploring medicines and products from verified pharmacies.</p>
               <Link href="/products">
                  <Button variant="primary" size="lg" className="rounded-2xl px-8">Start Shopping</Button>
               </Link>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
