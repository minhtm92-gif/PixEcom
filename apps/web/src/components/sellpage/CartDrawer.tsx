'use client';

import { useCartStore } from '@/stores/cart-store';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore();

  const subtotal = totalPrice();
  const itemCount = totalItems();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-bold text-gray-900">
              Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500">Add items to get started</p>
              <button
                onClick={closeCart}
                className="mt-6 px-6 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upsell banner */}
              {itemCount >= 1 && (
                <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium text-center">
                  🎉 Add one more item and get <strong>15% OFF</strong> your order!
                </div>
              )}

              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                  {/* Image */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{item.name}</h4>
                    {item.variantLabel && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.variantLabel}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium border-x border-gray-300 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 self-start mt-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - only show if cart has items */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-5 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-base">
              <span className="text-gray-600">Subtotal ({itemCount} items)</span>
              <span className="font-bold text-gray-900 text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 -mt-2">Shipping and taxes calculated at checkout</p>

            {/* Checkout button */}
            <a
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center py-4 rounded-lg bg-black text-white font-bold text-base hover:bg-gray-800 transition-colors"
            >
              🔒 PROCEED TO SECURE CHECKOUT
            </a>

            {/* PayPal button */}
            <a
              href="/checkout?method=paypal"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#FFC439] hover:bg-[#F0B429] transition-colors"
            >
              <img
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                alt="PayPal"
                className="h-5"
              />
              <span className="font-bold text-[#003087] text-sm">Checkout with PayPal</span>
            </a>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>🔒</span>
              <span>Secure SSL encrypted checkout</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
