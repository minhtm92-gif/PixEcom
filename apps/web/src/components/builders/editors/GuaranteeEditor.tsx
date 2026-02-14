'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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

interface GuaranteeItem {
  icon: string;
  title: string;
  description: string;
}

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function GuaranteeEditor({ config, onChange }: SectionEditorProps) {
  const items = (config.items as GuaranteeItem[]) || [];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const update = (field: string, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const updateItem = (index: number, field: keyof GuaranteeItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    update('items', newItems);
  };

  const addItem = () => {
    const newItems = [...items, { icon: 'shield', title: '', description: '' }];
    update('items', newItems);
    setExpandedIndex(newItems.length - 1);
  };

  const removeItem = (index: number) => {
    update('items', items.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
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
    setExpandedIndex(swapIndex);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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
            placeholder="Our Guarantees"
            value={(config.title as string) || ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide">
            Guarantee Items ({items.length})
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
            No guarantee items yet. Click &quot;Add&quot; to create one.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <Card key={index} padding="none" className="overflow-hidden">
              <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-surface-50 transition-colors"
                onClick={() => toggleExpand(index)}
              >
                <span className="flex-1 text-sm font-medium text-surface-700 truncate">
                  {item.title || `Item ${index + 1}`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}
                    disabled={index === 0}
                    className="p-0.5 text-surface-400 hover:text-surface-600 disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}
                    disabled={index === items.length - 1}
                    className="p-0.5 text-surface-400 hover:text-surface-600 disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                    className="p-0.5 text-surface-400 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {expandedIndex === index && (
                <div className="border-t border-surface-200 px-3 py-3 space-y-2">
                  <Select
                    label="Icon"
                    options={ICON_OPTIONS}
                    value={item.icon || 'shield'}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  />
                  <Input
                    label="Title"
                    placeholder="30-Day Money Back"
                    value={item.title || ''}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                  />
                  <Textarea
                    label="Description"
                    placeholder="Full refund, no questions asked."
                    value={item.description || ''}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
