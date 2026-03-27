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
  Navigation,
  Pill,
  HeartPulse,
  Thermometer,
  Baby,
  Activity,
  Droplets,
  Clock,
  Star,
  Tag
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Pain Relief', category: 'Pain Relief', icon: Pill, color: 'bg-red-50 text-red-500' },
  { name: 'Cold & Flu', category: 'Cold & Flu', icon: Thermometer, color: 'bg-blue-50 text-blue-500' },
  { name: 'Vitamins', category: 'Vitamins', icon: Activity, color: 'bg-orange-50 text-orange-500' },
  { name: 'Heart Care', category: 'Heart Care', icon: HeartPulse, color: 'bg-rose-50 text-rose-500' },
  { name: 'Baby Care', category: 'Baby Care', icon: Baby, color: 'bg-purple-50 text-purple-500' },
  { name: 'Diabetes', category: 'Diabetes', icon: Droplets, color: 'bg-sky-50 text-sky-500' },
  { name: 'Antibiotics', category: 'Antibiotics', icon: ShieldCheck, color: 'bg-green-50 text-green-500' },
  { name: 'Personal Care', category: 'Personal Care', icon: Navigation, color: 'bg-pink-50 text-pink-500' },
];

const PROMOS = [
  { id: 1, title: 'Summer Wellness', discount: '20% OFF', image: '/placeholder-promo-1.jpg', bg: 'bg-gradient-to-r from-orange-400 to-rose-400' },
  { id: 2, title: 'Free Delivery', discount: 'On first order', image: '/placeholder-promo-2.jpg', bg: 'bg-gradient-to-r from-primary-500 to-indigo-500' },
];

