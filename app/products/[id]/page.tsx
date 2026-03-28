'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  ShieldCheck, 
  Store, 
  MapPin, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Heart,
  ChevronRight,
  Info,
  Loader2,
  AlertCircle,
  Star
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      ...product,
      pharmacyId: product.pharmacyId || product.pharmacy?.id,
      quantity
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      ...product,
      pharmacyId: product.pharmacyId || product.pharmacy?.id,
      quantity
    });
    router.push('/checkout');
  };
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/inventory/${productId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.medicine) {
            data.name = data.medicine.name;
            data.genericName = data.medicine.genericName;
            data.category = data.medicine.category;
            data.description = data.medicine.description;
            data.requiresPrescription = data.medicine.requiresPrescription;
            data.imageUrl = data.medicine.imageUrl;
            data.averageRating = data.medicine.averageRating;
            data.reviewCount = data.medicine.reviewCount;
            data.dosage = data.medicine.dosage;
            data.sideEffects = data.medicine.sideEffects;
          }
          setProduct(data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

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
          productId,
          rating: ratingInput,
          comment: commentInput
        })
      });
      if (res.ok) {
        setCommentInput('');
        setRatingInput(5);
        // Refresh product to show new review
        const updatedRes = await fetch(`/api/inventory/${productId}`);
        if(updatedRes.ok) setProduct(await updatedRes.json());
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
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{error || 'Something went wrong'}</h2>
          <Link href="/products">
            <Button variant="primary">Back to Medicines</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow pb-40 lg:pb-12">
        
        {/* Desktop Breadcrumb - Hide on mobile */}
        <div className="hidden lg:block container mx-auto px-4 mt-8 mb-4">
          <nav className="flex items-center text-sm text-slate-500">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/products" className="hover:text-primary-600">Medicines</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-slate-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>

        <div className="bg-white lg:rounded-3xl lg:shadow-sm lg:border lg:border-slate-200 overflow-hidden lg:container lg:mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Image Section */}
            <div className="bg-slate-50 flex items-center justify-center relative min-h-[350px] lg:min-h-[400px] w-full">
              
              <Link href="/products" className="lg:hidden absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-md text-slate-700 rounded-full shadow-sm z-20">
                <ChevronRight className="h-6 w-6 rotate-180" />
              </Link>

              <button className="absolute top-4 right-4 lg:top-6 lg:right-6 p-2 lg:p-3 bg-white/80 backdrop-blur-md text-slate-400 hover:text-red-500 rounded-full shadow-sm transition-colors z-20">
                <Heart className="h-6 w-6" />
              </button>

              {product.requiresPrescription && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:top-6 lg:left-6 bg-red-500 text-white text-[10px] lg:text-sm font-black px-3 py-1 lg:px-4 lg:py-2 rounded-full flex items-center gap-1.5 shadow-md z-20 uppercase tracking-wide">
                  <ShieldCheck className="h-4 w-4" />
                  Prescription Needed
                </div>
              )}

              {/* Product Image */}
              <div className="relative w-full h-full p-8 flex items-center justify-center">
                 {product.imageUrl ? (
                   <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-contain rounded-2xl"
                   />
                 ) : (
                   <div className="absolute inset-0 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-slate-100">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-32 h-32 text-slate-300">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      <path d="M12 11h4" />
                      <path d="M14 9v4" />
                    </svg>
                   </div>
                 )}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2.5 py-1 rounded border border-primary-100">
                  {product.category}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-2xl lg:text-4xl font-black text-slate-900 mb-1 lg:mb-2 leading-tight">
                {product.name}
              </h1>
              
              {product.genericName && (
                <p className="text-sm lg:text-lg text-slate-500 font-medium mb-3">
                  {product.genericName}
                </p>
              )}

              {/* Product Rating */}
              {product.averageRating !== undefined && product.averageRating > 0 && (
                <div className="flex items-center gap-2 mb-6 text-left">
                  <div className="flex bg-amber-50 px-2 py-1 rounded-full items-center gap-1 border border-amber-100">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-amber-700">{product.averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">({product.reviewCount} Reviews)</span>
                </div>
              )}
              {(!product.averageRating || product.averageRating === 0) && <div className="mb-6"></div>}

              {/* Pharmacy Info */}
              <Link href={`/pharmacies/${product.pharmacy?.id}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8 active:scale-[0.98] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                    <Store className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{product.pharmacy?.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-primary-400" />
                      {product.pharmacy?.address || 'Location hidden'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary-600 transition-colors" />
              </Link>

              {/* Price & Add to Cart Area */}
              <div className="mb-8 hidden lg:block">
                {/* Desktop Add to Cart */}
                ...
              </div>

              {/* Information Tabs abstract */}
              <div className="space-y-6 lg:mt-0">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Description</h3>
                  <p className="text-sm lg:text-base text-slate-600 leading-relaxed font-medium">
                    {product.description || 'No description provided for this medicine.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-primary-50/50 p-4 rounded-2xl border border-primary-100">
                    <h3 className="font-bold text-primary-900 mb-2">Dosage Info</h3>
                    <p className="text-sm text-primary-700 leading-relaxed">
                      {product.dosage}
                    </p>
                  </div>
                  <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                    <h3 className="font-bold text-orange-900 mb-2">Possible Side Effects</h3>
                    <p className="text-sm text-orange-700 leading-relaxed">
                      {product.sideEffects}
                    </p>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                   <h3 className="text-lg font-bold text-slate-900 mb-4">Customer Reviews</h3>
                   
                   {/* Reviews List */}
                   {product.reviews && product.reviews.length > 0 ? (
                     <div className="space-y-4 mb-6">
                       {product.reviews.map((review: any) => (
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
                       <p className="text-sm text-slate-500 font-medium">No reviews yet. Be the first to review this product!</p>
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

              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar Custom Redesign for Instant Purchase */}
        <div className="fixed bottom-[68px] md:bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] p-3 pb-safe z-50">
          <div className="max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between gap-3">
              {/* Left Side: Quantity Selector */}
              <div className="flex items-center bg-slate-100 border border-slate-200/60 rounded-[18px] p-1 h-14 shrink-0 shadow-inner">
                <button 
                  onClick={decreaseQuantity}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-800 rounded-xl shadow-sm transition-all focus:outline-none disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="w-10 text-center font-black text-lg text-slate-900">
                  {quantity}
                </span>
                <button 
                  onClick={increaseQuantity}
                  className="w-10 h-10 flex items-center justify-center text-white bg-slate-800 hover:bg-black rounded-xl shadow-sm transition-all focus:outline-none"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Right Side: Actions */}
              <div className="flex items-center gap-2 flex-1">
                {/* Secondary Add to Cart */}
                <Button 
                  variant="outline" 
                  onClick={handleAddToCart} 
                  className="h-14 w-14 shrink-0 rounded-[18px] border-slate-200 bg-white shadow-sm hover:border-primary-300 hover:text-primary-600 focus:ring-2 focus:ring-primary-500/20 active:scale-95 transition-all p-0 flex items-center justify-center"
                  title="Add to Cart"
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="h-6 w-6" />
                </Button>

                {/* Primary Buy Now */}
                <Button 
                  variant="primary" 
                  className="flex-1 h-14 rounded-[18px] shadow-lg shadow-primary-600/30 active:scale-95 transition-all group overflow-hidden relative"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  {/* Subtle shine effect on the button */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                  
                  <span className="flex flex-col items-center justify-center relative z-10 w-full">
                    <span className="text-base font-black uppercase tracking-widest leading-none mb-1">
                      {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                    </span>
                    <span className="text-[11px] font-bold text-primary-100 uppercase tracking-wide leading-none">
                      {(product.price * quantity).toLocaleString('en-ET')} ETB
                    </span>
                  </span>
                </Button>
              </div>
            </div>

            {/* Prescription Indicator below if required */}
            {product.requiresPrescription && (
              <div className="mt-2.5 bg-red-50 text-red-600 py-1.5 px-3 rounded-xl border border-red-100 flex items-center justify-center gap-1.5 animate-in slide-in-from-bottom-2 fade-in duration-300">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest">Prescription Upload Required</span>
              </div>
            )}
            
          </div>
        </div>
      </main>

      {/* Footer hidden on mobile since we have sticky elements */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}
