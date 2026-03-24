'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { 
  Store, 
  MapPin, 
  Search, 
  Star, 
  Clock, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const res = await fetch('/api/pharmacies');
        if (res.ok) {
          const data = await res.json();
          // Map real pharmacies to the expected UI structure
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            rating: 4.8, // Default since not in DB
            reviews: Math.floor(Math.random() * 200) + 10, // Randomized for UI
            location: p.address || 'Location not specified',
            openStatus: 'Open Now', // Placeholder
            closingTime: '9:00 PM', // Placeholder
            distance: (Math.random() * 5 + 1).toFixed(1) + ' km', // Randomized for UI
            verified: p.status === 'ACTIVE',
            tags: ['Prescription', 'OTC', 'General']
          }));
          setPharmacies(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch pharmacies:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  const filteredPharmacies = pharmacies.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Partner Pharmacies</h1>
            <p className="text-slate-500 mt-1">Find and order from trusted local pharmacies near you.</p>
          </div>
          
          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search pharmacies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              />
            </div>
            <Button variant="outline" className="shrink-0 bg-white">
              <MapPin className="h-4 w-4 mr-2" /> Near Me
            </Button>
          </div>
        </div>

        {/* Pharmacy Listing Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-4" />
            <p className="text-slate-500 text-lg font-medium">Finding pharmacies near you...</p>
          </div>
        ) : filteredPharmacies.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 md:gap-6 mb-12">
            {filteredPharmacies.map((pharmacy: any) => (
              <div key={pharmacy.id} className="bg-white rounded-2xl md:rounded-3xl p-2.5 md:p-6 shadow-sm shadow-slate-200/50 border border-slate-100 hover:shadow-md hover:border-primary-100 transition-all group relative overflow-hidden flex flex-col gap-2 md:gap-6">
                
                {/* Optional background accent for verified */}
                {pharmacy.verified && (
                  <div className="absolute top-0 right-0 w-12 h-12 md:w-24 md:h-24 bg-primary-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                )}

                {/* Content Header (Icon + Name/Rating) */}
                <div className="flex items-center sm:items-start gap-3 md:gap-6">
                  {/* Icon / Image Placeholder */}
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-slate-50 rounded-xl md:rounded-2xl flex flex-col items-center justify-center shrink-0 border border-slate-100 relative z-10 group-hover:bg-primary-50 transition-colors">
                     <Store className="h-5 w-5 md:h-8 md:w-8 text-slate-400 group-hover:text-primary-600 transition-colors" />
                  </div>

                  {/* Pharmacy Details */}
                  <div className="flex-grow relative z-10 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h2 className="text-sm md:text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors flex items-center gap-1 md:gap-2 truncate">
                        {pharmacy.name}
                        {pharmacy.verified && <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-primary-500" />}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md text-amber-700 text-[9px] md:text-xs font-bold w-fit">
                      <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                      {pharmacy.rating}
                    </div>
                  </div>
                </div>

                {/* Sub-details */}
                <div className="relative z-10">
                  <p className="text-[10px] md:text-sm text-slate-500 flex items-center gap-1 mb-1.5 md:mb-3">
                    <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span className="truncate">{pharmacy.location} • {pharmacy.distance}</span>
                  </p>

                  <div className="flex items-center gap-4 mb-2 md:mb-4 text-[10px] md:text-sm">
                    <div className="flex items-center gap-1 md:gap-1.5 font-medium">
                      <Clock className={`h-3 w-3 md:h-4 md:w-4 ${pharmacy.openStatus === 'Open Now' ? 'text-green-500' : 'text-slate-400'}`} />
                      <span className={pharmacy.openStatus === 'Open Now' ? 'text-green-700' : 'text-slate-500'}>
                        {pharmacy.openStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-4">
                    {pharmacy.tags.slice(0, 2).map((tag: string, idx: number) => (
                      <span key={idx} className="text-[9px] md:text-xs font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-slate-50">
                    <span className="text-[9px] md:text-xs text-slate-500">{pharmacy.reviews} <span className="hidden sm:inline">Reviews</span></span>
                    <Link href={`/products?pharmacyId=${pharmacy.id}`}>
                      <Button variant="outline" size="sm" className="h-7 md:h-9 rounded-lg md:rounded-xl text-[10px] md:text-sm group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-200 px-2 md:px-4">
                        View <span className="hidden sm:inline">Medicines</span> <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-0.5 md:ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center mb-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No pharmacies found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">We couldn't find any pharmacies matching your search criteria.</p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
