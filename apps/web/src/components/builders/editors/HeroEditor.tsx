'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function HeroEditor({ config, onChange }: SectionEditorProps) {
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
            label="Headline"
            placeholder="Your amazing product headline"
            value={(config.headline as string) || ''}
            onChange={(e) => update('headline', e.target.value)}
          />
          <Textarea
            label="Sub-headline"
            placeholder="A compelling description that supports your headline..."
            value={(config.subheadline as string) || ''}
            onChange={(e) => update('subheadline', e.target.value)}
            rows={3}
          />
          <Input
            label="Badge Text (optional)"
            placeholder="Best Seller"
            value={(config.badgeText as string) || ''}
            onChange={(e) => update('badgeText', e.target.value)}
            hint="Small label shown above the headline"
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
              checked={(config.showPrice as boolean) ?? true}
              onChange={(e) => update('showPrice', e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-surface-700">Show product price</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={(config.showComparePrice as boolean) ?? false}
              onChange={(e) => update('showComparePrice', e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-surface-700">Show compare-at price</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">
          Background
        </h3>
        <div className="space-y-3">
          <Input
            label="Background Image URL (optional)"
            placeholder="https://example.com/hero-bg.jpg"
            value={(config.backgroundImage as string) || ''}
            onChange={(e) => update('backgroundImage', e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">
          Call to Action
        </h3>
        <div className="space-y-3">
          <Input
            label="CTA Button Text (optional)"
            placeholder="Buy Now"
            value={(config.ctaText as string) || ''}
            onChange={(e) => update('ctaText', e.target.value)}
          />
          <Input
            label="CTA Link URL (optional)"
            placeholder="https://example.com/product"
            value={(config.ctaUrl as string) || ''}
            onChange={(e) => update('ctaUrl', e.target.value)}
            hint="For homepage heroes — links to product page"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">
          Social Proof
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={(config.showSocialProof as boolean) ?? false}
              onChange={(e) => update('showSocialProof', e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-surface-700">Show social proof counters</span>
          </label>

          {(config.showSocialProof as boolean) && (
            <>
              <Input
                label="Viewer Count"
                type="number"
                min={0}
                placeholder="210"
                value={(config.viewerCount as number) ?? ''}
                onChange={(e) => update('viewerCount', parseInt(e.target.value) || 0)}
                hint="Number of people currently viewing"
              />
              <Input
                label="Purchase Count"
                type="number"
                min={0}
                placeholder="2346"
                value={(config.purchaseCount as number) ?? ''}
                onChange={(e) => update('purchaseCount', parseInt(e.target.value) || 0)}
                hint="Total number of purchases"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
