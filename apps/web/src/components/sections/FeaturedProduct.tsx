'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { ShoppingBag, Star } from 'lucide-react';
import type { SectionPreviewProps } from './types';

interface PlaceholderProduct {
  name: string;
  price: string;
  image?: string;
  rating: number;
}

const placeholderProducts: PlaceholderProduct[] = [
  { name: 'Premium Wireless Earbuds', price: '$79.99', rating: 4.8 },
  { name: 'Organic Face Serum', price: '$34.99', rating: 4.9 },
  { name: 'Fitness Tracker Band', price: '$49.99', rating: 4.7 },
  { name: 'Bamboo Water Bottle', price: '$24.99', rating: 4.6 },
  { name: 'LED Desk Lamp', price: '$42.99', rating: 4.5 },
  { name: 'Yoga Mat Pro', price: '$59.99', rating: 4.8 },
];

export function FeaturedProduct({ config }: SectionPreviewProps) {
  const title = (config.title as string) || 'Featured Products';
  const maxProducts = (config.maxProducts as number) || 4;

  const displayProducts = placeholderProducts.slice(
    0,
    Math.min(Math.max(maxProducts, 1), 6)
  );

  return (
    <section className="w-full bg-white py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-surface-900 leading-tight">
            {title}
          </h2>
        </div>

        {/* Products grid */}
        <div
          className={cn(
            'grid gap-6',
            maxProducts <= 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : maxProducts === 3
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          )}
        >
          {displayProducts.map((product, idx) => (
            <div
              key={idx}
              className={cn(
                'group rounded-2xl border border-surface-200 bg-white',
                'overflow-hidden transition-all duration-300',
                'hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50',
                'hover:-translate-y-1'
              )}
            >
              {/* Product image placeholder */}
              <div className="relative aspect-square bg-gradient-to-br from-surface-50 to-surface-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <ShoppingBag className="mx-auto h-10 w-10 text-surface-300 transition-colors group-hover:text-brand-300" />
                    <p className="text-xs text-surface-400">Product Image</p>
                  </div>
                </div>

                {/* Quick view overlay */}
                <div
                  className={cn(
                    'absolute inset-0 bg-black/0 transition-all duration-300',
                    'group-hover:bg-black/5',
                    'flex items-end justify-center pb-4',
                    'opacity-0 group-hover:opacity-100'
                  )}
                >
                  <button
                    className={cn(
                      'rounded-lg bg-white px-4 py-2 text-sm font-medium text-surface-900',
                      'shadow-lg transition-transform',
                      'translate-y-2 group-hover:translate-y-0'
                    )}
                  >
                    Quick View
                  </button>
                </div>
              </div>

              {/* Product info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-surface-900 mb-1 line-clamp-1 group-hover:text-brand-700 transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-3 w-3',
                        star <= Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-surface-200 text-surface-200'
                      )}
                    />
                  ))}
                  <span className="ml-1 text-xs text-surface-500">
                    {product.rating}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-surface-900">
                    {product.price}
                  </span>
                  <button
                    className={cn(
                      'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                      'bg-brand-50 text-brand-600 transition-colors',
                      'hover:bg-brand-100'
                    )}
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
