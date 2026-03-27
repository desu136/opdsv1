'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboardRedirect() {
  const router = useRouter();

  useLayoutEffect(() => {
    router.replace('/customer/profile');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium">
      Redirecting to your profile...
    </div>
  );
}
