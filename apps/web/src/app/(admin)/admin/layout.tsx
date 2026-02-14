'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api-client';

interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  role?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, workspace, setWorkspace } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Auto-initialize workspace if not set
  useEffect(() => {
    async function initWorkspace() {
      // Wait for hydration before checking auth
      if (!hasHydrated) {
        return;
      }

      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // If workspace is already set, we're good
      if (workspace) {
        setIsInitializing(false);
        return;
      }

      try {
        const workspaces = await apiClient.get<WorkspaceResponse[]>('/workspaces');
        if (workspaces && workspaces.length > 0) {
          setWorkspace({
            id: workspaces[0].id,
            name: workspaces[0].name,
            slug: workspaces[0].slug,
            plan: 'free',
          });
          setInitError(null);
        } else {
          setInitError('No workspaces found. Please create a workspace first.');
        }
      } catch (err) {
        console.error('Failed to fetch workspaces:', err);
        setInitError('Failed to connect to API. Make sure the backend is running.');
      } finally {
        setIsInitializing(false);
      }
    }

    initWorkspace();
  }, [hasHydrated, isAuthenticated, workspace, setWorkspace, router]);

  // Show loading while hydrating or initializing
  if (!hasHydrated || isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-surface-500">Loading workspace...</p>
          {initError && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-left">
                <p className="text-sm text-red-800 font-medium mb-2">Initialization Error</p>
                <p className="text-sm text-red-700">{initError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-surface-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
