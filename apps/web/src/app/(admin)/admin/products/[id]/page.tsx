'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { apiClient, ApiClientError } from '@/lib/api-client';
import {
  ArrowLeft,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Package,
  X,
  Pencil,
  Check,
  Loader2,
  ExternalLink,
  Star,
} from 'lucide-react';
import { BulkImageUploader } from '@/components/products/BulkImageUploader';

// --- Types ---

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  priceOverride: number | string | null;
  stock: number;
  stockQuantity?: number;
  options: Record<string, string> | null;
  createdAt: string;
}

interface Media {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  position: number;
  isPrimary: boolean;
}

interface Sellpage {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number | string;
  compareAtPrice: number | string | null;
  costPrice: number | string | null;
  currency: string;
  sku: string | null;
  description: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  variants: Variant[];
  media: Media[];
  sellpages?: Sellpage[];
  _count?: { variants: number; sellpages: number; orderItems: number };
  createdAt: string;
}

// --- Helpers ---

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatPrice(price: number | string, currency: string = 'USD'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(numPrice);
}

function toNumberString(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return '';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '';
  return String(n);
}

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
];

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const statusVariantMap: Record<string, 'success' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  DRAFT: 'warning',
  ARCHIVED: 'default',
};

// --- Loading Skeleton ---

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 rounded-lg bg-surface-200" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-surface-200" />
          <div className="h-4 w-32 rounded bg-surface-200" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-64 rounded-xl bg-surface-200" />
          <div className="h-48 rounded-xl bg-surface-200" />
        </div>
        <div className="space-y-6">
          <div className="h-32 rounded-xl bg-surface-200" />
          <div className="h-40 rounded-xl bg-surface-200" />
        </div>
      </div>
    </div>
  );
}

