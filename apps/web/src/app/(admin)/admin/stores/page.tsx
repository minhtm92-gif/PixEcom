'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import {
  Plus,
  Search,
  Store,
  Globe,
  FileText,
  Loader2,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  primaryDomain: string;
  brandColor: string;
  currency: string;
  logoUrl?: string;
  isActive?: boolean;
  sellpageCount?: number;
  _count?: { sellpages?: number; orders?: number };
  createdAt?: string;
}

interface StoresResponse {
  data: StoreItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.get<StoresResponse>('/stores');
      const storeItems = Array.isArray(result) ? result : (result.data || []);
      // Map _count to sellpageCount for template usage
      setStores(storeItems.map((s: StoreItem) => ({
        ...s,
        sellpageCount: s.sellpageCount ?? s._count?.sellpages ?? 0,
      })));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load stores';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.primaryDomain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Stores</h1>
          <p className="mt-1 text-sm text-surface-500">
            Manage your storefronts and their settings
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push('/admin/stores/new')}
        >
          Create Store
        </Button>
      </div>

      {/* Search Bar */}
      <Card padding="sm">
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} hover>
              <CardContent>
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-surface-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-surface-200" />
                      <div className="h-3 w-1/2 rounded bg-surface-200" />
                    </div>
                  </div>
                  <div className="h-3 w-full rounded bg-surface-100" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-surface-100" />
                    <div className="h-5 w-12 rounded-full bg-surface-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
              <p className="text-sm font-medium text-surface-900">
                Failed to load stores
              </p>
              <p className="mt-1 text-sm text-surface-500">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={fetchStores}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && stores.length === 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-100">
                <ShoppingBag className="h-7 w-7 text-surface-400" />
              </div>
              <p className="text-sm font-medium text-surface-900">
                No stores yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-surface-500">
                Create your first store to start selling. Each store can have its own domain, branding, and sellpages.
              </p>
              <Button
                className="mt-4"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => router.push('/admin/stores/new')}
              >
                Create Store
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Search Results */}
      {!loading && !error && stores.length > 0 && filteredStores.length === 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-3 h-8 w-8 text-surface-300" />
              <p className="text-sm font-medium text-surface-900">
                No stores match your search
              </p>
              <p className="mt-1 text-sm text-surface-500">
                Try a different search term
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Store Cards Grid */}
      {!loading && !error && filteredStores.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store) => (
            <Card
              key={store.id}
              hover
              className="cursor-pointer"
              onClick={() => router.push(`/admin/stores/${store.id}`)}
            >
              <CardContent>
                <div className="space-y-3">
                  {/* Store Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: store.brandColor
                            ? `${store.brandColor}20`
                            : undefined,
                        }}
                      >
                        {store.logoUrl ? (
                          <img
                            src={store.logoUrl}
                            alt={store.name}
                            className="h-6 w-6 rounded object-cover"
                          />
                        ) : (
                          <Store
                            className="h-5 w-5"
                            style={{
                              color: store.brandColor || undefined,
                            }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-surface-900">
                          {store.name}
                        </h3>
                        <p className="truncate text-xs text-surface-500">
                          /{store.slug}
                        </p>
                      </div>
                    </div>
                    <Badge variant={store.isActive !== false ? 'success' : 'default'}>
                      {store.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Store Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      <Globe className="h-3.5 w-3.5" />
                      <span className="truncate">{store.primaryDomain || 'No domain'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{store.sellpageCount ?? 0} sellpages</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-surface-100 pt-3">
                    <div className="flex items-center gap-2">
                      {store.brandColor && (
                        <div
                          className="h-4 w-4 rounded-full border border-surface-200"
                          style={{ backgroundColor: store.brandColor }}
                          title={`Brand color: ${store.brandColor}`}
                        />
                      )}
                      <span className="text-xs font-medium text-surface-500">
                        {store.currency || 'USD'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Store Count Footer */}
      {!loading && !error && stores.length > 0 && (
        <p className="text-center text-sm text-surface-500">
          Showing {filteredStores.length} of {stores.length} stores
        </p>
      )}
    </div>
  );
}
