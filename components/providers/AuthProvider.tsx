'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string;
  image?: string | null;
  isNewUser?: boolean;
  lastLat?: number | null;
  lastLng?: number | null;
  role: 'CUSTOMER' | 'PHARMACIST' | 'DELIVERY_AGENT' | 'ADMIN';
  pharmacy?: { id: string, name: string };
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, isNewUser?: boolean) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        // Auto-detect and save location for Customers
        if (data.user?.role === 'CUSTOMER') {
          import('@/lib/location').then(async ({ getUserLocation }) => {
            const loc = await getUserLocation();
            if (loc && data.user) {
              await fetch(`/api/users/${data.user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lastLat: loc.lat, lastLng: loc.lng })
              });
            }
          });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    // Strict Role-Based Access Control
    if (!isLoading && user) {
      const isCustomerRoute = pathname.startsWith('/customer');
      const isAdminRoute = pathname.startsWith('/admin');
      const isPharmacyRoute = pathname.startsWith('/pharmacy');
      const isAgentRoute = pathname.startsWith('/agent');

      // 1. Prevent non-customers from accessing customer dashboards
      if (isCustomerRoute && user.role !== 'CUSTOMER') {
        redirectToDashboard(user.role);
      }
      // 2. Prevent customers from accessing staff dashboards
      else if ((isAdminRoute || isPharmacyRoute || isAgentRoute) && user.role === 'CUSTOMER') {
        router.push('/');
      }
      // 3. Prevent staff from cross-accessing each other's dashboards
      else if (isAdminRoute && user.role !== 'ADMIN') {
        redirectToDashboard(user.role);
      } else if (isPharmacyRoute && user.role !== 'PHARMACIST') {
        redirectToDashboard(user.role);
      } else if (isAgentRoute && user.role !== 'DELIVERY_AGENT') {
        redirectToDashboard(user.role);
      }
      // 4. (Required) Prevent staff from using the customer Home page or storefront
      const isHome = pathname === '/';
      const isStorefront = 
        pathname.startsWith('/products') || 
        pathname.startsWith('/pharmacies') || 
        pathname.startsWith('/tracking') || 
        pathname.startsWith('/cart') || 
        pathname.startsWith('/checkout');

      if ((isHome || isStorefront) && user.role !== 'CUSTOMER') {
        redirectToDashboard(user.role);
      }
    }
  }, [user, isLoading, pathname, router]);

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'ADMIN': return router.push('/admin/dashboard');
      case 'PHARMACIST': return router.push('/pharmacy/dashboard');
      case 'DELIVERY_AGENT': return router.push('/agent/dashboard');
      default: return router.push('/');
    }
  };

  const login = (userData: User, isNewUser?: boolean) => {
    setUser(userData);
    
    if (userData.role === 'CUSTOMER') {
      if (isNewUser) {
        router.push('/login/onboarding');
      } else {
        router.push('/'); // Customers go straight to the search-first home page
      }
      return;
    }

    redirectToDashboard(userData.role);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
