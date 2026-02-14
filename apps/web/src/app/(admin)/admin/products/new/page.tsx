'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { apiClient, ApiClientError } from '@/lib/api-client';
import {
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

// --- Types ---

interface CreateProductPayload {
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  currency: string;
  sku?: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE';
  tags?: string[];
}

interface CreatedProduct {
  id: string;
  name: string;
  slug: string;
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
];

// --- Component ---

export default function NewProductPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [basePrice, setBasePrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [tags, setTags] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Handle name change to auto-generate slug
  function handleNameChange(value: string) {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(value);
  }

  // Validate form
  function validate(): boolean {
    const errors: Record<string, string[]> = {};

    if (!name.trim()) {
      errors.name = ['Product name is required'];
    }
    if (!slug.trim()) {
      errors.slug = ['Slug is required'];
    }
    if (!basePrice || isNaN(parseFloat(basePrice)) || parseFloat(basePrice) < 0) {
      errors.basePrice = ['A valid base price is required'];
    }
    if (compareAtPrice && (isNaN(parseFloat(compareAtPrice)) || parseFloat(compareAtPrice) < 0)) {
      errors.compareAtPrice = ['Compare at price must be a valid number'];
    }
    if (costPrice && (isNaN(parseFloat(costPrice)) || parseFloat(costPrice) < 0)) {
      errors.costPrice = ['Cost price must be a valid number'];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const payload: CreateProductPayload = {
        name: name.trim(),
        slug: slug.trim(),
        basePrice: parseFloat(basePrice),
        currency,
        status: status as 'DRAFT' | 'ACTIVE',
      };

      if (compareAtPrice) {
        payload.compareAtPrice = parseFloat(compareAtPrice);
      }
      if (costPrice) {
        payload.costPrice = parseFloat(costPrice);
      }
      if (sku.trim()) {
        payload.sku = sku.trim();
      }
      if (description.trim()) {
        payload.description = description.trim();
      }
      if (tags.trim()) {
        payload.tags = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }

      const result = await apiClient.post<CreatedProduct>('/products', payload);
      router.push(`/admin/products/${result.id}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        if (err.errors) {
          setFieldErrors(err.errors);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">New Product</h1>
          <p className="mt-1 text-sm text-surface-500">
            Add a new product to your catalog
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content - Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  The core details of your product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Product Name"
                    placeholder="e.g. Premium Wireless Headphones"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    error={fieldErrors.name?.[0]}
                    required
                  />
                  <Input
                    label="Slug"
                    placeholder="premium-wireless-headphones"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    error={fieldErrors.slug?.[0]}
                    hint="URL-friendly identifier. Auto-generated from name."
                  />
                  <Textarea
                    label="Description"
                    placeholder="Describe your product..."
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
                <CardDescription>
                  Set the pricing details for your product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Base Price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
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
                    placeholder="0.00"
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
                    placeholder="0.00"
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
                <div className="space-y-4">
                  <Input
                    label="SKU"
                    placeholder="e.g. WH-PRO-001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    error={fieldErrors.sku?.[0]}
                    hint="Stock Keeping Unit"
                  />
                  <Input
                    label="Tags"
                    placeholder="electronics, wireless, audio"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    hint="Comma-separated tags"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-surface-200 pt-6">
          <Link href="/admin/products">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
