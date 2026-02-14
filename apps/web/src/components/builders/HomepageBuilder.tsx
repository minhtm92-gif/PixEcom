'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBuilderStore, type SectionConfig } from '@/stores/builder-store';
import { apiClient } from '@/lib/api-client';
import { SectionListPanel } from './SectionListPanel';
import { SectionEditorPanel } from './SectionEditorPanel';
import { SectionRenderer } from './SectionRenderer';
import {
  Save,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Homepage section types
// ---------------------------------------------------------------------------
const HOMEPAGE_SECTION_TYPES = [
  'hero',
  'featured-product',
  'reviews',
  'guarantee',
  'footer',
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface HomepageBuilderProps {
  storeId: string;
  initialSections: SectionConfig[];
  onSave?: () => void;
}

// ---------------------------------------------------------------------------
// HomepageBuilder
// ---------------------------------------------------------------------------
export function HomepageBuilder({
  storeId,
  initialSections,
  onSave,
}: HomepageBuilderProps) {
  const setSections = useBuilderStore((s) => s.setSections);
  const sections = useBuilderStore((s) => s.sections);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const isSaving = useBuilderStore((s) => s.isSaving);
  const setIsSaving = useBuilderStore((s) => s.setIsSaving);
  const markClean = useBuilderStore((s) => s.markClean);

  const [fullPreview, setFullPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // -----------------------------------------------------------------------
  // Initialize store
  // -----------------------------------------------------------------------
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      setSections(initialSections);
      initialized.current = true;
    }
  }, [initialSections, setSections]);

  // -----------------------------------------------------------------------
  // Save handler (PUT /stores/:storeId/homepage)
  // -----------------------------------------------------------------------
  const save = useCallback(async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      setSaveStatus('saving');
      await apiClient.put(`/stores/${storeId}/homepage`, {
        sections,
      });
      markClean();
      setSaveStatus('saved');
      onSave?.();
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save homepage sections:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, setIsSaving, storeId, sections, markClean, onSave]);

  // -----------------------------------------------------------------------
  // Auto-save: debounced 2 s
  // -----------------------------------------------------------------------
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty) return;

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
      {/* Toolbar */}
      <header className="flex items-center justify-between border-b border-surface-200 bg-white px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-surface-800">Homepage Builder</h1>
          {renderSaveStatus()}
        </div>

        <div className="flex items-center gap-2">
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

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        {!fullPreview && (
          <div className="w-[280px] shrink-0 overflow-hidden">
            <SectionListPanel sectionTypes={HOMEPAGE_SECTION_TYPES} />
          </div>
        )}

        {/* Center: live preview */}
        <div
          className={cn(
            'flex-1 overflow-y-auto bg-surface-100',
            fullPreview && 'bg-white',
          )}
          onClick={() => {
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
                isPreview={!fullPreview}
                selectedSectionId={selectedSectionId}
                onSelectSection={fullPreview ? undefined : selectSection}
              />
            </div>
          </div>
        </div>

        {/* Right panel */}
        {!fullPreview && selectedSectionId && (
          <div className="w-[320px] shrink-0 overflow-hidden">
            <SectionEditorPanel />
          </div>
        )}
      </div>
    </div>
  );
}
