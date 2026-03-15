'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Pill, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Automatically redirect based on role using the AuthContext
      login(data.user);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Output - Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24">
        
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2 mb-12 w-fit">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            EthioPharma
          </span>
        </Link>
        
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 mb-8">Sign in to your account to order medicines, manage prescriptions, or view order history.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
             <div className="space-y-1">
               <label className="text-sm font-semibold text-slate-700 block">Email Address</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="you@example.com"
                   className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                 />
               </div>
             </div>

             <div className="space-y-1">
               <div className="flex justify-between items-center block">
                 <label className="text-sm font-semibold text-slate-700">Password</label>
                 <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">Forgot Password?</Link>
               </div>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                 <input 
                   type="password" 
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                 />
               </div>
             </div>

             {error && (
               <div className={`p-4 mb-4 text-sm rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                 error === 'Account pending approval.' 
                   ? 'bg-amber-50 text-amber-800 border border-amber-100' 
                   : 'bg-red-50 text-red-700 border border-red-100'
               }`}>
                 <AlertCircle className={`h-5 w-5 shrink-0 ${error === 'Account pending approval.' ? 'text-amber-500' : 'text-red-500'}`} />
                 <div>
                    <p className="font-bold">{error}</p>
                    {error === 'Account pending approval.' && (
                      <p className="text-xs mt-1 text-amber-700/80 leading-relaxed">
                        Your registration is currently being reviewed by our team. You will be notified once it is approved.
                      </p>
                    )}
                 </div>
               </div>
             )}

             <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl py-4 mt-2" disabled={isLoading}>
               {isLoading ? (
                 <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Signing In...</>
               ) : (
                 <>Sign In <ArrowRight className="h-5 w-5 ml-2" /></>
               )}
             </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
             Don't have an account? <Link href="/register" className="font-bold text-primary-600 hover:text-primary-700">Create an account</Link>
          </div>
        </div>
      </div>

      {/* Right side - Decoration */}
      <div className="hidden lg:flex w-1/2 bg-primary-600 relative overflow-hidden items-center justify-center">
         <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800"></div>
         <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-primary-500 opacity-20 filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-secondary-500 opacity-20 filter blur-3xl translate-y-1/2 -translate-x-1/4"></div>
         
         <div className="relative z-10 max-w-lg px-12 text-white">
            <h2 className="text-4xl font-bold mb-6 leading-tight">Your Health,<br/>Delivered to Your Door.</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
                <span className="text-lg text-primary-50">100% Genuine Medicines & Products</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
                <span className="text-lg text-primary-50">Secure and fast local deliveries</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
                <span className="text-lg text-primary-50">Expert Pharmacist Verification</span>
              </li>
            </ul>
         </div>
      </div>
    </div>
  );
}
