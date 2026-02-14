'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';

// ---------- Types ----------

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string | null;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  paymentMethod: string | null;
  paidAt: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ---------- Constants ----------

const STATUS_OPTIONS: { label: string; value: OrderStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const statusBadgeVariant: Record<OrderStatus, 'warning' | 'info' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'default',
};

const LIMIT = 20;

// ---------- Helpers ----------

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---------- Component ----------

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(LIMIT));
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await apiClient.get<OrdersResponse>(`/orders?${params.toString()}`);
      setOrders(res.data);
      setMeta(res.meta);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    alert('CSV export coming soon');
  };

  // ---------- Render ----------

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Orders</h1>
          <p className="mt-1 text-sm text-surface-500">
            Track and manage customer orders
          </p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={handleExportCSV}
        >
          Export CSV
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value as OrderStatus | '')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === opt.value
                ? 'bg-brand-600 text-white'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <Card padding="sm">
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by order number or customer email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">Error loading orders</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchOrders} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      {/* Orders Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                // Skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-surface-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-surface-300" />
                    <p className="mt-4 text-sm font-medium text-surface-900">No orders found</p>
                    <p className="mt-1 text-sm text-surface-500">
                      {searchQuery || statusFilter
                        ? 'Try adjusting your filters or search term'
                        : 'Orders will appear here when customers make purchases'}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer transition-colors hover:bg-surface-50"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-brand-600">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-surface-900">
                          {order.customerName || 'Guest'}
                        </p>
                        <p className="text-xs text-surface-500">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusBadgeVariant[order.status]}>
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-700">
                      {order.items?.length ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-surface-900">
                      {formatCurrency(order.total, order.currency)}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-700">
                      {order.paymentMethod || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/orders/${order.id}`);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-surface-200 px-6 py-3">
          <p className="text-sm text-surface-500">
            {loading
              ? 'Loading...'
              : `Showing ${orders.length} of ${meta.total} orders`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <span className="text-sm text-surface-600">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= meta.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
