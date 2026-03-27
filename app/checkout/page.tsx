'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Camera
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Address, 2: Prescription (if needed), 3: Payment
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Form State
  const [address, setAddress] = useState({
    street: '',
    city: 'Addis Ababa',
    phone: user?.phone || '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD, CBEBirr, Telebirr
  const [prescriptions, setPrescriptions] = useState<File[]>([]);

  const deliveryFee = 50.00;
  const tax = totalPrice * 0.15;
  const grandTotal = totalPrice + deliveryFee + tax;
  const hasCoordinates = !!(user?.lastLat && user?.lastLng);

  const requiresPrescription = items.some(item => item.requiresPrescription);

  const [isUploading, setIsUploading] = useState(false);

  const handleNextStep = async () => {
    if (step === 1) {
      if (!address.street && !hasCoordinates) {
        setError('Please enter your delivery street address or enable location');
        return;
      }
      setError(null);
      if (requiresPrescription) setStep(2);
      else setStep(3);
    } else if (step === 2) {
      if (prescriptions.length === 0) {
        setError('Please upload at least one prescription for your Rx items');
        return;
      }
      
      // Upload prescriptions to Cloudinary
      setIsUploading(true);
      setError(null);
      try {
        const uploadedUrls: string[] = [];
        for (const file of prescriptions) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'prescriptions');
          
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!res.ok) throw new Error('Failed to upload one or more prescriptions');
          const data = await res.json();
          uploadedUrls.push(data.url);
        }
        // Save the first URL for the order (Prisma schema supports one prescription per order currently)
        (window as any)._prescriptionUrl = uploadedUrls[0]; 
        setStep(3);
      } catch (err: any) {
        setError(err.message || 'Prescription upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Prepare order data
      const orderData = {
        pharmacyId: items[0].pharmacyId,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: grandTotal,
        paymentMethod: paymentMethod,
        shippingAddress: address.street || (hasCoordinates ? 'Detected Phone Location' : ''),
        lat: user?.lastLat,
        lng: user?.lastLng,
        phone: address.phone,
        notes: address.notes,
        prescriptionUrl: (window as any)._prescriptionUrl || null,
        status: requiresPrescription ? 'PENDING' : 'PLACED'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const order = await res.json();
        setOrderSuccess(order.id);
        clearCart();
        delete (window as any)._prescriptionUrl;
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4">Order Placed!</h1>
            <p className="text-slate-500 mb-8">
              Your order <span className="font-bold text-slate-900">#{orderSuccess.slice(-8).toUpperCase()}</span> has been placed successfully. 
              {requiresPrescription ? ' The pharmacy is reviewing your prescription.' : ' You will receive a notification when the agent picks it up.'}
            </p>
            <div className="space-y-4">
              <Link href="/customer/orders">
                <Button className="w-full h-12 rounded-xl text-lg font-bold">Track My Orders</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full h-12 rounded-xl">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-4 md:py-12 pb-32 md:pb-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Checkout Steps Header */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center w-full max-w-xl px-2">
              <div className={`flex flex-col items-center relative group`}>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all ${step >= 1 ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-200 text-slate-500'}`}>
                  1
                </div>
                <span className={`absolute -bottom-6 whitespace-nowrap text-[9px] md:text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-primary-600' : 'text-slate-400'}`}>Shipping</span>
              </div>

              <div className={`flex-grow h-1 mx-2 md:mx-4 rounded-full transition-colors ${step >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>

              <div className={`flex flex-col items-center relative`}>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all ${step >= 2 ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-200 text-slate-500'}`}>
                  2
                </div>
                <span className={`absolute -bottom-6 whitespace-nowrap text-[9px] md:text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-primary-600' : 'text-slate-400'}`}>
                  {requiresPrescription ? 'Prescription' : 'Review'}
                </span>
              </div>

              <div className={`flex-grow h-1 mx-2 md:mx-4 rounded-full transition-colors ${step >= 3 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>

              <div className={`flex flex-col items-center relative`}>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all ${step >= 3 ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-200 text-slate-500'}`}>
                  3
                </div>
                <span className={`absolute -bottom-6 whitespace-nowrap text-[9px] md:text-xs font-bold uppercase tracking-wider ${step >= 3 ? 'text-primary-600' : 'text-slate-400'}`}>Payment</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            
            {/* Step Content */}
            <div className="flex-1">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border border-slate-200">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                    Delivery Address
                  </h2>
                  <div className="space-y-4 md:space-y-6">
                    {hasCoordinates && (
                      <div className="mb-4 bg-primary-50 border border-primary-100 p-3 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-primary-900 font-bold text-xs">Location Detected</p>
                          <p className="text-primary-700 text-[10px]">We'll deliver to your current phone location.</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                        Street Address / Landmark {hasCoordinates && <span className="text-slate-400 font-normal normal-case">(Optional)</span>}
                      </label>
                      <input 
                        type="text" 
                        placeholder={hasCoordinates ? "Current location used by default..." : "e.g. Near Bole Medhanialem"} 
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all outline-none text-slate-900 text-sm"
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">City</label>
                        <select 
                          className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all outline-none text-slate-900 text-sm"
                          value={address.city}
                          onChange={(e) => setAddress({...address, city: e.target.value})}
                        >
                          <option>Addis Ababa</option>
                          <option>Bishoftu</option>
                          <option>Adama</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Phone Number</label>
                        <input 
                          type="tel" 
                          placeholder="+251 9..." 
                          className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all outline-none text-slate-900 text-sm"
                          value={address.phone}
                          onChange={(e) => setAddress({...address, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Instructions (Optional)</label>
                      <textarea 
                        rows={2}
                        placeholder="e.g. Ring doorbell..." 
                        className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all outline-none text-slate-900 text-sm"
                        value={address.notes}
                        onChange={(e) => setAddress({...address, notes: e.target.value})}
                      ></textarea>
                    </div>
                    <Button 
                      onClick={handleNextStep} 
                      className="w-full h-12 rounded-xl font-bold text-base mt-2 group"
                    >
                      Continue
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Prescription Upload */}
              {step === 2 && (
                <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border border-slate-200">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-3">
                    <Camera className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                    Prescription
                  </h2>
                  <p className="text-slate-500 mb-6 text-xs md:text-sm font-medium">Please take a clear photo of your prescription.</p>
                  
                  <div className="border-4 border-dashed border-slate-100 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer group mb-6 relative">
                    <div className="bg-slate-100 text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                      <Camera className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <p className="text-slate-900 font-bold text-sm mb-1 underline decoration-primary-300 decoration-2">Tap to take photo</p>
                    <p className="text-slate-500 text-[10px]">Must be clear and readable</p>
                    <input 
                      type="file" 
                      className="hidden" 
                      id="prescription-upload" 
                      accept="image/*"
                      capture="environment"
                      multiple 
                      onChange={(e) => e.target.files && setPrescriptions(Array.from(e.target.files))}
                    />
                    <label htmlFor="prescription-upload" className="inset-0 absolute cursor-pointer"></label>
                  </div>

                  {prescriptions.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {prescriptions.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-xs text-slate-700 font-bold truncate">{file.name}</span>
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setStep(1)} className="h-12 rounded-xl flex-1 border border-slate-200 text-sm">Back</Button>
                    <Button onClick={handleNextStep} disabled={isUploading} className="h-12 rounded-xl flex-[2] font-bold text-base group">
                      {isUploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</>
                      ) : (
                        <>Continue to Payment <ChevronRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border border-slate-200">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                    Payment Method
                  </h2>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      { id: 'COD', name: 'Cash on Delivery', description: 'Pay at your door' },
                      { id: 'Telebirr', name: 'Telebirr', description: 'Fast mobile payment' },
                      { id: 'CBEBirr', name: 'CBE Birr', description: 'Bank mobile payment' }
                    ].map((method) => (
                      <label 
                        key={method.id}
                        className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-primary-500 bg-primary-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`}>
                              {paymentMethod === method.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm leading-tight">{method.name}</p>
                              <p className="text-[10px] text-slate-500">{method.description}</p>
                            </div>
                          </div>
                          <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                          />
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setStep(requiresPrescription ? 2 : 1)} className="h-12 rounded-xl flex-1 border border-slate-200 text-sm">Back</Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      disabled={isSubmitting}
                      className="h-12 rounded-xl flex-[2] font-black text-lg shadow-lg shadow-primary-200"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                      ) : (
                        `Pay ${grandTotal.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}`
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Sidebar */}
            <aside className="lg:w-96 space-y-4">
              <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200">
                <h3 className="font-black text-slate-900 mb-3 uppercase tracking-wider text-[10px] md:text-sm">Order Summary</h3>
                <div className="max-h-48 md:max-h-64 overflow-y-auto mb-4 pr-1 -mr-1 space-y-3 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] md:text-sm truncate leading-tight">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.quantity} × {item.price.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</p>
                      </div>
                      <span className="font-bold text-slate-900 text-[11px] md:text-sm shrink-0">
                        {(item.price * item.quantity).toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] md:text-sm text-slate-500 font-medium">
                    <span>Subtotal</span>
                    <span className="text-slate-900 font-bold font-mono">{totalPrice.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</span>
                  </div>
                  <div className="flex justify-between text-[11px] md:text-sm text-slate-500 font-medium">
                    <span>Delivery</span>
                    <span className="text-slate-900 font-bold font-mono">{deliveryFee.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</span>
                  </div>
                  <div className="flex justify-between text-[11px] md:text-sm text-slate-500 font-medium">
                    <span>Tax (15%)</span>
                    <span className="text-slate-900 font-bold font-mono">{tax.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-primary-600 font-black text-lg md:text-xl">
                    <span className="text-sm md:text-base">Grand Total</span>
                    <span className="font-mono">{grandTotal.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary-200 relative overflow-hidden hidden md:block">
                 <h4 className="text-lg font-black mb-1 relative z-10">Need Help?</h4>
                 <p className="text-primary-100 text-xs relative z-10 mb-4 font-medium leading-relaxed">Our support team is available 24/7 for you.</p>
                 <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary-600 rounded-xl relative z-10 font-bold h-10 text-sm">
                   Call Support
                 </Button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)] z-40 pb-safe">
          {step === 1 && (
             <Button 
               onClick={handleNextStep} 
               className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary-200"
             >
               Continue
             </Button>
          )}
          {step === 2 && (
             <Button 
               onClick={handleNextStep} 
               disabled={isUploading} 
               className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary-200"
             >
               {isUploading ? 'Uploading...' : 'Continue to Payment'}
             </Button>
          )}
          {step === 3 && (
             <Button 
               onClick={handlePlaceOrder} 
               disabled={isSubmitting}
               className="w-full h-14 rounded-2xl font-black text-xl shadow-lg shadow-primary-200"
             >
               {isSubmitting ? 'Processing...' : `Pay ${grandTotal.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}`}
             </Button>
          )}
      </div>
    </div>
  );
}
