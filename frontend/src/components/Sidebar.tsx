import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Bot,
  Store,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AskMyStore</h1>
            <p className="text-xs text-gray-400">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
            end={item.to === "/admin"}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="font-medium">View Store</span>
          </Link>
        </div>
      </nav>

      {/* RAG Info */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-400">
              AI Assistant
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Powered by RAG with FAISS vector search & Claude AI. Click the chat
            button to ask questions.
          </p>
        </div>
      </div>
    </aside>
  );
}
