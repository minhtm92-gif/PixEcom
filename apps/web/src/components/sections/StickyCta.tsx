'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { ShoppingCart } from 'lucide-react';
import type { SectionPreviewProps } from './types';

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function StickyCta({ config, product, isPreview }: SectionPreviewProps) {
  const text = (config.text as string) || 'Buy Now';
  const backgroundColor = (config.backgroundColor as string) || '#4c6ef5';
  const textColor = (config.textColor as string) || '#ffffff';
  const showPrice = config.showPrice !== false;

  const currency = product?.currency || 'USD';

  return (
    <div
      className={cn(
        'w-full z-50',
        // In preview mode, render inline; on public pages, render fixed at bottom
        isPreview ? 'relative' : 'fixed bottom-0 left-0 right-0'
      )}
    >
      <div
        className="w-full py-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        style={{ backgroundColor }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Left side: price info */}
          <div className="flex items-center gap-3 min-w-0">
            {showPrice && product && (
              <div className="flex items-baseline gap-2" style={{ color: textColor }}>
                <span className="text-lg sm:text-xl font-bold whitespace-nowrap">
                  {formatCurrency(product.basePrice, currency)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                  <span className="text-sm line-through opacity-60 whitespace-nowrap">
                    {formatCurrency(product.compareAtPrice, currency)}
                  </span>
                )}
              </div>
            )}
            {!showPrice && product?.name && (
              <span
                className="text-sm font-medium truncate"
                style={{ color: textColor }}
              >
                {product.name}
              </span>
            )}
          </div>

          {/* Right side: CTA button */}
          <button
            className={cn(
              'flex-shrink-0 inline-flex items-center justify-center gap-2',
              'rounded-lg px-6 py-2.5 sm:px-8 sm:py-3',
              'text-sm sm:text-base font-semibold',
              'transition-all duration-200',
              'hover:opacity-90 active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
            )}
            style={{
              backgroundColor: textColor,
              color: backgroundColor,
            }}
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            {text}
          </button>
        </div>
      </div>
    </div>
  );
}
