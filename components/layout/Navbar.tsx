'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Pill, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCart } from '@/components/providers/CartProvider';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { totalItems } = useCart();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    await logout();
    toggleMenu(); // Close mobile menu if open
  };

  const isActive = (path: string) => pathname === path;

  const NavLinks = () => {
    if (user && user.role !== 'CUSTOMER') return null;
    
    return (
      <>
        <Link href="/products" className={`transition-colors hover:text-primary-600 ${isActive('/products') ? 'text-primary-600 font-semibold' : 'text-slate-600'}`}>
          Medicines
        </Link>
        <Link href="/pharmacies" className={`transition-colors hover:text-primary-600 ${isActive('/pharmacies') ? 'text-primary-600 font-semibold' : 'text-slate-600'}`}>
          Pharmacies
        </Link>
        <Link href="/tracking" className={`transition-colors hover:text-primary-600 ${isActive('/tracking') ? 'text-primary-600 font-semibold' : 'text-slate-600'}`}>
          Track Order
        </Link>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              EthioPharma
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <NavLinks />
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" className="relative p-2 rounded-full" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-secondary-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          {user && (
            <>
              <NotificationBell />
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
            </>
          )}
          
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800 leading-none">{user.name?.split(' ')[0] || 'User'}</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user.role}</span>
                </div>
                
                {/* Dynamically route to their specific dashboard based on role */}
                <Link href={
                  user.role === 'ADMIN' ? '/admin/dashboard' : 
                  user.role === 'PHARMACIST' ? '/pharmacy/dashboard' : 
                  user.role === 'DELIVERY_AGENT' ? '/agent/dashboard' : 
                  '/customer/dashboard'
                }>
                  <Button variant="outline" size="sm" className="hidden lg:flex">
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Button>
                </Link>

                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Partner with Us</Button>
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Link href="/cart" className="relative text-slate-600 hover:text-primary-600">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-secondary-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={toggleMenu} className="text-slate-600 p-1 focus:outline-none" aria-label="Menu">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg border-b border-slate-200 animate-in slide-in-from-top-2">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <NavLinks />
            <hr className="border-slate-100" />
            <div className="flex flex-col gap-3">
              {!isLoading && (
                user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 mb-2">
                       <div className="bg-primary-100 p-2 rounded-full"><User className="h-5 w-5 text-primary-700"/></div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">{user.name || 'User'}</p>
                         <p className="text-xs text-slate-500">{user.role}</p>
                       </div>
                    </div>
                    <Link href={
                        user.role === 'ADMIN' ? '/admin/dashboard' : 
                        user.role === 'PHARMACIST' ? '/pharmacy/dashboard' : 
                        user.role === 'DELIVERY_AGENT' ? '/agent/dashboard' : 
                        '/customer/dashboard'
                      } 
                      onClick={toggleMenu}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full justify-center text-slate-700">Go to Dashboard</Button>
                    </Link>
                    <Button variant="ghost" onClick={handleLogout} className="w-full text-red-600 justify-center hover:bg-red-50">Logout</Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={toggleMenu}>
                      <Button variant="outline" className="w-full justify-center">Login</Button>
                    </Link>
                    <Link href="/register" onClick={toggleMenu}>
                      <Button variant="primary" className="w-full justify-center">Partner with Us</Button>
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
