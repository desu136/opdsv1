'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Search, 
  MapPin, 
  Store,
  ArrowRight,
  ShieldCheck,
  Navigation
} from 'lucide-react';

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyPharmacies, setNearbyPharmacies] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  const formatAddress = (addr: string) => {
    if (!addr) return 'Address not provided';
    if (addr.startsWith('http') || addr.includes('maps.')) {
      return 'Location on Map';
    }
    return addr;
  };

  useEffect(() => {
    const fetchNearby = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`/api/pharmacies?lat=${lat}&lng=${lng}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setNearbyPharmacies(data);
        }
      } catch (err) {
        console.error('Failed to fetch nearby pharmacies', err);
      }
    };

    if (user?.role === 'CUSTOMER' && (user as any).lastLat && (user as any).lastLng) {
      fetchNearby((user as any).lastLat, (user as any).lastLng);
    } else if (!authLoading && !user && !isLocating) {
      // Try to get browser location for guests
      setIsLocating(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            fetchNearby(pos.coords.latitude, pos.coords.longitude);
            setIsLocating(false);
          },
          () => {
            fetch('/api/pharmacies?limit=6').then(res => res.json()).then(data => setNearbyPharmacies(data));
            setIsLocating(false);
          }
        );
      } else {
        fetch('/api/pharmacies?limit=6').then(res => res.json()).then(data => setNearbyPharmacies(data));
        setIsLocating(false);
      }
    }
  }, [user, authLoading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow">
        
        {/* Search Hero Section */}
        <section className="relative pt-12 pb-10 md:pt-24 md:pb-20 overflow-hidden bg-primary-600 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900 pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white filter blur-[100px]"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-secondary-400 filter blur-[80px]"></div>
          </div>

          <div className="container mx-auto max-w-4xl relative z-10 text-center">
            {user ? (
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 animate-in fade-in slide-in-from-bottom-4">
                Hello, {user.name?.split(' ')[0] || 'there'} 👋
              </h1>
            ) : (
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                What do you need today?
              </h1>
            )}
            <p className="text-primary-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Find medicines, vitamins, and pharmacies near you. Fast home delivery guaranteed.
            </p>

            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Panadol, Vitamin C, or Pharmacy name..." 
                className="w-full pl-16 pr-36 py-5 bg-white rounded-3xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/30 text-lg font-medium text-slate-800 transition-all border-none"
              />
              <div className="absolute inset-y-2 right-2 flex items-center">
                <Button type="submit" variant="primary" className="h-full px-8 rounded-2xl shadow-md text-base">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Nearby Pharmacies Section */}
        <section className="py-10 md:py-20 container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="h-6 w-6 text-primary-600" />
                {user?.role === 'CUSTOMER' && (user as any).lastLat ? 'Pharmacies Near You' : 'Featured Pharmacies'}
              </h2>
              <p className="text-slate-500 mt-1">Get fast delivery from verified local partners.</p>
            </div>
            <Link href="/pharmacies" className="hidden md:flex items-center gap-2 text-primary-600 font-bold hover:text-primary-800 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {nearbyPharmacies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-6">
              {nearbyPharmacies.map((pharmacy) => (
                <div key={pharmacy.id} className="bg-white rounded-xl md:rounded-2xl p-2 md:p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-primary-200 transition-all group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-1">
                    <div className="h-8 w-8 md:h-12 md:w-12 bg-primary-50 rounded-lg md:rounded-xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors shrink-0">
                      <Store className="h-4 w-4 md:h-6 md:w-6" />
                    </div>
                    {pharmacy.distance && (
                      <span className="bg-slate-100 text-slate-600 font-bold text-[8px] md:text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <MapPin className="h-2 w-2 hidden sm:block" /> {pharmacy.distance}km
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 mt-0.5">
                    <h3 className="text-xs md:text-base font-bold text-slate-900 mb-0.5 line-clamp-1">{pharmacy.name}</h3>
                    <div className="flex items-center gap-1 text-[8px] md:text-xs text-emerald-600 font-medium mb-1 md:mb-2 text-nowrap">
                      <ShieldCheck className="h-2.5 w-2.5" /> <span className="hidden sm:inline">MOH Verified</span><span className="sm:hidden">Verified</span>
                    </div>
                    {pharmacy.address && (
                      <p className="text-slate-500 text-[8px] md:text-xs line-clamp-1 md:line-clamp-2 mb-2 flex items-start gap-1">
                        <MapPin className="h-2.5 w-2.5 shrink-0 mt-0.5 opacity-50 hidden sm:block" /> <span className="truncate">{formatAddress(pharmacy.address)}</span>
                      </p>
                    )}
                  </div>

                  <Link href={`/pharmacies/${pharmacy.id}`} className="mt-auto w-full">
                    <Button variant="outline" size="sm" className="w-full rounded-md md:rounded-xl text-[9px] md:text-sm h-6 md:h-9 px-1 md:px-3 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                      Shop
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Finding the nearest options for you...</p>
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
             <Link href="/pharmacies" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-800 transition-colors">
              View All Pharmacies <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

