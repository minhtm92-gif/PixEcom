'use client';

const SESSION_KEY = 'pixecom_cart_session';
// Use relative /api path so requests go through nginx on the same domain
// This works for both custom domains (stretchactive.circlekar.com/api → port 3001)
// and the admin domain (pixecom.pixelxlab.com/api → port 3001)
const API_BASE = '/api';

// Get or create a persistent cart session ID (used as fallback for checkout)
export function getCartSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

// Add item to server cart (cart controller uses cookies for session)
export async function apiAddToCart(variantId: string, quantity: number, storeId?: string) {
  const res = await fetch(`${API_BASE}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // send/receive cart_session cookie
    body: JSON.stringify({ variantId, quantity, storeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to add to cart');
  }
  return res.json();
}

// Get cart from server
export async function apiGetCart() {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'GET',
    credentials: 'include', // send cart_session cookie
  });
  if (!res.ok) return { items: [], itemCount: 0, subtotal: 0 };
  const data = await res.json();
  return data?.data || data;
}

// Update cart item quantity
export async function apiUpdateCartItem(itemId: string, quantity: number) {
  const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error('Failed to update cart item');
  return res.json();
}

// Remove cart item
export async function apiRemoveCartItem(itemId: string) {
  const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to remove cart item');
  return res.json();
}

// Initiate checkout — pass sessionId as body fallback for checkout controller
// (checkout controller reads from body sessionId OR cookie cart_session)
export async function apiInitiateCheckout(data: {
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  sellpageId?: string;
  storeId?: string;
}) {
  const sessionId = getCartSessionId();
  const res = await fetch(`${API_BASE}/checkout/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ sessionId, ...data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to initiate checkout');
  }
  const result = await res.json();
  return result?.data || result;
}

// Update shipping address
export async function apiUpdateShipping(orderId: string, shippingAddress: {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}) {
  const res = await fetch(`${API_BASE}/checkout/${orderId}/shipping`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ shippingAddress }),
  });
  if (!res.ok) throw new Error('Failed to update shipping');
  const result = await res.json();
  return result?.data || result;
}

// Process payment
export async function apiProcessPayment(orderId: string, data: {
  paymentMethod: string;
  paymentToken?: string;
  returnUrl?: string;
}) {
  const res = await fetch(`${API_BASE}/checkout/${orderId}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to process payment');
  const result = await res.json();
  return result?.data || result;
}
