'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, CreditCard, Eye, ShoppingBag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { apiAddToCart } from '@/lib/cart-session';

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
  const [selectedVariant, setSelectedVariant] = useState<any>(product?.variants?.[0] || null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem, openCart } = useCartStore();

  const images = data.images?.length > 0 ? data.images : product?.media?.map((m: any) => m.url) || [];
  const title = data.title || product?.name || 'Product';

  const price = selectedVariant?.priceOverride
    ? Number(selectedVariant.priceOverride)
    : Number(data.price || product?.basePrice || 0);

  const compareAtPrice = selectedVariant?.compareAtPrice
    ? Number(selectedVariant.compareAtPrice)
    : (data.compareAtPrice ? Number(data.compareAtPrice) : undefined);

  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleAddToCart = async () => {
    if (isPreview || addingToCart) return;
    setAddingToCart(true);
    try {
      const variantId = selectedVariant?.id;
      const imageUrl = images[0] || null;

      if (variantId) {
        // Call server-side cart API
        await apiAddToCart(variantId, quantity, product?.storeId);
      }

      // Also update local Zustand store for immediate UI feedback
      addItem({
        productId: product?.id || 'unknown',
        variantId: variantId,
        name: title,
        price,
        quantity,
        imageUrl,
        variantLabel: selectedVariant?.name || undefined,
      });

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      openCart();
    } catch (err) {
      console.error('Add to cart error:', err);
      // Still open cart with local state even if API fails
      openCart();
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isPreview) return;
    await handleAddToCart();
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  // Group variants by option keys for color/size selectors
  const variants = product?.variants || [];
  const hasVariants = variants.length > 1;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Image Gallery */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">No image</div>
              )}

              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {data.showClearanceBadge && discount > 0 && (
                <div className="absolute left-4 top-4 rounded bg-red-600 px-3 py-1 text-sm font-bold text-white">
                  CLEARANCE {discount}% OFF
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-6 gap-2">
                {images.slice(0, 6).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'}`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

            {(data.rating || data.reviewCount) && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(data.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{data.rating?.toFixed(1)} ({data.reviewCount} reviews)</span>
              </div>
            )}

            {/* Pricing */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">${price.toFixed(2)}</span>
              {compareAtPrice && compareAtPrice > price && (
                <>
                  <span className="text-xl text-gray-500 line-through">${compareAtPrice.toFixed(2)}</span>
                  <span className="rounded bg-red-100 px-2 py-0.5 text-sm font-bold text-red-600">-{discount}%</span>
                </>
              )}
            </div>

            {/* Social Proof */}
            {data.showSocialProof && (data.viewerCount || data.purchaseCount) && (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                {data.viewerCount && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span><strong className="font-semibold text-gray-900">{data.viewerCount}</strong> people viewing</span>
                  </div>
                )}
                {data.purchaseCount && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <ShoppingBag className="h-4 w-4" />
                    <span><strong className="font-semibold text-gray-900">{data.purchaseCount}</strong> purchased</span>
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
                <CountdownTimer />
              </div>
            )}

            {/* Variant Selector */}
            {hasVariants && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option: <span className="font-semibold">{selectedVariant?.name}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isPreview || addingToCart}
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg text-base font-bold transition-all ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-black text-white hover:bg-gray-800 active:scale-95'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addedToCart ? (
                  <><Check className="h-5 w-5" /> Added to Cart!</>
                ) : addingToCart ? (
                  <>Adding...</>
                ) : (
                  <><ShoppingCart className="h-5 w-5" /> Add to Cart</>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isPreview}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg text-base font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="h-5 w-5" /> Buy It Now
              </button>

              {/* PayPal quick checkout */}
              {!isPreview && (
                <button
                  onClick={() => window.location.href = '/checkout?method=paypal'}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-[#FFC439] hover:bg-[#F0B429] transition-colors"
                >
                  <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-5" />
                  <span className="font-bold text-[#003087]">Pay with PayPal</span>
                </button>
              )}
            </div>

            {/* Guarantees */}
            <div className="mt-6 space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>45-Day Satisfaction Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Secured Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Live countdown timer component
function CountdownTimer() {
  const [time, setTime] = React.useState({ h: 11, m: 59, s: 59 });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="mt-2 flex gap-3 text-2xl font-bold text-red-600">
      <div className="text-center"><div>{pad(time.h)}</div><div className="text-xs font-normal text-red-500">hrs</div></div>
      <span>:</span>
      <div className="text-center"><div>{pad(time.m)}</div><div className="text-xs font-normal text-red-500">min</div></div>
      <span>:</span>
      <div className="text-center"><div>{pad(time.s)}</div><div className="text-xs font-normal text-red-500">sec</div></div>
    </div>
  );
}
