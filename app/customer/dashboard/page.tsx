'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { customerSidebarItems } from '@/components/layout/Sidebar';
import { OrderCard, OrderProps } from '@/components/ui/OrderCard';
import { Search, Heart, Clock, Bell, Settings, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CustomerDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    total: 0,
    prescriptions: 0,
    saved: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (res.ok) {
          setOrders(data);
          
          // Calculate stats
          const active = data.filter((o: any) => !['COMPLETED', 'CANCELLED'].includes(o.status)).length;
          const prescriptions = data.filter((o: any) => o.prescription).length;
          
          setStats({
            active,
            total: data.length,
            prescriptions,
            saved: 0 // Feature not implemented yet
          });
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (isAuthLoading || (user && isLoadingOrders)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return null; // AuthProvider handles redirect
  }

  return (
    <DashboardLayout 
      items={customerSidebarItems} 
      title="Customer Dashboard"
    >
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name?.split(' ')[0] || 'Customer'}! 👋</h1>
          <p className="text-slate-500">Here's what's happening with your health orders.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="primary">
            New Order
          </Button>
        </div>
      </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Orders', value: stats.active.toString(), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Orders', value: stats.total.toString(), icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Saved Medicines', value: stats.saved.toString(), icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
              { label: 'Prescriptions', value: stats.prescriptions.toString(), icon: Search, color: 'text-purple-600', bg: 'bg-purple-50' }, 
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Main Content Area */}
            <div className="lg:w-2/3 space-y-8">
              
              {/* Active / Recent Orders */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                  <button className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</button>
                </div>
                <div className="space-y-4">
                  {orders.length > 0 ? (
                    orders.map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))
                  ) : (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 border-dashed text-center">
                      <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">No orders yet</h3>
                      <p className="text-slate-500 mb-6">Start your healthcare journey by placing your first order.</p>
                      <Button variant="outline">Browse Pharmacies</Button>
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* Sidebar Area */}
            <div className="lg:w-1/3 space-y-8">
              
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                        <Search className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-slate-700">Upload Prescription</span>
                    </div>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary-50 text-secondary-600 rounded-lg flex items-center justify-center group-hover:bg-secondary-100 transition-colors">
                        <Heart className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-slate-700">Reorder Medicines</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Patient Profile Summary */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Profile Details</h3>
                  <button className="text-slate-400 hover:text-primary-600 transition-colors"><Settings className="h-4 w-4" /></button>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium text-slate-900">{user.phone || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium text-slate-900">{user.email}</span>
                  </li>
                  <li className="flex justify-between pb-2">
                    <span className="text-slate-500">Account Status</span>
                    <span className="font-medium text-green-600 uppercase tracking-tight text-xs">{user.status}</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

    </DashboardLayout>
  );
}
