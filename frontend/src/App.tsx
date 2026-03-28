import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./hooks/useCart";

// Layouts
import StoreLayout from "./layouts/StoreLayout";
import AdminLayout from "./layouts/AdminLayout";

// Consumer pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";

// Admin pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Consumer-facing store */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
          </Route>

          {/* Admin dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
