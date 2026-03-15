'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/providers/CartProvider';
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
  AlertCircle
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      ...product,
      pharmacyId: product.pharmacyId || product.pharmacy?.id
    });
  };
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/inventory/${productId}`);
        if (res.ok) {
          const data = await res.json();
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

      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/products" className="hover:text-primary-600">Medicines</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-slate-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Image Section */}
            <div className="bg-slate-50 p-8 flex items-center justify-center relative min-h-[400px]">
              
              <button className="absolute top-6 right-6 p-3 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-sm transition-colors z-10">
                <Heart className="h-6 w-6" />
              </button>

              {product.requiresPrescription && (
                <div className="absolute top-6 left-6 bg-red-100 text-red-700 text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm z-10 border border-red-200">
                  <ShieldCheck className="h-5 w-5" />
                  Prescription Required
                </div>
              )}

              {/* Product Image */}
              <div className="relative w-full max-w-sm aspect-square">
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
              
              <div className="mb-2 flex items-center gap-3">
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">
                {product.name}
              </h1>
              
              {product.genericName && (
                <p className="text-lg text-slate-500 italic mb-6">
                  Generic: {product.genericName}
                </p>
              )}

              {/* Pharmacy Info */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <Store className="h-5 w-5 text-secondary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{product.pharmacy?.name}</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {product.pharmacy?.address || 'Location hidden'}
                  </p>
                </div>
              </div>

              {/* Price & Add to Cart Area */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6">
                  <div>
                    <span className="text-slate-500 text-sm block mb-1">Price per unit</span>
                    <span className="text-4xl font-extrabold text-slate-900">
                      {product.price.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
                    </span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center">
                    <span className="text-slate-500 text-sm mr-4 font-medium">Quantity</span>
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                      <button 
                        onClick={decreaseQuantity}
                        className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors focus:outline-none disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <span className="w-12 text-center font-bold text-lg text-slate-900">
                        {quantity}
                      </span>
                      <button 
                        onClick={increaseQuantity}
                        className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors focus:outline-none"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full text-lg h-14 rounded-2xl"
                  disabled={product.stock <= 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-6 w-6 mr-3" />
                  Add to Cart — {(product.price * quantity).toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
                </Button>

                {product.requiresPrescription && (
                  <p className="text-sm text-slate-500 mt-4 text-center flex items-center justify-center gap-2">
                    <Info className="h-4 w-4" />
                    You will be asked to upload your prescription at checkout.
                  </p>
                )}
              </div>

              <hr className="border-slate-100 mb-8" />

              {/* Information Tabs abstract */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Description</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {product.description}
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
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
