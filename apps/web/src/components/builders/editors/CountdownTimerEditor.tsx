'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function CountdownTimerEditor({ config, onChange }: SectionEditorProps) {
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
            label="Title (optional)"
            placeholder="Offer Ends In"
            value={(config.title as string) || ''}
            onChange={(e) => update('title', e.target.value)}
            hint="Text displayed above the countdown timer"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-700">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={(config.endDate as string) || ''}
              onChange={(e) => update('endDate', e.target.value)}
              className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="mt-1.5 text-sm text-surface-500">
              When the countdown should reach zero
            </p>
          </div>
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
                value={(config.backgroundColor as string) || '#dc2626'}
                onChange={(e) => update('backgroundColor', e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-surface-300"
              />
              <Input
                placeholder="#dc2626"
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
    </div>
  );
}
