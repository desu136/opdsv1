'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Store, ShieldCheck } from 'lucide-react';
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
  requiresPrescription: boolean;
  inStock: boolean;
  category: string;
}

export const ProductCard = ({ product }: { product: ProductProps }) => {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300">
      {/* Product Image section */}
      <div className="relative aspect-square bg-slate-50 p-6 flex justify-center items-center">
        {/* Prescription Badge */}
        {product.requiresPrescription && (
          <div className="absolute top-3 left-3 bg-red-100/90 backdrop-blur-sm text-red-700 text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
            <ShieldCheck className="h-3 w-3" />
            Rx Required
          </div>
        )}
        
        {/* Favorite Button */}
        <button className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-full transition-colors z-10">
          <Heart className="h-5 w-5" />
        </button>

        {/* Product Image or Placeholder */}
        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
          {product.imageUrl ? (
            <Image 
              src={product.imageUrl} 
              alt={product.name}
              fill
              className="object-contain mix-blend-multiply"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24 opacity-50">
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
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1 text-right">
            <Store className="h-3 w-3" />
            {product.pharmacyName}
          </span>
        </div>

        <Link href={`/products/${product.id}`} className="block mt-1 mb-1">
          <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors text-left">
            {product.name}
          </h3>
        </Link>
        
        {product.genericName && (
          <p className="text-sm text-slate-500 italic mb-3 text-left">
            {product.genericName}
          </p>
        )}

        {/* Spacers to push price and button to bottom */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <div className="text-left">
            <span className="text-xs text-slate-500 block">Price</span>
            <span className="text-xl font-bold text-slate-900">
              {product.price.toLocaleString('en-ET', { style: 'currency', currency: 'ETB' })}
            </span>
          </div>
          
          <Button 
            variant={product.inStock ? 'primary' : 'outline'} 
            size="sm"
            className="rounded-xl px-4 py-2"
            disabled={!product.inStock}
            onClick={() => addItem(product)}
          >
            {product.inStock ? (
              <>
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Add
              </>
            ) : (
               'Out of Stock'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
