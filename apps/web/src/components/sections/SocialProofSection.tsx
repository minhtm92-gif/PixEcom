'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Star, CheckCircle, User } from 'lucide-react';
import type { SectionPreviewProps } from './types';

interface ReviewItem {
  name: string;
  rating: number;
  text: string;
  verified?: boolean;
  avatar?: string;
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : star - 0.5 <= rating
              ? 'fill-amber-400/50 text-amber-400'
              : 'fill-surface-200 text-surface-200'
          )}
        />
      ))}
    </div>
  );
}

function AvatarCircle({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
      />
    );
  }

  const colors = [
    'bg-brand-100 text-brand-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-violet-100 text-violet-700',
    'bg-cyan-100 text-cyan-700',
  ];
  const colorIndex =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;

  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ring-2 ring-white',
        colors[colorIndex]
      )}
    >
      {initials}
    </div>
  );
}

export function SocialProofSection({ config }: SectionPreviewProps) {
  const title = (config.title as string) || 'What Our Customers Say';
  const averageRating = (config.averageRating as number) || 4.8;
  const reviewCount = (config.reviewCount as number) || 0;
  const reviews = (config.reviews as ReviewItem[]) || [];

  const displayReviewCount = reviewCount || reviews.length;

  return (
    <section className="w-full bg-surface-50 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-surface-900 mb-4 leading-tight">
            {title}
          </h2>

          {/* Average rating summary */}
          {displayReviewCount > 0 && (
            <div className="flex items-center justify-center gap-3">
              <StarRating rating={averageRating} size="lg" />
              <span className="text-lg font-semibold text-surface-900">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-surface-500">
                ({displayReviewCount.toLocaleString()} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Reviews grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className={cn(
                  'rounded-2xl border border-surface-200 bg-white p-6',
                  'shadow-card transition-all duration-300',
                  'hover:shadow-card-hover hover:-translate-y-0.5'
                )}
              >
                {/* Stars */}
                <div className="mb-4">
                  <StarRating rating={review.rating} />
                </div>

                {/* Review text */}
                <p className="mb-5 text-sm leading-relaxed text-surface-700">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Reviewer info */}
                <div className="flex items-center gap-3 border-t border-surface-100 pt-4">
                  <AvatarCircle name={review.name} avatar={review.avatar} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-surface-900 truncate">
                        {review.name}
                      </span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="rounded-2xl border-2 border-dashed border-surface-300 bg-white p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="h-4 w-4 rounded bg-surface-200" />
                  ))}
                </div>
                <div className="space-y-2 mb-5">
                  <div className="h-4 w-full rounded bg-surface-100" />
                  <div className="h-4 w-3/4 rounded bg-surface-100" />
                </div>
                <div className="flex items-center gap-3 border-t border-surface-100 pt-4">
                  <div className="h-10 w-10 rounded-full bg-surface-200" />
                  <div className="h-4 w-24 rounded bg-surface-200" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export { StarRating, AvatarCircle };
