'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

interface StoreOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewSellpagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [form, setForm] = useState({
    storeId: '',
    productId: '',
    slug: '',
    titleOverride: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  async function fetchStores() {
    try {
      setLoadingStores(true);
      const result = await apiClient.get<{ data?: StoreOption[] } | StoreOption[]>('/stores');
      const items = Array.isArray(result) ? result : (result.data || []);
      setStores(items);
    } catch {
      // Stores will remain empty
    } finally {
      setLoadingStores(false);
    }
  }

  async function fetchProducts() {
    try {
      setLoadingProducts(true);
      const result = await apiClient.get<{ data?: ProductOption[] } | ProductOption[]>('/products');
      const items = Array.isArray(result) ? result : (result.data || []);
      setProducts(items);
    } catch {
      // Products will remain empty
    } finally {
      setLoadingProducts(false);
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug from product name when product changes
      if (field === 'productId') {
        const product = products.find((p) => p.id === value);
        if (product && (prev.slug === '' || prev.slug === slugify(getProductNameById(prev.productId)))) {
          next.slug = slugify(product.name);
        }
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function getProductNameById(id: string): string {
    const product = products.find((p) => p.id === id);
    return product?.name || '';
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.storeId) newErrors.storeId = 'Please select a store';
    if (!form.productId) newErrors.productId = 'Please select a product';
    if (!form.slug.trim()) newErrors.slug = 'Slug is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setErrors({});
      // Default sections for new sellpage
      const defaultSections = [
        {
          type: 'announcement-bar',
          text: '🎉 Limited Time Offer - Free Shipping on Orders Over $50!',
          backgroundColor: '#95be61',
          textColor: '#ffffff',
        },
        {
          type: 'product-hero',
          price: 0,
          images: [],
          showClearanceBadge: true,
          showCountdownTimer: true,
          tieredDiscountText: 'ADD 2 ITEMS TO CART TO GET 71% OFF',
          rating: 4.9,
          reviewCount: 0,
        },
        {
          type: 'social-proof',
          viewerCount: 210,
          purchaseCount: 2346,
          showLiveCounter: true,
        },
        {
          type: 'product-benefits',
          title: 'Why Choose This Product?',
          benefits: [
            {
              icon: '🔒',
              title: 'Secure & Durable',
              description: 'Premium materials built to last',
            },
            {
              icon: '✨',
              title: 'Handcrafted Quality',
              description: 'Made with attention to detail',
            },
            {
              icon: '🌟',
              title: 'Perfect Gift',
              description: 'Loved by thousands of customers',
            },
          ],
          backgroundColor: '#f7f7f7',
        },
        {
          type: 'reviews-section',
          title: 'Customer Reviews',
          showRatingDistribution: true,
        },
      ];

      const sellpage = await apiClient.post<{ id: string }>('/sellpages', {
        storeId: form.storeId,
        productId: form.productId,
        slug: form.slug.trim(),
        titleOverride: form.titleOverride.trim() || undefined,
        status: form.status,
        sections: defaultSections,
      });
      router.push(`/admin/sellpages/${sellpage.id}`);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(err.errors)) {
          fieldErrors[key] = messages[0] || 'Invalid value';
        }
        setErrors(fieldErrors);
      } else {
        const message = err instanceof Error ? err.message : 'Failed to create sellpage';
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
          onClick={() => router.push('/admin/sellpages')}
          className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
          aria-label="Back to sellpages"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Create Sellpage</h1>
          <p className="mt-1 text-sm text-surface-500">
            Set up a new product landing page
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

        {/* Store & Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Store & Product</CardTitle>
            <CardDescription>
              Select which store and product this sellpage is for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Store Select */}
              <div className="w-full">
                <label
                  htmlFor="store-select"
                  className="mb-1.5 block text-sm font-medium text-surface-700"
                >
                  Store <span className="text-red-500">*</span>
                </label>
                <select
                  id="store-select"
                  value={form.storeId}
                  onChange={(e) => updateField('storeId', e.target.value)}
                  disabled={loadingStores}
                  className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-surface-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-surface-50 disabled:text-surface-500 ${
                    errors.storeId ? 'border-red-500' : 'border-surface-300'
                  }`}
                >
                  <option value="">
                    {loadingStores ? 'Loading stores...' : 'Select a store'}
                  </option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                {errors.storeId && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.storeId}</p>
                )}
              </div>

              {/* Product Select */}
              <div className="w-full">
                <label
                  htmlFor="product-select"
                  className="mb-1.5 block text-sm font-medium text-surface-700"
                >
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  id="product-select"
                  value={form.productId}
                  onChange={(e) => updateField('productId', e.target.value)}
                  disabled={loadingProducts}
                  className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-surface-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-surface-50 disabled:text-surface-500 ${
                    errors.productId ? 'border-red-500' : 'border-surface-300'
                  }`}
                >
                  <option value="">
                    {loadingProducts ? 'Loading products...' : 'Select a product'}
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {errors.productId && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.productId}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page Details */}
        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
            <CardDescription>
              Configure the sellpage slug and display options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Slug"
                placeholder="my-product-page"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                error={errors.slug}
                hint="URL path for this sellpage (e.g., /my-product-page)"
                required
              />
              <Input
                label="Title Override"
                placeholder="Custom page title (optional)"
                value={form.titleOverride}
                onChange={(e) => updateField('titleOverride', e.target.value)}
                error={errors.titleOverride}
                hint="Leave empty to use the product name as the page title"
              />
              <div className="w-full">
                <label
                  htmlFor="status-select"
                  className="mb-1.5 block text-sm font-medium text-surface-700"
                >
                  Status
                </label>
                <select
                  id="status-select"
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
                <p className="mt-1.5 text-sm text-surface-500">
                  Draft sellpages are not visible to the public
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/sellpages')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={saving}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Create Sellpage
          </Button>
        </div>
      </form>
    </div>
  );
}
