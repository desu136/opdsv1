'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { KeyRound, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full border border-slate-100">
         <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Link</h2>
         <p className="text-slate-500 mb-6">The password reset link is invalid or missing the token. Please request a new one.</p>
         <Link href="/forgot-password">
            <Button variant="primary" className="w-full rounded-xl">Request New Link</Button>
         </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Your password has been successfully reset.');
        setTimeout(() => router.push('/login'), 5000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('A network error occurred. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full border border-slate-100">
         <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
           <CheckCircle2 className="h-8 w-8 text-green-600" />
         </div>
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful</h2>
         <p className="text-slate-500 mb-8">{message}</p>
         <Link href="/login">
            <Button variant="primary" size="lg" className="w-full rounded-xl">Go to Login</Button>
         </Link>
         <p className="text-sm text-slate-400 mt-4">Redirecting you to login in 5 seconds...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 w-full max-w-md">
      <div className="text-center mb-8">
         <div className="h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <KeyRound className="h-8 w-8 text-primary-600" />
         </div>
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Set New Password</h2>
         <p className="text-slate-500">Please choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">New Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Confirm New Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900"
            />
          </div>
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
          {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div className="p-12 text-center text-slate-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" /> Loading reset form...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
