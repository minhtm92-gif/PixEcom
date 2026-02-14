'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

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

const COLUMN_OPTIONS = [
  { value: '2', label: '2 Columns' },
  { value: '3', label: '3 Columns' },
  { value: '4', label: '4 Columns' },
];

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function FeaturesEditor({ config, onChange }: SectionEditorProps) {
  const features = (config.features as FeatureItem[]) || [];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const update = (field: string, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    update('features', newFeatures);
  };

  const addFeature = () => {
    const newFeatures = [...features, { icon: 'star', title: '', description: '' }];
    update('features', newFeatures);
    setExpandedIndex(newFeatures.length - 1);
  };

  const removeFeature = (index: number) => {
    update('features', features.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === features.length - 1)
    ) return;
    const newFeatures = [...features];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newFeatures[index], newFeatures[swapIndex]] = [newFeatures[swapIndex], newFeatures[index]];
    update('features', newFeatures);
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
            placeholder="Why Choose Us"
            value={(config.title as string) || ''}
            onChange={(e) => update('title', e.target.value)}
          />
          <Select
            label="Grid Columns"
            options={COLUMN_OPTIONS}
            value={String((config.columns as number) || 3)}
            onChange={(e) => update('columns', Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide">
            Features ({features.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={addFeature}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add
          </Button>
        </div>

        {features.length === 0 && (
          <p className="text-sm text-surface-400 text-center py-4 border border-dashed border-surface-300 rounded-lg">
            No features yet. Click &quot;Add&quot; to create one.
          </p>
        )}

        <div className="space-y-2">
          {features.map((feature, index) => (
            <Card key={index} padding="none" className="overflow-hidden">
              <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-surface-50 transition-colors"
                onClick={() => toggleExpand(index)}
              >
                <button
                  type="button"
                  className="cursor-grab text-surface-400 hover:text-surface-600"
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={() => moveFeature(index, 'up')}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <span className="flex-1 text-sm font-medium text-surface-700 truncate">
                  {feature.title || `Feature ${index + 1}`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveFeature(index, 'up'); }}
                    disabled={index === 0}
                    className="p-0.5 text-surface-400 hover:text-surface-600 disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveFeature(index, 'down'); }}
                    disabled={index === features.length - 1}
                    className="p-0.5 text-surface-400 hover:text-surface-600 disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFeature(index); }}
                    className="p-0.5 text-surface-400 hover:text-red-500 transition-colors"
                    title="Remove feature"
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
                    value={feature.icon || 'star'}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                  />
                  <Input
                    label="Title"
                    placeholder="Feature title"
                    value={feature.title || ''}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  />
                  <Textarea
                    label="Description"
                    placeholder="Describe this feature..."
                    value={feature.description || ''}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
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
