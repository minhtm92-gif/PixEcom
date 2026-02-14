'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function FeaturedProductEditor({ config, onChange }: SectionEditorProps) {
  const update = (field: string, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">
          Settings
        </h3>
        <div className="space-y-3">
          <Input
            label="Section Title"
            placeholder="Featured Products"
            value={(config.title as string) || ''}
            onChange={(e) => update('title', e.target.value)}
          />
          <Input
            label="Max Products"
            type="number"
            min={1}
            max={20}
            placeholder="4"
            value={(config.maxProducts as number) ?? ''}
            onChange={(e) => update('maxProducts', parseInt(e.target.value) || 1)}
            hint="Maximum number of products to display"
          />
        </div>
      </div>
    </div>
  );
}
