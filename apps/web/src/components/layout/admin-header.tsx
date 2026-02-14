'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAuthStore, Workspace } from '@/stores/auth-store';
import { apiClient } from '@/lib/api-client';
import {
  ChevronDown,
  LogOut,
  User,
  Bell,
  Search,
  Building2,
  Check,
} from 'lucide-react';

interface WorkspaceListItem {
  id: string;
  name: string;
  slug: string;
  role?: string;
  logoUrl?: string;
}

export function AdminHeader() {
  const router = useRouter();
  const { user, workspace, setWorkspace, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        workspaceMenuRef.current &&
        !workspaceMenuRef.current.contains(event.target as Node)
      ) {
        setWorkspaceMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch workspaces when dropdown opens
  const handleWorkspaceMenuToggle = async () => {
    const newState = !workspaceMenuOpen;
    setWorkspaceMenuOpen(newState);

    if (newState && workspaces.length === 0) {
      setLoadingWorkspaces(true);
      try {
        const data = await apiClient.get<WorkspaceListItem[]>('/workspaces');
        if (data) {
          setWorkspaces(data);
        }
      } catch (err) {
        console.error('Failed to fetch workspaces:', err);
      } finally {
        setLoadingWorkspaces(false);
      }
    }
  };

  const handleSwitchWorkspace = (ws: WorkspaceListItem) => {
    setWorkspace({
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      plan: 'free',
    });
    setWorkspaceMenuOpen(false);
    // Reload the current page to reflect the new workspace context
    router.refresh();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Build initials from user fields - handle both displayName and firstName/lastName
  const initials = user
    ? (user as any).displayName
      ? (user as any).displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  const displayName = user
    ? (user as any).displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'User';

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-200 bg-white px-6">
      {/* Left: Search */}
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border border-surface-200 bg-surface-50 py-2 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Workspace Selector */}
        <div className="relative" ref={workspaceMenuRef}>
          <button
            onClick={handleWorkspaceMenuToggle}
            className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm transition-colors hover:bg-surface-50"
          >
            <Building2 className="h-4 w-4 text-surface-500" />
            <span className="max-w-[150px] truncate text-surface-700">
              {workspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-surface-400 transition-transform',
                workspaceMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-surface-200 bg-white py-1 shadow-lg animate-fade-in">
              <div className="border-b border-surface-100 px-4 py-2">
                <p className="text-xs font-medium uppercase text-surface-400">
                  Workspaces
                </p>
              </div>

              {loadingWorkspaces ? (
                <div className="px-4 py-3 text-sm text-surface-400">
                  Loading...
                </div>
              ) : workspaces.length > 0 ? (
                <div className="max-h-48 overflow-y-auto py-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 px-4 py-2 text-sm transition-colors hover:bg-surface-50',
                        workspace?.id === ws.id
                          ? 'text-brand-700 bg-brand-50'
                          : 'text-surface-700'
                      )}
                      onClick={() => handleSwitchWorkspace(ws)}
                    >
                      <div className="flex items-center gap-2">
                        <Building2
                          className={cn(
                            'h-4 w-4',
                            workspace?.id === ws.id
                              ? 'text-brand-600'
                              : 'text-surface-400'
                          )}
                        />
                        <span className="truncate">{ws.name}</span>
                        {ws.role && (
                          <span className="rounded bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-surface-500">
                            {ws.role}
                          </span>
                        )}
                      </div>
                      {workspace?.id === ws.id && (
                        <Check className="h-4 w-4 text-brand-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-surface-400">
                  No workspaces found
                </div>
              )}

              <div className="border-t border-surface-100">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-500 hover:bg-surface-50"
                  onClick={() => setWorkspaceMenuOpen(false)}
                >
                  + Create Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-50 hover:text-surface-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-surface-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
              {initials || 'U'}
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-surface-400 transition-transform',
                userMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-surface-200 bg-white py-1 shadow-lg animate-fade-in">
              <div className="border-b border-surface-100 px-4 py-3">
                <p className="text-sm font-medium text-surface-900">
                  {displayName}
                </p>
                <p className="text-xs text-surface-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push('/admin/settings');
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
              >
                <User className="h-4 w-4" />
                Profile Settings
              </button>
              <div className="border-t border-surface-100">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
