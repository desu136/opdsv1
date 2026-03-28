import React from 'react';
import Link from 'next/link';
import { Pill, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="hidden md:block bg-slate-900 py-8 text-slate-300">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <Pill className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            EthioPharma
          </span>
        </div>
        
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link href="/register" className="text-primary-400 hover:text-primary-300 transition-colors">Partner with Us</Link>
        </div>

        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} EthioPharma. All rights reserved.</p>
      </div>
    </footer>
  );
};
