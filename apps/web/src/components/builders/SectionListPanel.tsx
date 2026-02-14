'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { useBuilderStore, type SectionConfig } from '@/stores/builder-store';
import { getSectionMeta } from './section-meta';
import { AddSectionModal } from './AddSectionModal';
import {
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
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
// Icon resolver
// ---------------------------------------------------------------------------
const typeIconMap: Record<string, LucideIcon> = {
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

function resolveIcon(iconName: string): LucideIcon {
  return typeIconMap[iconName] ?? Layout;
}

// ---------------------------------------------------------------------------
// SectionListPanel
// ---------------------------------------------------------------------------
export interface SectionListPanelProps {
  sectionTypes: string[];
}

export function SectionListPanel({ sectionTypes }: SectionListPanelProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  const sections = useBuilderStore((s) => s.sections);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const removeSection = useBuilderStore((s) => s.removeSection);
  const toggleSectionVisibility = useBuilderStore((s) => s.toggleSectionVisibility);
  const moveSection = useBuilderStore((s) => s.moveSection);
  const duplicateSection = useBuilderStore((s) => s.duplicateSection);

  const sorted = [...sections].sort((a, b) => a.position - b.position);

  return (
    <>
      <div className="flex h-full flex-col bg-surface-50 border-r border-surface-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-surface-800">Sections</h2>
          <span className="text-xs text-surface-400">{sorted.length}</span>
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {sorted.map((section, index) => (
            <SectionListItem
              key={section.id}
              section={section}
              index={index}
              total={sorted.length}
              isSelected={selectedSectionId === section.id}
              onSelect={() => selectSection(section.id)}
              onRemove={() => removeSection(section.id)}
              onToggleVisibility={() => toggleSectionVisibility(section.id)}
              onMoveUp={() => moveSection(index, index - 1)}
              onMoveDown={() => moveSection(index, index + 1)}
              onDuplicate={() => duplicateSection(section.id)}
            />
          ))}

          {sorted.length === 0 && (
            <div className="py-8 text-center text-xs text-surface-400">
              No sections yet.
              <br />
              Click the button below to add one.
            </div>
          )}
        </div>

        {/* Add section button */}
        <div className="border-t border-surface-200 p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setAddModalOpen(true)}
          >
            Add Section
          </Button>
        </div>
      </div>

      <AddSectionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        availableTypes={sectionTypes}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Single section list item
// ---------------------------------------------------------------------------
interface SectionListItemProps {
  section: SectionConfig;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

function SectionListItem({
  section,
  index,
  total,
  isSelected,
  onSelect,
  onRemove,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: SectionListItemProps) {
  const meta = getSectionMeta(section.type);
  const Icon = meta ? resolveIcon(meta.icon) : Layout;
  const label = meta?.label ?? section.type;

  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 rounded-lg px-2 py-2 transition-colors cursor-pointer',
        'hover:bg-surface-100',
        isSelected && 'bg-brand-50 border border-brand-600 shadow-sm',
        !isSelected && 'border border-transparent',
        !section.visible && 'opacity-50',
      )}
      onClick={onSelect}
    >
      {/* Drag handle visual indicator */}
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-surface-300" />

      {/* Icon */}
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          isSelected ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-500',
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Label */}
      <span
        className={cn(
          'flex-1 truncate text-xs font-medium',
          isSelected ? 'text-brand-800' : 'text-surface-700',
        )}
      >
        {label}
      </span>

      {/* Action buttons - shown on hover or when selected */}
      <div
        className={cn(
          'flex items-center gap-0.5 transition-opacity',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Move up */}
        <button
          type="button"
          disabled={index === 0}
          onClick={onMoveUp}
          className="rounded p-0.5 text-surface-400 hover:text-surface-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>

        {/* Move down */}
        <button
          type="button"
          disabled={index === total - 1}
          onClick={onMoveDown}
          className="rounded p-0.5 text-surface-400 hover:text-surface-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {/* Visibility toggle */}
        <button
          type="button"
          onClick={onToggleVisibility}
          className="rounded p-0.5 text-surface-400 hover:text-surface-700"
          title={section.visible ? 'Hide section' : 'Show section'}
        >
          {section.visible ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Duplicate */}
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded p-0.5 text-surface-400 hover:text-surface-700"
          title="Duplicate section"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-0.5 text-surface-400 hover:text-red-500"
          title="Delete section"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
