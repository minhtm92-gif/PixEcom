'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { ImageUpload } from '@/components/ui/image-upload';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import {
  Save,
  Building2,
  CreditCard,
  Scale,
  Users,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ---------- Types ----------

interface WorkspaceSettings {
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  timezone: string;
  logoUrl?: string;
  faviconUrl?: string;
  [key: string]: unknown;
}

interface PaymentProvider {
  id: string;
  providerType: string;
  displayName: string;
  isActive: boolean;
  credentials: Record<string, string>;
  createdAt: string;
}

interface NewProviderForm {
  providerType: 'stripe' | 'paypal' | 'tazapay';
  displayName: string;
  apiKey: string;
  secretKey: string;
  webhookSecret: string;
}

// ---------- Tabs Config ----------

const tabs = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'domains', label: 'Domains', icon: Globe },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'team', label: 'Team', icon: Users },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SGD', 'AUD', 'CAD', 'JPY', 'INR', 'MYR'];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
];

// ---------- Component ----------

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const router = useRouter();

  const handleTabClick = (tabId: string) => {
    if (tabId === 'domains') {
      router.push('/admin/settings/domains');
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="mt-1 text-sm text-surface-500">
          Manage your workspace and store settings
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-surface-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-surface-500 hover:border-surface-300 hover:text-surface-700'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'legal' && <LegalTab />}
        {activeTab === 'team' && <TeamTab />}
      </div>
    </div>
  );
}

// ========================================================================
// GENERAL TAB
// ========================================================================

