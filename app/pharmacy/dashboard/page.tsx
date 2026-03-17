'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { pharmacySidebarItems } from '@/components/layout/Sidebar';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ClipboardCheck, 
  Bell, 
  MoreVertical,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function PharmacyDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('new');
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedPrescriptionUrl, setSelectedPrescriptionUrl] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, inventoryRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/inventory')
      ]);

      if (ordersRes.ok && inventoryRes.ok) {
        const ordersData = await ordersRes.json();
        const inventoryData = await inventoryRes.json();
        setOrders(ordersData);
        setInventory(inventoryData);
      }
    } catch (err) {
      console.error('Failed to fetch pharmacy data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh local data
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
      }
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  if (isAuthLoading || (user && isLoadingData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) return null;

  // Filter orders based on tab
  const filteredOrders = orders.filter(o => {
    if (activeTab === 'new') return o.status === 'PENDING';
    if (activeTab === 'preparing') return o.status === 'PREPARING' || o.status === 'PLACED';
    return true;
  });

  // Calculate KPIs
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt.startsWith(today)).length;
  const pendingRx = orders.filter(o => o.prescription && o.prescription.status === 'PENDING_REVIEW').length;
  const lowStockCount = inventory.filter(p => p.stock <= 10).length;
  const revenue = orders
    .filter(o => o.status === 'COMPLETED' && o.createdAt.startsWith(today))
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const lowStockItems = inventory.filter(p => p.stock <= 10).slice(0, 5);

  return (
    <DashboardLayout 
      items={pharmacySidebarItems} 
      title="Store Dashboard"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Manage Orders</h1>
           <p className="text-slate-500">Inventory and dispensing overview.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="primary" className="rounded-xl px-4">Download Orders</Button>
        </div>
      </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: "Today's Orders", value: todayOrders.toString(), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
              { title: 'Pending Rx Review', value: pendingRx.toString(), icon: ClipboardCheck, color: 'text-orange-600', bg: 'bg-orange-50', trend: pendingRx > 0 ? 'Action needed' : '0' },
              { title: 'Low Stock Items', value: lowStockCount.toString(), icon: Package, color: 'text-red-600', bg: 'bg-red-50', trend: lowStockCount > 10 ? 'Urgent' : 'Minimal' },
              { title: "Today's Revenue", value: `ETB ${revenue.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: '+5.4%' },
            ].map((kpi, idx) => (
               <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                       <kpi.icon className="h-5 w-5" />
                     </div>
                     <span className={`text-xs font-bold ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-slate-400'}`}>
                       {kpi.trend}
                     </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">{kpi.title}</p>
                  </div>
               </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Order Queue */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Live Order Queue</h2>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      <button onClick={() => setActiveTab('new')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        New ({orders.filter(o => o.status === 'PENDING').length})
                      </button>
                      <button onClick={() => setActiveTab('preparing')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'preparing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        Preparing ({orders.filter(o => o.status === 'PREPARING').length})
                      </button>
                    </div>
                 </div>

                 <div className="divide-y divide-slate-100">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map(order => (
                        <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <span className="font-bold text-slate-900">#{order.id.slice(0, 8)}</span>
                                 {order.status === 'PENDING' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">NEW</span>}
                                 {order.prescription && <button onClick={() => setSelectedPrescriptionUrl(order.prescription.documentUrl)} className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors">VIEW RX</button>}
                              </div>
                              <p className="text-sm text-slate-500">{order.customer?.name || 'Guest'} • {order.items.length} items • <Clock className="h-3 w-3 inline mr-1" /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                           
                           <div className="flex items-center gap-3">
                             <div className="text-right mr-4">
                                <span className="text-sm text-slate-500 block">Total</span>
                                <span className="font-bold text-slate-900">{order.totalAmount.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</span>
                             </div>
                             {order.status === 'PENDING' ? (
                               <>
                                 <Button variant="outline" className="px-3 rounded-lg" onClick={() => handleStatusUpdate(order.id, 'CANCELLED')} disabled={isUpdating === order.id}>
                                   <XCircle className="h-4 w-4 text-red-500" />
                                 </Button>
                                 <Button variant="primary" className="px-4 rounded-lg" onClick={() => handleStatusUpdate(order.id, 'PREPARING')} disabled={isUpdating === order.id}>
                                   {isUpdating === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-2" /> Accept</>}
                                 </Button>
                               </>
                             ) : (
                               <Button variant="outline" className="px-4 rounded-lg" onClick={() => handleStatusUpdate(order.id, 'READY')} disabled={isUpdating === order.id}>
                                 {isUpdating === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark Ready'}
                               </Button>
                             )}
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-500">
                        No orders in this category.
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Sidebar Alerts */}
            <div className="space-y-6">
               
               {/* Rx Verification Needs */}
               <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
                 <div className="flex items-center gap-2 mb-4">
                   <ClipboardCheck className="h-5 w-5 text-amber-600" />
                   <h3 className="font-bold text-amber-900">Rx Verifications Required</h3>
                 </div>
                 <div className="space-y-3">
                   {orders.filter(o => o.prescription && o.prescription.status === 'PENDING_REVIEW').map(order => (
                     <div key={order.id} className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-900">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{order.items[0]?.product.name || 'Medicine'}</p>
                        </div>
                        <button className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">Review</button>
                     </div>
                   ))}
                   {pendingRx === 0 && <p className="text-xs text-amber-700 italic">All caught up!</p>}
                 </div>
               </div>

               {/* Low Stock Alerts */}
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-slate-900">Low Stock Alerts</h3>
                   <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
                 </div>
                 <ul className="space-y-4">
                   {lowStockItems.length > 0 ? (
                     lowStockItems.map((item, idx) => (
                       <li key={idx} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700 truncate mr-2">{item.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                             <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (item.stock / 20) * 100)}%` }}></div>
                             </div>
                             <span className="text-xs font-bold text-red-600 min-w-[30px] text-right">{item.stock}</span>
                          </div>
                       </li>
                     ))
                   ) : (
                     <p className="text-xs text-slate-400 italic">No items currently low on stock.</p>
                   )}
                 </ul>
                 <Button variant="outline" className="w-full mt-6 text-sm">Manage Inventory</Button>
               </div>
            </div>

          </div>

          {/* Prescription Viewer Modal */}
          {selectedPrescriptionUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedPrescriptionUrl(null)}>
              <div className="bg-white rounded-3xl p-2 max-w-2xl w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedPrescriptionUrl(null)} className="absolute -top-12 right-0 p-2 text-white hover:text-slate-200 transition-colors">
                  <XCircle className="h-8 w-8" />
                </button>
                <div className="overflow-hidden rounded-2xl bg-slate-100 min-h-[400px] flex items-center justify-center">
                  <img src={selectedPrescriptionUrl} alt="Prescription" className="max-w-full max-h-[80vh] object-contain" />
                </div>
                <div className="p-4 flex justify-between items-center">
                   <h3 className="font-bold text-slate-900">Prescription Document</h3>
                   <a href={selectedPrescriptionUrl} target="_blank" rel="noreferrer" className="text-primary-600 text-sm font-bold hover:underline">Open Original</a>
                </div>
              </div>
            </div>
          )}
    </DashboardLayout>
  );
}
