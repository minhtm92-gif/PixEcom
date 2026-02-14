'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { apiClient, ApiClientError } from '@/lib/api-client';
import {
  Save,
  ArrowLeft,
  Trash2,
  Loader2,
  AlertCircle,
  FileText,
  ExternalLink,
  Code,
} from 'lucide-react';

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'NGN', label: 'NGN - Nigerian Naira' },
];

interface StoreSellpage {
  id: string;
  slug: string;
  titleOverride?: string;
  status: string;
  productName?: string;
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
  primaryDomain: string;
  brandColor: string;
  currency: string;
  logoUrl?: string;
  isActive?: boolean;
  homepageConfig?: Record<string, unknown>;
  sellpages?: StoreSellpage[];
  createdAt?: string;
  updatedAt?: string;
}

export default function EditStorePage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    primaryDomain: '',
    brandColor: '#6366f1',
    currency: 'USD',
    logoUrl: '',
  });

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  async function fetchStore() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<StoreData>(`/stores/${storeId}`);
      setStore(data);
      setForm({
        name: data.name || '',
        slug: data.slug || '',
        primaryDomain: data.primaryDomain || '',
        brandColor: data.brandColor || '#6366f1',
        currency: data.currency || 'USD',
        logoUrl: data.logoUrl || '',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load store';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Store name is required';
    if (!form.slug.trim()) newErrors.slug = 'Slug is required';
    if (!form.primaryDomain.trim()) newErrors.primaryDomain = 'Primary domain is required';
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setFieldErrors({});
      await apiClient.patch(`/stores/${storeId}`, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        primaryDomain: form.primaryDomain.trim(),
        brandColor: form.brandColor,
        currency: form.currency,
        logoUrl: form.logoUrl.trim() || undefined,
      });
      // Refetch to get updated data
      await fetchStore();
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.errors) {
        const errs: Record<string, string> = {};
        for (const [key, messages] of Object.entries(err.errors)) {
          errs[key] = messages[0] || 'Invalid value';
        }
        setFieldErrors(errs);
      } else {
        const message = err instanceof Error ? err.message : 'Failed to save store';
        setFieldErrors({ _form: message });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      await apiClient.delete(`/stores/${storeId}`);
      router.push('/admin/stores');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete store';
      setFieldErrors({ _form: message });
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-surface-200" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-surface-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-surface-200" />
          </div>
        </div>
        <div className="max-w-2xl space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-1/3 rounded bg-surface-200" />
                  <div className="h-10 w-full rounded bg-surface-100" />
                  <div className="h-10 w-full rounded bg-surface-100" />
                  <div className="h-10 w-2/3 rounded bg-surface-100" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/stores')}
            className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            aria-label="Back to stores"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-surface-900">Edit Store</h1>
        </div>
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
              <p className="text-sm font-medium text-surface-900">
                Failed to load store
              </p>
              <p className="mt-1 text-sm text-surface-500">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={fetchStore}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sellpages = store?.sellpages || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/stores')}
            className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            aria-label="Back to stores"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">
              {store?.name || 'Edit Store'}
            </h1>
            <p className="mt-1 text-sm text-surface-500">
              Update store settings and configuration
            </p>
          </div>
        </div>
        <Button
          variant="danger"
          leftIcon={<Trash2 className="h-4 w-4" />}
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Store
        </Button>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* General Error */}
        {fieldErrors._form && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fieldErrors._form}
          </div>
        )}

        {/* Store Details */}
        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>
              Basic information about your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Store Name"
                placeholder="My Awesome Store"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={fieldErrors.name}
                required
              />
              <Input
                label="Slug"
                placeholder="my-awesome-store"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                error={fieldErrors.slug}
                hint="URL-friendly identifier for this store"
              />
              <Input
                label="Primary Domain"
                placeholder="store.example.com"
                value={form.primaryDomain}
                onChange={(e) => updateField('primaryDomain', e.target.value)}
                error={fieldErrors.primaryDomain}
                hint="The main domain where this store is accessible"
                required
              />
              <Input
                label="Logo URL"
                placeholder="https://example.com/logo.png"
                value={form.logoUrl}
                onChange={(e) => updateField('logoUrl', e.target.value)}
                error={fieldErrors.logoUrl}
                hint="Optional URL to your store logo image"
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding & Currency */}
        <Card>
          <CardHeader>
            <CardTitle>Branding & Currency</CardTitle>
            <CardDescription>
              Customize the look and regional settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-surface-700">
                  Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.brandColor}
                    onChange={(e) => updateField('brandColor', e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-surface-300"
                  />
                  <Input
                    value={form.brandColor}
                    onChange={(e) => updateField('brandColor', e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                  <div
                    className="h-10 w-10 rounded-lg border border-surface-200"
                    style={{ backgroundColor: form.brandColor }}
                  />
                </div>
              </div>

              <div className="w-full">
                <label
                  htmlFor="currency"
                  className="mb-1.5 block text-sm font-medium text-surface-700"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Homepage Builder */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-surface-400" />
                Homepage Configuration
              </div>
            </CardTitle>
            <CardDescription>
              Design and arrange the sections of your store homepage using the visual builder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 p-4">
              <div>
                <p className="text-sm font-medium text-surface-900">
                  {store?.homepageConfig && Array.isArray(store.homepageConfig) && store.homepageConfig.length > 0
                    ? `${store.homepageConfig.length} section${store.homepageConfig.length === 1 ? '' : 's'} configured`
                    : 'No homepage sections configured yet'}
                </p>
                <p className="text-xs text-surface-500 mt-1">
                  Open the visual builder to create your store homepage.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => router.push(`/admin/stores/${storeId}/homepage`)}
                leftIcon={<Code className="h-4 w-4" />}
              >
                Open Builder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/stores')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={saving}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Sellpages belonging to this store */}
      <div className="max-w-2xl">
        <Card padding="none">
          <div className="border-b border-surface-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-surface-900">
                  Store Sellpages
                </h3>
                <p className="mt-0.5 text-sm text-surface-500">
                  Sellpages linked to this store
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push('/admin/sellpages/new')}
              >
                Add Sellpage
              </Button>
            </div>
          </div>

          {sellpages.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <FileText className="mb-2 h-8 w-8 text-surface-300" />
              <p className="text-sm text-surface-500">
                No sellpages linked to this store yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100">
              {sellpages.map((sp) => (
                <div
                  key={sp.id}
                  className="flex cursor-pointer items-center justify-between px-6 py-3 transition-colors hover:bg-surface-50"
                  onClick={() => router.push(`/admin/sellpages/${sp.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-900">
                      {sp.titleOverride || sp.slug}
                    </p>
                    <p className="text-xs text-surface-500">/{sp.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        sp.status === 'PUBLISHED'
                          ? 'success'
                          : sp.status === 'ARCHIVED'
                            ? 'default'
                            : 'warning'
                      }
                    >
                      {sp.status}
                    </Badge>
                    <ExternalLink className="h-4 w-4 text-surface-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Store"
        description="Are you sure you want to delete this store? This action cannot be undone. All sellpages associated with this store may also be affected."
        size="sm"
      >
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">
            You are about to delete &quot;{store?.name}&quot;
          </p>
          <p className="mt-1 text-sm text-red-600">
            This will permanently remove the store and its configuration.
          </p>
        </div>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleting}
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={handleDelete}
          >
            Delete Store
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
