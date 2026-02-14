'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function ProductDescriptionEditor({ config, onChange }: SectionEditorProps) {
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
            placeholder="Product Details"
            value={(config.title as string) || ''}
            onChange={(e) => update('title', e.target.value)}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={(config.showTitle as boolean) ?? true}
              onChange={(e) => update('showTitle', e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-surface-700">Show section title</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">
          Layout
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Content Width</label>
            <select
              value={(config.maxWidth as string) || 'lg'}
              onChange={(e) => update('maxWidth', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="sm">Small (768px)</option>
              <option value="md">Medium (1024px)</option>
              <option value="lg">Large (1280px)</option>
              <option value="xl">Extra Large (1536px)</option>
            </select>
          </div>
          <Input
            label="Background Color"
            type="color"
            value={(config.backgroundColor as string) || '#ffffff'}
            onChange={(e) => update('backgroundColor', e.target.value)}
          />
        </div>
      </div>

      <div className="p-3 bg-surface-100 rounded-lg border border-surface-200">
        <p className="text-xs text-surface-600">
          <strong>Note:</strong> This section displays the product description from product settings.
          Edit the description in Products → Edit Product.
        </p>
      </div>
    </div>
  );
}
