'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { HomepageBuilder } from '@/components/builders/HomepageBuilder';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  homepageConfig: Array<{
    id: string;
    type: string;
    position: number;
    visible: boolean;
    config: Record<string, unknown>;
  }>;
}

export default function HomepageBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;

  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  async function fetchStore() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<StoreData>(`/stores/${storeId}`);
      setStore(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load store';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-sm text-surface-500">Loading homepage builder...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="space-y-6 p-6">
        <button
          onClick={() => router.push(`/admin/stores/${storeId}`)}
          className="flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </button>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load store</p>
            <p className="text-sm text-red-600">{error || 'Store not found'}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchStore} className="ml-auto">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Normalize homepageConfig - could be object or array
  const sections = Array.isArray(store.homepageConfig)
    ? store.homepageConfig
    : [];

  return (
    <div className="-m-6 flex h-[calc(100vh-64px)] flex-col">
      {/* Builder Header Bar */}
      <div className="flex items-center justify-between border-b border-surface-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/stores/${storeId}`)}
            className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-surface-900">
              {store.name} — Homepage
            </h1>
            <p className="text-xs text-surface-500">Homepage Builder</p>
          </div>
        </div>
      </div>

      {/* Builder Content */}
      <div className="flex-1 overflow-hidden">
        <HomepageBuilder
          storeId={storeId}
          initialSections={sections}
          onSave={fetchStore}
        />
      </div>
    </div>
  );
}
