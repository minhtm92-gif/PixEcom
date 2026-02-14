'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function FaqEditor({ config, onChange }: SectionEditorProps) {
  const items = (config.items as FaqItem[]) || [];

  const update = (field: string, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const updateItem = (index: number, field: keyof FaqItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    update('items', newItems);
  };

  const addItem = () => {
    update('items', [...items, { question: '', answer: '' }]);
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
          Settings
        </h3>
        <div className="space-y-3">
          <Input
            label="Section Title"
            placeholder="Frequently Asked Questions"
            value={(config.title as string) || ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide">
            Questions ({items.length})
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
            No questions yet. Click &quot;Add&quot; to create one.
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <Card key={index} padding="sm">
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
                  <Input
                    label="Question"
                    placeholder="What is your return policy?"
                    value={item.question || ''}
                    onChange={(e) => updateItem(index, 'question', e.target.value)}
                  />
                  <Textarea
                    label="Answer"
                    placeholder="We offer a 30-day money-back guarantee..."
                    value={item.answer || ''}
                    onChange={(e) => updateItem(index, 'answer', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-0.5 text-surface-400 hover:text-surface-600 disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-0.5 text-surface-400 hover:text-surface-600 disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-0.5 text-surface-400 hover:text-red-500 transition-colors"
                    title="Remove question"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
