'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard, ProductProps } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCart } from '@/components/providers/CartProvider';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Search, 
  Loader2,
  ArrowLeft,
  Info,
  Star,
  Clock,
  ChevronRight,
  Plus
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
  const [activeTab, setActiveTab] = useState('All');
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { addItem, totalItems, totalPrice } = useCart();

  const CATEGORIES = ['All', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Personal Care', 'Baby', 'Heart', 'Reviews'];

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
            name: p.medicine?.name || 'Unknown',
            genericName: p.medicine?.genericName,
            price: p.price,
            imageUrl: p.medicine?.imageUrl,
            pharmacyId: p.pharmacy.id,
            pharmacyName: p.pharmacy.name,
            distance: p.pharmacy.distance,
            requiresPrescription: p.medicine?.requiresPrescription,
            inStock: p.stock > 0,
            category: p.medicine?.category,
            offers: p.offers,
            averageRating: p.medicine?.averageRating,
            reviewCount: p.medicine?.reviewCount
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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to leave a review.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacyId: id,
          rating: ratingInput,
          comment: commentInput
        })
      });
      if (res.ok) {
        setCommentInput('');
        setRatingInput(5);
        // Soft refresh pharmacy data
        const updatedRes = await fetch(`/api/pharmacies/${id}`);
        if(updatedRes.ok) setPharmacy(await updatedRes.json());
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
    <div className="flex flex-col min-h-screen bg-slate-50 pb-safe">
      <Navbar />

      <main className="flex-grow pb-24">
        {/* Banner / Header */}
        <section className="bg-white border-b border-slate-100">
          {/* Cover Image */}
          <div className="relative h-48 md:h-64 w-full bg-slate-200">
             <img src={pharmacy.coverImageUrl || "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&h=400&fit=crop"} alt="Pharmacy Cover" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
             
             {/* Back Button Overlay */}
             <Link href="/" className="absolute top-4 left-4 h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10 transition-colors hover:bg-white/30">
               <ArrowLeft className="h-5 w-5" />
             </Link>

             {/* Pharmacy Logo Overlay */}
             <div className="absolute -bottom-6 left-4 h-20 w-20 md:h-24 md:w-24 bg-white rounded-2xl p-1 shadow-2xl border border-white overflow-hidden z-20">
                <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                  {pharmacy.logoUrl ? (
                    <img src={pharmacy.logoUrl} alt={pharmacy.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-10 w-10 text-primary-400" />
                  )}
                </div>
             </div>

             {/* Pharmacy Info Overlay */}
             <div className="absolute bottom-4 left-28 md:left-32 right-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-black truncate">{pharmacy.name}</h1>
                  <span className="shrink-0 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    Open
                  </span>
                </div>
                <p className="text-xs font-medium flex items-center gap-1 opacity-90 truncate italic">
                  <MapPin className="h-3 w-3" /> {formatAddress(pharmacy.address)}
                </p>
             </div>
          </div>

          {/* Info Row */}
          <div className="px-4 py-6 flex items-center justify-between text-sm border-b border-slate-50 mt-4 overflow-x-auto gap-4">
             <div className="flex flex-col items-center gap-0.5 shrink-0">
                <span className="font-bold flex items-center gap-1 text-slate-900"><Star className="h-4 w-4 text-amber-400 fill-amber-400" /> {pharmacy.averageRating ? pharmacy.averageRating.toFixed(1) : '0.0'}</span>
                <span className="text-[10px] text-slate-500">{pharmacy.reviewCount || 0} Reviews</span>
             </div>
             <div className="w-px h-8 bg-slate-200 shrink-0"></div>
             <div className="flex flex-col items-center gap-0.5 shrink-0">
                <span className="font-bold text-slate-900 flex items-center gap-1"><Clock className="h-4 w-4 text-primary-600" /> {pharmacy.workingHours || '8AM - 8PM'}</span>
                <span className="text-[10px] text-slate-500">Operations</span>
             </div>
             <div className="w-px h-8 bg-slate-200 shrink-0"></div>
             <div className="flex flex-col items-center gap-0.5 shrink-0">
                <span className="font-bold text-slate-900">{pharmacy.distance !== undefined ? `${pharmacy.distance} km` : 'Near you'}</span>
                <span className="text-[10px] text-slate-500">Distance</span>
             </div>
          </div>

          {/* Description Section */}
          {pharmacy.description && (
            <div className="px-5 py-4 bg-white border-b border-slate-50">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">About Pharmcay</h3>
               <p className="text-xs text-slate-600 leading-relaxed italic">{pharmacy.description}</p>
            </div>
          )}

          {/* Category Tabs */}
          <div className="px-4 py-2 overflow-x-auto hide-scrollbar flex gap-2 border-b border-slate-100 shadow-sm sticky top-16 z-30 bg-white">
             {CATEGORIES.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setActiveTab(cat)}
                 className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </section>

        {/* Medicine List */}
        <section className="pt-4 pb-8 container mx-auto px-4 max-w-3xl">
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search in this pharmacy..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-sm font-medium text-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <h2 className="text-lg font-black text-slate-900 mb-4">{activeTab === 'All' ? 'Available Items' : activeTab}</h2>

          <div className="flex flex-col gap-3">
            {activeTab === 'Reviews' ? (
              <div className="mt-2">
                 {/* Reviews List */}
                 {pharmacy.reviews && pharmacy.reviews.length > 0 ? (
                   <div className="space-y-4 mb-6">
                     {pharmacy.reviews.map((review: any) => (
                       <div key={review.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                         <div className="flex items-center justify-between mb-2">
                           <span className="font-bold text-sm text-slate-800">{review.user?.name || 'Anonymous User'}</span>
                           <div className="flex">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                             ))}
                           </div>
                         </div>
                         {review.comment && <p className="text-sm text-slate-600">{review.comment}</p>}
                         <p className="text-[10px] text-slate-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center mb-6">
                     <p className="text-sm text-slate-500 font-medium">No reviews yet for this pharmacy.</p>
                   </div>
                 )}

                 {/* Write Review Form */}
                 {user?.role === 'CUSTOMER' && (
                   <form onSubmit={submitReview} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                     <h4 className="font-bold text-sm text-slate-800 mb-3">Write a Review</h4>
                     <div className="flex items-center gap-1 mb-4">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <button
                           key={star}
                           type="button"
                           onClick={() => setRatingInput(star)}
                           className="focus:outline-none transition-transform hover:scale-110"
                         >
                           <Star className={`w-6 h-6 ${star <= ratingInput ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-50'}`} />
                         </button>
                       ))}
                     </div>
                     <textarea
                       value={commentInput}
                       onChange={(e) => setCommentInput(e.target.value)}
                       placeholder="Share your experience (optional)"
                       className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white mb-3 min-h-[80px]"
                     />
                     <Button type="submit" variant="primary" size="sm" disabled={isSubmittingReview}>
                       {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                     </Button>
                   </form>
                 )}
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => {
                const offer = (product as any).offers?.[0];
                const discountedPrice = offer ? product.price * (1 - offer.discountPct/100) : null;

                return (
                  <div key={product.id} className="bg-white p-3.5 rounded-[1.5rem] flex gap-4 items-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    {offer && (
                      <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl shadow-lg uppercase tracking-tighter">
                        -{offer.discountPct}% OFF
                      </div>
                    )}
                    
                    {/* Product Image */}
                    <Link href={`/products/${product.id}`} className="block h-20 w-20 bg-slate-50 rounded-2xl shrink-0 overflow-hidden relative border border-slate-50">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Store className="h-8 w-8" />
                        </div>
                      )}
                      {product.requiresPrescription && (
                        <span className="absolute bottom-1 right-1 bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm border border-red-100 flex items-center gap-0.5">
                          <ShieldCheck className="h-2 w-2" /> Rx
                        </span>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                      <Link href={`/products/${product.id}`} className="block">
                        <h3 className="text-sm font-black text-slate-900 line-clamp-1 mb-0.5 group-hover:text-primary-600 transition-colors">{product.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {discountedPrice ? (
                            <>
                              <span className="text-sm font-black text-primary-600">{discountedPrice.toFixed(0)} ETB</span>
                              <span className="text-[10px] font-medium text-slate-400 line-through">{product.price.toFixed(0)}</span>
                            </>
                          ) : (
                            <span className="text-sm font-black text-slate-900">{product.price.toFixed(0)} ETB</span>
                          )}
                        </div>
                      </Link>
                    </div>

                    {/* Add Button */}
                    <div className="shrink-0 pl-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => addItem(product)}
                        className="h-10 w-10 p-0 rounded-2xl shadow-lg shadow-primary-500/20 flex items-center justify-center shrink-0 active:scale-90 transition-all"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-12 text-center text-slate-500 text-sm font-medium">
                No medicines found.
              </div>
            )}
          </div>
        </section>

        {/* Floating Cart (Only visible if items are in cart) */}
        {totalItems > 0 && (
          <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 z-40 bg-gradient-to-t from-white via-white to-transparent pb-6 pt-10 pointer-events-none">
            <Link href="/cart" className="w-full bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/30 p-4 flex items-center justify-between pointer-events-auto active:scale-[0.98] transition-all">
               <div className="flex items-center gap-3">
                 <div className="bg-primary-700 h-8 w-8 rounded-full flex items-center justify-center border border-primary-500 font-bold text-sm">
                   {totalItems}
                 </div>
                 <span className="font-bold text-sm">View Cart</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="font-black text-sm">{totalPrice.toFixed(2)} ETB</span>
                 <ChevronRight className="h-5 w-5" />
               </div>
            </Link>
          </div>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
