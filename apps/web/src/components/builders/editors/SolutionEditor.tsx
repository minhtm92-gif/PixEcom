'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'zap', label: 'Zap' },
  { value: 'droplet', label: 'Droplet' },
  { value: 'sun', label: 'Sun' },
  { value: 'shield', label: 'Shield' },
  { value: 'truck', label: 'Truck' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'star', label: 'Star' },
  { value: 'heart', label: 'Heart' },
  { value: 'check', label: 'Check' },
  { value: 'clock', label: 'Clock' },
  { value: 'award', label: 'Award' },
  { value: 'gift', label: 'Gift' },
  { value: 'lock', label: 'Lock' },
  { value: 'globe', label: 'Globe' },
  { value: 'target', label: 'Target' },
  { value: 'thumbs-up', label: 'Thumbs Up' },
  { value: 'package', label: 'Package' },
  { value: 'phone', label: 'Phone' },
  { value: 'mail', label: 'Mail' },
  { value: 'message-circle', label: 'Message Circle' },
];

interface SolutionItem {
  icon: string;
  text: string;
}

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function SolutionEditor({ config, onChange }: SectionEditorProps) {
  const items = (config.items as SolutionItem[]) || [];

  const update = (field: string, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const updateItem = (index: number, field: keyof SolutionItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    update('items', newItems);
  };

  const addItem = () => {
    update('items', [...items, { icon: 'check', text: '' }]);
  };

  const removeItem = (index: number) => {
    update('items', items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) return;
    const newItems = [...items];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    update('items', newItems);
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
            placeholder="The Solution"
            value={(config.title as string) || ''}
            onChange={(e) => update('title', e.target.value)}
          />
          <Textarea
            label="Description"
            placeholder="Describe how your product solves the problem..."
            value={(config.description as string) || ''}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
          />
          <Input
            label="Image URL (optional)"
            placeholder="https://example.com/solution-image.jpg"
            value={(config.imageUrl as string) || ''}
            onChange={(e) => update('imageUrl', e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide">
            Solution Points
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={addItem}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add
          </Button>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-surface-400 text-center py-4 border border-dashed border-surface-300 rounded-lg">
            No solution points yet. Click &quot;Add&quot; to create one.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <Card key={index} padding="sm" className="relative">
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="mt-1 cursor-grab text-surface-400 hover:text-surface-600"
                  title="Drag to reorder"
                  onClick={() => {}}
                  onDoubleClick={() => moveItem(index, 'up')}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <div className="flex-1 space-y-2">
                  <Select
                    label="Icon"
                    options={ICON_OPTIONS}
                    value={item.icon || 'check'}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                  <Input
                    label="Text"
                    placeholder="Describe this solution point..."
                    value={item.text || ''}
                    onChange={(e) => updateItem(index, 'text', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mt-1 p-1 text-surface-400 hover:text-red-500 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
