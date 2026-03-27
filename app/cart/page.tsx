'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Store 
} from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();

  const deliveryFee = 50.00;
  const tax = totalPrice * 0.15; // 15% VAT
  const grandTotal = totalPrice + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="bg-white p-8 rounded-full shadow-sm mb-6">
            <ShoppingBag className="h-16 w-16 text-slate-300" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
          <p className="text-slate-500 mb-8 max-w-md">Looks like you haven't added any medicines yet. Find what you need from our verified pharmacies.</p>
          <Link href="/products">
            <Button size="lg" className="rounded-2xl px-8">
              Browse Medicines
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-4 md:py-12 pb-32 md:pb-12">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* Cart Items List */}
          <div className="flex-1 space-y-4 md:space-y-6">
            <div className="flex items-center justify-between px-1">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">Your Cart ({totalItems})</h1>
              <button 
                onClick={clearCart} 
                className="text-xs md:text-sm font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="p-3 md:p-6 flex items-start gap-3 md:gap-6">
                    {/* Item Image Placeholder */}
                    <div className="h-20 w-20 md:h-24 md:w-24 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                      <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-slate-200" />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 flex flex-col h-full py-0.5">
                      <div className="mb-0.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Store className="h-3 w-3 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.pharmacyName}</span>
                        </div>
                        <h3 className="text-sm md:text-lg font-bold text-slate-900 truncate leading-tight mb-1">
                          {item.name}
                        </h3>
                        {item.requiresPrescription && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-tighter">
                            <ShieldCheck className="h-2.5 w-2.5" /> Rx Required
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-auto pt-2 flex items-center justify-between w-full">
                        <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-100">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white transition-colors text-slate-500 hover:text-primary-600"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white transition-colors text-slate-500 hover:text-primary-600"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm md:text-xl font-black text-slate-900 leading-none">
                            {(item.price * item.quantity).toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.price.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
              <p className="text-sm text-primary-800">
                Items marked with <strong>Rx Required</strong> will need a valid prescription during checkout.
              </p>
            </div>
          </div>

          {/* Checkout Summary Sidebar */}
          <div className="lg:w-96">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{totalPrice.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-slate-900">{deliveryFee.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated VAT (15%)</span>
                  <span className="font-medium text-slate-900">{tax.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</span>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-black text-primary-600">
                      {grandTotal.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
                    </span>
                  </div>
                </div>
              </div>

              {user ? (
                <Link href="/checkout">
                  <Button size="lg" className="w-full h-14 rounded-2xl text-lg font-bold group shadow-lg shadow-primary-200">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <div className="space-y-4">
                  <Link href="/login?redirect=/cart">
                    <Button size="lg" className="w-full h-14 rounded-2xl text-lg font-bold">
                      Login to Checkout
                    </Button>
                  </Link>
                  <p className="text-center text-xs text-slate-500">
                    You need to be logged in as a customer to place an order.
                  </p>
                </div>
              )}
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>Secure 256-bit SSL encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
      
      {/* Mobile Sticky Checkout Bar */}
      {items.length > 0 && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)] z-40 pb-safe">
          <div className="flex items-center justify-between gap-4">
             <div>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total</p>
               <p className="text-xl font-black text-primary-600 leading-none">{grandTotal.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</p>
             </div>
             {user ? (
                <Link href="/checkout" className="flex-1">
                  <Button size="lg" className="w-full rounded-2xl font-bold shadow-lg shadow-primary-200">
                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
             ) : (
                <Link href="/login?redirect=/cart" className="flex-1">
                  <Button size="lg" className="w-full rounded-2xl font-bold shadow-lg shadow-primary-200">
                    Login to Pay
                  </Button>
                </Link>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
