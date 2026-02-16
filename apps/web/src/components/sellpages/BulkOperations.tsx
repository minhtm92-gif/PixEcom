'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import {
  Check,
  X,
  Archive,
  Eye,
  Trash2,
  Copy,
} from 'lucide-react';

interface BulkOperationsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onOperationComplete: () => void;
}

export function BulkOperations({
  selectedIds,
  onClearSelection,
  onOperationComplete,
}: BulkOperationsProps) {
  const [processing, setProcessing] = useState(false);

  const handleBulkOperation = async (operation: string) => {
    if (!confirm(`Are you sure you want to ${operation} ${selectedIds.length} sellpages?`)) {
      return;
    }

    setProcessing(true);
    try {
      const promises = selectedIds.map(async (id) => {
        switch (operation) {
          case 'publish':
            return apiClient.patch(`/sellpages/${id}/publish`, { status: 'PUBLISHED' });
          case 'unpublish':
            return apiClient.patch(`/sellpages/${id}/publish`, { status: 'DRAFT' });
          case 'archive':
            return apiClient.patch(`/sellpages/${id}/publish`, { status: 'ARCHIVED' });
          case 'delete':
            return apiClient.delete(`/sellpages/${id}`);
          case 'duplicate':
            return apiClient.post(`/sellpages/${id}/duplicate`);
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
      });

      await Promise.all(promises);
      onClearSelection();
      onOperationComplete();
    } catch (err) {
      console.error(`Bulk ${operation} failed:`, err);
      alert(`Failed to ${operation} some sellpages. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="flex items-center gap-3 rounded-lg border border-surface-200 bg-white px-4 py-3 shadow-lg dark:border-surface-700 dark:bg-surface-800">
        {/* Selection Count */}
        <div className="flex items-center gap-2">
          <Badge variant="info">{selectedIds.length}</Badge>
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
            selected
          </span>
        </div>

        <div className="h-6 w-px bg-surface-200 dark:bg-surface-700" />

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Eye className="h-4 w-4" />}
            onClick={() => handleBulkOperation('publish')}
            disabled={processing}
          >
            Publish
          </Button>

          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Archive className="h-4 w-4" />}
            onClick={() => handleBulkOperation('archive')}
            disabled={processing}
          >
            Archive
          </Button>

          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Copy className="h-4 w-4" />}
            onClick={() => handleBulkOperation('duplicate')}
            disabled={processing}
          >
            Duplicate
          </Button>

          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => handleBulkOperation('delete')}
            disabled={processing}
          >
            Delete
          </Button>
        </div>

        <div className="h-6 w-px bg-surface-200 dark:bg-surface-700" />

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          className="rounded p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-700"
          aria-label="Clear selection"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