// --- Component ---

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // Product data
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Delete product
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Variant state
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [newVariantOptions, setNewVariantOptions] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [newVariantSku, setNewVariantSku] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantStock, setNewVariantStock] = useState('0');
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editVariantName, setEditVariantName] = useState('');
  const [editVariantSku, setEditVariantSku] = useState('');
  const [editVariantPrice, setEditVariantPrice] = useState('');
  const [editVariantStock, setEditVariantStock] = useState('');
  const [isSavingVariant, setIsSavingVariant] = useState(false);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);

  // Media state
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaAlt, setNewMediaAlt] = useState('');
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  // General action error
  const [actionError, setActionError] = useState<string | null>(null);

  // --- Fetch product ---
  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await apiClient.get<Product>(`/products/${productId}`);
      setProduct(result);
      // Populate form
      setName(result.name);
      setSlug(result.slug);
      setBasePrice(toNumberString(result.basePrice));
      setCompareAtPrice(toNumberString(result.compareAtPrice));
      setCostPrice(toNumberString(result.costPrice));
      setCurrency(result.currency || 'USD');
      setSku(result.sku || '');
      setDescription(result.description || '');
      setStatus(result.status);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setLoadError(err.message);
      } else {
        setLoadError('Failed to load product. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Clear success message after delay
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // --- Save product ---
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    setFieldErrors({});

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        slug: slug.trim(),
        basePrice: parseFloat(basePrice),
        currency,
        status,
      };

      if (compareAtPrice) {
        payload.compareAtPrice = parseFloat(compareAtPrice);
      } else {
        payload.compareAtPrice = null;
      }
      if (costPrice) {
        payload.costPrice = parseFloat(costPrice);
      } else {
        payload.costPrice = null;
      }
      payload.sku = sku.trim() || null;
      payload.description = description.trim() || null;

      const result = await apiClient.patch<Product>(`/products/${productId}`, payload);
      setProduct(result);
      setSaveSuccess(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setSaveError(err.message);
        if (err.errors) setFieldErrors(err.errors);
      } else {
        setSaveError('Failed to save changes.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  // --- Delete product ---
  async function handleDeleteProduct() {
    setIsDeletingProduct(true);
    setActionError(null);
    try {
      await apiClient.delete(`/products/${productId}`);
      // Show success message briefly before redirect
      alert('Product deleted successfully');
      router.push('/admin/products');
    } catch (err) {
      console.error('Delete error:', err);
      if (err instanceof ApiClientError) {
        setActionError(err.message);
      } else {
        setActionError('Failed to delete product. Please try again.');
      }
      setIsDeletingProduct(false);
      setShowDeleteModal(false);
    }
  }

  // --- Variant handlers ---
  async function handleAddVariant() {
    // Validate at least one option is filled
    const validOptions = newVariantOptions.filter(opt => opt.key.trim() && opt.value.trim());
    if (validOptions.length === 0) {
      setActionError('Please add at least one variant option (e.g., Size: Large)');
      return;
    }

    setIsAddingVariant(true);
    setActionError(null);
    try {
      // Build options object
      const optionsObj: Record<string, string> = {};
      validOptions.forEach(opt => {
        optionsObj[opt.key.trim()] = opt.value.trim();
      });

      // Generate display name from options
      const displayName = validOptions.map(opt => opt.value.trim()).join(' / ');

      const payload: Record<string, unknown> = {
        name: displayName,
        options: optionsObj,
        stock: parseInt(newVariantStock, 10) || 0,
      };
      if (newVariantSku.trim()) payload.sku = newVariantSku.trim();
      if (newVariantPrice) payload.priceOverride = parseFloat(newVariantPrice);

      await apiClient.post(`/products/${productId}/variants`, payload);
      // Reset form and refresh
      setNewVariantOptions([{ key: '', value: '' }]);
      setNewVariantSku('');
      setNewVariantPrice('');
      setNewVariantStock('0');
      setShowAddVariant(false);
      fetchProduct();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setActionError(err.message);
      } else {
        setActionError('Failed to add variant.');
      }
    } finally {
      setIsAddingVariant(false);
    }
  }

  function startEditVariant(variant: Variant) {
    setEditingVariantId(variant.id);
    setEditVariantName(variant.name);
    setEditVariantSku(variant.sku || '');
    setEditVariantPrice(toNumberString(variant.priceOverride));
    setEditVariantStock(String(variant.stock));
  }

  function cancelEditVariant() {
    setEditingVariantId(null);
  }

  async function handleSaveVariant(variantId: string) {
    setIsSavingVariant(true);
    setActionError(null);
    try {
      const payload: Record<string, unknown> = {
        name: editVariantName.trim(),
        stock: parseInt(editVariantStock, 10) || 0,
      };
      payload.sku = editVariantSku.trim() || null;
      payload.priceOverride = editVariantPrice ? parseFloat(editVariantPrice) : null;

      await apiClient.patch(`/products/${productId}/variants/${variantId}`, payload);
      setEditingVariantId(null);
      fetchProduct();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setActionError(err.message);
      } else {
        setActionError('Failed to update variant.');
      }
    } finally {
      setIsSavingVariant(false);
    }
  }

  async function handleDeleteVariant(variantId: string) {
    setDeletingVariantId(variantId);
    setActionError(null);
    try {
      await apiClient.delete(`/products/${productId}/variants/${variantId}`);
      fetchProduct();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setActionError(err.message);
      } else {
        setActionError('Failed to delete variant.');
      }
    } finally {
      setDeletingVariantId(null);
    }
  }

  // --- Media handlers ---
  async function handleAddMedia() {
    if (!newMediaUrl.trim()) return;
    setIsAddingMedia(true);
    setActionError(null);
    try {
      const payload: Record<string, unknown> = {
        url: newMediaUrl.trim(),
      };
      if (newMediaAlt.trim()) payload.altText = newMediaAlt.trim();

      await apiClient.post(`/products/${productId}/media`, payload);
      setNewMediaUrl('');
      setNewMediaAlt('');
      fetchProduct();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setActionError(err.message);
      } else {
        setActionError('Failed to add media.');
      }
    } finally {
      setIsAddingMedia(false);
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    setDeletingMediaId(mediaId);
    setActionError(null);
    try {
      await apiClient.delete(`/products/${productId}/media/${mediaId}`);
      fetchProduct();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setActionError(err.message);
      } else {
        setActionError('Failed to delete media.');
      }
    } finally {
      setDeletingMediaId(null);
    }
  }

  // --- Render ---

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900">Product</h1>
        </div>
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">Failed to load product</p>
                <p className="mt-1 text-sm text-surface-500">{loadError}</p>
              </div>
              <Button size="sm" onClick={fetchProduct}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-900">{product.name}</h1>
              <Badge variant={statusVariantMap[product.status] || 'default'}>
                {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-surface-500">
              Created {new Date(product.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${productId}/reviews`}>
            <Button
              variant="secondary"
              leftIcon={<Star className="h-4 w-4" />}
            >
              Manage Reviews
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Success / Error Banners */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span>Product saved successfully.</span>
        </div>
      )}
      {(saveError || actionError) && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{saveError || actionError}</span>
          <button
            onClick={() => { setSaveError(null); setActionError(null); }}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content - Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={fieldErrors.name?.[0]}
                    required
                  />
                  <Input
                    label="Slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    error={fieldErrors.slug?.[0]}
                    hint="URL-friendly identifier"
                  />
                  <Textarea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    error={fieldErrors.description?.[0]}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Base Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    error={fieldErrors.basePrice?.[0]}
                    required
                  />
                  <Input
                    label="Compare at Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    error={fieldErrors.compareAtPrice?.[0]}
                    hint="Original price before discount"
                  />
                  <Input
                    label="Cost Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    error={fieldErrors.costPrice?.[0]}
                    hint="Your cost to produce/acquire"
                  />
                  <Select
                    label="Currency"
                    options={currencyOptions}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Variants</CardTitle>
                    <CardDescription>
                      Manage sizes, colors, and other product options
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => setShowAddVariant(!showAddVariant)}
                  >
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Add Variant Form */}
                {showAddVariant && (
                  <div className="mb-4 rounded-lg border border-surface-200 bg-surface-50 p-4">
                    <h4 className="mb-3 text-sm font-medium text-surface-900">New Variant</h4>

                    {/* Variant Options (Key-Value Pairs) */}
                    <div className="mb-4">
                      <label className="mb-2 block text-xs font-medium text-surface-700">
                        Variant Options
                      </label>
                      <div className="space-y-2">
                        {newVariantOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Option name (e.g. Size, Color)"
                              value={option.key}
                              onChange={(e) => {
                                const updated = [...newVariantOptions];
                                updated[index].key = e.target.value;
                                setNewVariantOptions(updated);
                              }}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Value (e.g. Large, Red)"
                              value={option.value}
                              onChange={(e) => {
                                const updated = [...newVariantOptions];
                                updated[index].value = e.target.value;
                                setNewVariantOptions(updated);
                              }}
                              className="flex-1"
                            />
                            {newVariantOptions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = newVariantOptions.filter((_, i) => i !== index);
                                  setNewVariantOptions(updated);
                                }}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewVariantOptions([...newVariantOptions, { key: '', value: '' }])}
                        className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
                      >
                        + Add Another Option
                      </button>
                      <p className="mt-1 text-xs text-surface-500">
                        Example: Size = Large, Color = Blue
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="SKU"
                        placeholder="e.g. WH-PRO-001-L"
                        value={newVariantSku}
                        onChange={(e) => setNewVariantSku(e.target.value)}
                      />
                      <Input
                        label="Price Override"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Leave empty to use base price"
                        value={newVariantPrice}
                        onChange={(e) => setNewVariantPrice(e.target.value)}
                      />
                      <Input
                        label="Stock"
                        type="number"
                        min="0"
                        value={newVariantStock}
                        onChange={(e) => setNewVariantStock(e.target.value)}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setShowAddVariant(false);
                          setNewVariantOptions([{ key: '', value: '' }]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddVariant}
                        isLoading={isAddingVariant}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                {/* Variants Table */}
                {product.variants.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="mx-auto h-8 w-8 text-surface-300" />
                    <p className="mt-2 text-sm text-surface-500">No variants yet</p>
                    <p className="text-xs text-surface-400">
                      Add variants for different sizes, colors, or configurations
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-surface-200">
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase text-surface-500">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase text-surface-500">
                            SKU
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase text-surface-500">
                            Price
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase text-surface-500">
                            Stock
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium uppercase text-surface-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-100">
                        {product.variants.map((variant) => (
                          <tr key={variant.id}>
                            {editingVariantId === variant.id ? (
                              <>
                                <td className="px-3 py-2">
                                  <Input
                                    value={editVariantName}
                                    onChange={(e) => setEditVariantName(e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    value={editVariantSku}
                                    onChange={(e) => setEditVariantSku(e.target.value)}
                                    className="h-8 text-xs"
                                    placeholder="-"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editVariantPrice}
                                    onChange={(e) => setEditVariantPrice(e.target.value)}
                                    className="h-8 text-xs"
                                    placeholder="Base"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={editVariantStock}
                                    onChange={(e) => setEditVariantStock(e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveVariant(variant.id)}
                                      disabled={isSavingVariant}
                                      className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                                    >
                                      {isSavingVariant ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditVariant}
                                      className="rounded p-1 text-surface-400 hover:bg-surface-100"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 py-2 text-sm text-surface-900">
                                  <div>{variant.name}</div>
                                  {variant.options && Object.keys(variant.options).length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {Object.entries(variant.options).map(([key, value]) => (
                                        <span
                                          key={key}
                                          className="inline-flex items-center rounded bg-surface-100 px-2 py-0.5 text-xs text-surface-600"
                                        >
                                          <span className="font-medium">{key}:</span>
                                          <span className="ml-1">{value}</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm text-surface-500">
                                  {variant.sku || '-'}
                                </td>
                                <td className="px-3 py-2 text-sm text-surface-700">
                                  {variant.priceOverride
                                    ? formatPrice(variant.priceOverride, currency)
                                    : 'Base'}
                                </td>
                                <td className="px-3 py-2 text-sm text-surface-700">
                                  {variant.stockQuantity ?? variant.stock ?? 0}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => startEditVariant(variant)}
                                      className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVariant(variant.id)}
                                      disabled={deletingVariantId === variant.id}
                                      className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >
                                      {deletingVariantId === variant.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload multiple images at once. Drag to reorder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkImageUploader
                  productId={productId}
                  existingMedia={product.media.map(m => ({
                    id: m.id,
                    url: m.url,
                    altText: m.altText,
                    isPrimary: m.isPrimary,
                    position: m.position || m.displayOrder || 0,
                  }))}
                  onUploadComplete={() => fetchProduct()}
                  onReorder={async (mediaIds) => {
                    try {
                      await apiClient.put(`/products/${productId}/media/reorder`, { mediaIds });
                      await fetchProduct();
                    } catch (error) {
                      console.error('Failed to reorder media:', error);
                    }
                  }}
                  onDelete={async (mediaId) => {
                    try {
                      await apiClient.delete(`/products/${productId}/media/${mediaId}`);
                      await fetchProduct();
                    } catch (error) {
                      console.error('Failed to delete media:', error);
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  label="Product Status"
                  options={statusOptions}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  label="SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  error={fieldErrors.sku?.[0]}
                  hint="Stock Keeping Unit"
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500">Variants</span>
                    <span className="font-medium text-surface-900">
                      {product.variants.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500">Total Stock</span>
                    <span className="font-medium text-surface-900">
                      {product.variants.reduce((sum, v) => sum + (v.stockQuantity ?? v.stock ?? 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500">Media</span>
                    <span className="font-medium text-surface-900">
                      {product.media.length}
                    </span>
                  </div>
                  {product._count && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-500">Sell Pages</span>
                        <span className="font-medium text-surface-900">
                          {product._count.sellpages}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-500">Orders</span>
                        <span className="font-medium text-surface-900">
                          {product._count.orderItems}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sell Pages */}
            {product.sellpages && product.sellpages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sell Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {product.sellpages.map((sp) => (
                      <div
                        key={sp.id}
                        className="flex items-center justify-between rounded-lg border border-surface-200 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-surface-900">
                            {sp.title}
                          </p>
                          <p className="truncate text-xs text-surface-500">/{sp.slug}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 text-surface-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Danger Zone */}
            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-surface-500">
                  Permanently delete this product and all associated data including variants,
                  media, and sell pages.
                </p>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="w-full"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Product
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
        size="sm"
      >
        <p className="text-sm text-surface-600">
          Are you sure you want to permanently delete{' '}
          <span className="font-medium text-surface-900">{product.name}</span>?
          This will also delete all variants, media, and associated sell pages.
          This action cannot be undone.
        </p>
        <ModalFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeletingProduct}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteProduct}
            isLoading={isDeletingProduct}
          >
            Delete Permanently
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
