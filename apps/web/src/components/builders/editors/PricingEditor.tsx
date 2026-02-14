'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function PricingEditor({ config, onChange }: SectionEditorProps) {
  const update = (field: string, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">
          Content
        </h3>
        <div className="space-y-3">
          <Input
            label="Section Title"
            placeholder="Get It Now"
            value={(config.title as string) || ''}
            onChange={(e) => update('title', e.target.value)}
          />
          <Input
            label="Highlight Text (optional)"
            placeholder="Limited Time Offer"
            value={(config.highlightText as string) || ''}
            onChange={(e) => update('highlightText', e.target.value)}
            hint="Shown as a badge or banner above pricing"
          />
          <Input
            label="CTA Button Text"
            placeholder="Add to Cart"
            value={(config.ctaText as string) || ''}
            onChange={(e) => update('ctaText', e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">
          Display Options
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={(config.showComparePrice as boolean) ?? true}
              onChange={(e) => update('showComparePrice', e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-surface-700">Show compare-at price</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={(config.showDiscount as boolean) ?? true}
              onChange={(e) => update('showDiscount', e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-surface-700">Show discount percentage</span>
          </label>
        </div>
      </div>
    </div>
  );
}
