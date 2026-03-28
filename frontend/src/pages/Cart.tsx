import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Tag,
  Package,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useState } from "react";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } =
    useCart();
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5"
            >
              {/* Image */}
              <Link
                to={`/product/${item.product.id}`}
                className="w-28 h-28 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0"
              >
                {!imgErrors[item.product.id] ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={() =>
                      setImgErrors((prev) => ({
                        ...prev,
                        [item.product.id]: true,
                      }))
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                    <Package className="w-8 h-8 text-indigo-200" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-indigo-600 font-medium">
                      {item.product.category_name}
                    </p>
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between mt-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400">
                        ${item.product.price.toFixed(2)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-700 mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-emerald-600 font-medium" : "font-medium text-gray-900"}>
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span className="font-medium text-gray-900">
                  ${tax.toFixed(2)}
                </span>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                  Add ${(50 - totalPrice).toFixed(2)} more for free shipping!
                </p>
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button className="w-full mt-6 bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all">
              Proceed to Checkout
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Tag className="w-3.5 h-3.5" />
              <span>Secure checkout powered by AskMyStore</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
