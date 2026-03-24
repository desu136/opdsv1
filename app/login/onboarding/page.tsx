'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Loader2, User, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, checkSession } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user?.id) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(),
          isNewUser: false 
        })
      });

      if (res.ok) {
        await checkSession(); // Refresh context
        router.push('/'); // Redirect to Home (customer flow)
      } else {
        alert('Failed to save name. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-primary-900/10 border border-slate-100 text-center animate-in zoom-in-95 duration-500">
        
        <div className="w-20 h-20 bg-primary-50 rounded-full mx-auto flex items-center justify-center mb-6">
           <User className="h-10 w-10 text-primary-600" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Welcome to EthioPharma!</h1>
        <p className="text-slate-500 mb-8">What should we call you? We just need your name for your deliveries.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-lg font-medium"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full rounded-2xl py-4 shadow-lg" disabled={isLoading || !name.trim()}>
             {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
               <div className="flex items-center justify-center gap-2">
                 Complete Setup <ArrowRight className="h-5 w-5" />
               </div>
             )}
          </Button>
        </form>

      </div>
    </div>
  );
}
