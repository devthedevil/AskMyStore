import { Star, ShoppingCart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import { useCart } from "../hooks/useCart";
import { useState } from "react";

export default function StoreProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-xl hover:border-gray-200 transition-all duration-300">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-gray-50">
          {!imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
              <span className="text-4xl font-bold text-indigo-200">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
            <Eye className="w-4 h-4" />
            Quick View
          </span>
        </div>

        {/* Stock badge */}
        {product.stock_quantity < 20 && product.stock_quantity > 0 && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Low Stock
          </span>
        )}
        {product.stock_quantity === 0 && (
          <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Out of Stock
          </span>
        )}
        {product.rating >= 4.8 && (
          <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Bestseller
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <p className="text-xs text-indigo-600 font-medium mb-1">
            {product.category_name}
          </p>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200 fill-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {product.rating} ({product.reviews_count.toLocaleString()})
          </span>
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </p>
          <button
            onClick={handleAdd}
            disabled={product.stock_quantity === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              added
                ? "bg-emerald-500 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {added ? "Added!" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
