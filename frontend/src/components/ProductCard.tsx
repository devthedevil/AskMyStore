import { Star, Package } from "lucide-react";
import type { Product } from "../types";
import { useState } from "react";

const categoryColors: Record<string, string> = {
  Electronics: "bg-blue-100 text-blue-700",
  Clothing: "bg-pink-100 text-pink-700",
  "Home & Kitchen": "bg-amber-100 text-amber-700",
  "Sports & Outdoors": "bg-green-100 text-green-700",
  Books: "bg-purple-100 text-purple-700",
  "Beauty & Personal Care": "bg-rose-100 text-rose-700",
  "Toys & Games": "bg-orange-100 text-orange-700",
  "Grocery & Gourmet": "bg-emerald-100 text-emerald-700",
};

export default function ProductCard({ product }: { product: Product }) {
  const margin = (((product.price - product.cost) / product.price) * 100).toFixed(1);
  const colorClass = categoryColors[product.category_name] || "bg-gray-100 text-gray-700";
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group">
      {/* Product image */}
      <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-gray-50">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
            <Package className="w-12 h-12 text-indigo-300" />
          </div>
        )}
      </div>

      {/* Category badge */}
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${colorClass} mb-2`}>
        {product.category_name}
      </span>

      {/* Product info */}
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
        {product.name}
      </h3>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
        {product.description}
      </p>

      {/* Price and margin */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">
            Cost: ${product.cost.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-emerald-600">{margin}%</p>
          <p className="text-xs text-gray-400">margin</p>
        </div>
      </div>

      {/* Rating and stock */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-gray-400">
            ({product.reviews_count.toLocaleString()})
          </span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            product.stock_quantity > 100
              ? "bg-emerald-50 text-emerald-700"
              : product.stock_quantity > 0
              ? "bg-amber-50 text-amber-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {product.stock_quantity} in stock
        </span>
      </div>
    </div>
  );
}
