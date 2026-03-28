'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Store, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/providers/CartProvider';

export interface ProductProps {
  id: string;
  name: string;
  genericName?: string;
  price: number;
  imageUrl?: string;
  pharmacyId: string;
  pharmacyName: string;
  distance?: number | null;
  requiresPrescription: boolean;
  inStock: boolean;
  category: string;
  averageRating?: number;
  reviewCount?: number;
}

export const ProductCard = ({ product }: { product: ProductProps }) => {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col bg-white rounded-xl md:rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300">
      {/* Product Image section */}
      <div className="relative aspect-[4/3] md:aspect-square bg-slate-50 p-1.5 md:p-6 flex justify-center items-center">
        {/* Prescription Badge */}
        {product.requiresPrescription && (
          <div className="absolute top-1 left-1 md:top-3 md:left-3 bg-red-100/90 backdrop-blur-sm text-red-700 text-[8px] md:text-xs font-semibold px-1 py-0.5 md:px-2 md:py-1 rounded-sm md:rounded-md flex items-center gap-0.5 shadow-sm z-10">
            <ShieldCheck className="h-2 w-2 md:h-3 md:w-3" />
            <span className="hidden sm:inline">Rx Required</span>
            <span className="sm:hidden">Rx</span>
          </div>
        )}
        
        {/* Favorite Button */}
        <button className="absolute top-1 right-1 md:top-3 md:right-3 p-1 md:p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-full transition-colors z-10 w-5 h-5 md:w-8 md:h-8 flex items-center justify-center">
          <Heart className="h-2.5 w-2.5 md:h-5 md:w-5" />
        </button>

        {/* Product Image or Placeholder */}
        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
          {product.imageUrl ? (
            <Image 
              src={product.imageUrl} 
              alt={product.name}
              fill
              className="object-contain mix-blend-multiply"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 md:w-24 md:h-24 opacity-50">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                <path d="M12 11h4" />
                <path d="M14 9v4" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-1.5 md:p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-0.5 md:mb-2">
          <span className="text-[8px] md:text-xs font-medium text-primary-600 bg-primary-50 px-1 py-0.5 md:px-2 md:py-0.5 rounded-full line-clamp-1 max-w-[60%]">
            {product.category}
          </span>
          <span className="text-[8px] md:text-xs font-medium text-slate-500 flex items-center gap-0.5 md:gap-1 text-right line-clamp-1">
            <Store className="h-2 w-2 md:h-3 md:w-3 shrink-0" />
            <span className="truncate">{product.pharmacyName} {product.distance && `• ${product.distance}km`}</span>
          </span>
        </div>

        <Link href={`/products/${product.id}`} className="block mt-0.5 mb-0.5">
          <h3 className="font-bold text-slate-900 text-[10px] md:text-lg leading-tight line-clamp-1 md:line-clamp-2 group-hover:text-primary-600 transition-colors text-left">
            {product.name}
          </h3>
        </Link>
        
        {product.genericName && (
          <p className="text-[8px] md:text-sm text-slate-500 italic mb-1 md:mb-1 text-left line-clamp-1 opacity-80">
            {product.genericName}
          </p>
        )}

        {/* Rating Section */}
        {product.averageRating !== undefined && product.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-1 md:mb-2 text-left">
            <Star className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[9px] md:text-xs font-bold text-slate-700">{product.averageRating.toFixed(1)}</span>
            <span className="text-[8px] md:text-[10px] text-slate-400">({product.reviewCount})</span>
          </div>
        )}

        {/* Price and Add Button Section */}
        <div className="mt-auto pt-1 md:pt-4 flex flex-row items-center justify-between border-t border-slate-100 gap-1 md:gap-0">
          <div className="text-left flex flex-col items-start">
            <span className="text-[7px] md:text-xs text-slate-500 leading-none mb-0.5">Price</span>
            <span className="text-[10px] md:text-xl font-bold text-slate-900 leading-none">
              {product.price.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
            </span>
          </div>
          
          <Button 
            variant={product.inStock ? 'primary' : 'outline'} 
            size="sm"
            className="w-auto rounded-md md:rounded-xl h-6 md:h-9 px-1.5 md:px-4 text-[9px] md:text-sm flex items-center justify-center font-bold"
            disabled={!product.inStock}
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
          >
            {product.inStock ? (
              <>
                <ShoppingCart className="h-2.5 w-2.5 md:h-4 md:w-4 mr-0.5 md:mr-1.5 shrink-0" />
                Add
              </>
            ) : (
               'Empty'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
