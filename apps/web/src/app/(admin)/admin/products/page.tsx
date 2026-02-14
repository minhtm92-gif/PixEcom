'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Plus,
  Search,
  MoreHorizontal,
  Package,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

// --- Types ---

interface ProductMedia {
  url: string;
  altText: string;
}

interface ProductVariant {
  id: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number | string;
  compareAtPrice: number | string | null;
  costPrice: number | string | null;
  currency: string;
  sku: string | null;
  description: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  variants: ProductVariant[];
  media: ProductMedia[];
  _count?: { variants: number; sellpages: number; orderItems: number };
  createdAt: string;
  primaryImage?: { url: string; altText: string } | null;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}

// --- Helpers ---

const statusVariantMap: Record<string, 'success' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  DRAFT: 'warning',
  ARCHIVED: 'default',
};

const statusFilterOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
];

function formatPrice(price: number | string, currency: string = 'USD'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(numPrice);
}

function getTotalStock(variants: ProductVariant[]): number {
  if (!variants || variants.length === 0) return 0;
  return variants.reduce((sum, v) => sum + (v.stock || 0), 0);
}

// --- Skeleton Rows ---

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 w-4 rounded bg-surface-200" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-surface-200" />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-surface-200" />
            <div className="h-3 w-24 rounded bg-surface-200" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-16 rounded-full bg-surface-200" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 rounded bg-surface-200" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-12 rounded bg-surface-200" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-5 rounded bg-surface-200" />
      </td>
    </tr>
  );
}

// --- Component ---

export default function ProductsPage() {
  const router = useRouter();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '20');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);

      const result = await apiClient.get<ProductsResponse>(`/products?${params.toString()}`);
      setProducts(result.data);
      setMeta(result.meta);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to load products. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick() {
      setOpenDropdownId(null);
    }
    if (openDropdownId) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [openDropdownId]);

  // Selection handlers
  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Delete handler
  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to delete product.');
      }
    } finally {
      setIsDeleting(false);
    }
  }

  // Pagination
  const showingFrom = products.length === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const showingTo = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Products</h1>
          <p className="mt-1 text-sm text-surface-500">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <Card padding="sm">
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-48">
              <Select
                options={statusFilterOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => { setError(null); fetchProducts(); }}
            className="ml-auto text-sm font-medium text-red-700 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Products Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100">
                        <Package className="h-6 w-6 text-surface-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900">No products found</p>
                        <p className="mt-1 text-sm text-surface-500">
                          {debouncedSearch || statusFilter
                            ? 'Try adjusting your search or filters.'
                            : 'Get started by adding your first product.'}
                        </p>
                      </div>
                      {!debouncedSearch && !statusFilter && (
                        <Link href="/admin/products/new">
                          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                            Add Product
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-surface-50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-100">
                          {product.primaryImage?.url ? (
                            <img
                              src={product.primaryImage.url}
                              alt={product.primaryImage.altText || product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-surface-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="block truncate text-sm font-medium text-surface-900 hover:text-brand-600"
                          >
                            {product.name}
                          </Link>
                          {product.sku && (
                            <p className="truncate text-xs text-surface-500">
                              SKU: {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariantMap[product.status] || 'default'}>
                        {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-700">
                      {formatPrice(product.basePrice, product.currency)}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-700">
                      {getTotalStock(product.variants)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === product.id ? null : product.id);
                          }}
                          className="rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        {openDropdownId === product.id && (
                          <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-surface-200 bg-white py-1 shadow-lg">
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                router.push(`/admin/products/${product.id}`);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-surface-700 hover:bg-surface-50"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                setDeleteTarget(product);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && products.length > 0 && (
          <div className="flex items-center justify-between border-t border-surface-200 px-6 py-3">
            <p className="text-sm text-surface-500">
              Showing {showingFrom} to {showingTo} of {meta.total} products
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <span className="px-2 text-sm text-surface-600">
                {meta.page} / {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        size="sm"
      >
        <p className="text-sm text-surface-600">
          Are you sure you want to delete{' '}
          <span className="font-medium text-surface-900">{deleteTarget?.name}</span>?
          This action cannot be undone.
        </p>
        <ModalFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
