'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard, ProductProps } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { Search, Filter, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';

const categories = ['All', 'Pain Relief', 'Antibiotics', 'Vitamins & Supplements', 'First Aid', 'Chronic Care', 'Baby Care'];

function MedicinesListing() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialQuery = searchParams.get('query') || '';
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Update searchQuery if URL parameter changes
    const query = searchParams.get('query');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async (lat?: number, lng?: number) => {
      try {
        let url = '/api/inventory';
        if (lat && lng) {
          url += `?lat=${lat}&lng=${lng}`;
        }
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Map API response to ProductProps
          const mapped = data.map((p: any) => ({
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
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const getCoordsAndFetch = () => {
      if (user?.role === 'CUSTOMER' && (user as any).lastLat) {
        fetchProducts((user as any).lastLat, (user as any).lastLng);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchProducts(pos.coords.latitude, pos.coords.longitude),
          () => fetchProducts()
        );
      } else {
        fetchProducts();
      }
    };

    getCoordsAndFetch();
  }, [user]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchLower) || 
                          (p.genericName && p.genericName.toLowerCase().includes(searchLower)) ||
                          (p.pharmacyName && p.pharmacyName.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* Page Header & Search */}
        <div className="mb-4 md:mb-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Find Medicines</h1>
              <p className="text-slate-500">Order from verified pharmacies near you.</p>
            </div>
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or generic..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <div className="flex items-center gap-2 font-bold justify-between mb-4 pb-4 border-b border-slate-100">
                <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</span>
                <button className="text-xs text-primary-600 font-medium hover:underline" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>Clear all</button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 text-sm flex justify-between items-center cursor-pointer">
                    Prescription Type <ChevronDown className="h-4 w-4" />
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                      Requires Prescription (Rx)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                      Over the Counter (OTC)
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 text-sm flex justify-between items-center cursor-pointer">
                    Availability <ChevronDown className="h-4 w-4" />
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" defaultChecked />
                      In Stock Only
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 text-sm">
                {isLoading ? 'Loading products...' : <>Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> products</>}
              </span>
              <button className="lg:hidden flex items-center gap-2 text-sm font-medium text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-4" />
                <p className="text-slate-500">Fetching latest inventory...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No medicines found</h3>
                <p className="text-slate-500 mb-6">We couldn't find any products matching your current search or filters.</p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function MedicinesListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    }>
      <MedicinesListing />
    </Suspense>
  );
}
