'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { useBuilderStore } from '@/stores/builder-store';
import { getSectionMeta } from './section-meta';
import { editorRegistry } from './editors';
import { MousePointerClick } from 'lucide-react';

// ---------------------------------------------------------------------------
// Editor error boundary
// ---------------------------------------------------------------------------
class EditorErrorBoundary extends React.Component<
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
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          Editor failed to load for &quot;{this.props.type}&quot;.
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// SectionEditorPanel
// ---------------------------------------------------------------------------
export function SectionEditorPanel() {
  const sections = useBuilderStore((s) => s.sections);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const updateSectionConfig = useBuilderStore((s) => s.updateSectionConfig);

  const selected = selectedSectionId
    ? sections.find((s) => s.id === selectedSectionId)
    : null;

  if (!selected) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-surface-50 border-l border-surface-200 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-400 mb-3">
          <MousePointerClick className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-surface-600">No section selected</p>
        <p className="mt-1 text-xs text-surface-400">
          Click a section in the preview or list to edit it.
        </p>
      </div>
    );
  }

  const meta = getSectionMeta(selected.type);
  const EditorComponent = editorRegistry[selected.type];

  const handleChange = (config: Record<string, unknown>) => {
    updateSectionConfig(selected.id, config);
  };

  return (
    <div className="flex h-full flex-col bg-surface-50 border-l border-surface-200">
      {/* Header */}
      <div className="border-b border-surface-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-surface-800">
          {meta?.label ?? selected.type}
        </h2>
        <p className="text-xs text-surface-400 mt-0.5">Edit section settings</p>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {EditorComponent ? (
          <EditorErrorBoundary type={selected.type}>
            <EditorComponent config={selected.config} onChange={handleChange} />
          </EditorErrorBoundary>
        ) : (
          <div className={cn(
            'rounded-lg border border-dashed border-surface-300 bg-white p-6',
            'text-center text-sm text-surface-400',
          )}>
            <p>No editor available for this section type.</p>
            <p className="mt-1 text-xs">Section type: {selected.type}</p>
          </div>
        )}
      </div>
    </div>
  );
}
