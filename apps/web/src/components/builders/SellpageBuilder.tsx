'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBuilderStore, type SectionConfig } from '@/stores/builder-store';
import { apiClient } from '@/lib/api-client';
import { SectionListPanel } from './SectionListPanel';
import { SectionEditorPanel } from './SectionEditorPanel';
import { SectionRenderer, type ProductContext } from './SectionRenderer';
import {
  Save,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Sellpage section types
// ---------------------------------------------------------------------------
const SELLPAGE_SECTION_TYPES = [
  'announcement-bar',
  'hero',
  'problem',
  'solution',
  'features',
  'social-proof',
  'pricing',
  'faq',
  'sticky-cta',
  'countdown-timer',
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface SellpageBuilderProps {
  sellpageId: string;
  initialSections: SectionConfig[];
  product?: ProductContext;
  onSave?: () => void;
}

// ---------------------------------------------------------------------------
// SellpageBuilder
// ---------------------------------------------------------------------------
export function SellpageBuilder({
  sellpageId,
  initialSections,
  product,
  onSave,
}: SellpageBuilderProps) {
  const setSections = useBuilderStore((s) => s.setSections);
  const sections = useBuilderStore((s) => s.sections);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const isSaving = useBuilderStore((s) => s.isSaving);
  const setIsSaving = useBuilderStore((s) => s.setIsSaving);
  const markClean = useBuilderStore((s) => s.markClean);

  // Full-preview mode hides the side panels
  const [fullPreview, setFullPreview] = useState(false);

  // Track last-saved status for user feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // -----------------------------------------------------------------------
  // Initialize store with initial data
  // -----------------------------------------------------------------------
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      setSections(initialSections);
      initialized.current = true;
    }
  }, [initialSections, setSections]);

  // -----------------------------------------------------------------------
  // Save handler
  // -----------------------------------------------------------------------
  const save = useCallback(async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      setSaveStatus('saving');
      await apiClient.patch(`/sellpages/${sellpageId}/sections`, {
        sections,
      });
      markClean();
      setSaveStatus('saved');
      onSave?.();
      // Reset status after a brief display
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save sellpage sections:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, setIsSaving, sellpageId, sections, markClean, onSave]);

  // -----------------------------------------------------------------------
  // Auto-save: debounced 2 s after last change
  // -----------------------------------------------------------------------
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    // Clear any pending timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      save();
    }, 2000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [isDirty, sections, save]);

  // -----------------------------------------------------------------------
  // Cleanup on unmount
  // -----------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  // -----------------------------------------------------------------------
  // Save status indicator
  // -----------------------------------------------------------------------
  function renderSaveStatus() {
    switch (saveStatus) {
      case 'saving':
        return (
          <Badge variant="info" className="gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </Badge>
        );
      case 'saved':
        return (
          <Badge variant="success" className="gap-1.5">
            <CheckCircle className="h-3 w-3" />
            Saved
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="danger" className="gap-1.5">
            <AlertCircle className="h-3 w-3" />
            Save failed
          </Badge>
        );
      default:
        if (isDirty) {
          return (
            <Badge variant="warning" className="gap-1.5">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </Badge>
          );
        }
        return null;
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="flex h-full flex-col bg-white">
      {/* ----------------------------------------------------------------- */}
      {/* Top toolbar                                                        */}
      {/* ----------------------------------------------------------------- */}
      <header className="flex items-center justify-between border-b border-surface-200 bg-white px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-surface-800">Page Builder</h1>
          {renderSaveStatus()}
        </div>

        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFullPreview((v) => !v)}
            leftIcon={
              fullPreview ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )
            }
          >
            {fullPreview ? 'Exit Preview' : 'Preview'}
          </Button>

          {/* Manual save */}
          <Button
            variant="primary"
            size="sm"
            onClick={save}
            isLoading={isSaving}
            disabled={!isDirty && saveStatus !== 'error'}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save
          </Button>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Three-column layout                                                */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: section list */}
        {!fullPreview && (
          <div className="w-[280px] shrink-0 overflow-hidden">
            <SectionListPanel sectionTypes={SELLPAGE_SECTION_TYPES} />
          </div>
        )}

        {/* Center: live preview */}
        <div
          className={cn(
            'flex-1 overflow-y-auto bg-surface-100',
            fullPreview && 'bg-white',
          )}
          onClick={() => {
            // Deselect when clicking outside a section in the preview area
            if (selectedSectionId) {
              selectSection(null);
            }
          }}
        >
          <div
            className={cn(
              'mx-auto min-h-full',
              fullPreview ? 'max-w-full' : 'max-w-3xl py-4',
            )}
          >
            <div
              className={cn(
                'bg-white',
                !fullPreview && 'rounded-lg shadow-sm border border-surface-200 overflow-hidden',
              )}
            >
              <SectionRenderer
                sections={sections}
                product={product}
                isPreview={!fullPreview}
                selectedSectionId={selectedSectionId}
                onSelectSection={fullPreview ? undefined : selectSection}
              />
            </div>
          </div>
        </div>

        {/* Right panel: section editor */}
        {!fullPreview && selectedSectionId && (
          <div className="w-[320px] shrink-0 overflow-hidden">
            <SectionEditorPanel />
          </div>
        )}
      </div>
    </div>
  );
}
