'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Building2,
  Store,
  Package,
  FileText,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: any;
  action: {
    label: string;
    path: string;
  };
}

export function SetupChecklist() {
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadChecklistStatus();
  }, []);

  async function loadChecklistStatus() {
    try {
      setLoading(true);

      // Check workspace settings
      const settings = await apiClient.get('/settings');
      const hasWorkspaceSetup = !!(settings?.brandName && settings?.supportEmail);

      // Check stores
      const storesData = await apiClient.get<any>('/stores');
      const hasStore = Array.isArray(storesData?.data) ? storesData.data.length > 0 : false;

      // Check products
      const productsData = await apiClient.get<any>('/products');
      const hasProduct = Array.isArray(productsData?.data) ? productsData.data.length > 0 : false;

      // Check sellpages
      const sellpagesData = await apiClient.get<any>('/sellpages');
      const hasSellpage = Array.isArray(sellpagesData?.data) ? sellpagesData.data.length > 0 : false;

      // Check payment providers
      const providersData = await apiClient.get<any>('/payment-providers');
      const hasPayment = Array.isArray(providersData) ? providersData.length > 0 : false;

      const checklistItems: ChecklistItem[] = [
        {
          id: 'workspace',
          title: 'Configure Workspace',
          description: 'Set up brand name, logo, and contact info',
          completed: hasWorkspaceSetup,
          icon: Building2,
          action: { label: 'Go to Settings', path: '/admin/settings' },
        },
        {
          id: 'store',
          title: 'Create Your First Store',
          description: 'Set up a store with domain and branding',
          completed: hasStore,
          icon: Store,
          action: { label: 'Create Store', path: '/admin/stores' },
        },
        {
          id: 'product',
          title: 'Add a Product',
          description: 'Create your first product with pricing',
          completed: hasProduct,
          icon: Package,
          action: { label: 'Add Product', path: '/admin/products' },
        },
        {
          id: 'sellpage',
          title: 'Build a Sellpage',
          description: 'Create a sales page for your product',
          completed: hasSellpage,
          icon: FileText,
          action: { label: 'Create Sellpage', path: '/admin/sellpages' },
        },
        {
          id: 'payment',
          title: 'Set Up Payments',
          description: 'Configure payment provider (Stripe, PayPal)',
          completed: hasPayment,
          icon: CreditCard,
          action: { label: 'Configure Payments', path: '/admin/settings?tab=payments' },
        },
      ];

      setItems(checklistItems);
    } catch (error) {
      console.error('Failed to load checklist:', error);
    } finally {
      setLoading(false);
    }
  }

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount;

  // Auto-collapse when complete
  useEffect(() => {
    if (isComplete) {
      setIsCollapsed(true);
    }
  }, [isComplete]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-1/3 rounded bg-surface-200 dark:bg-surface-700" />
            <div className="h-2 w-full rounded bg-surface-200 dark:bg-surface-700" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded bg-surface-100 dark:bg-surface-800" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                {isComplete ? (
                  <Sparkles className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-brand-600" />
                )}
                Setup Checklist
              </CardTitle>
              {isComplete && (
                <span className="rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  Complete
                </span>
              )}
            </div>
            <CardDescription className="mt-1">
              {isComplete
                ? 'All setup tasks completed! 🎉'
                : `${completedCount} of ${totalCount} tasks completed`}
            </CardDescription>
          </div>
          <ChevronRight
            className={`h-5 w-5 text-surface-400 transition-transform ${
              isCollapsed ? '' : 'rotate-90'
            }`}
          />
        </div>

        {/* Progress Bar */}
        {!isCollapsed && (
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
              <div
                className={`h-full transition-all duration-500 ${
                  isComplete ? 'bg-green-600' : 'bg-brand-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => !item.completed && router.push(item.action.path)}
                disabled={item.completed}
                className={`group flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  item.completed
                    ? 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 cursor-default'
                    : 'border-surface-200 dark:border-surface-700 hover:border-brand-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                }`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    item.completed
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                      : 'bg-brand-100 dark:bg-brand-900/20 text-brand-600'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-medium ${
                        item.completed
                          ? 'text-surface-600 dark:text-surface-400 line-through'
                          : 'text-surface-900 dark:text-surface-100'
                      }`}
                    >
                      {item.title}
                    </h4>
                  </div>
                  <p className="mt-0.5 text-xs text-surface-600 dark:text-surface-400">
                    {item.description}
                  </p>
                </div>

                {!item.completed && (
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-surface-400 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            );
          })}

          {isComplete && (
            <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-900/10 p-4 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-green-600" />
              <p className="mt-2 text-sm font-medium text-green-900 dark:text-green-100">
                Great job! Your store is ready to go live! 🚀
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => router.push('/admin/sellpages')}
              >
                View Your Sellpages
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
