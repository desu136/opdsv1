'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FileText } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export function HeroActions() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleOrder = () => {
    if (isLoading) return;
    if (user) {
      router.push('/products');
    } else {
      router.push('/login?redirect=/products');
    }
  };

  const handlePrescription = () => {
    if (isLoading) return;
    if (user) {
      // Assuming customer dashboard or specific prescription page
      router.push('/customer/prescriptions');
    } else {
      router.push('/login?redirect=/customer/prescriptions');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <Button 
        onClick={handleOrder}
        variant="primary" 
        size="lg" 
        className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary-600/20"
      >
        Order Medicine
      </Button>
      <Button 
        onClick={handlePrescription}
        variant="outline" 
        size="lg" 
        className="w-full sm:w-auto rounded-xl bg-white hover:bg-slate-50 border-slate-200"
      >
        <FileText className="h-5 w-5 mr-2" />
        Upload Prescription
      </Button>
    </div>
  );
}
