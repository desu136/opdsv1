'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Pill, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginPageContent() {
  const [loginMode, setLoginMode] = useState<'customer' | 'staff'>('customer');
  
  // Staff State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Customer State
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read ?mode=customer|staff from URL and set the login mode on mount
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'staff') {
      setLoginMode('staff');
    } else {
      setLoginMode('customer'); // default to customer OTP
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleStaffLogin = async (e: React.FormEvent) => {
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

      login(data.user);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return setError('Please enter your phone number');
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setOtpSent(true);
      setCountdown(60); // 60 second cooldown
      setMessage(data.message || 'OTP sent to your phone');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return setError('Please enter the OTP code');

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      // Login and handle new user onboarding redirection
      login(data.user, data.isNewUser);

    } catch (err: any) {
      setError(err.message);
      setOtpCode('');
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
          <p className="text-slate-500 mb-8">Sign in to access your pharmacy account or order medicines.</p>

          {/* Login Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button
              onClick={() => { setLoginMode('customer'); setError(''); setMessage(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                loginMode === 'customer' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => { setLoginMode('staff'); setError(''); setMessage(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                loginMode === 'staff' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Pharmacy / Admin
            </button>
          </div>

          {/* Status Messages */}
          {message && (
             <div className="p-4 mb-6 text-sm rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-3 animate-in fade-in duration-300">
               <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
               <span className="font-bold">{message}</span>
             </div>
          )}

          {error && (
            <div className={`p-4 mb-6 text-sm rounded-2xl flex items-start gap-3 animate-in fade-in duration-300 ${
              error.includes('pending') 
                ? 'bg-amber-50 text-amber-800 border border-amber-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              <AlertCircle className={`h-5 w-5 shrink-0 ${error.includes('pending') ? 'text-amber-500' : 'text-red-500'}`} />
              <div>
                 <p className="font-bold">{error}</p>
                 {error.includes('pending') && (
                   <p className="text-xs mt-1 text-amber-700/80 leading-relaxed">
                     Your registration is currently being reviewed by our team. You will be notified once it is approved.
                   </p>
                 )}
              </div>
            </div>
          )}

          {/* CUSTOMER OTP FORM */}
          {loginMode === 'customer' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-5">
                   <div className="space-y-1">
                     <label className="text-sm font-semibold text-slate-700 block">Phone Number</label>
                     <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <Phone className="h-5 w-5 text-slate-400" />
                         <span className="text-slate-600 font-bold border-r border-slate-200 pr-2">+251</span>
                       </div>
                       <input 
                         type="tel" 
                         required
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         placeholder="911 234 567"
                         className="w-full pl-[88px] pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg font-medium tracking-wide"
                       />
                     </div>
                   </div>

                   <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl py-4 mt-2" disabled={isLoading}>
                     {isLoading ? (
                       <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Sending OTP...</>
                     ) : (
                       <>Send Verification Code <ArrowRight className="h-5 w-5 ml-2" /></>
                     )}
                   </Button>
                   <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed">
                     New to EthioPharma? <span className="text-primary-600 font-bold">No need to register.</span><br/>
                     Just enter your phone above to get started instantly.
                   </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                   <div className="space-y-1">
                     <label className="text-sm font-semibold text-slate-700 block">Enter 6-digit OTP</label>
                     <p className="text-xs text-slate-500 mb-3 block">Sent to +251 {phone}</p>
                     <div className="relative">
                       <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary-400" />
                       <input 
                         type="text" 
                         required
                         maxLength={6}
                         value={otpCode}
                         onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Numbers only
                         placeholder="000000"
                         className="w-full pl-14 pr-4 py-4 bg-white border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-2xl tracking-[0.5em] font-black text-slate-800 text-center shadow-inner"
                       />
                     </div>
                   </div>

                   <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl py-4 mt-2" disabled={isLoading || otpCode.length !== 6}>
                     {isLoading ? (
                       <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Verifying...</>
                     ) : (
                       <>Verify & Login <ArrowRight className="h-5 w-5 ml-2" /></>
                     )}
                   </Button>

                   <div className="text-center mt-4">
                     <button 
                       type="button" 
                       disabled={countdown > 0 || isLoading}
                       onClick={handleSendOTP}
                       className="text-sm font-bold text-primary-600 disabled:text-slate-400 hover:text-primary-700 transition-colors"
                     >
                       {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}
                     </button>
                     <div className="mt-4">
                        <button type="button" onClick={() => {setOtpSent(false); setError(''); setMessage('');}} className="text-xs text-slate-500 hover:text-slate-700 underline">
                          Change Phone Number
                        </button>
                     </div>
                   </div>
                </form>
              )}
            </div>
          )}

          {/* STAFF EMAIL/PASSWORD FORM */}
          {loginMode === 'staff' && (
            <form onSubmit={handleStaffLogin} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
               <div className="space-y-1">
                 <label className="text-sm font-semibold text-slate-700 block">Work Email Address</label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="admin@pharmacy.com"
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

               <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl py-4 mt-2" disabled={isLoading}>
                 {isLoading ? (
                   <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Authenticating...</>
                 ) : (
                   <>Access Portal <ArrowRight className="h-5 w-5 ml-2" /></>
                 )}
               </Button>
            </form>
          )}

          {loginMode === 'staff' && (
            <div className="mt-8 text-center text-sm text-slate-500 animate-in fade-in">
               Register your pharmacy? <Link href="/register" className="font-bold text-primary-600 hover:text-primary-700">Apply Here</Link>
            </div>
          )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
