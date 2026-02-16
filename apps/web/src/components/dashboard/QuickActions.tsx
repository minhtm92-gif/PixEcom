'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  FileText,
  Package,
  Store,
  Users,
  Settings,
  Zap,
} from 'lucide-react';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  path: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: <FileText className="h-5 w-5" />,
    label: 'New Sellpage',
    description: 'Create a new landing page',
    path: '/admin/sellpages/new',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: <Package className="h-5 w-5" />,
    label: 'New Product',
    description: 'Add a new product',
    path: '/admin/products/new',
    color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: <Store className="h-5 w-5" />,
    label: 'New Store',
    description: 'Create a new store',
    path: '/admin/stores/new',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: 'Team Members',
    description: 'Manage your team',
    path: '/admin/team',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
    description: 'Configure workspace',
    path: '/admin/settings',
    color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
  },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-surface-100">
              <Zap className="h-5 w-5 text-brand-600" />
              Quick Actions
            </h3>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              Common tasks and shortcuts
            </p>
          </div>

          {/* Actions Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.path}
                onClick={() => router.push(action.path)}
                className="group flex items-start gap-3 rounded-lg border border-surface-200 bg-white p-4 text-left transition-all hover:border-brand-300 hover:shadow-sm dark:border-surface-700 dark:bg-surface-800 dark:hover:border-brand-600"
              >
                <div className={`flex-shrink-0 rounded-lg p-2 ${action.color}`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 transition-colors group-hover:text-brand-700 dark:text-surface-100 dark:group-hover:text-brand-400">
                    {action.label}
                  </p>
                  <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