function GeneralTab() {
  const [settings, setSettings] = useState<WorkspaceSettings>({
    brandName: '',
    supportEmail: '',
    supportPhone: '',
    defaultCurrency: 'USD',
    timezone: 'UTC',
    logoUrl: '',
    faviconUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiClient.get<WorkspaceSettings>('/settings');
        setSettings({
          brandName: data.brandName || '',
          supportEmail: data.supportEmail || '',
          supportPhone: data.supportPhone || '',
          defaultCurrency: data.defaultCurrency || 'USD',
          timezone: data.timezone || 'UTC',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load settings';
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await apiClient.patch('/settings', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="max-w-lg space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-200" />
                <div className="h-10 animate-pulse rounded bg-surface-100" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Configure your store brand, contact information, and regional preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-2xl space-y-6">
          {/* Brand Identity Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-200 dark:border-surface-700 pb-2">
              Brand Identity
            </h3>

            <Input
              label="Brand Name"
              placeholder="My Store"
              value={settings.brandName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, brandName: e.target.value }))
              }
            />

            <ImageUpload
              label="Logo"
              value={settings.logoUrl}
              onChange={(url) => setSettings((s) => ({ ...s, logoUrl: url }))}
              dimensions="400x400px"
              helpText="PNG, JPG or WebP. Max 2MB."
            />

            <ImageUpload
              label="Favicon"
              value={settings.faviconUrl}
              onChange={(url) => setSettings((s) => ({ ...s, faviconUrl: url }))}
              dimensions="32x32px or 64x64px"
              helpText="Shown in browser tabs. PNG or ICO format preferred."
            />
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-200 dark:border-surface-700 pb-2">
              Contact Information
            </h3>

            <Input
              label="Support Email"
              type="email"
              placeholder="support@example.com"
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings((s) => ({ ...s, supportEmail: e.target.value }))
              }
            />
            <Input
              label="Support Phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={settings.supportPhone}
              onChange={(e) =>
                setSettings((s) => ({ ...s, supportPhone: e.target.value }))
              }
            />
          </div>

          {/* Regional Settings Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-200 dark:border-surface-700 pb-2">
              Regional Settings
            </h3>

            {/* Currency select */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Default Currency
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, defaultCurrency: e.target.value }))
                }
                className="block w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-3 py-2.5 text-sm text-surface-900 dark:text-surface-100 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Timezone select */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, timezone: e.target.value }))
                }
                className="block w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-3 py-2.5 text-sm text-surface-900 dark:text-surface-100 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {success ? 'Saved!' : 'Save Changes'}
            </Button>
            {success && (
              <span className="text-sm text-green-600">Settings saved successfully</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ========================================================================
// PAYMENTS TAB
// ========================================================================

function PaymentsTab() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<PaymentProvider[]>('/payment-providers');
      setProviders(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load payment providers';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleToggleActive = async (provider: PaymentProvider) => {
    try {
      await apiClient.patch(`/payment-providers/${provider.id}`, {
        isActive: !provider.isActive,
      });
      setProviders((prev) =>
        prev.map((p) =>
          p.id === provider.id ? { ...p, isActive: !p.isActive } : p
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update provider';
      alert(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment provider?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/payment-providers/${id}`);
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete provider';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchProviders();
  };

  function maskCredential(value: string): string {
    if (!value || value.length <= 8) return '********';
    return value.slice(0, 4) + '****' + value.slice(-4);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-surface-200" />
                  <div className="h-4 w-48 animate-pulse rounded bg-surface-100" />
                </div>
                <div className="h-8 w-16 animate-pulse rounded bg-surface-100" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-800">{error}</p>
        <Button variant="secondary" size="sm" onClick={fetchProviders} className="ml-auto">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Payment Providers</h2>
          <p className="text-sm text-surface-500">
            Manage payment gateways for your store
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAddModal(true)}
        >
          Add Provider
        </Button>
      </div>

      {providers.length === 0 ? (
        <Card>
          <CardContent>
            <div className="py-8 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-surface-300" />
              <p className="mt-4 text-sm font-medium text-surface-900">
                No payment providers configured
              </p>
              <p className="mt-1 text-sm text-surface-500">
                Add a payment provider to start accepting payments
              </p>
              <Button
                className="mt-4"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowAddModal(true)}
              >
                Add Provider
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-surface-900">
                        {provider.displayName}
                      </h3>
                      <Badge variant={provider.isActive ? 'success' : 'default'}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="info">
                        {provider.providerType.charAt(0).toUpperCase() +
                          provider.providerType.slice(1)}
                      </Badge>
                    </div>

                    {/* Masked credentials */}
                    {provider.credentials && (
                      <div className="flex flex-wrap gap-4 text-xs text-surface-500">
                        {Object.entries(provider.credentials).map(([key, val]) => (
                          <span key={key}>
                            <span className="font-medium text-surface-600">
                              {key}:
                            </span>{' '}
                            {maskCredential(String(val))}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Active toggle */}
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={provider.isActive}
                        onChange={() => handleToggleActive(provider)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-surface-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-brand-600 peer-checked:after:translate-x-full" />
                    </label>
                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(provider.id)}
                      disabled={deletingId === provider.id}
                    >
                      {deletingId === provider.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Provider Modal */}
      <AddProviderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}

// ---------- Add Provider Modal ----------

function AddProviderModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<NewProviderForm>({
    providerType: 'stripe',
    displayName: '',
    apiKey: '',
    secretKey: '',
    webhookSecret: '',
  });
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/payment-providers', {
        providerType: form.providerType,
        displayName: form.displayName,
        credentials: {
          apiKey: form.apiKey,
          secretKey: form.secretKey,
          webhookSecret: form.webhookSecret,
        },
      });
      // Reset form
      setForm({
        providerType: 'stripe',
        displayName: '',
        apiKey: '',
        secretKey: '',
        webhookSecret: '',
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add provider';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Payment Provider"
      description="Configure a new payment gateway for your store"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Provider Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700">
            Provider Type
          </label>
          <select
            value={form.providerType}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                providerType: e.target.value as NewProviderForm['providerType'],
              }))
            }
            className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="tazapay">Tazapay</option>
          </select>
        </div>

        {/* Display Name */}
        <Input
          label="Display Name"
          placeholder="e.g. Stripe Live"
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          required
        />

        {/* Credentials */}
        <div className="space-y-3 rounded-lg border border-surface-200 bg-surface-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-surface-700">Credentials</p>
            <button
              type="button"
              onClick={() => setShowKeys(!showKeys)}
              className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-700"
            >
              {showKeys ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" /> Hide
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" /> Show
                </>
              )}
            </button>
          </div>
          <Input
            label="API Key"
            type={showKeys ? 'text' : 'password'}
            placeholder="pk_live_..."
            value={form.apiKey}
            onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
            required
          />
          <Input
            label="Secret Key"
            type={showKeys ? 'text' : 'password'}
            placeholder="sk_live_..."
            value={form.secretKey}
            onChange={(e) => setForm((f) => ({ ...f, secretKey: e.target.value }))}
            required
          />
          <Input
            label="Webhook Secret"
            type={showKeys ? 'text' : 'password'}
            placeholder="whsec_..."
            value={form.webhookSecret}
            onChange={(e) =>
              setForm((f) => ({ ...f, webhookSecret: e.target.value }))
            }
          />
        </div>

        <ModalFooter className="-mx-6 -mb-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            Add Provider
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ========================================================================
// LEGAL TAB
// ========================================================================

function LegalTab() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legal Policies</CardTitle>
        <CardDescription>
          Manage your store&apos;s legal policies and compliance documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-surface-600">
            Create and manage legal documents such as Terms of Service, Privacy Policy, Refund Policy, and more.
          </p>
          <Button onClick={() => router.push('/admin/settings/legal')}>
            Manage Legal Policies
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ========================================================================
// TEAM TAB (placeholder)
// ========================================================================

function TeamTab() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Management</CardTitle>
        <CardDescription>
          Invite and manage team members for your workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Invite team members, assign roles, and manage permissions for your workspace.
          </p>
          <Button onClick={() => router.push('/admin/settings/team')}>
            Manage Team Members
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
