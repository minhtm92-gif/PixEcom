'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

const RATING_OPTIONS = [
  { value: '1', label: '1 Star' },
  { value: '2', label: '2 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '5', label: '5 Stars' },
];

interface ReviewItem {
  name: string;
  rating: number;
  text: string;
  verified: boolean;
}

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function ReviewsEditor({ config, onChange }: SectionEditorProps) {
  const reviews = (config.reviews as ReviewItem[]) || [];

  const update = (field: string, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const updateReview = (index: number, field: keyof ReviewItem, value: unknown) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    update('reviews', newReviews);
  };

  const addReview = () => {
    update('reviews', [...reviews, { name: '', rating: 5, text: '', verified: true }]);
  };

  const removeReview = (index: number) => {
    update('reviews', reviews.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">
          Overview
        </h3>
        <div className="space-y-3">
          <Input
            label="Section Title"
            placeholder="Customer Reviews"
            value={(config.title as string) || ''}
            onChange={(e) => update('title', e.target.value)}
          />
          <Input
            label="Average Rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            placeholder="4.8"
            value={(config.averageRating as number) ?? ''}
            onChange={(e) => update('averageRating', parseFloat(e.target.value) || 0)}
            hint="Value between 0 and 5"
          />
          <Input
            label="Total Review Count"
            type="number"
            min={0}
            placeholder="1250"
            value={(config.reviewCount as number) ?? ''}
            onChange={(e) => update('reviewCount', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide">
            Reviews ({reviews.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={addReview}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add
          </Button>
        </div>

        {reviews.length === 0 && (
          <p className="text-sm text-surface-400 text-center py-4 border border-dashed border-surface-300 rounded-lg">
            No reviews yet. Click &quot;Add&quot; to create one.
          </p>
        )}

        <div className="space-y-2">
          {reviews.map((review, index) => (
            <Card key={index} padding="sm">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-surface-500">
                  Review {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeReview(index)}
                  className="p-0.5 text-surface-400 hover:text-red-500 transition-colors"
                  title="Remove review"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                <Input
                  label="Reviewer Name"
                  placeholder="Jane S."
                  value={review.name || ''}
                  onChange={(e) => updateReview(index, 'name', e.target.value)}
                />
                <Select
                  label="Rating"
                  options={RATING_OPTIONS}
                  value={String(review.rating || 5)}
                  onChange={(e) => updateReview(index, 'rating', parseInt(e.target.value))}
                />
                <Textarea
                  label="Review Text"
                  placeholder="What did they say about your product?"
                  value={review.text || ''}
                  onChange={(e) => updateReview(index, 'text', e.target.value)}
                  rows={2}
                />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={review.verified ?? true}
                    onChange={(e) => updateReview(index, 'verified', e.target.checked)}
                    className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-surface-700">Verified purchase</span>
                </label>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
