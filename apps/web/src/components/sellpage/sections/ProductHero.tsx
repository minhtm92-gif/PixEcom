'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, CreditCard, Eye, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ProductHeroData {
  type: 'product-hero';
  title?: string;
  price: number;
  compareAtPrice?: number;
  rating?: number;
  reviewCount?: number;
  images: string[];
  showClearanceBadge?: boolean;
  showCountdownTimer?: boolean;
  tieredDiscountText?: string;
  viewerCount?: number;
  purchaseCount?: number;
  showSocialProof?: boolean;
}

interface ProductHeroProps {
  data: ProductHeroData;
  product: any;
  isPreview?: boolean;
}

export function ProductHero({ data, product, isPreview = false }: ProductHeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = data.images.length > 0 ? data.images : product.media?.map((m: any) => m.url) || [];
  const title = data.title || product.name;
  // Convert Prisma Decimal fields to numbers
  const price = Number(data.price || product.basePrice);
  const compareAtPrice = data.compareAtPrice ? Number(data.compareAtPrice) : undefined;
  const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Clearance Badge */}
              {data.showClearanceBadge && discount > 0 && (
                <div className="absolute left-4 top-4 rounded bg-red-600 px-3 py-1 text-sm font-bold text-white">
                  CLEARANCE {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-6 gap-2">
                {images.slice(0, 6).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded border-2 ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

            {/* Rating */}
            {(data.rating || data.reviewCount) && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(data.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {data.rating?.toFixed(1)} ({data.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">${price.toFixed(2)}</span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-xl text-gray-500 line-through">${compareAtPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Social Proof Counters */}
            {data.showSocialProof && (data.viewerCount || data.purchaseCount) && (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                {data.viewerCount && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>
                      <strong className="font-semibold text-gray-900">{data.viewerCount}</strong> people viewing
                    </span>
                  </div>
                )}

                {data.purchaseCount && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <ShoppingBag className="h-4 w-4" />
                    <span>
                      <strong className="font-semibold text-gray-900">{data.purchaseCount}</strong> purchased
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tiered Discount */}
            {data.tieredDiscountText && (
              <div className="mt-4 rounded-lg border-2 border-dashed border-green-500 bg-green-50 p-4">
                <p className="font-semibold text-green-700">{data.tieredDiscountText}</p>
              </div>
            )}

            {/* Countdown Timer */}
            {data.showCountdownTimer && (
              <div className="mt-4 rounded-lg bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">🔥 Deal ends in:</p>
                <div className="mt-2 flex gap-3 text-2xl font-bold text-red-600">
                  <div>
                    <span>12</span>
                    <span className="text-sm font-normal">h</span>
                  </div>
                  <span>:</span>
                  <div>
                    <span>34</span>
                    <span className="text-sm font-normal">m</span>
                  </div>
                  <span>:</span>
                  <div>
                    <span>56</span>
                    <span className="text-sm font-normal">s</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 space-y-3">
              <Button
                size="lg"
                className="w-full"
                leftIcon={<ShoppingCart className="h-5 w-5" />}
                disabled={isPreview}
              >
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                leftIcon={<CreditCard className="h-5 w-5" />}
                disabled={isPreview}
              >
                Buy It Now
              </Button>
            </div>

            {/* Guarantees */}
            <div className="mt-8 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>45-Day Satisfaction Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Secured Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
