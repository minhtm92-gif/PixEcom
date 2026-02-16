'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  Users,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  sellpageId: string;
  sellpageName: string;
  sellpageSlug: string;
  views: number;
  viewsChange: number;
  addToCarts: number;
  addToCartsChange: number;
  orders: number;
  ordersChange: number;
  revenue: number;
  revenueChange: number;
  conversionRate: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function SellpageAnalytics() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    try {
      setLoading(true);

      // Mock analytics data (replace with real API call)
      const mockData: AnalyticsData[] = [
        {
          sellpageId: '1',
          sellpageName: 'FlexFit Compression Shirt',
          sellpageSlug: 'flexfit-compression-shirt',
          views: 3240,
          viewsChange: 12.5,
          addToCarts: 486,
          addToCartsChange: 8.3,
          orders: 127,
          ordersChange: 15.2,
          revenue: 5080,
          revenueChange: 18.7,
          conversionRate: 3.92,
          status: 'PUBLISHED',
        },
        {
          sellpageId: '2',
          sellpageName: 'AquaPure Water Bottle',
          sellpageSlug: 'aquapure-water-bottle',
          views: 2890,
          viewsChange: -5.2,
          addToCarts: 405,
          addToCartsChange: 3.1,
          orders: 98,
          ordersChange: 7.8,
          revenue: 2450,
          revenueChange: 9.2,
          conversionRate: 3.39,
          status: 'PUBLISHED',
        },
      ];

      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
  const totalOrders = analytics.reduce((sum, item) => sum + item.orders, 0);
  const totalRevenue = analytics.reduce((sum, item) => sum + item.revenue, 0);
  const avgConversion = analytics.length > 0
    ? analytics.reduce((sum, item) => sum + item.conversionRate, 0) / analytics.length
    : 0;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="py-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-20 rounded bg-surface-200 dark:bg-surface-700" />
                <div className="h-8 w-24 rounded bg-surface-200 dark:bg-surface-700" />
                <div className="h-3 w-16 rounded bg-surface-200 dark:bg-surface-700" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          Sellpage Performance
        </h3>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
                  Total Views
                </p>
                <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {formatNumber(totalViews)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
                  Total Orders
                </p>
                <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {totalOrders}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
                  Total Revenue
                </p>
                <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
                  Avg Conversion
                </p>
                <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {avgConversion.toFixed(1)}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics per Sellpage */}
      <Card>
        <CardHeader>
          <CardTitle>Sellpage Breakdown</CardTitle>
          <CardDescription>
            Performance metrics for each published sellpage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.map((item) => (
              <button
                key={item.sellpageId}
                onClick={() => router.push(`/admin/sellpages/${item.sellpageId}`)}
                className="group w-full rounded-lg border border-surface-200 dark:border-surface-700 p-4 text-left transition-colors hover:border-brand-400 hover:bg-surface-50 dark:hover:bg-surface-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-surface-900 dark:text-surface-100">
                        {item.sellpageName}
                      </h4>
                      <Badge
                        variant={
                          item.status === 'PUBLISHED'
                            ? 'success'
                            : item.status === 'DRAFT'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">
                      /{item.sellpageSlug}
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-surface-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-surface-600 dark:text-surface-400">Views</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                        {formatNumber(item.views)}
                      </p>
                      <span
                        className={`flex items-center gap-0.5 text-xs font-medium ${
                          item.viewsChange >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {item.viewsChange >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(item.viewsChange).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-surface-600 dark:text-surface-400">Add to Cart</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                        {item.addToCarts}
                      </p>
                      <span
                        className={`flex items-center gap-0.5 text-xs font-medium ${
                          item.addToCartsChange >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {item.addToCartsChange >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(item.addToCartsChange).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-surface-600 dark:text-surface-400">Orders</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                        {item.orders}
                      </p>
                      <span
                        className={`flex items-center gap-0.5 text-xs font-medium ${
                          item.ordersChange >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {item.ordersChange >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(item.ordersChange).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-surface-600 dark:text-surface-400">Revenue</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                        {formatCurrency(item.revenue)}
                      </p>
                      <span
                        className={`flex items-center gap-0.5 text-xs font-medium ${
                          item.revenueChange >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {item.revenueChange >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(item.revenueChange).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-surface-600 dark:text-surface-400">Conversion Rate:</span>
                  <span className="font-semibold text-surface-900 dark:text-surface-100">
                    {item.conversionRate.toFixed(2)}%
                  </span>
                </div>
              </button>
            ))}

            {analytics.length === 0 && (
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" />
                <p className="mt-4 text-sm font-medium text-surface-900 dark:text-surface-100">
                  No Analytics Data Yet
                </p>
                <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">
                  Create and publish a sellpage to start tracking performance
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
