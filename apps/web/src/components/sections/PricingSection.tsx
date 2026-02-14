'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { ShoppingCart, Shield, Truck, RotateCcw, Tag } from 'lucide-react';
import type { SectionPreviewProps } from './types';

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function PricingSection({ config, product }: SectionPreviewProps) {
  const title = (config.title as string) || 'Special Offer';
  const showComparePrice = config.showComparePrice !== false;
  const showDiscount = config.showDiscount !== false;
  const highlightText = config.highlightText as string | undefined;
  const ctaText = (config.ctaText as string) || 'Add to Cart';

  const currency = product?.currency || 'USD';
  const basePrice = product?.basePrice ?? 49.99;
  const compareAtPrice = product?.compareAtPrice;
  const hasDiscount = compareAtPrice && compareAtPrice > basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice! - basePrice) / compareAtPrice!) * 100)
    : 0;
  const savings = hasDiscount ? compareAtPrice! - basePrice : 0;

  return (
    <section className="w-full bg-white py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-surface-900 leading-tight">
            {title}
          </h2>
        </div>

        {/* Pricing card */}
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border-2 border-brand-200',
            'bg-gradient-to-b from-brand-50/50 to-white',
            'shadow-xl shadow-brand-100/30'
          )}
        >
          {/* Highlight banner */}
          {highlightText && (
            <div className="bg-brand-600 py-2.5 text-center text-sm font-semibold text-white">
              {highlightText}
            </div>
          )}

          <div className="p-8 sm:p-10 md:p-12">
            {/* Product name */}
            {product?.name && (
              <p className="text-center text-lg font-medium text-surface-600 mb-6">
                {product.name}
              </p>
            )}

            {/* Price display */}
            <div className="text-center mb-8">
              {showComparePrice && hasDiscount && (
                <div className="mb-2">
                  <span className="text-lg text-surface-400 line-through">
                    {formatCurrency(compareAtPrice!, currency)}
                  </span>
                </div>
              )}

              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl sm:text-6xl font-bold text-surface-900">
                  {formatCurrency(basePrice, currency)}
                </span>
              </div>

              {showDiscount && hasDiscount && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    <Tag className="h-3.5 w-3.5" />
                    Save {discountPercent}%
                  </span>
                  <span className="text-sm text-surface-500">
                    (You save {formatCurrency(savings, currency)})
                  </span>
                </div>
              )}
            </div>

            {/* CTA button */}
            <button
              className={cn(
                'w-full rounded-xl px-8 py-4',
                'text-lg font-semibold text-white',
                'bg-brand-600 hover:bg-brand-700 active:bg-brand-800',
                'transition-all duration-200',
                'shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                'flex items-center justify-center gap-2'
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              {ctaText}
            </button>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-surface-200 pt-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <Shield className="h-6 w-6 text-brand-500" />
                <span className="text-xs font-medium text-surface-600">
                  Secure Checkout
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Truck className="h-6 w-6 text-brand-500" />
                <span className="text-xs font-medium text-surface-600">
                  Fast Shipping
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <RotateCcw className="h-6 w-6 text-brand-500" />
                <span className="text-xs font-medium text-surface-600">
                  30-Day Returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
