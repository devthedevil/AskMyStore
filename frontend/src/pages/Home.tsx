import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Star,
  Sparkles,
} from "lucide-react";
import StoreProductCard from "../components/StoreProductCard";
import { getProducts } from "../services/api";
import type { Product } from "../types";

const CATEGORY_IMAGES: Record<string, string> = {
  Electronics:
    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop",
  Clothing:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
  "Home & Kitchen":
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
  "Sports & Outdoors":
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop",
  Books:
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
  "Beauty & Personal Care":
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
  "Toys & Games":
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop",
  "Grocery & Gourmet":
    "https://images.unsplash.com/photo-1543168256-418811576931?w=400&h=300&fit=crop",
};

const PERKS = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
  { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Headphones, title: "AI Support", desc: "24/7 RAG assistant" },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.rating >= 4.7).slice(0, 8);
  const bestDeals = [...products]
    .sort((a, b) => (b.price - b.cost) / b.price - (a.price - a.cost) / a.price)
    .slice(0, 4);
  const categories = [...new Set(products.map((p) => p.category_name))];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Shopping Experience
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Shop Smarter with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                AI Analytics
              </span>
            </h1>
            <p className="text-lg text-indigo-100 mb-8 leading-relaxed max-w-lg">
              Discover 40+ curated products across 8 categories. Ask our
              AI assistant anything about products, prices, and trends.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <perk.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{perk.title}</p>
                <p className="text-xs text-gray-500">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <p className="text-gray-500 mt-1">Browse our curated collections</p>
          </div>
          <Link
            to="/shop"
            className="text-indigo-600 font-medium text-sm flex items-center gap-1 hover:text-indigo-700"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/shop?cat=${encodeURIComponent(cat)}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <img
                src={CATEGORY_IMAGES[cat] || ""}
                alt={cat}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-white font-semibold text-lg">{cat}</h3>
                <p className="text-white/70 text-sm">
                  {products.filter((p) => p.category_name === cat).length} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                Featured Products
              </h2>
              <p className="text-gray-500 mt-1">Top-rated picks for you</p>
            </div>
            <Link
              to="/shop"
              className="text-indigo-600 font-medium text-sm flex items-center gap-1 hover:text-indigo-700"
            >
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Value */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Best Value</h2>
            <p className="text-gray-500 mt-1">
              Highest margin products &mdash; great value for money
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestDeals.map((product) => (
            <StoreProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 md:p-14 text-center">
          <Sparkles className="w-10 h-10 text-indigo-200 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">
            Have Questions? Ask Our AI Assistant
          </h2>
          <p className="text-indigo-200 max-w-md mx-auto mb-6">
            Click the chat button in the bottom-right corner to ask about
            products, prices, sales trends, and more.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
