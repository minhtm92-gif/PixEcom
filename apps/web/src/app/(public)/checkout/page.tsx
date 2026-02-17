'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { apiInitiateCheckout, apiUpdateShipping, apiProcessPayment } from '@/lib/cart-session';
import { ShoppingBag, Lock, ChevronLeft, Check } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const subtotal = totalPrice();

  const [step, setStep] = useState<'info' | 'shipping' | 'payment' | 'done'>('info');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contact, setContact] = useState({ email: '', name: '', phone: '' });
  const [shipping, setShipping] = useState({
    fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US', phone: ''
  });
  const [payment, setPayment] = useState({ method: 'stripe', cardNumber: '', expiry: '', cvv: '', cardName: '' });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && step !== 'done') {
      router.back();
    }
  }, [items, step]);

  const shippingCost = 0; // Free shipping
  const total = subtotal + shippingCost;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await apiInitiateCheckout({
        customerEmail: contact.email,
        customerName: contact.name,
        customerPhone: contact.phone,
      });
      setOrderId(result.orderId);
      setOrderNumber(result.orderNumber);
      setStep('shipping');
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      await apiUpdateShipping(orderId, {
        fullName: shipping.fullName || contact.name,
        line1: shipping.line1,
        line2: shipping.line2 || undefined,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postalCode,
        country: shipping.country,
        phone: shipping.phone || contact.phone || undefined,
      });
      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Failed to save shipping. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      await apiProcessPayment(orderId, {
        paymentMethod: payment.method,
        paymentToken: payment.cardNumber ? `tok_${Date.now()}` : undefined,
      });
      clearCart();
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-1">Thank you for your purchase.</p>
          {orderNumber && (
            <p className="text-sm font-medium text-gray-500 mb-6">Order #{orderNumber}</p>
          )}
          <p className="text-sm text-gray-500 mb-8">
            A confirmation email has been sent to <strong>{contact.email}</strong>. We'll notify you when your order ships.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-lg bg-black text-white font-bold hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">Secure Checkout</h1>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Lock className="h-4 w-4 text-green-500" />
            <span>SSL Secured</span>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm">
          {[
            { key: 'info', label: 'Contact' },
            { key: 'shipping', label: 'Shipping' },
            { key: 'payment', label: 'Payment' },
          ].map((s, i) => {
            const steps = ['info', 'shipping', 'payment'];
            const currentIdx = steps.indexOf(step);
            const stepIdx = steps.indexOf(s.key);
            const isDone = stepIdx < currentIdx;
            const isActive = stepIdx === currentIdx;
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <div className="h-px w-6 bg-gray-300" />}
                <div className={`flex items-center gap-1.5 ${isActive ? 'text-black font-semibold' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-black text-white' : isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Step 1: Contact Info */}
          {step === 'info' && (
            <form onSubmit={handleContactSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={contact.email}
                  onChange={e => setContact({ ...contact, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={e => setContact({ ...contact, name: e.target.value })}
                  placeholder="John Smith"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={e => setContact({ ...contact, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Continue to Shipping →'}
              </button>
            </form>
          )}

          {/* Step 2: Shipping */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={shipping.fullName || contact.name}
                  onChange={e => setShipping({ ...shipping, fullName: e.target.value })}
                  placeholder="John Smith"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={shipping.line1}
                  onChange={e => setShipping({ ...shipping, line1: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={shipping.line2}
                  onChange={e => setShipping({ ...shipping, line2: e.target.value })}
                  placeholder="Apt, Suite, Unit (optional)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={e => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="New York"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={shipping.state}
                    onChange={e => setShipping({ ...shipping, state: e.target.value })}
                    placeholder="NY"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={shipping.postalCode}
                    onChange={e => setShipping({ ...shipping, postalCode: e.target.value })}
                    placeholder="10001"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select
                    value={shipping.country}
                    onChange={e => setShipping({ ...shipping, country: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="MY">Malaysia</option>
                    <option value="SG">Singapore</option>
                    <option value="ID">Indonesia</option>
                    <option value="PH">Philippines</option>
                    <option value="TH">Thailand</option>
                    <option value="VN">Vietnam</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Continue to Payment →'}
              </button>
            </form>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>

              {/* Payment method tabs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPayment({ ...payment, method: 'stripe' })}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${payment.method === 'stripe' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-sm font-semibold">💳 Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayment({ ...payment, method: 'paypal' })}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${payment.method === 'paypal' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-5" />
                  <span className="text-sm font-semibold text-[#003087]">PayPal</span>
                </button>
              </div>

              {/* Stripe card fields */}
              {payment.method === 'stripe' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card *</label>
                    <input
                      type="text"
                      required
                      value={payment.cardName}
                      onChange={e => setPayment({ ...payment, cardName: e.target.value })}
                      placeholder="John Smith"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                    <input
                      type="text"
                      required
                      value={payment.cardNumber}
                      onChange={e => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry *</label>
                      <input
                        type="text"
                        required
                        value={payment.expiry}
                        onChange={e => setPayment({ ...payment, expiry: e.target.value })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                      <input
                        type="text"
                        required
                        value={payment.cvv}
                        onChange={e => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="123"
                        maxLength={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal info */}
              {payment.method === 'paypal' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 text-center">
                  You'll be redirected to PayPal to complete your payment securely.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                {loading ? 'Processing Payment...' : `Pay $${total.toFixed(2)}`}
              </button>

              <div className="flex items-center justify-center gap-3 text-xs text-gray-400 pt-2">
                <span>🔒 256-bit SSL</span>
                <span>•</span>
                <span>Secured Payment</span>
                <span>•</span>
                <span>PCI Compliant</span>
              </div>
            </form>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Free shipping banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium text-center mb-4">
              🎉 You qualify for FREE shipping!
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">{item.name}</p>
                    {item.variantLabel && <p className="text-xs text-gray-400 mt-0.5">{item.variantLabel}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-3 mt-3">
                <span>Total</span>
                <span className="text-lg">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading checkout...</div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
