'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SELLPAGE_TEMPLATES, SellpageTemplate } from '@/lib/templates';
import { Check, Crown, TrendingUp, Search } from 'lucide-react';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: SellpageTemplate) => void;
}

export function TemplateSelectorModal({
  isOpen,
  onClose,
  onSelect,
}: TemplateSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'digital', label: 'Digital Products' },
    { id: 'service', label: 'Services' },
    { id: 'minimal', label: 'Minimal' },
  ];

  const filteredTemplates = SELLPAGE_TEMPLATES.filter((template) => {
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplyTemplate = () => {
    const template = SELLPAGE_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (template) {
      onSelect(template);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose a Template"
      size="xl"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 pl-10 pr-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="max-h-[500px] overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-surface-500 dark:text-surface-400">
                No templates found matching your criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                    selectedTemplate === template.id
                      ? 'border-brand-600 ring-2 ring-brand-500/20'
                      : 'border-surface-200 dark:border-surface-700 hover:border-brand-400'
                  }`}
                >
                  {/* Selected Checkmark */}
                  {selectedTemplate === template.id && (
                    <div className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute left-2 top-2 z-10 flex gap-1">
                    {template.isPopular && (
                      <Badge
                        variant="success"
                        className="flex items-center gap-1"
                      >
                        <TrendingUp className="h-3 w-3" />
                        Popular
                      </Badge>
                    )}
                    {template.isPremium && (
                      <Badge
                        variant="warning"
                        className="flex items-center gap-1"
                      >
                        <Crown className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="aspect-[4/3] overflow-hidden bg-surface-100 dark:bg-surface-800">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3 text-left">
                    <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                      {template.name}
                    </h3>
                    <p className="mt-1 text-xs text-surface-600 dark:text-surface-400">
                      {template.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                      <span>{template.sections.length} sections</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-surface-200 dark:border-surface-700 pt-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            {selectedTemplate
              ? `Selected: ${SELLPAGE_TEMPLATES.find((t) => t.id === selectedTemplate)?.name}`
              : 'Select a template to continue'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate}
            >
              Apply Template
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
