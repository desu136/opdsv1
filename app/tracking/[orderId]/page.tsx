'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
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
            
            {/* Live Map Placeholder */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden isolate relative h-[400px]">
              {/* Map abstract background */}
              <div className="absolute inset-0 bg-[#e5e3df] z-0 opacity-50">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                
                {/* Simulated route line */}
                 <svg className="absolute w-full h-full" style={{ zIndex: 1 }}>
                   <path d="M 100 300 Q 250 150 400 200 T 700 100" fill="none" stroke="#2563eb" strokeWidth="6" strokeDasharray="10, 10" className="opacity-60 animate-pulse" />
                 </svg>

                 {/* Pharmacy Marker */}
                 <div className="absolute top-[280px] left-[80px] transform -translate-x-1/2 -translate-y-full z-10 flex flex-col items-center">
                    <div className="bg-white px-3 py-1 rounded-lg shadow-md mb-2 text-xs font-bold text-slate-900 border border-slate-200">
                      {order.pharmacy.name}
                    </div>
                    <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <Store className="h-4 w-4 text-white" />
                    </div>
                 </div>

                 {/* Agent Marker (Current Location) */}
                 <div className="absolute top-[180px] left-[380px] transform -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center">
                    <div className="bg-primary-600 px-3 py-1 rounded-lg shadow-md mb-2 text-xs font-bold text-white relative animate-bounce">
                      Agent Location
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary-600 rotate-45"></div>
                    </div>
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl isolate">
                       <span className="absolute w-full h-full rounded-full bg-primary-400 animate-ping -z-10 opacity-75"></span>
                       <Navigation className="h-5 w-5 text-white transform -rotate-45" />
                    </div>
                 </div>

                 {/* Customer Location Marker */}
                 <div className="absolute top-[80px] left-[680px] transform -translate-x-1/2 -translate-y-full z-10 flex flex-col items-center">
                    <div className="bg-white px-3 py-1 rounded-lg shadow-md mb-2 text-xs font-bold text-slate-900 border border-slate-200">
                      Delivery Address
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                 </div>
              </div>
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
