import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, Store, Search } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StoreNavbar() {
  const { totalItems } = useCart();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Ask<span className="text-indigo-600">MyStore</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Category nav */}
        <nav className="flex items-center gap-1 py-2 overflow-x-auto -mx-1">
          {[
            { to: "/shop", label: "All Products" },
            { to: "/shop?cat=Electronics", label: "Electronics" },
            { to: "/shop?cat=Clothing", label: "Clothing" },
            { to: "/shop?cat=Home+%26+Kitchen", label: "Home & Kitchen" },
            { to: "/shop?cat=Sports+%26+Outdoors", label: "Sports" },
            { to: "/shop?cat=Books", label: "Books" },
            { to: "/shop?cat=Beauty+%26+Personal+Care", label: "Beauty" },
            { to: "/shop?cat=Toys+%26+Games", label: "Toys" },
            { to: "/shop?cat=Grocery+%26+Gourmet", label: "Grocery" },
          ].map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive && item.to === "/shop"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
              end={item.to === "/shop"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