const SPECIAL_OFFERS = [
  { id: 1, name: 'Vitamin C 1000mg', desc: 'Immunity booster', price: 250, oldPrice: 350, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
  { id: 2, name: 'Panadol Extra', desc: 'Fast pain relief', price: 120, oldPrice: 150, image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=400&fit=crop' },
  { id: 3, name: 'Omega 3 Fish Oil', desc: 'Heart health', price: 850, oldPrice: 1200, image: 'https://images.unsplash.com/photo-1550572017-edb3f54d6fb2?w=400&h=400&fit=crop' },
];

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyPharmacies, setNearbyPharmacies] = useState<any[]>([]);
  const [specialOffers, setSpecialOffers] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  const formatAddress = (addr: string) => {
    if (!addr) return 'Address not provided';
    if (addr.startsWith('http') || addr.includes('maps.')) {
      return 'Location on Map';
    }
    return addr;
  };

  useEffect(() => {
    const fetchHomeData = async (lat?: number, lng?: number) => {
      try {
        const coords = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
        const [pharmaciesRes, offersRes] = await Promise.all([
          fetch(`/api/pharmacies${coords}${coords ? '&limit=6' : '?limit=6'}`),
          fetch(`/api/offers?status=ACTIVE`)
        ]);

        if (pharmaciesRes.ok) setNearbyPharmacies(await pharmaciesRes.json());
        if (offersRes.ok) setSpecialOffers(await offersRes.json());
      } catch (err) {
        console.error('Failed to fetch home data', err);
      } finally {
        setIsLocating(false);
      }
    };

    if (user?.role === 'CUSTOMER' && (user as any).lastLat && (user as any).lastLng) {
      fetchHomeData((user as any).lastLat, (user as any).lastLng);
    } else if (!authLoading && !user && !isLocating) {
      setIsLocating(true);
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchHomeData(pos.coords.latitude, pos.coords.longitude),
          () => fetchHomeData()
        );
      } else {
        fetchHomeData();
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

      <main className="flex-grow pb-safe">
        
        {/* Mobile Search Section */}
        <section className="bg-white px-4 py-3 sticky top-16 z-40 border-b border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines or pharmacies..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white border border-transparent focus:border-primary-200 text-sm font-medium text-slate-800 transition-all"
            />
          </form>
        </section>

        {/* Promotional Slider */}
        <section className="mt-4 px-4 overflow-hidden">
          <div className="flex gap-3 overflow-x-auto snap-x hide-scrollbar pb-2">
            {PROMOS.map((promo) => (
              <div key={promo.id} className={`relative flex-none w-[85vw] max-w-sm ${promo.bg} rounded-2xl p-5 text-white snap-center overflow-hidden shadow-sm`}>
                <div className="relative z-10 w-2/3">
                  <span className="inline-block bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase mb-2">Offer</span>
                  <h3 className="text-xl font-bold leading-tight mb-1">{promo.title}</h3>
                  <p className="text-sm font-medium opacity-90">{promo.discount}</p>
                </div>
                {/* Decorative circles to represent graphics as we don't have images guaranteed */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="mt-6">
          <div className="px-4 flex justify-between items-end mb-3">
             <h2 className="text-lg font-bold text-slate-900">Browse by Category</h2>
             <Link href="/products" className="text-xs font-bold text-primary-600">See all</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 pb-2">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={`/products?category=${encodeURIComponent(cat.category)}`}
                  className="flex flex-col items-center gap-2 flex-none w-16 active:scale-90 transition-transform"
                >
                  <div className={`w-14 h-14 rounded-full ${cat.color} flex items-center justify-center shadow-sm hover:shadow-md transition-shadow`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-center text-slate-700 leading-tight h-8 line-clamp-2">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Special Offers Section */}
        <section className="mt-4">
          <div className="px-4 flex justify-between items-end mb-3 text-slate-900">
             <h2 className="text-lg font-bold flex items-center gap-2"><Tag className="w-5 h-5 text-rose-500" /> Special Offers</h2>
             <span className="text-xs font-bold text-primary-600">See all</span>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-4">
            {specialOffers.length > 0 ? (
              specialOffers.map((offer) => (
                <Link href={`/pharmacies/${offer.pharmacyId}`} key={offer.id} className="flex-none w-36 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col p-2.5 active:scale-95 transition-all">
                  <div className="relative aspect-square w-full bg-slate-50 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                    <img src={offer.imageUrl || offer.product?.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop'} alt={offer.title} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">-{offer.discountPct}%</div>
                  </div>
                  <h3 className="text-xs font-black text-slate-900 line-clamp-1">{offer.title}</h3>
                  <p className="text-[9px] text-slate-500 mb-1 line-clamp-1 font-bold">{offer.pharmacy?.name}</p>
                  <div className="mt-auto flex items-center gap-1.5">
                    <span className="text-xs font-black text-primary-600">{offer.product?.price ? (offer.product.price * (1 - offer.discountPct/100)).toFixed(0) : '0'} ETB</span>
                    <span className="text-[9px] font-medium text-slate-400 line-through">{offer.product?.price}</span>
                  </div>
                </Link>
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex-none w-36 h-44 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse"></div>
              ))
            )}
          </div>
        </section>

        {/* Nearby Pharmacies Section (Vertical App List) */}
        <section className="mt-4 px-4 pb-6">
          <div className="flex justify-between items-end mb-4">
             <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary-600" /> Nearby Pharmacies
             </h2>
          </div>

          <div className="flex flex-col gap-3">
            {nearbyPharmacies.length > 0 ? (
              nearbyPharmacies.map((pharmacy) => (
                <Link href={`/pharmacies/${pharmacy.id}`} key={pharmacy.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex gap-4 items-center group active:scale-[0.98] transition-all">
                  
                  {/* Pharmacy Logo/Image Thumbnail */}
                  <div className="h-16 w-16 bg-slate-50 rounded-xl flex items-center justify-center text-primary-400 shrink-0 border border-slate-100 overflow-hidden">
                    {pharmacy.logoUrl ? (
                      <img src={pharmacy.logoUrl} alt={pharmacy.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="h-8 w-8" />
                    )}
                  </div>

                  {/* Pharmacy Details */}
                  <div className="flex-1 min-w-0 py-0.5">
                     <div className="flex justify-between items-start mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate pr-2">{pharmacy.name}</h3>
                        <span className="bg-emerald-50 text-emerald-600 font-bold text-[8px] px-1.5 py-0.5 rounded shadow-sm shrink-0 uppercase tracking-wider">Open</span>
                     </div>
                     
                     <p className="text-[10px] text-slate-500 truncate mb-1.5">
                        {formatAddress(pharmacy.address)}
                     </p>

                     {/* Info Row: Rating, Time, Distance, Fee */}
                     <div className="flex items-center gap-2 text-[9px] font-medium text-slate-600">
                        <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-400 fill-amber-400" /> 4.8</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> 20-35 min</span>
                        {pharmacy.distance && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-0.5 text-primary-600"><MapPin className="h-3 w-3" /> {pharmacy.distance}km</span>
                          </>
                        )}
                     </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                {isLocating ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                    <p className="text-sm text-slate-500 font-medium">Locating pharmacies near you...</p>
                  </>
                ) : (
                  <>
                    <Store className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-medium">No nearby pharmacies found.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

      </main>
      
      {/* Footer only visible on desktop now, since body has pb-16 for mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

