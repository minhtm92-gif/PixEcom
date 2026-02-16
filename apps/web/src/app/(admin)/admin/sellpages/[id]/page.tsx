'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { ImageUpload } from '@/components/ui/image-upload';
import { apiClient, ApiClientError } from '@/lib/api-client';
import {
  Save,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Globe,
  Eye,
  EyeOff,
  Code,
  Search as SearchIcon,
  ExternalLink,
  Wand2,
} from 'lucide-react';
import { PreviewLinkModal } from '@/components/sellpages/PreviewLinkModal';
import { TemplateSelectorModal } from '@/components/sellpages/TemplateSelectorModal';
import { SellpageActions } from '@/components/sellpages/SellpageActions';
import { UTMLinkGenerator } from '@/components/sellpages/UTMLinkGenerator';
import { SellpageBuilder } from '@/components/sellpage/SellpageBuilder';
import { SectionData } from '@/components/sellpage/SectionRenderer';
import { SellpageTemplate } from '@/lib/templates';

interface SellpageData {
  id: string;
  slug: string;
  titleOverride?: string;
  descriptionOverride?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  storeId: string;
  productId: string;
  store?: { id: string; name: string; slug: string; primaryDomain: string };
  product?: { id: string; name: string; basePrice?: number; media?: any[] };
  storeName?: string;
  productName?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoOgImage?: string;
  logoUrl?: string;
  faviconUrl?: string;
  sections?: SectionData[];
  createdAt?: string;
  updatedAt?: string;
}

const statusVariant = {
  DRAFT: 'warning' as const,
  PUBLISHED: 'success' as const,
  ARCHIVED: 'default' as const,
};

