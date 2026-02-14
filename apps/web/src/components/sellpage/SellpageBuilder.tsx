'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SectionData, SectionRenderer } from './SectionRenderer';

interface SellpageBuilderProps {
  initialSections?: SectionData[];
  product: any;
  reviews?: any[];
  onChange: (sections: SectionData[]) => void;
}

const SECTION_TEMPLATES = [
  {
    type: 'announcement-bar',
    label: 'Announcement Bar',
    defaultData: {
      type: 'announcement-bar',
      text: '🎉 Limited Time Offer - Free Shipping on Orders Over $50!',
      backgroundColor: '#95be61',
      textColor: '#ffffff',
    },
  },
  {
    type: 'product-hero',
    label: 'Product Hero',
    defaultData: {
      type: 'product-hero',
      price: 0,
      images: [],
      showClearanceBadge: true,
      showCountdownTimer: true,
      tieredDiscountText: 'ADD 2 ITEMS TO CART TO GET 71% OFF',
    },
  },
  {
    type: 'social-proof',
    label: 'Social Proof Counter',
    defaultData: {
      type: 'social-proof',
      viewerCount: 210,
      purchaseCount: 2346,
      showLiveCounter: true,
    },
  },
  {
    type: 'product-benefits',
    label: 'Product Benefits',
    defaultData: {
      type: 'product-benefits',
      title: 'Why Choose Our Product?',
      benefits: [
        {
          icon: '🔒',
          title: 'Secure & Durable',
          description: 'Premium materials built to last',
        },
        {
          icon: '✨',
          title: 'Handcrafted Quality',
          description: 'Made with attention to detail',
        },
        {
          icon: '🌟',
          title: 'Perfect Gift',
          description: 'Loved by thousands of customers',
        },
      ],
      backgroundColor: '#f7f7f7',
    },
  },
  {
    type: 'reviews-section',
    label: 'Customer Reviews',
    defaultData: {
      type: 'reviews-section',
      title: 'Customer Reviews',
      showRatingDistribution: true,
    },
  },
  {
    type: 'product-description',
    label: 'Product Description',
    defaultData: {
      type: 'product-description',
      title: 'Product Details',
      showTitle: true,
      backgroundColor: '#ffffff',
      maxWidth: 'lg',
    },
  },
];

