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

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            {filteredPharmacies.map((pharmacy: any) => (
              <div key={pharmacy.id} className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-100 hover:shadow-md hover:border-primary-100 transition-all group relative overflow-hidden flex flex-col sm:flex-row gap-6">
                
                {/* Optional background accent for verified */}
                {pharmacy.verified && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                )}

                {/* Icon / Image Placeholder */}
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-slate-100 relative z-10 group-hover:bg-primary-50 transition-colors">
                   <Store className="h-8 w-8 text-slate-400 group-hover:text-primary-600 transition-colors" />
                </div>

                {/* Pharmacy Details */}
                <div className="flex-grow relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors flex items-center gap-2">
                      {pharmacy.name}
                      {pharmacy.verified && <ShieldCheck className="h-4 w-4 text-primary-500" />}
                    </h2>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg text-amber-700 text-xs font-bold">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {pharmacy.rating}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    {pharmacy.location} • {pharmacy.distance}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className={`h-4 w-4 ${pharmacy.openStatus === 'Open Now' ? 'text-green-500' : 'text-slate-400'}`} />
                      <span className={pharmacy.openStatus === 'Open Now' ? 'text-green-700' : 'text-slate-500'}>
                        {pharmacy.openStatus}
                      </span>
                      <span className="text-slate-400">({pharmacy.closingTime})</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pharmacy.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-xs text-slate-500">{pharmacy.reviews} Reviews</span>
                    <Link href={`/products?pharmacyId=${pharmacy.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-200">
                        View Medicines <ChevronRight className="h-4 w-4 ml-1" />
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
