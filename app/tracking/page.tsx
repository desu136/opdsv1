'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { PackageSearch, Search } from 'lucide-react';

export default function TrackOrderLandingPage() {
  const [orderId, setOrderId] = useState('');
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      router.push(`/tracking/${orderId}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 max-w-xl w-full text-center relative overflow-hidden isolate">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -z-10 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-50 rounded-full blur-3xl -z-10 -ml-20 -mb-20"></div>

          <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
             <PackageSearch className="h-10 w-10" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-3">Track Your Order</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            Enter your Order ID (e.g. ORD-8923) to see real-time updates on your medicine delivery.
          </p>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Enter Order ID" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                required
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="rounded-2xl px-8 h-[60px] shadow-lg shadow-primary-500/20">
              Track
            </Button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
