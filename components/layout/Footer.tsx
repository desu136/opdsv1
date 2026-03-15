import React from 'react';
import Link from 'next/link';
import { Pill, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 text-slate-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                EthioPharma
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted online pharmacy and delivery system in Ethiopia. 
              We connect you with verified local pharmacies for fast, secure, 
              and reliable medicine delivery.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-primary-400 transition-colors">Shop Medicines</Link></li>
              <li><Link href="/pharmacies" className="hover:text-primary-400 transition-colors">Find Pharmacies</Link></li>
              <li><Link href="/tracking" className="hover:text-primary-400 transition-colors">Track Order</Link></li>
              <li><Link href="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Special Categories */}
          <div>
            <h3 className="text-white font-semibold mb-6">Categories</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/category/prescription" className="hover:text-primary-400 transition-colors">Prescription Drugs</Link></li>
              <li><Link href="/category/otc" className="hover:text-primary-400 transition-colors">Over-The-Counter</Link></li>
              <li><Link href="/category/vitamins" className="hover:text-primary-400 transition-colors">Vitamins & Supplements</Link></li>
              <li><Link href="/category/devices" className="hover:text-primary-400 transition-colors">Medical Devices</Link></li>
              <li><Link href="/category/baby" className="hover:text-primary-400 transition-colors">Baby & Mother Care</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary-500 shrink-0" />
                <span>Bole Road, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 text-primary-500 shrink-0" />
                <span>+251 911 234 567</span>
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 text-primary-500 shrink-0" />
                <span>support@ethiopharma.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} EthioPharma. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
