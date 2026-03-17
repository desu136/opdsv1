'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Phone, 
  Camera, 
  Package, 
  Clock, 
  Menu,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { agentSidebarItems } from '@/components/layout/Sidebar';

// Unified layout for the Delivery Agent
export default function AgentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('current'); // current, queue
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ completedCount: 0, earnings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAgentData = async () => {
    try {
      const [statsRes, activeRes, queueRes] = await Promise.all([
        fetch('/api/agent/stats'),
        fetch('/api/orders?status=IN_TRANSIT'),
        fetch('/api/orders?status=READY')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (activeRes.ok) {
        const activeOrders = await activeRes.json();
        setActiveDelivery(activeOrders[0] || null);
      }
      if (queueRes.ok) setQueue(await queueRes.json());
      
    } catch (err) {
      console.error('Failed to fetch agent data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'DELIVERY_AGENT') {
      fetchAgentData();
    }
  }, [user]);

  const handleAcceptOrder = async (orderId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_TRANSIT' })
      });
      if (res.ok) {
        await fetchAgentData();
        setActiveTab('current');
      }
    } catch (err) {
      console.error('Accept order error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      if (res.ok) {
        await fetchAgentData();
      }
    } catch (err) {
      console.error('Complete order error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <DashboardLayout 
      items={agentSidebarItems} 
      title="Agent Portal"
    >
      
      {/* Tabs */}
      <div className="flex bg-white px-2 pt-2 border-b border-slate-200 sticky top-0 md:top-[-32px] z-20 rounded-t-2xl">
        <button 
          onClick={() => setActiveTab('current')} 
          className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'current' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
        >
          Active Task
        </button>
        <button 
          onClick={() => setActiveTab('queue')} 
          className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'queue' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
        >
          Open Queue ({queue.length})
        </button>
      </div>

      <div className="pb-24 pt-6">
        
        {activeTab === 'current' ? (
          <div className="space-y-6">
            
            {activeDelivery ? (
                <div className="bg-white rounded-3xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-primary-50 text-primary-700 font-bold px-4 py-1.5 rounded-bl-xl text-sm">
                     ETB 50.00
                   </div>
                   
                   <div className="flex items-center gap-2 mb-4">
                     <Package className="h-5 w-5 text-primary-600" />
                     <h2 className="font-bold text-slate-900">{activeDelivery.id.slice(0, 8)}</h2>
                   </div>

                   {/* Route Timeline */}
                   <div className="relative pl-6 py-2 space-y-6 mb-6">
                     <div className="absolute left-2.5 top-4 bottom-4 w-0.5 bg-slate-200"></div>
                     
                     <div className="relative">
                       <div className="absolute -left-[27px] w-5 h-5 rounded-full bg-primary-100 border-2 border-primary-600 flex items-center justify-center">
                         <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                       </div>
                       <h3 className="text-xs font-bold text-slate-500 uppercase">Pickup Location</h3>
                       <p className="font-semibold text-slate-900">{activeDelivery.pharmacy.name}</p>
                       <p className="text-sm text-slate-600 mt-1 line-clamp-1">{activeDelivery.pharmacy.address || 'Pharmacy Address'}</p>
                     </div>

                     <div className="relative">
                       <div className="absolute -left-[27px] w-5 h-5 rounded-full bg-white border-2 border-slate-300"></div>
                       <h3 className="text-xs font-bold text-slate-500 uppercase">Dropoff Location</h3>
                       <p className="font-semibold text-slate-900">{activeDelivery.customer.name}</p>
                       <p className="text-sm text-slate-600 mt-1 line-clamp-1">{activeDelivery.shippingAddress}</p>
                     </div>
                   </div>

                   {/* Actions */}
                   <div className="grid grid-cols-2 gap-3 mb-4">
                     <a href={`tel:${activeDelivery.customer.phone}`} className="w-full">
                       <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                         <Phone className="h-4 w-4" /> Call Client
                       </Button>
                     </a>
                     <Button variant="outline" className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                       <Navigation className="h-4 w-4" /> Navigate
                     </Button>
                   </div>

                   <hr className="border-slate-100 mb-4" />

                   <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full text-lg h-14 rounded-2xl shadow-md"
                    onClick={() => handleCompleteOrder(activeDelivery.id)}
                    disabled={isUpdating}
                   >
                     {isUpdating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Complete Delivery'} 
                     {!isUpdating && <CheckCircle2 className="h-5 w-5 ml-2" />}
                   </Button>
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">No Active Task</h3>
                    <p className="text-sm text-slate-500 mb-6">Go to the Open Queue to accept a new delivery task.</p>
                    <Button variant="outline" onClick={() => setActiveTab('queue')}>View Queue</Button>
                </div>
            )}

            {/* Daily Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Completed</p>
                  <p className="font-bold text-slate-900 text-lg">{stats.completedCount} Orders</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Earnings</p>
                  <p className="font-bold text-slate-900 text-lg">ETB {stats.earnings}</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-4">
             {queue.length > 0 ? queue.map(job => (
               <div key={job.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform">
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <span className="text-xs font-bold text-slate-400">#{job.id.slice(0, 8)}</span>
                     <h3 className="font-bold text-slate-900">{job.pharmacy.name}</h3>
                   </div>
                   <div className="bg-green-50 text-green-700 font-bold px-3 py-1 rounded-lg text-sm">
                     ETB 50.00
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                   <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.pharmacy.address || 'Pickup'}</span>
                   <span className="flex items-center gap-1"><Navigation className="h-4 w-4" /> 2.4 km away</span>
                 </div>

                 <Button 
                    variant="outline" 
                    className="w-full rounded-xl justify-between px-4 group hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200"
                    onClick={() => handleAcceptOrder(job.id)}
                    disabled={isUpdating}
                 >
                   {isUpdating ? 'Assigning...' : 'Accept Delivery'}
                   {!isUpdating && <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                 </Button>
               </div>
             )) : (
                <div className="py-20 text-center text-slate-400">
                    <p>The queue is empty. Check back later!</p>
                </div>
             )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