export default function EditSellpagePage() {
  const router = useRouter();
  const params = useParams();
  const sellpageId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [sellpage, setSellpage] = useState<SellpageData | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'design' | 'seo' | 'marketing'>('details');
  const [pageSections, setPageSections] = useState<SectionData[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  const [form, setForm] = useState({
    slug: '',
    titleOverride: '',
    descriptionOverride: '',
    status: 'DRAFT',
    seoTitle: '',
    seoDescription: '',
    seoOgImage: '',
    logoUrl: '',
    faviconUrl: '',
  });

  useEffect(() => {
    fetchSellpage();
  }, [sellpageId]);

  async function fetchSellpage() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<SellpageData>(`/sellpages/${sellpageId}`);
      setSellpage(data);
      setPageSections(data.sections || []);
      setForm({
        slug: data.slug || '',
        titleOverride: data.titleOverride || '',
        descriptionOverride: data.descriptionOverride || '',
        status: data.status || 'DRAFT',
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        seoOgImage: data.seoOgImage || '',
        logoUrl: data.logoUrl || '',
        faviconUrl: data.faviconUrl || '',
      });

      // Fetch product and reviews if productId exists
      if (data.productId) {
        try {
          const productData = await apiClient.get<any>(`/products/${data.productId}`);
          setProduct(productData);

          const reviewsData = await apiClient.get<any[]>(`/products/${data.productId}/reviews`);
          setReviews(reviewsData.filter((r: any) => r.isVisible));
        } catch (err) {
          console.error('Failed to load product/reviews:', err);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load sellpage';
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
    if (!form.slug.trim()) newErrors.slug = 'Slug is required';
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setFieldErrors({});
      await apiClient.patch(`/sellpages/${sellpageId}`, {
        slug: form.slug.trim(),
        titleOverride: form.titleOverride.trim() || undefined,
        descriptionOverride: form.descriptionOverride.trim() || undefined,
        status: form.status,
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
        seoOgImage: form.seoOgImage.trim() || undefined,
      });
      await fetchSellpage();
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.errors) {
        const errs: Record<string, string> = {};
        for (const [key, messages] of Object.entries(err.errors)) {
          errs[key] = messages[0] || 'Invalid value';
        }
        setFieldErrors(errs);
      } else {
        const message = err instanceof Error ? err.message : 'Failed to save sellpage';
        setFieldErrors({ _form: message });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish() {
    if (!sellpage) return;

    try {
      setPublishing(true);

      // Determine target status based on current status
      const targetStatus: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' =
        sellpage.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

      // Send status in request body
      await apiClient.patch(`/sellpages/${sellpageId}/publish`, {
        status: targetStatus
      });

      await fetchSellpage();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to toggle publish status';
      setFieldErrors({ _form: message });
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      await apiClient.delete(`/sellpages/${sellpageId}`);
      router.push('/admin/sellpages');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete sellpage';
      setFieldErrors({ _form: message });
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaveSections(sections: SectionData[]) {
    try {
      await apiClient.patch(`/sellpages/${sellpageId}/sections`, { sections });
      setPageSections(sections);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save sections';
      setFieldErrors({ _form: message });
    }
  }

  async function handleApplyTemplate(template: SellpageTemplate) {
    try {
      const newSections = template.sections.map((section, index) => ({
        ...section,
        position: index,
      }));
      await apiClient.patch(`/sellpages/${sellpageId}/sections`, { sections: newSections });
      setPageSections(newSections);
      setShowTemplateModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to apply template';
      setFieldErrors({ _form: message });
    }
  }

  function getStoreName(): string {
    return sellpage?.store?.name || sellpage?.storeName || 'Unknown Store';
  }

  function getProductName(): string {
    return sellpage?.product?.name || sellpage?.productName || 'Unknown Product';
  }

  function getDisplayTitle(): string {
    return sellpage?.titleOverride || sellpage?.slug || 'Untitled';
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
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-1/3 rounded bg-surface-200" />
                  <div className="h-10 w-full rounded bg-surface-100" />
                  <div className="h-10 w-full rounded bg-surface-100" />
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
            onClick={() => router.push('/admin/sellpages')}
            className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            aria-label="Back to sellpages"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-surface-900">Edit Sellpage</h1>
        </div>
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
              <p className="text-sm font-medium text-surface-900">
                Failed to load sellpage
              </p>
              <p className="mt-1 text-sm text-surface-500">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={fetchSellpage}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPublished = sellpage?.status === 'PUBLISHED';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/sellpages')}
            className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            aria-label="Back to sellpages"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-900">
                {getDisplayTitle()}
              </h1>
              <Badge variant={statusVariant[sellpage?.status || 'DRAFT']}>
                {sellpage?.status || 'DRAFT'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-surface-500">
              {getStoreName()} &middot; {getProductName()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Sellpage Actions (Copy, View, QR, UTM) */}
          {sellpage && (
            <SellpageActions
              sellpageId={sellpage.id}
              slug={sellpage.slug}
              storeSlug={sellpage.store?.slug}
              storeDomain={sellpage.store?.primaryDomain}
              status={sellpage.status}
            />
          )}

          <div className="mx-2 h-6 w-px bg-surface-200 dark:bg-surface-700" />

          <Button
            variant="outline"
            leftIcon={<ExternalLink className="h-4 w-4" />}
            onClick={() => setShowPreviewModal(true)}
          >
            Generate Preview Link
          </Button>
          <Button
            variant={isPublished ? 'secondary' : 'outline'}
            isLoading={publishing}
            leftIcon={
              isPublished ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )
            }
            onClick={handleTogglePublish}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </Button>
          <Button
            variant="danger"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-surface-200 dark:border-surface-700">
        <nav className="-mb-px flex gap-6">
          {[
            { id: 'details', label: 'Details' },
            { id: 'design', label: 'Page Design' },
            { id: 'marketing', label: 'Marketing' },
            { id: 'seo', label: 'SEO' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-surface-500 hover:border-surface-300 hover:text-surface-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* General Error */}
      {fieldErrors._form && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fieldErrors._form}
        </div>
      )}

      {/* Tab Content: Details */}
      {activeTab === 'details' && (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          {/* Page Details */}
        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
            <CardDescription>
              Configure the sellpage content and display
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Input
                label="Slug"
                placeholder="my-product-page"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                error={fieldErrors.slug}
                hint="URL path for this sellpage"
                required
              />
              <Input
                label="Title Override"
                placeholder="Custom page title (optional)"
                value={form.titleOverride}
                onChange={(e) => updateField('titleOverride', e.target.value)}
                error={fieldErrors.titleOverride}
                hint="Leave empty to use the product name"
              />
              <div className="w-full">
                <label
                  htmlFor="description-override"
                  className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300"
                >
                  Description Override
                </label>
                <textarea
                  id="description-override"
                  rows={3}
                  value={form.descriptionOverride}
                  onChange={(e) => updateField('descriptionOverride', e.target.value)}
                  placeholder="Custom description for this sellpage (optional)"
                  className="block w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-3 py-2.5 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">
                  Leave empty to use the product description
                </p>
              </div>

              {/* Branding Section */}
              <div className="border-t border-surface-200 dark:border-surface-700 pt-4 space-y-4">
                <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                  Branding Override
                </h4>
                <p className="text-sm text-surface-500 dark:text-surface-400 -mt-2">
                  Customize logo and favicon for this sellpage. Leave empty to use workspace defaults.
                </p>

                <ImageUpload
                  label="Logo Override"
                  value={form.logoUrl}
                  onChange={(url) => updateField('logoUrl', url)}
                  dimensions="400x400px"
                  helpText="Override the workspace logo for this sellpage only. PNG, JPG or WebP. Max 2MB."
                />

                <ImageUpload
                  label="Favicon Override"
                  value={form.faviconUrl}
                  onChange={(url) => updateField('faviconUrl', url)}
                  dimensions="32x32px or 64x64px"
                  helpText="Override the workspace favicon for this sellpage only. PNG or ICO format preferred."
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="status-select"
                  className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300"
                >
                  Status
                </label>
                <select
                  id="status-select"
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="block w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-3 py-2.5 text-sm text-surface-900 dark:text-surface-100 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
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
            Save Changes
          </Button>
        </div>
        </form>
      )}

      {/* Tab Content: Page Design */}
      {activeTab === 'design' && product && (
        <div className="space-y-6">
          {/* Template Selector Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              leftIcon={<Wand2 className="h-4 w-4" />}
              onClick={() => setShowTemplateModal(true)}
            >
              Choose Template
            </Button>
          </div>

          <SellpageBuilder
            initialSections={pageSections}
            product={product}
            reviews={reviews}
            onChange={handleSaveSections}
          />
        </div>
      )}

      {/* Tab Content: Marketing */}
      {activeTab === 'marketing' && sellpage && (
        <div className="max-w-4xl space-y-6">
          {/* UTM Link Generator */}
          <UTMLinkGenerator
            baseUrl={
              sellpage.store?.primaryDomain
                ? `https://${sellpage.store.primaryDomain}/${sellpage.slug}`
                : sellpage.store?.slug
                ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${sellpage.store.slug}/${sellpage.slug}`
                : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/preview/${sellpage.id}`
            }
          />
        </div>
      )}

      {/* Tab Content: SEO */}
      {activeTab === 'seo' && (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <SearchIcon className="h-5 w-5 text-surface-400" />
                SEO Settings
              </div>
            </CardTitle>
            <CardDescription>
              Optimize how this page appears in search engines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="SEO Title"
                placeholder="Page title for search engines"
                value={form.seoTitle}
                onChange={(e) => updateField('seoTitle', e.target.value)}
                error={fieldErrors.seoTitle}
                hint={`${form.seoTitle.length}/60 characters recommended`}
              />
              <div className="w-full">
                <label
                  htmlFor="seo-description"
                  className="mb-1.5 block text-sm font-medium text-surface-700"
                >
                  SEO Description
                </label>
                <textarea
                  id="seo-description"
                  rows={3}
                  value={form.seoDescription}
                  onChange={(e) => updateField('seoDescription', e.target.value)}
                  placeholder="Meta description for search engines"
                  className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <p className="mt-1.5 text-sm text-surface-500">
                  {form.seoDescription.length}/160 characters recommended
                </p>
              </div>
              <Input
                label="OG Image URL"
                placeholder="https://example.com/og-image.jpg"
                value={form.seoOgImage}
                onChange={(e) => updateField('seoOgImage', e.target.value)}
                error={fieldErrors.seoOgImage}
                hint="Image shown when the page is shared on social media (1200x630px recommended)"
              />

              {/* SEO Preview */}
              {(form.seoTitle || form.seoDescription) && (
                <div className="rounded-lg border border-surface-200 bg-surface-50 p-4">
                  <p className="text-xs font-medium uppercase text-surface-400">
                    Search Preview
                  </p>
                  <div className="mt-2">
                    <p className="text-base font-medium text-blue-700">
                      {form.seoTitle || form.titleOverride || form.slug || 'Page Title'}
                    </p>
                    <p className="text-xs text-green-700">
                      example.com/{form.slug}
                    </p>
                    <p className="mt-1 text-sm text-surface-600 line-clamp-2">
                      {form.seoDescription || 'No description provided.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
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
            Save Changes
          </Button>
        </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Sellpage"
        description="Are you sure you want to delete this sellpage? This action cannot be undone."
        size="sm"
      >
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">
            You are about to delete &quot;{getDisplayTitle()}&quot;
          </p>
          <p className="mt-1 text-sm text-red-600">
            This will permanently remove the sellpage and all its configuration.
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
            Delete Sellpage
          </Button>
        </ModalFooter>
      </Modal>

      {/* Preview Link Modal */}
      <PreviewLinkModal
        sellpageId={sellpageId as string}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
      />

      {/* Template Selector Modal */}
      <TemplateSelectorModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleApplyTemplate}
      />
    </div>
  );
}
