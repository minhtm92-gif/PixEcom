'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface FooterLink {
  label: string;
  url: string;
}

interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function FooterEditor({ config, onChange }: SectionEditorProps) {
  const links = (config.links as FooterLink[]) || [];

  const update = (field: string, value: unknown) => {
    onChange({ ...config, [field]: value });
  };

  const updateLink = (index: number, field: keyof FooterLink, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    update('links', newLinks);
  };

  const addLink = () => {
    update('links', [...links, { label: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    update('links', links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">
          Content
        </h3>
        <div className="space-y-3">
          <Input
            label="Copyright Text"
            placeholder="&copy; 2024 Your Store. All rights reserved."
            value={(config.copyright as string) || ''}
            onChange={(e) => update('copyright', e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide">
            Footer Links ({links.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={addLink}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add
          </Button>
        </div>

        {links.length === 0 && (
          <p className="text-sm text-surface-400 text-center py-4 border border-dashed border-surface-300 rounded-lg">
            No footer links yet. Click &quot;Add&quot; to create one.
          </p>
        )}

        <div className="space-y-2">
          {links.map((link, index) => (
            <Card key={index} padding="sm">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    label="Label"
                    placeholder="Privacy Policy"
                    value={link.label || ''}
                    onChange={(e) => updateLink(index, 'label', e.target.value)}
                  />
                  <Input
                    label="URL"
                    placeholder="https://example.com/privacy"
                    value={link.url || ''}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="mt-1 p-1 text-surface-400 hover:text-red-500 transition-colors"
                  title="Remove link"
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
