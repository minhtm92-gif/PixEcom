'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/cn';
import { getSectionMetaForTypes, type SectionMeta } from './section-meta';
import { sectionDefaults } from './section-defaults';
import { useBuilderStore } from '@/stores/builder-store';
import {
  Layout,
  AlertCircle,
  Lightbulb,
  Grid,
  Users,
  Tag,
  HelpCircle,
  ArrowUp,
  Clock,
  ShoppingBag,
  Star,
  ShieldCheck,
  Layers,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Icon resolver for section meta icons
// ---------------------------------------------------------------------------
const sectionIconMap: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  layout: Layout,
  'alert-circle': AlertCircle,
  lightbulb: Lightbulb,
  grid: Grid,
  users: Users,
  tag: Tag,
  'help-circle': HelpCircle,
  'arrow-up': ArrowUp,
  clock: Clock,
  'shopping-bag': ShoppingBag,
  star: Star,
  'shield-check': ShieldCheck,
  layers: Layers,
};

function resolveSectionIcon(iconName: string): LucideIcon {
  return sectionIconMap[iconName] ?? Layout;
}

// ---------------------------------------------------------------------------
// AddSectionModal
// ---------------------------------------------------------------------------
export interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTypes: string[];
}

export function AddSectionModal({ isOpen, onClose, availableTypes }: AddSectionModalProps) {
  const addSection = useBuilderStore((s) => s.addSection);
  const metaList = getSectionMetaForTypes(availableTypes);

  const handleAdd = (meta: SectionMeta) => {
    const defaults = sectionDefaults[meta.type] ?? {};
    addSection(meta.type, defaults);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Section"
      description="Choose a section type to add to your page."
      size="lg"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metaList.map((meta) => {
          const Icon = resolveSectionIcon(meta.icon);
          return (
            <button
              key={meta.type}
              type="button"
              onClick={() => handleAdd(meta)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border border-surface-200 bg-white p-4',
                'text-center transition-all hover:border-brand-400 hover:shadow-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-surface-800">{meta.label}</span>
              <span className="text-xs text-surface-500 line-clamp-2">{meta.description}</span>
            </button>
          );
        })}

        {metaList.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-surface-400">
            No section types available.
          </div>
        )}
      </div>
    </Modal>
  );
}
