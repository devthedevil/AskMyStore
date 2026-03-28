import { Store, Bot } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Shop<span className="text-indigo-400">RAG</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              An AI-powered e-commerce platform with a built-in RAG assistant.
              Ask questions about products, sales, revenue, and trends using
              natural language.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Powered by FAISS Vector Search & Claude AI</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-indigo-400 transition-colors">All Products</Link></li>
              <li><Link to="/shop?cat=Electronics" className="hover:text-indigo-400 transition-colors">Electronics</Link></li>
              <li><Link to="/shop?cat=Clothing" className="hover:text-indigo-400 transition-colors">Clothing</Link></li>
              <li><Link to="/shop?cat=Books" className="hover:text-indigo-400 transition-colors">Books</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/admin" className="hover:text-indigo-400 transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/admin/products" className="hover:text-indigo-400 transition-colors">Product Management</Link></li>
              <li><Link to="/admin/orders" className="hover:text-indigo-400 transition-colors">Order Management</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          AskMyStore &mdash; Single Agent RAG E-Commerce Application &mdash; Built with FastAPI, React, FAISS & Claude AI
        </div>
      </div>
    </footer>
  );
}
