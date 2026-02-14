'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { SellpageBuilder } from '@/components/builders/SellpageBuilder';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SellpageData {
  id: string;
  slug: string;
  titleOverride?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  storeId: string;
  productId: string;
  sections: Array<{
    id: string;
    type: string;
    position: number;
    visible: boolean;
    config: Record<string, unknown>;
  }>;
  product?: {
    id: string;
    name: string;
    basePrice: number | string;
    compareAtPrice?: number | string;
    currency?: string;
    media?: Array<{
      id: string;
      url: string;
      altText?: string;
      isPrimary?: boolean;
    }>;
  };
  store?: {
    id: string;
    name: string;
  };
}

const statusVariant = {
  DRAFT: 'warning' as const,
  PUBLISHED: 'success' as const,
  ARCHIVED: 'default' as const,
};

export default function SellpageBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const sellpageId = params.id as string;

  const [sellpage, setSellpage] = useState<SellpageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSellpage();
  }, [sellpageId]);

  async function fetchSellpage() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<SellpageData>(`/sellpages/${sellpageId}`);
      setSellpage(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load sellpage';
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
          <p className="text-sm text-surface-500">Loading page builder...</p>
        </div>
      </div>
    );
  }

  if (error || !sellpage) {
    return (
      <div className="space-y-6 p-6">
        <button
          onClick={() => router.push(`/admin/sellpages/${sellpageId}`)}
          className="flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sellpage
        </button>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load sellpage</p>
            <p className="text-sm text-red-600">{error || 'Sellpage not found'}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchSellpage} className="ml-auto">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const productContext = sellpage.product
    ? {
        name: sellpage.product.name,
        basePrice:
          typeof sellpage.product.basePrice === 'string'
            ? parseFloat(sellpage.product.basePrice)
            : sellpage.product.basePrice,
        compareAtPrice: sellpage.product.compareAtPrice
          ? typeof sellpage.product.compareAtPrice === 'string'
            ? parseFloat(sellpage.product.compareAtPrice)
            : sellpage.product.compareAtPrice
          : undefined,
        currency: sellpage.product.currency || 'USD',
        media: sellpage.product.media,
      }
    : undefined;

  return (
    <div className="-m-6 flex h-[calc(100vh-64px)] flex-col">
      {/* Builder Header Bar */}
      <div className="flex items-center justify-between border-b border-surface-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/sellpages/${sellpageId}`)}
            className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-surface-900">
                {sellpage.titleOverride || sellpage.slug}
              </h1>
              <Badge variant={statusVariant[sellpage.status]}>
                {sellpage.status}
              </Badge>
            </div>
            <p className="text-xs text-surface-500">
              {sellpage.store?.name || 'Store'} · Page Builder
            </p>
          </div>
        </div>
      </div>

      {/* Builder Content */}
      <div className="flex-1 overflow-hidden">
        <SellpageBuilder
          sellpageId={sellpageId}
          initialSections={sellpage.sections || []}
          product={productContext}
          onSave={fetchSellpage}
        />
      </div>
    </div>
  );
}
