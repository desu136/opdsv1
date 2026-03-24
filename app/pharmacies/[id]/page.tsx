'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard, ProductProps } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Search, 
  Loader2,
  ArrowLeft,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function PharmacyStorefrontPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const formatAddress = (addr: string) => {
    if (!addr) return 'Address not provided';
    if (addr.startsWith('http') || addr.includes('maps.')) {
      return 'Location on Map';
    }
    return addr;
  };

  useEffect(() => {
    const fetchPharmacyData = async (lat?: number, lng?: number) => {
      try {
        let pharmacyUrl = `/api/pharmacies/${id}`;
        let inventoryUrl = `/api/inventory?pharmacyId=${id}`;
        
        if (lat && lng) {
          const coords = `&lat=${lat}&lng=${lng}`;
          pharmacyUrl += coords.replace('&', '?');
          inventoryUrl += coords;
        }

        const [pharmacyRes, inventoryRes] = await Promise.all([
          fetch(pharmacyUrl),
          fetch(inventoryUrl)
        ]);

        if (pharmacyRes.ok && inventoryRes.ok) {
          const pharmacyData = await pharmacyRes.json();
          const inventoryData = await inventoryRes.json();
          
          setPharmacy(pharmacyData);
          
          const mappedProducts = inventoryData.map((p: any) => ({
            id: p.id,
            name: p.name,
            genericName: p.genericName,
            price: p.price,
            imageUrl: p.imageUrl,
            pharmacyId: p.pharmacy.id,
            pharmacyName: p.pharmacy.name,
            distance: p.pharmacy.distance,
            requiresPrescription: p.requiresPrescription,
            inStock: p.stock > 0,
            category: p.category
          }));
          
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Failed to fetch pharmacy storefront data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const getCoordsAndFetch = () => {
      if (user?.role === 'CUSTOMER' && (user as any).lastLat) {
        fetchPharmacyData((user as any).lastLat, (user as any).lastLng);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchPharmacyData(pos.coords.latitude, pos.coords.longitude),
          () => fetchPharmacyData()
        );
      } else {
        fetchPharmacyData();
      }
    };

    if (id) getCoordsAndFetch();
  }, [id, user]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.genericName && p.genericName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md">
            <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">Pharmacy Not Found</h1>
            <p className="text-slate-500 mb-6">The pharmacy you're looking for doesn't exist or has been removed.</p>
            <Link href="/pharmacies">
              <Button variant="primary" className="w-full rounded-xl">Browse All Pharmacies</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow">
        {/* Banner / Header */}
        <section className="bg-white border-b border-slate-200 pt-8 pb-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <Link href="/pharmacies" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to all pharmacies
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="h-24 w-24 md:h-32 md:w-32 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-600 shrink-0 shadow-inner border border-primary-100">
                <Store className="h-12 w-12 md:h-16 md:w-16" />
              </div>
              
              <div className="flex-grow space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-black text-slate-900">{pharmacy.name}</h1>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> MOH Verified
                      </span>
                    </div>
                    <p className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <MapPin className="h-4 w-4 text-primary-500" /> {formatAddress(pharmacy.address)} {pharmacy.distance && `• ${pharmacy.distance}km`}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <a href={`tel:${pharmacy.phone}`}>
                      <Button variant="outline" className="rounded-xl px-4 flex items-center gap-2 font-bold border-slate-200">
                        <Phone className="h-4 w-4" /> Call
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center"><Phone className="h-4 w-4 text-slate-400" /></div>
                    <div className="text-xs">
                       <p className="text-slate-400 font-bold uppercase tracking-tighter">Phone</p>
                       <p className="text-slate-900 font-bold">{pharmacy.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center"><Mail className="h-4 w-4 text-slate-400" /></div>
                    <div className="text-xs">
                       <p className="text-slate-400 font-bold uppercase tracking-tighter">Email</p>
                       <p className="text-slate-900 font-bold">{pharmacy.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Products */}
        <section className="py-12 container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Available Medicines</h2>
            
            <div className="w-full md:w-80 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search in this store..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-20 text-center rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No medicines found</h3>
              <p className="text-slate-500">We couldn't find any products in this pharmacy matching your search.</p>
              {searchQuery && (
                <Button variant="ghost" onClick={() => setSearchQuery('')} className="mt-4 text-primary-600">
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
