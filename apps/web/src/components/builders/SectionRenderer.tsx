'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { type SectionConfig } from '@/stores/builder-store';
import { sectionComponents } from '@/components/sections';
import { getSectionMeta } from './section-meta';

// ---------------------------------------------------------------------------
// Product context shared with section preview components
// ---------------------------------------------------------------------------
export interface ProductContext {
  name: string;
  basePrice: number;
  compareAtPrice?: number;
  currency?: string;
  media?: { url: string; altText?: string; isPrimary?: boolean }[];
  description?: string;
}

// ---------------------------------------------------------------------------
// Fallback for section types without a preview component
// ---------------------------------------------------------------------------
function SectionPlaceholder({ type }: { type: string }) {
  const meta = getSectionMeta(type);
  return (
    <div className="flex items-center justify-center py-12 bg-surface-50 border border-dashed border-surface-300 rounded-lg">
      <p className="text-sm text-surface-400">
        {meta ? meta.label : type} &mdash; preview not available
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error boundary so one broken section does not crash the whole preview
// ---------------------------------------------------------------------------
class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; type: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; type: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <SectionPlaceholder type={this.props.type} />;
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// SectionRenderer
// ---------------------------------------------------------------------------
export interface SectionRendererProps {
  sections: SectionConfig[];
  product?: ProductContext;
  isPreview?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}

export function SectionRenderer({
  sections,
  product,
  isPreview = false,
  selectedSectionId,
  onSelectSection,
}: SectionRendererProps) {
  // Sort by position before rendering
  const sorted = [...sections].sort((a, b) => a.position - b.position);

  return (
    <div className="w-full">
      {sorted.map((section) => {
        // In public rendering, skip invisible sections entirely
        if (!section.visible && !isPreview) return null;

        const PreviewComponent = sectionComponents[section.type];
        const isSelected = selectedSectionId === section.id;

        return (
          <div
            key={section.id}
            className={cn(
              'relative transition-all duration-150',
              // Dim invisible sections in preview mode
              !section.visible && isPreview && 'opacity-40',
              // Interactive selection styling in builder preview
              isPreview && 'cursor-pointer',
              isPreview && !isSelected && 'hover:ring-2 hover:ring-blue-300 hover:ring-inset',
              isPreview && isSelected && 'ring-2 ring-blue-500 ring-inset',
            )}
            onClick={
              isPreview && onSelectSection
                ? (e) => {
                    e.stopPropagation();
                    onSelectSection(section.id);
                  }
                : undefined
            }
          >
            {/* Section type label badge in preview mode */}
            {isPreview && isSelected && (
              <div className="absolute top-0 left-0 z-10 bg-blue-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-br-md">
                {getSectionMeta(section.type)?.label ?? section.type}
              </div>
            )}

            <SectionErrorBoundary type={section.type}>
              {PreviewComponent ? (
                <PreviewComponent
                  config={section.config}
                  product={product}
                  isPreview={isPreview}
                />
              ) : (
                <SectionPlaceholder type={section.type} />
              )}
            </SectionErrorBoundary>
          </div>
        );
      })}

      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-surface-400">
          <p className="text-lg font-medium">No sections yet</p>
          <p className="mt-1 text-sm">Add your first section from the left panel.</p>
        </div>
      )}
    </div>
  );
}
