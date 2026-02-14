'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ReviewsSectionData {
  type: 'reviews-section';
  title?: string;
  showRatingDistribution?: boolean;
}

interface ReviewsSectionProps {
  data: ReviewsSectionData;
  reviews: Array<{
    id: string;
    authorName: string;
    avatarUrl?: string;
    rating: number;
    body: string;
    createdAt: string;
  }>;
  isPreview?: boolean;
}

export function ReviewsSection({ data, reviews, isPreview = false }: ReviewsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {data.title || 'Customer Reviews'}
          </h2>

          {/* Average Rating */}
          {reviews.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {avgRating.toFixed(1)} out of 5
              </span>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {displayedReviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {review.avatarUrl ? (
                    <img
                      src={review.avatarUrl}
                      alt={review.authorName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* Name & Date */}
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{review.authorName}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="mb-2 flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Body */}
                  <p className="text-gray-700">{review.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {reviews.length > 3 && (
          <div className="mt-8 text-center">
            <Button
              variant="secondary"
              onClick={() => setShowAll(!showAll)}
              disabled={isPreview}
            >
              {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {reviews.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}
