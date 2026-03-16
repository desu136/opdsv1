import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const PartnerSection = () => {
  return (
    <section className="bg-primary-600 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between bg-primary-700/50 rounded-3xl p-8 md:p-12 border border-primary-500 shadow-inner">
          <div className="text-white mb-8 md:mb-0 max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Are you a Pharmacy Owner?</h2>
            <p className="text-primary-100 text-lg">
              Join our growing network to reach more customers, easily manage 
              inventory, and process prescriptions digitally securely.
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link href="/register" className="w-full md:w-auto">
              <Button variant="secondary" size="lg" className="w-full md:w-auto shadow-xl">
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
