'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Star,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface LegalPolicy {
  id: string;
  title: string;
  slug: string;
  policyType: string;
  displayOrder: number;
  isActive: boolean;
}

interface LegalSet {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  policies: LegalPolicy[];
  _count: {
    policies: number;
    stores: number;
  };
}

export default function LegalSetsPage() {
  const router = useRouter();
  const [legalSets, setLegalSets] = useState<LegalSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingDefault, setCreatingDefault] = useState(false);

  useEffect(() => {
    fetchLegalSets();
  }, []);

  async function fetchLegalSets() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/legal-sets');
      setLegalSets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load legal sets');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDefault() {
    if (!confirm('Create the default legal set with all standard policies?')) {
      return;
    }

    try {
      setCreatingDefault(true);
      await apiClient.post('/legal-sets/default');
      await fetchLegalSets();
    } catch (err: any) {
      alert(err.message || 'Failed to create default legal set');
    } finally {
      setCreatingDefault(false);
    }
  }

  async function handleDuplicate(legalSet: LegalSet) {
    const newName = prompt(`Enter name for duplicated legal set:`, `${legalSet.name} (Copy)`);
    if (!newName) return;

    try {
      await apiClient.post(`/legal-sets/${legalSet.id}/duplicate`, { name: newName });
      await fetchLegalSets();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate legal set');
    }
  }

  async function handleDelete(legalSet: LegalSet) {
    if (!confirm(`Are you sure you want to delete "${legalSet.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/legal-sets/${legalSet.id}`);
      await fetchLegalSets();
    } catch (err: any) {
      alert(err.message || 'Failed to delete legal set');
    }
  }

  async function handleSetAsDefault(legalSet: LegalSet) {
    if (!confirm(`Set "${legalSet.name}" as the default legal set?`)) {
      return;
    }

    try {
      await apiClient.patch(`/legal-sets/${legalSet.id}`, { isDefault: true });
      await fetchLegalSets();
    } catch (err: any) {
      alert(err.message || 'Failed to set as default');
    }
  }

  function handleViewPolicies(legalSet: LegalSet) {
    router.push(`/admin/settings/legal/${legalSet.id}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const defaultSet = legalSets.find((set) => set.isDefault);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">
            Legal Sets
          </h1>
          <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">
            Manage legal policy sets for your stores
          </p>
        </div>

        <div className="flex gap-3">
          {!defaultSet && (
            <button
              onClick={handleCreateDefault}
              disabled={creatingDefault}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Star className="w-4 h-4" />
              {creatingDefault ? 'Creating...' : 'Create Default Set'}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Error</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {legalSets.length === 0 && !error && (
        <div className="text-center py-12 bg-surface-50 dark:bg-surface-900 rounded-lg border-2 border-dashed border-surface-300 dark:border-surface-700">
          <FileText className="w-12 h-12 text-surface-400 dark:text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
            No legal sets yet
          </h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            Create a default legal set with all standard policies to get started
          </p>
          <button
            onClick={handleCreateDefault}
            disabled={creatingDefault}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {creatingDefault ? 'Creating...' : 'Create Default Legal Set'}
          </button>
        </div>
      )}

      {/* Legal Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {legalSets.map((legalSet) => (
          <div
            key={legalSet.id}
            className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-5 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 truncate">
                    {legalSet.name}
                  </h3>
                  {legalSet.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium rounded">
                      <Star className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>
                {legalSet.description && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1 line-clamp-2">
                    {legalSet.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-surface-600 dark:text-surface-400 mb-4">
              <span>{legalSet._count.policies} policies</span>
              <span>{legalSet._count.stores} stores</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewPolicies(legalSet)}
                className="flex items-center gap-1 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded hover:bg-brand-100 dark:hover:bg-brand-900/30 text-sm font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>

              <button
                onClick={() => handleDuplicate(legalSet)}
                className="flex items-center gap-1 px-3 py-1.5 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded hover:bg-surface-200 dark:hover:bg-surface-600 text-sm font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>

              {!legalSet.isDefault && (
                <>
                  <button
                    onClick={() => handleSetAsDefault(legalSet)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded hover:bg-surface-200 dark:hover:bg-surface-600 text-sm font-medium transition-colors"
                    title="Set as default"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(legalSet)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-sm font-medium transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
