'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft } from 'lucide-react';

const POLICY_TYPES = [
  { value: 'terms_of_service', label: 'Terms of Service' },
  { value: 'privacy_policy', label: 'Privacy Policy' },
  { value: 'refund_policy', label: 'Refund Policy' },
  { value: 'shipping_policy', label: 'Shipping Policy' },
  { value: 'cookie_policy', label: 'Cookie Policy' },
];

export default function EditLegalPolicyPage() {
  const params = useParams();
  const router = useRouter();
  const { workspace } = useAuthStore();
  const { success, error } = useToast();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    policyType: 'terms_of_service',
    bodyHtml: '',
    isActive: true,
  });

  useEffect(() => {
    if (!isNew && params.id) {
      loadPolicy();
    }
  }, [params.id, isNew]);

  const loadPolicy = async () => {
    try {
      const data = await apiClient.get<any>(`/legal-policies/${params.id}`);
      setFormData({
        title: data.title,
        slug: data.slug,
        policyType: data.policyType,
        bodyHtml: data.bodyHtml,
        isActive: data.isActive,
      });
    } catch (err) {
      error('Failed to load policy');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: isNew && !prev.slug ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isNew) {
        await apiClient.post('/legal-policies', {
          ...formData,
          workspaceId: workspace?.id,
        });
        success('Policy created successfully');
      } else {
        await apiClient.patch(`/legal-policies/${params.id}`, formData);
        success('Policy updated successfully');
      }
      router.push('/admin/settings/legal');
    } catch (err: any) {
      error(err.message || 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-surface-500">Loading policy...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {isNew ? 'Create Legal Policy' : 'Edit Legal Policy'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Policy'}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Policy Type
          </label>
          <Select
            value={formData.policyType}
            onChange={(e) =>
              setFormData({ ...formData, policyType: e.target.value })
            }
            options={POLICY_TYPES}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Title
          </label>
          <Input
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., Terms of Service"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Slug
          </label>
          <Input
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value })
            }
            placeholder="e.g., terms-of-service"
            required
          />
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            URL: /legal/{formData.slug || '[slug]'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Content
          </label>
          <RichTextEditor
            value={formData.bodyHtml}
            onChange={(value) =>
              setFormData({ ...formData, bodyHtml: value })
            }
            height={500}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
          />
          <label
            htmlFor="isActive"
            className="text-sm text-surface-700 dark:text-surface-300"
          >
            Active (visible to customers)
          </label>
        </div>
      </div>
    </form>
  );
}
