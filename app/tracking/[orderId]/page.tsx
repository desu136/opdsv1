'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

const TrackingMap = dynamic(() => import('@/components/ui/TrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center rounded-3xl border border-slate-200">
      <span className="text-slate-400 font-medium text-sm flex items-center gap-2">
        Initializing Live Map...
      </span>
    </div>
  )
});
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Phone,
  MessageSquare,
  Navigation,
  Store,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function TrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.orderId;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const handleAction = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus === 'CANCELLED' ? 'cancel' : 'return'} this order?`)) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrder(await res.json());
      } else {
        const data = await res.json();
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsProcessingAction(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError('Order not found or access denied');
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load tracking information');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{error || 'Unable to track order'}</h2>
          <Link href="/customer/orders">
            <Button variant="primary">Back to Orders</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusSteps = () => {
    const status = order.status;
    const isCompleted = (s: string[]) => s.includes(status) || status === 'COMPLETED';
    const isCurrent = (s: string) => status === s;

    return [
      { 
        title: 'Order Placed', 
        time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        status: isCompleted(['PENDING', 'PREPARING', 'READY', 'IN_TRANSIT']) ? 'completed' : 'pending', 
        icon: CheckCircle2 
      },
      { 
        title: 'Payment Confirmed', 
        time: 'Verified', 
        status: isCompleted(['PENDING', 'PREPARING', 'READY', 'IN_TRANSIT']) ? 'completed' : 'pending', 
        icon: CheckCircle2 
      },
      { 
        title: 'Preparing Order', 
        time: isCurrent('PREPARING') ? 'In Progress' : isCompleted(['READY', 'IN_TRANSIT']) ? 'Done' : 'Pending', 
        status: isCompleted(['READY', 'IN_TRANSIT']) ? 'completed' : isCurrent('PREPARING') ? 'current' : 'pending', 
        icon: Package 
      },
      { 
        title: 'Out for Delivery', 
        time: isCurrent('IN_TRANSIT') ? 'En Route' : isCompleted(['COMPLETED']) ? 'Delivered' : 'Awaiting', 
        status: isCompleted(['COMPLETED']) ? 'completed' : isCurrent('IN_TRANSIT') ? 'current' : 'pending', 
        icon: Navigation 
      },
      { 
        title: 'Delivered', 
        time: order.delivery?.deliveryTime ? new Date(order.delivery.deliveryTime).toLocaleTimeString() : 'Estimated Today', 
        status: status === 'COMPLETED' ? 'completed' : 'pending', 
        icon: MapPin 
      },
    ];
  };

  const steps = getStatusSteps();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 pb-32 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Track Order #{order.id.slice(0, 8)}</h1>
            <p className="text-slate-500">Order Status: <span className="font-semibold text-primary-600">{order.status}</span></p>
          </div>
          <Link href="/customer/orders" className="hidden md:block">
             <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Tracking / Map Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Interactive Tracking Map */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden isolate relative h-[400px]">
               <TrackingMap 
                  pharmacyLoc={{
                    lat: order.pharmacy.lat || 9.0300, 
                    lng: order.pharmacy.lng || 38.7400,
                    name: order.pharmacy.name
                  }}
                  customerLoc={{
                    lat: order.delivery?.dropoffLat || 9.0200, 
                    lng: order.delivery?.dropoffLng || 38.7500,
                    name: 'Delivery Address'
                  }}
                  agentLoc={order.delivery?.agentId ? {
                    lat: order.delivery?.currentLat || 9.0250, 
                    lng: order.delivery?.currentLng || 38.7450,
                    name: order.delivery?.agent?.name
                  } : null}
               />
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
               <h2 className="text-lg font-bold text-slate-900 mb-8">Delivery Status</h2>
               
               <div className="relative">
                 {/* Progress Line */}
                 <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-100 z-0"></div>
                 
                 <div className="space-y-8 relative z-10">
                   {steps.map((step, idx) => {
                     const isComplete = step.status === 'completed';
                     const isCurrent = step.status === 'current';
                     
                     return (
                       <div key={idx} className="flex gap-6 items-start">
                         <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 ${
                           isComplete ? 'bg-green-100 border-white text-green-600' :
                           isCurrent ? 'bg-primary-600 border-primary-100 text-white shadow-lg' :
                           'bg-slate-50 border-white text-slate-300'
                         }`}>
                           <step.icon className="h-6 w-6" />
                         </div>
                         <div className="pt-3">
                           <h4 className={`font-bold ${isCurrent ? 'text-primary-700 text-lg' : isComplete ? 'text-slate-900' : 'text-slate-400'}`}>
                             {step.title}
                           </h4>
                           <p className={`text-sm ${isCurrent ? 'text-primary-600 font-medium' : 'text-slate-500'}`}>
                             {step.time}
                           </p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
            </div>

          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            
            {/* Delivery Agent Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Delivery Agent</h3>
              
              {order.delivery?.agent ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center border-2 border-primary-100">
                       <span className="text-2xl font-bold text-slate-400">
                         {order.delivery.agent.name.split(' ').map((n: string) => n[0]).join('')}
                       </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{order.delivery.agent.name}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> 
                        {order.status === 'IN_TRANSIT' ? 'En route' : 'Assigned'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a href={`tel:${order.delivery.agent.phone}`} className="w-full">
                      <Button variant="primary" className="w-full flex justify-center gap-2 rounded-xl">
                        <Phone className="h-4 w-4" /> Call
                      </Button>
                    </a>
                    <Button variant="outline" className="w-full flex justify-center gap-2 rounded-xl">
                      <MessageSquare className="h-4 w-4" /> Message
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-slate-500 text-sm">Waiting for a delivery agent to pick up your order.</p>
                </div>
              )}
            </div>

            {/* Order Details Summary */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Order Details</h3>
              
              <ul className="space-y-3 mb-6">
                {order.items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.product.name}</span>
                    <span className="font-medium text-slate-900">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
              
              <hr className="border-slate-200 mb-4" />
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-slate-500">Total Paid</span>
                <span className="text-lg font-bold text-slate-900">
                  {order.totalAmount.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
                </span>
              </div>

              {order.status === 'PENDING' && (
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 mb-4"
                  onClick={() => handleAction('CANCELLED')}
                  disabled={isProcessingAction}
                >
                  {isProcessingAction ? 'Processing...' : 'Cancel Order'}
                </Button>
              )}

              {order.status === 'COMPLETED' && (
                <Button 
                  variant="outline" 
                  className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 mb-4"
                  onClick={() => handleAction('RETURN_REQUESTED')}
                  disabled={isProcessingAction}
                >
                  {isProcessingAction ? 'Processing...' : 'Request Return'}
                </Button>
              )}

              {['CANCELLED', 'RETURN_REQUESTED', 'RETURNED'].includes(order.status) && (
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center text-sm font-medium text-slate-700 mb-4">
                  {order.status === 'CANCELLED' && 'This order was cancelled.'}
                  {order.status === 'RETURN_REQUESTED' && 'Return request pending.'}
                  {order.status === 'RETURNED' && 'Order has been returned.'}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Address</h4>
                <p className="text-sm text-slate-700 font-medium bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary-500 shrink-0" />
                  {order.shippingAddress || 'Address not specified'}
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
