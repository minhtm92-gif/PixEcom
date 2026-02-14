'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewStorePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    slug: '',
    primaryDomain: '',
    brandColor: '#6366f1',
    currency: 'USD',
    logoUrl: '',
  });

  function updateField(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug from name
      if (field === 'name' && (prev.slug === '' || prev.slug === slugify(prev.name))) {
        next.slug = slugify(value);
      }
      return next;
    });
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) {
      newErrors.name = 'Store name is required';
    }
    if (!form.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!form.primaryDomain.trim()) {
      newErrors.primaryDomain = 'Primary domain is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setErrors({});
      const store = await apiClient.post<{ id: string }>('/stores', {
        name: form.name.trim(),
        slug: form.slug.trim(),
        primaryDomain: form.primaryDomain.trim(),
        brandColor: form.brandColor,
        currency: form.currency,
        logoUrl: form.logoUrl.trim() || undefined,
      });
      router.push(`/admin/stores/${store.id}`);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(err.errors)) {
          fieldErrors[key] = messages[0] || 'Invalid value';
        }
        setErrors(fieldErrors);
      } else {
        const message = err instanceof Error ? err.message : 'Failed to create store';
        setErrors({ _form: message });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/stores')}
          className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
          aria-label="Back to stores"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Create Store</h1>
          <p className="mt-1 text-sm text-surface-500">
            Set up a new storefront
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* General Error */}
        {errors._form && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors._form}
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
                error={errors.name}
                required
              />
              <Input
                label="Slug"
                placeholder="my-awesome-store"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                error={errors.slug}
                hint="URL-friendly identifier for this store"
              />
              <Input
                label="Primary Domain"
                placeholder="store.example.com"
                value={form.primaryDomain}
                onChange={(e) => updateField('primaryDomain', e.target.value)}
                error={errors.primaryDomain}
                hint="The main domain where this store is accessible"
                required
              />
              <Input
                label="Logo URL"
                placeholder="https://example.com/logo.png"
                value={form.logoUrl}
                onChange={(e) => updateField('logoUrl', e.target.value)}
                error={errors.logoUrl}
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

        {/* Actions */}
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
            Create Store
          </Button>
        </div>
      </form>
    </div>
  );
}
