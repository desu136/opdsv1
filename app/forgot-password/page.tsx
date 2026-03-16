'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('If an account matches that email, a password reset link has been sent.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to process request. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('A network error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 w-full max-w-md">
          
          <div className="text-center mb-8">
             <div className="h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Mail className="h-8 w-8 text-primary-600 -rotate-3" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
             <p className="text-slate-500">No worries, we'll send you reset instructions.</p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-4">
               <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium mb-8 flex items-start gap-3 text-left border border-green-100">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />
                  {message}
               </div>
               <Link href="/login">
                 <Button variant="outline" size="lg" className="w-full rounded-xl">
                    Return to Login
                 </Button>
               </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
                <input 
                  id="email"
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter the email associated with your account"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 font-medium">
                  {message}
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={status === 'loading'}
                className="w-full rounded-xl shadow-lg shadow-primary-600/20"
              >
                {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Reset Password'}
              </Button>

              <div className="text-center pt-4">
                 <Link href="/login" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to log in
                 </Link>
              </div>

            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
