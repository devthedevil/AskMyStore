import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import StoreProductCard from "../components/StoreProductCard";
import { getProducts } from "../services/api";
import type { Product } from "../types";

type SortOption = "featured" | "price-low" | "price-high" | "rating" | "name";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [showFilters, setShowFilters] = useState(false);

  const selectedCat = searchParams.get("cat") || "";
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category_name))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let result = products;

    if (selectedCat) {
      result = result.filter((p) => p.category_name === selectedCat);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category_name.toLowerCase().includes(q)
      );
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sort) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result = [...result].sort((a, b) => b.reviews_count - a.reviews_count);
    }

    return result;
  }, [products, selectedCat, searchQuery, sort, priceRange]);

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat) {
      params.set("cat", cat);
    } else {
      params.delete("cat");
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([0, 1500]);
    setSort("featured");
  };

  const hasActiveFilters = selectedCat || searchQuery || priceRange[0] > 0 || priceRange[1] < 1500;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedCat || "All Products"}
          </h1>
          <p className="text-gray-500 mt-1">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {searchQuery && (
              <span>
                {" "}matching "<strong>{searchQuery}</strong>"
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside
          className={`w-56 flex-shrink-0 space-y-6 ${
            showFilters ? "block" : "hidden lg:block"
          }`}
        >
          {/* Active Filters */}
          {hasActiveFilters && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Active Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedCat && (
                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                    {selectedCat}
                    <button onClick={() => setCategory("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                    "{searchQuery}"
                    <button onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete("search");
                      setSearchParams(params);
                    }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setCategory("")}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !selectedCat
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCat === cat
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                  <span className="text-gray-400 ml-1">
                    ({products.filter((p) => p.category_name === cat).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Price Range
            </h3>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="1500"
                step="50"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="w-full accent-indigo-600"
              />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span className="text-gray-300">&mdash;</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">No products found</p>
              <button
                onClick={clearFilters}
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