export function SellpageBuilder({ initialSections = [], product, reviews = [], onChange }: SellpageBuilderProps) {
  const [sections, setSections] = useState<SectionData[]>(initialSections);
  const [showPreview, setShowPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const updateSections = (newSections: SectionData[]) => {
    setSections(newSections);
    onChange(newSections);
  };

  const addSection = (template: any) => {
    updateSections([...sections, template.defaultData]);
  };

  const removeSection = (index: number) => {
    updateSections(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    updateSections(newSections);
  };

  const updateSection = (index: number, data: SectionData) => {
    const newSections = [...sections];
    newSections[index] = data;
    updateSections(newSections);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Page Builder</h2>
        <Button
          variant={showPreview ? 'primary' : 'secondary'}
          leftIcon={<Eye className="h-4 w-4" />}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      {/* Preview Mode */}
      {showPreview ? (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
            <p className="text-sm text-gray-600">Preview Mode</p>
          </div>
          <SectionRenderer sections={sections} product={product} reviews={reviews} isPreview={true} />
        </div>
      ) : (
        <>
          {/* Sections List */}
          <div className="space-y-4">
            {sections.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No sections added yet. Add a section to get started.</p>
                </CardContent>
              </Card>
            ) : (
              sections.map((section, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      {SECTION_TEMPLATES.find((t) => t.type === section.type)?.label || section.type}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sections.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeSection(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SectionEditor
                      section={section}
                      onChange={(data) => updateSection(index, data)}
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Add Section Menu */}
          <Card>
            <CardHeader>
              <CardTitle>Add Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {SECTION_TEMPLATES.map((template) => (
                  <Button
                    key={template.type}
                    variant="outline"
                    onClick={() => addSection(template)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    {template.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Section Editor Component
function SectionEditor({ section, onChange }: { section: SectionData; onChange: (data: SectionData) => void }) {
  switch (section.type) {
    case 'announcement-bar':
      return (
        <div className="space-y-3">
          <Input
            label="Text"
            value={section.text}
            onChange={(e) => onChange({ ...section, text: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Background Color"
              type="color"
              value={section.backgroundColor || '#95be61'}
              onChange={(e) => onChange({ ...section, backgroundColor: e.target.value })}
            />
            <Input
              label="Text Color"
              type="color"
              value={section.textColor || '#ffffff'}
              onChange={(e) => onChange({ ...section, textColor: e.target.value })}
            />
          </div>
          <Input
            label="Link Text (optional)"
            value={section.linkText || ''}
            onChange={(e) => onChange({ ...section, linkText: e.target.value })}
          />
          <Input
            label="Link URL (optional)"
            value={section.linkUrl || ''}
            onChange={(e) => onChange({ ...section, linkUrl: e.target.value })}
          />
        </div>
      );

    case 'product-hero':
      return (
        <div className="space-y-3">
          <Input
            label="Custom Title (optional)"
            value={section.title || ''}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
            hint="Leave empty to use product name"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price"
              type="number"
              step="0.01"
              value={section.price}
              onChange={(e) => onChange({ ...section, price: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Compare At Price"
              type="number"
              step="0.01"
              value={section.compareAtPrice || ''}
              onChange={(e) => onChange({ ...section, compareAtPrice: parseFloat(e.target.value) || undefined })}
            />
          </div>
          <Input
            label="Tiered Discount Text"
            value={section.tieredDiscountText || ''}
            onChange={(e) => onChange({ ...section, tieredDiscountText: e.target.value })}
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={section.showClearanceBadge || false}
                onChange={(e) => onChange({ ...section, showClearanceBadge: e.target.checked })}
              />
              <span className="text-sm">Show Clearance Badge</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={section.showCountdownTimer || false}
                onChange={(e) => onChange({ ...section, showCountdownTimer: e.target.checked })}
              />
              <span className="text-sm">Show Countdown Timer</span>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-3 mt-3">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={section.showSocialProof || false}
                onChange={(e) => onChange({ ...section, showSocialProof: e.target.checked })}
              />
              <span className="text-sm font-medium">Enable Social Proof Counters</span>
            </label>

            {section.showSocialProof && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div>
                  <label className="block text-sm mb-1">Viewer Count</label>
                  <input
                    type="number"
                    min="0"
                    value={section.viewerCount || 0}
                    onChange={(e) => onChange({ ...section, viewerCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Purchase Count</label>
                  <input
                    type="number"
                    min="0"
                    value={section.purchaseCount || 0}
                    onChange={(e) => onChange({ ...section, purchaseCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case 'social-proof':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Viewer Count"
              type="number"
              value={section.viewerCount || 0}
              onChange={(e) => onChange({ ...section, viewerCount: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Purchase Count"
              type="number"
              value={section.purchaseCount || 0}
              onChange={(e) => onChange({ ...section, purchaseCount: parseInt(e.target.value) || 0 })}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={section.showLiveCounter || false}
              onChange={(e) => onChange({ ...section, showLiveCounter: e.target.checked })}
            />
            <span className="text-sm">Show Live Counter</span>
          </label>
        </div>
      );

    case 'product-benefits':
      return (
        <div className="space-y-3">
          <Input
            label="Section Title"
            value={section.title || ''}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
          />
          <Input
            label="Background Color"
            type="color"
            value={section.backgroundColor || '#f7f7f7'}
            onChange={(e) => onChange({ ...section, backgroundColor: e.target.value })}
          />
          <p className="text-sm text-gray-600">
            Benefits: {section.benefits.length} items (edit benefits in advanced mode)
          </p>
        </div>
      );

    case 'reviews-section':
      return (
        <div className="space-y-3">
          <Input
            label="Section Title"
            value={section.title || 'Customer Reviews'}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={section.showRatingDistribution || false}
              onChange={(e) => onChange({ ...section, showRatingDistribution: e.target.checked })}
            />
            <span className="text-sm">Show Rating Distribution</span>
          </label>
        </div>
      );

    case 'product-description':
      return (
        <div className="space-y-3">
          <Input
            label="Section Title"
            value={section.title || 'Product Details'}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={section.showTitle !== false}
              onChange={(e) => onChange({ ...section, showTitle: e.target.checked })}
            />
            <span className="text-sm">Show Section Title</span>
          </label>
          <div>
            <label className="block text-sm mb-1">Content Width</label>
            <select
              value={section.maxWidth || 'lg'}
              onChange={(e) => onChange({ ...section, maxWidth: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
            value={section.backgroundColor || '#ffffff'}
            onChange={(e) => onChange({ ...section, backgroundColor: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-2">
            This section displays the product description from product settings. Edit the description in Products → Edit Product.
          </p>
        </div>
      );

    default:
      return <p className="text-sm text-gray-500">No editor available for this section type.</p>;
  }
}
