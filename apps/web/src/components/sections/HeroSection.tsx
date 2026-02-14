'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { ShoppingCart, ArrowRight, Eye, ShoppingBag } from 'lucide-react';
import type { SectionPreviewProps } from './types';

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function HeroSection({ config, product }: SectionPreviewProps) {
  const headline = (config.headline as string) || 'Transform Your Daily Routine';
  const subheadline =
    (config.subheadline as string) ||
    'Discover the product that thousands of customers trust every day.';
  const badgeText = config.badgeText as string | undefined;
  const showPrice = config.showPrice !== false;
  const showComparePrice = config.showComparePrice !== false;
  const backgroundImage = config.backgroundImage as string | undefined;
  const ctaText = (config.ctaText as string) || 'Buy Now';
  const ctaUrl = config.ctaUrl as string | undefined;
  const showSocialProof = config.showSocialProof as boolean | undefined;
  const viewerCount = config.viewerCount as number | undefined;
  const purchaseCount = config.purchaseCount as number | undefined;

  const currency = product?.currency || 'USD';
  const primaryMedia = product?.media?.find((m) => m.isPrimary) || product?.media?.[0];
  const hasDiscount =
    product?.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product!.compareAtPrice! - product!.basePrice) / product!.compareAtPrice!) * 100
      )
    : 0;

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden',
        backgroundImage ? 'min-h-[500px] md:min-h-[600px]' : 'bg-gradient-to-br from-brand-50 via-white to-surface-50'
      )}
    >
      {/* Background image overlay */}
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </>
      )}

      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
          'py-16 sm:py-20 md:py-24 lg:py-28'
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text content */}
          <div className="space-y-6 text-center lg:text-left">
            {badgeText && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-4 py-1.5',
                  'text-xs font-semibold uppercase tracking-wider',
                  'bg-brand-100 text-brand-700',
                  backgroundImage && 'bg-white/20 text-white backdrop-blur-sm'
                )}
              >
                {badgeText}
              </span>
            )}

            <h1
              className={cn(
                'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight',
                backgroundImage ? 'text-white' : 'text-surface-900'
              )}
            >
              {headline}
            </h1>

            <p
              className={cn(
                'text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed',
                backgroundImage
                  ? 'text-white/80'
                  : 'text-surface-600',
                'lg:max-w-none'
              )}
            >
              {subheadline}
            </p>

            {/* Pricing */}
            {product && showPrice && (
              <div className="flex items-baseline gap-3 justify-center lg:justify-start">
                <span
                  className={cn(
                    'text-3xl sm:text-4xl font-bold',
                    backgroundImage ? 'text-white' : 'text-surface-900'
                  )}
                >
                  {formatCurrency(product.basePrice, currency)}
                </span>
                {showComparePrice && hasDiscount && (
                  <>
                    <span
                      className={cn(
                        'text-lg line-through',
                        backgroundImage ? 'text-white/50' : 'text-surface-400'
                      )}
                    >
                      {formatCurrency(product.compareAtPrice!, currency)}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-700">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Social Proof Counters */}
            {showSocialProof && (viewerCount || purchaseCount) && (
              <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
                {viewerCount && (
                  <div className={cn(
                    "flex items-center gap-2",
                    backgroundImage ? "text-white/90" : "text-surface-600"
                  )}>
                    <Eye className="h-4 w-4" />
                    <span>
                      <strong className={cn(
                        "font-semibold",
                        backgroundImage ? "text-white" : "text-surface-900"
                      )}>
                        {viewerCount}
                      </strong>{' '}
                      people viewing
                    </span>
                  </div>
                )}

                {purchaseCount && (
                  <div className={cn(
                    "flex items-center gap-2",
                    backgroundImage ? "text-white/90" : "text-surface-600"
                  )}>
                    <ShoppingBag className="h-4 w-4" />
                    <span>
                      <strong className={cn(
                        "font-semibold",
                        backgroundImage ? "text-white" : "text-surface-900"
                      )}>
                        {purchaseCount}
                      </strong>{' '}
                      purchased
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <button
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4',
                  'text-base font-semibold transition-all duration-200',
                  'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
                  'shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2'
                )}
              >
                <ShoppingCart className="h-5 w-5" />
                {ctaText}
              </button>
              {ctaUrl && (
                <a
                  href={ctaUrl}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4',
                    'text-base font-semibold transition-all duration-200',
                    backgroundImage
                      ? 'border-2 border-white/30 text-white hover:bg-white/10'
                      : 'border-2 border-surface-300 text-surface-700 hover:bg-surface-50'
                  )}
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Product image */}
          <div className="flex justify-center lg:justify-end">
            {primaryMedia ? (
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={primaryMedia.url}
                    alt={primaryMedia.altText || product?.name || 'Product'}
                    className="h-auto w-full max-w-md object-cover"
                  />
                </div>
                {hasDiscount && (
                  <div className="absolute -right-3 -top-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                    <span className="text-sm font-bold">-{discountPercent}%</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full max-w-md">
                <div
                  className={cn(
                    'aspect-square rounded-2xl',
                    'bg-gradient-to-br from-brand-100 to-brand-200',
                    'flex items-center justify-center shadow-2xl'
                  )}
                >
                  <div className="text-center space-y-3 px-8">
                    <div className="mx-auto h-16 w-16 rounded-full bg-brand-300/50 flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-brand-600" />
                    </div>
                    <p className="text-sm font-medium text-brand-600">
                      Product Image
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
