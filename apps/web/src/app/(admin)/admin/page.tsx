'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Store,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';

// --- Types ---

interface OrderStatsResponse {
  totalRevenue?: number;
  totalOrders?: number;
  averageOrderValue?: number;
  pendingOrders?: number;
  confirmedOrders?: number;
  cancelledOrders?: number;
}

interface ProductItem {
  id: string;
  name: string;
  basePrice: number | string;
  status: string;
}

interface StoreItem {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
  items?: unknown[];
}

// --- Stat Card ---

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, loading }: StatCardProps) {
  return (
    <Card hover>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-surface-500">{title}</p>
            {loading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded bg-surface-200" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-surface-900">{value}</p>
            )}
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Status Badge Variant ---

const statusBadgeVariant: Record<string, 'warning' | 'info' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'default',
};

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- Component ---

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    productCount: 0,
    storeCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [topProducts, setTopProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      // Note: Backend wraps responses in { data: T, success: true } (handled by api-client)
      // Paginated endpoints return { data: [...], meta: {...} }
      const [ordersStatsRes, productsRes, storesRes, recentOrdersRes] = await Promise.allSettled([
        apiClient.get<OrderStatsResponse>('/orders/stats'),
        apiClient.get<{ data?: ProductItem[]; meta?: unknown }>('/products?limit=5&status=ACTIVE'),
        apiClient.get<{ data?: StoreItem[]; meta?: { total?: number } }>('/stores'),
        apiClient.get<{ data?: OrderItem[]; meta?: unknown }>('/orders?limit=5'),
      ]);

      // Process order stats
      if (ordersStatsRes.status === 'fulfilled') {
        const orderStats = ordersStatsRes.value;
        setStats((prev) => ({
          ...prev,
          totalRevenue: orderStats.totalRevenue || 0,
          orderCount: orderStats.totalOrders || 0,
        }));
      }

      // Process products (paginated: { data: [...], meta: {...} })
      if (productsRes.status === 'fulfilled') {
        const prodData = productsRes.value;
        const prodArray = Array.isArray(prodData) ? prodData : (prodData.data || []);
        setTopProducts(prodArray.slice(0, 5));
        setStats((prev) => ({
          ...prev,
          productCount: prodArray.length,
        }));
      }

      // Process stores (paginated: { data: [...], meta: {...} })
      if (storesRes.status === 'fulfilled') {
        const storeData = storesRes.value;
        const storeArray = Array.isArray(storeData) ? storeData : (storeData.data || []);
        const storeTotal = !Array.isArray(storeData) && storeData.meta?.total
          ? storeData.meta.total
          : storeArray.length;
        setStats((prev) => ({
          ...prev,
          storeCount: storeTotal,
        }));
      }

      // Process recent orders (paginated: { data: [...], meta: {...} })
      if (recentOrdersRes.status === 'fulfilled') {
        const orderData = recentOrdersRes.value;
        const orderArray = Array.isArray(orderData) ? orderData : (orderData.data || []);
        setRecentOrders(orderArray.slice(0, 5));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="mt-1 text-sm text-surface-500">
          Welcome back! Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="ml-auto text-sm font-medium text-red-700 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          loading={loading}
        />
        <StatCard
          title="Orders"
          value={String(stats.orderCount)}
          icon={ShoppingCart}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          loading={loading}
        />
        <StatCard
          title="Products"
          value={String(stats.productCount)}
          icon={Package}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          loading={loading}
        />
        <StatCard
          title="Stores"
          value={String(stats.storeCount)}
          icon={Store}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          loading={loading}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-surface-100 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-lg bg-surface-100" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-surface-200" />
                        <div className="h-3 w-20 animate-pulse rounded bg-surface-100" />
                      </div>
                    </div>
                    <div className="h-4 w-16 animate-pulse rounded bg-surface-200" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="mx-auto h-8 w-8 text-surface-300" />
                <p className="mt-2 text-sm text-surface-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between rounded-lg border border-surface-100 p-3 transition-colors hover:bg-surface-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100">
                        <ShoppingCart className="h-4 w-4 text-surface-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-surface-900">
                            {order.orderNumber}
                          </p>
                          <Badge variant={statusBadgeVariant[order.status] || 'default'}>
                            {order.status?.charAt(0) + order.status?.slice(1).toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-surface-500">
                          {order.customerName || order.customerEmail} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-surface-900">
                      {formatCurrency(order.total, order.currency)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">Products</h2>
              <Link
                href="/admin/products"
                className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-surface-100 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-lg bg-surface-100" />
                      <div className="space-y-2">
                        <div className="h-4 w-36 animate-pulse rounded bg-surface-200" />
                        <div className="h-3 w-16 animate-pulse rounded bg-surface-100" />
                      </div>
                    </div>
                    <div className="h-4 w-16 animate-pulse rounded bg-surface-200" />
                  </div>
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="mx-auto h-8 w-8 text-surface-300" />
                <p className="mt-2 text-sm text-surface-500">No products yet</p>
                <Link
                  href="/admin/products/new"
                  className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Add your first product →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="flex items-center justify-between rounded-lg border border-surface-100 p-3 transition-colors hover:bg-surface-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100">
                        <Package className="h-4 w-4 text-surface-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-surface-500">
                          {product.status?.charAt(0) + product.status?.slice(1).toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-surface-900">
                      {formatCurrency(
                        typeof product.basePrice === 'string'
                          ? parseFloat(product.basePrice)
                          : product.basePrice
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
