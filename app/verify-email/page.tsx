'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now log into your account.');
          // Redirect to login after a few seconds optionally
          setTimeout(() => router.push('/login'), 5000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. The link may have expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('A network error occurred while verifying. Please try again.');
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 text-center max-w-lg w-full">
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center">
           <div className="h-20 w-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
             <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying...</h2>
           <p className="text-slate-500">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center justify-center">
           <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
             <CheckCircle2 className="h-10 w-10 text-green-600" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
           <p className="text-slate-500 mb-8">{message}</p>
           <Link href="/login" className="w-full">
              <Button variant="primary" size="lg" className="w-full rounded-xl shadow-lg shadow-primary-600/20">
                Proceed to Login
              </Button>
           </Link>
           <p className="text-sm text-slate-400 mt-4">Redirecting you to login in 5 seconds...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center justify-center">
           <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
             <XCircle className="h-10 w-10 text-rose-600" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
           <p className="text-slate-500 mb-8">{message}</p>
           <Link href="/login" className="w-full">
              <Button variant="outline" size="lg" className="w-full rounded-xl">
                Go to Login
              </Button>
           </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div className="p-12 text-center text-slate-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" /> Loading verification system...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
