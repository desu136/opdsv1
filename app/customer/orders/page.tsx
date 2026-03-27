'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { 
  ShoppingCart, 
  Package, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  Loader2,
  Calendar,
  Clock
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
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PREPARING': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'READY': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'IN_TRANSIT': return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'CANCELLED': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe">
      <Navbar />

      <main className="flex-grow pt-6 pb-24 container mx-auto px-4 max-w-3xl">
          
          <div className="flex flex-col mb-8">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Orders</h1>
             <p className="text-slate-500 font-medium">View and track your previous deliveries.</p>
          </div>


          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
               <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-4" />
               <p className="text-slate-500 font-medium">Pulling up your orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
               {orders.map(order => (
                 <Link href={`/tracking/${order.id}`} key={order.id} className="block bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all active:scale-[0.98]">
                    <div className="flex flex-col gap-4">
                       
                       {/* Top Row: Status & Order ID */}
                       <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                             {order.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">#{order.id.slice(0, 8)}</span>
                       </div>

                       {/* Middle Row: Content */}
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                             <Package className="h-6 w-6 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h3 className="font-black text-slate-900 text-base truncate">{order.pharmacy.name}</h3>
                             <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                               {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • ETB {order.totalAmount.toLocaleString()}
                             </p>
                          </div>
                          <div className="shrink-0 h-8 w-8 bg-slate-50 rounded-full flex items-center justify-center">
                             <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                       </div>

                       {/* Bottom Row: Date */}
                       <div className="border-t border-slate-50 pt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <Calendar className="h-3.5 w-3.5 opacity-70" />
                          {new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       </div>

                    </div>
                 </Link>
               ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-[2.5rem] border border-dashed border-slate-200 mt-8">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="h-10 w-10 text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
               <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">It looks like you haven't placed any orders. Discover medicines from top pharmacies.</p>
               <Link href="/">
                  <Button variant="primary" size="lg" className="rounded-2xl px-8 font-black w-full sm:w-auto text-base h-14">Start Shopping</Button>
               </Link>
            </div>
          )}

      </main>
    </div>
  );
}
