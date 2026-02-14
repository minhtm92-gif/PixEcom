'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Truck,
} from 'lucide-react';

// ---------- Types ----------

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

interface OrderItem {
  id: string;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  paidAt: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  notes: string | null;
  shippingAddress: ShippingAddress | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// ---------- Constants ----------

const ALL_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

const statusBadgeVariant: Record<OrderStatus, 'warning' | 'info' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'default',
};

const STATUS_FLOW: Record<OrderStatus, string> = {
  PENDING: 'Order placed, awaiting confirmation',
  CONFIRMED: 'Order confirmed by admin',
  PROCESSING: 'Order is being prepared',
  SHIPPED: 'Order has been shipped',
  DELIVERED: 'Order delivered to customer',
  CANCELLED: 'Order was cancelled',
  REFUNDED: 'Order was refunded',
};

// ---------- Helpers ----------

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------- Component ----------

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [notes, setNotes] = useState('');

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Order>(`/orders/${orderId}`);
      setOrder(data);
      setStatus(data.status);
      setTrackingNumber(data.trackingNumber || '');
      setTrackingUrl(data.trackingUrl || '');
      setNotes(data.notes || '');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load order';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await apiClient.patch<Order>(`/orders/${orderId}`, {
        status,
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
        notes: notes || null,
      });
      setOrder(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save changes';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Loading / Error states ----------

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded bg-surface-200" />
          <div className="h-6 w-48 animate-pulse rounded bg-surface-200" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-surface-100" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-4 animate-pulse rounded bg-surface-100" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/admin/orders')}
          className="flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load order</p>
            <p className="text-sm text-red-600">{error || 'Order not found'}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchOrder} className="ml-auto">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const addr = order.shippingAddress;

  // ---------- Render ----------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="flex items-center justify-center rounded-lg border border-surface-200 p-2 text-surface-600 transition-colors hover:bg-surface-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-900">
                {order.orderNumber}
              </h1>
              <Badge variant={statusBadgeVariant[order.status]}>
                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-surface-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          isLoading={saving}
          leftIcon={<Save className="h-4 w-4" />}
        >
          {saveSuccess ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {/* Success banner */}
      {saveSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Changes saved successfully.
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN — Order Items + Status Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-surface-400" />
                  Order Items
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                        Product
                      </th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
                        SKU
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500">
                        Qty
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500">
                        Unit Price
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3">
                          <p className="text-sm font-medium text-surface-900">
                            {item.productName}
                          </p>
                          {item.variantName && (
                            <p className="text-xs text-surface-500">
                              {item.variantName}
                            </p>
                          )}
                        </td>
                        <td className="py-3 text-sm text-surface-500">
                          {item.sku || '—'}
                        </td>
                        <td className="py-3 text-right text-sm text-surface-700">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right text-sm text-surface-700">
                          {formatCurrency(item.unitPrice, order.currency)}
                        </td>
                        <td className="py-3 text-right text-sm font-medium text-surface-900">
                          {formatCurrency(item.totalPrice, order.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-4 border-t border-surface-200 pt-4">
                <div className="flex flex-col items-end gap-1">
                  <div className="flex w-64 justify-between text-sm">
                    <span className="text-surface-500">Subtotal</span>
                    <span className="text-surface-700">
                      {formatCurrency(order.subtotal, order.currency)}
                    </span>
                  </div>
                  <div className="flex w-64 justify-between text-sm">
                    <span className="text-surface-500">Shipping</span>
                    <span className="text-surface-700">
                      {formatCurrency(order.shippingCost, order.currency)}
                    </span>
                  </div>
                  {(order.discount ?? 0) > 0 && (
                    <div className="flex w-64 justify-between text-sm">
                      <span className="text-surface-500">Discount</span>
                      <span className="text-green-600">
                        -{formatCurrency(order.discount, order.currency)}
                      </span>
                    </div>
                  )}
                  {(order.tax ?? 0) > 0 && (
                    <div className="flex w-64 justify-between text-sm">
                      <span className="text-surface-500">Tax</span>
                      <span className="text-surface-700">
                        {formatCurrency(order.tax, order.currency)}
                      </span>
                    </div>
                  )}
                  <div className="mt-1 flex w-64 justify-between border-t border-surface-200 pt-2 text-base font-semibold">
                    <span className="text-surface-900">Total</span>
                    <span className="text-surface-900">
                      {formatCurrency(order.total, order.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update + Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-surface-400" />
                  Status &amp; Tracking
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status select */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">
                    Order Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tracking fields — shown when status is SHIPPED or beyond */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Tracking Number"
                    placeholder="e.g. 1Z999AA10123456784"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                  <Input
                    label="Tracking URL"
                    placeholder="https://tracking.example.com/..."
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-700">
                    Internal Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add internal notes about this order..."
                    className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-surface-400" />
                  Order Timeline
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ALL_STATUSES.map((s) => {
                  const isActive = s === order.status;
                  const isPast =
                    ALL_STATUSES.indexOf(s) <= ALL_STATUSES.indexOf(order.status);
                  // Skip cancelled/refunded from the normal flow unless it IS the status
                  if (
                    (s === 'CANCELLED' || s === 'REFUNDED') &&
                    s !== order.status
                  ) {
                    return null;
                  }

                  return (
                    <div key={s} className="flex items-start gap-3">
                      <div
                        className={cn(
                          'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
                          isActive
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : isPast
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-surface-300 bg-white text-surface-300'
                        )}
                      >
                        {isPast || isActive ? (
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-surface-300" />
                        )}
                      </div>
                      <div>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            isPast || isActive
                              ? 'text-surface-900'
                              : 'text-surface-400'
                          )}
                        >
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                        </p>
                        <p
                          className={cn(
                            'text-xs',
                            isPast || isActive
                              ? 'text-surface-500'
                              : 'text-surface-300'
                          )}
                        >
                          {STATUS_FLOW[s]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN — Customer, Shipping, Payment */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-surface-400" />
                  Customer
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase text-surface-400">Name</p>
                  <p className="text-sm text-surface-900">
                    {order.customerName || 'Guest Customer'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-surface-400">Email</p>
                  <p className="text-sm text-surface-900">{order.customerEmail}</p>
                </div>
                {order.customerPhone && (
                  <div>
                    <p className="text-xs font-medium uppercase text-surface-400">Phone</p>
                    <p className="text-sm text-surface-900">{order.customerPhone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-surface-400" />
                  Shipping Address
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addr ? (
                <div className="text-sm text-surface-700 leading-relaxed">
                  {addr.firstName || addr.lastName ? (
                    <p className="font-medium text-surface-900">
                      {[addr.firstName, addr.lastName].filter(Boolean).join(' ')}
                    </p>
                  ) : null}
                  {addr.address1 && <p>{addr.address1}</p>}
                  {addr.address2 && <p>{addr.address2}</p>}
                  {(addr.city || addr.state || addr.postalCode) && (
                    <p>
                      {[addr.city, addr.state].filter(Boolean).join(', ')}
                      {addr.postalCode ? ` ${addr.postalCode}` : ''}
                    </p>
                  )}
                  {addr.country && <p>{addr.country}</p>}
                  {addr.phone && (
                    <p className="mt-2 text-surface-500">{addr.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-surface-400">No shipping address provided</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-surface-400" />
                  Payment
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase text-surface-400">Method</p>
                  <p className="text-sm text-surface-900">
                    {order.paymentMethod || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-surface-400">Status</p>
                  <p className="text-sm text-surface-900">
                    {order.paidAt
                      ? `Paid on ${formatDate(order.paidAt)}`
                      : order.paymentStatus || 'Unpaid'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-surface-400">Amount</p>
                  <p className="text-lg font-semibold text-surface-900">
                    {formatCurrency(order.total, order.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
