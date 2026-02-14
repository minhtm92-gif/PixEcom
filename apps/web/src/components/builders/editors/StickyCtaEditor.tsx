'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function StickyCtaEditor({ config, onChange }: SectionEditorProps) {
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
            label="Button Text"
            placeholder="Buy Now"
            value={(config.text as string) || ''}
            onChange={(e) => update('text', e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">
          Colors
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(config.backgroundColor as string) || '#16a34a'}
                onChange={(e) => update('backgroundColor', e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-surface-300"
              />
              <Input
                placeholder="#16a34a"
                value={(config.backgroundColor as string) || ''}
                onChange={(e) => update('backgroundColor', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(config.textColor as string) || '#ffffff'}
                onChange={(e) => update('textColor', e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-surface-300"
              />
              <Input
                placeholder="#ffffff"
                value={(config.textColor as string) || ''}
                onChange={(e) => update('textColor', e.target.value)}
              />
            </div>
          </div>
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
            <span className="text-sm text-surface-700">Show price on button</span>
          </label>
        </div>
      </div>
    </div>
  );
}
