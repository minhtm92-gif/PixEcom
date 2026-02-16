'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { BulkOperations } from '@/components/sellpages/BulkOperations';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Loader2,
  AlertCircle,
  Copy,
  Eye,
  QrCode,
  Trash2,
} from 'lucide-react';

interface SellpageItem {
  id: string;
  slug: string;
  titleOverride?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  store?: { id: string; name: string };
  storeName?: string;
  product?: { id: string; name: string };
  productName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SellpagesResponse {
  data: SellpageItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const statusVariant = {
  DRAFT: 'warning' as const,
  PUBLISHED: 'success' as const,
  ARCHIVED: 'default' as const,
};

const STATUS_OPTIONS = ['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export default function SellpagesPage() {
  const router = useRouter();
  const [sellpages, setSellpages] = useState<SellpageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchSellpages();
  }, []);

  async function fetchSellpages() {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.get<SellpagesResponse>('/sellpages');
      const items = Array.isArray(result) ? result : (result.data || []);
      setSellpages(items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load sellpages';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const filteredSellpages = sellpages.filter((sp) => {
    const matchesSearch =
      (sp.titleOverride || sp.slug).toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sp.store?.name || sp.storeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sp.product?.name || sp.productName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || sp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function getStoreName(sp: SellpageItem): string {
    return sp.store?.name || sp.storeName || '-';
  }

  function getProductName(sp: SellpageItem): string {
    return sp.product?.name || sp.productName || '-';
  }

  function getDisplayTitle(sp: SellpageItem): string {
    return sp.titleOverride || sp.slug;
  }

  async function handleDuplicate(sellpage: SellpageItem, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const duplicated = await apiClient.post<{ id: string }>(`/sellpages/${sellpage.id}/duplicate`);
      await fetchSellpages();
      router.push(`/admin/sellpages/${duplicated.id}`);
    } catch (err) {
      console.error('Failed to duplicate sellpage:', err);
    }
  }

  async function handleDelete(sellpageId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this sellpage?')) return;

    try {
      await apiClient.delete(`/sellpages/${sellpageId}`);
      await fetchSellpages();
    } catch (err) {
      console.error('Failed to delete sellpage:', err);
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredSellpages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSellpages.map((sp) => sp.id));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Sellpages</h1>
          <p className="mt-1 text-sm text-surface-500">
            Manage your product landing pages
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push('/admin/sellpages/new')}
        >
          Create Sellpage
        </Button>
      </div>

      {/* Filters Bar */}
      <Card padding="sm">
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search sellpages, stores, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card padding="none">
          <div className="space-y-0 divide-y divide-surface-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 px-6 py-4">
                <div className="h-4 w-4 rounded bg-surface-200" />
                <div className="h-4 w-48 rounded bg-surface-200" />
                <div className="h-4 w-24 rounded bg-surface-200" />
                <div className="h-4 w-24 rounded bg-surface-200" />
                <div className="h-5 w-16 rounded-full bg-surface-200" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
              <p className="text-sm font-medium text-surface-900">
                Failed to load sellpages
              </p>
              <p className="mt-1 text-sm text-surface-500">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={fetchSellpages}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && sellpages.length === 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-100">
                <FileText className="h-7 w-7 text-surface-400" />
              </div>
              <p className="text-sm font-medium text-surface-900">
                No sellpages yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-surface-500">
                Create your first sellpage to build a custom landing page for a product.
              </p>
              <Button
                className="mt-4"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => router.push('/admin/sellpages/new')}
              >
                Create Sellpage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Search Results */}
      {!loading && !error && sellpages.length > 0 && filteredSellpages.length === 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-3 h-8 w-8 text-surface-300" />
              <p className="text-sm font-medium text-surface-900">
                No sellpages match your filters
              </p>
              <p className="mt-1 text-sm text-surface-500">
                Try a different search term or status filter
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Operations Bar */}
      <BulkOperations
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onOperationComplete={fetchSellpages}
      />

      {/* Sellpages Table */}
      {!loading && !error && filteredSellpages.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800">
                  <th className="w-12 px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredSellpages.length && filteredSellpages.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 dark:text-surface-400">
                    Sellpage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                {filteredSellpages.map((sp) => (
                  <tr
                    key={sp.id}
                    className={`cursor-pointer transition-colors hover:bg-surface-50 dark:hover:bg-surface-800 ${
                      selectedIds.includes(sp.id) ? 'bg-brand-50 dark:bg-brand-900/10' : ''
                    }`}
                    onClick={() => router.push(`/admin/sellpages/${sp.id}`)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(sp.id)}
                        onChange={() => toggleSelect(sp.id)}
                        className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-surface-900">
                          {getDisplayTitle(sp)}
                        </p>
                        <p className="text-xs text-surface-500">/{sp.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-700">
                      {getStoreName(sp)}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-700">
                      {getProductName(sp)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[sp.status] || 'default'}>
                        {sp.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          className="rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === sp.id ? null : sp.id);
                          }}
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === sp.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                              }}
                            />
                            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-surface-200 bg-white py-1 shadow-lg dark:border-surface-700 dark:bg-surface-800">
                              <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/admin/sellpages/${sp.id}`);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                Edit Sellpage
                              </button>
                              <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700"
                                onClick={(e) => handleDuplicate(sp, e)}
                              >
                                <Copy className="h-4 w-4" />
                                Duplicate
                              </button>
                              <div className="my-1 border-t border-surface-200 dark:border-surface-700" />
                              <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={(e) => handleDelete(sp.id, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-surface-200 px-6 py-3">
            <p className="text-sm text-surface-500">
              Showing {filteredSellpages.length} of {sellpages.length} sellpages
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled>
                Previous
              </Button>
              <Button variant="secondary" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
