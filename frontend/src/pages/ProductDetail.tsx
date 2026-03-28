import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Package,
} from "lucide-react";
import { getProduct, getProducts } from "../services/api";
import { useCart } from "../hooks/useCart";
import StoreProductCard from "../components/StoreProductCard";
import type { Product } from "../types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setImgError(false);
    setQuantity(1);
    setAdded(false);

    Promise.all([getProduct(Number(id)), getProducts()])
      .then(([prod, all]) => {
        setProduct(prod);
        setRelated(
          all
            .filter(
              (p) =>
                p.category_id === prod.category_id && p.id !== prod.id
            )
            .slice(0, 4)
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-gray-500 text-lg">Product not found</p>
        <Link to="/shop" className="text-indigo-600 font-medium mt-4 inline-block">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const inStock = product.stock_quantity > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-indigo-600">Shop</Link>
        <span>/</span>
        <Link
          to={`/shop?cat=${encodeURIComponent(product.category_name)}`}
          className="hover:text-indigo-600"
        >
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      {/* Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-50 aspect-square">
          {!imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
              <Package className="w-24 h-24 text-indigo-200" />
            </div>
          )}
          {product.rating >= 4.8 && (
            <span className="absolute top-4 right-4 bg-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
              Bestseller
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-indigo-600 font-medium text-sm mb-2">
            {product.category_name}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {product.rating}
            </span>
            <span className="text-sm text-gray-500">
              ({product.reviews_count.toLocaleString()} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-sm text-emerald-600 mt-1 font-medium">
              Free shipping on orders over $50
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {inStock ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">
                  In Stock ({product.stock_quantity} available)
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-rose-600">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock_quantity, quantity + 1))
                }
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 ${
                added
                  ? "bg-emerald-500"
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ShoppingCart className="w-5 h-5" />
              {added ? "Added to Cart!" : "Add to Cart"}
            </button>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
            <div className="text-center">
              <Truck className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">Free Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">Secure Payment</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">30-Day Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <StoreProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
