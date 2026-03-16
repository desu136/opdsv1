'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, CheckCircle2, MapPin } from 'lucide-react';
import { RealisticCapsule } from './RealisticCapsule';

export function HeroIllustration() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [orderData, setOrderData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setIsMounted(true);
    fetchLatestOrder();
  }, []);

  const fetchLatestOrder = async () => {
    try {
      const res = await fetch('/api/orders/latest');
      const data = await res.json();
      if (data.hasActiveOrder) {
        setOrderData(data.order);
      }
    } catch (error) {
      console.error('Error fetching latest order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Verifying...';
      case 'PREPARING': return 'Preparing Order';
      case 'READY': return 'Ready for Pickup';
      case 'IN_TRANSIT': return 'Out for Delivery';
      default: return status || 'Processing';
    }
  };

  if (!isMounted) return (
    <div className="relative w-full aspect-square max-w-lg mx-auto bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-2xl shadow-primary-900/10 border border-white flex items-center justify-center">
    </div>
  );

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-2xl shadow-primary-900/10 border border-white flex items-center justify-center overflow-visible">
      
      {/* Dynamic Popups overlapping for visual interest */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
        transition={{ 
          opacity: { duration: 0.5 },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute top-12 -right-8 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-20 flex items-center gap-4 hover:scale-105 transition-transform cursor-pointer"
      >
        <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Order Status</p>
          <p className="text-sm font-bold text-slate-900">
            {orderData ? getStatusLabel(orderData.status) : 'Out for Delivery'}
          </p>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
        transition={{ 
          opacity: { duration: 0.5, delay: 0.2 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }
        }}
        className="absolute bottom-24 -left-12 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-20 flex items-center gap-4 max-w-[260px] hover:scale-105 transition-transform cursor-pointer"
      >
          <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
            <MapPin className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Delivering to</p>
            <p className="text-sm font-bold text-slate-900 leading-tight">
              {orderData ? (orderData.shippingAddress || 'Your Address') : 'Your Doorstep'}
            </p>
          </div>
      </motion.div>

      {/* Central Animated Illustration */}
      <div className="w-[75%] h-[75%] bg-gradient-to-br from-slate-50 to-primary-50/30 rounded-[2rem] border-4 border-white shadow-inner relative overflow-hidden flex items-center justify-center">
        
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [-40, -20, -40] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[10%] top-[15%]"
        >
          <RealisticCapsule className="w-32 h-14" />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, 10, 0], rotate: [20, 35, 20] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute left-[30%] top-[45%]"
        >
          <RealisticCapsule className="w-24 h-10" />
        </motion.div>
        
        {/* Additional Capsules */}
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [60, 45, 60] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute right-[10%] bottom-[15%] opacity-80"
        >
          <RealisticCapsule className="w-20 h-8" />
        </motion.div>

        <motion.div
          animate={{ x: [0, -15, 0], y: [0, 10, 0], rotate: [-15, 0, -15] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute right-[35%] top-[10%] opacity-60"
        >
          <RealisticCapsule className="w-16 h-7" />
        </motion.div>

        {/* Animated Medical Cross */}
        <motion.div
          animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute right-[20%] top-[30%] text-rose-500/80"
        >
          <div className="bg-white p-3 rounded-full shadow-lg border border-slate-100">
            <Plus className="w-12 h-12" strokeWidth={3} />
          </div>
        </motion.div>

        {/* Animated Delivery Truck crossing the center */}
        <motion.div
          animate={{ x: ['-100%', '250%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[20%] left-0 flex items-center"
        >
          <div className="relative">
            <Truck className="w-20 h-20 text-primary-600 drop-shadow-xl" />
            <motion.div 
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute top-1/2 -right-4 w-3 h-3 bg-yellow-400 rounded-full blur-[2px]"
            />
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-400/50 to-transparent rounded-full ml-2"></div>
        </motion.div>
        
        {/* Central Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-300/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}
