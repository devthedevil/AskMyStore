export interface Product {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  description: string;
  price: number;
  cost: number;
  stock_quantity: number;
  rating: number;
  reviews_count: number;
  image: string;
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  order_date: string;
  status: string;
  items: OrderItem[];
  total: number;
  shipping_cost: number;
}

export interface MonthlySales {
  month: string;
  month_name: string;
  total_revenue: number;
  total_cost: number;
  profit: number;
  order_count: number;
  cancelled_orders: number;
  top_category: string;
  avg_order_value: number;
}

export interface TopProduct {
  product_id: number;
  name: string;
  revenue: number;
  quantity_sold: number;
  profit: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
}

export interface DashboardSummary {
  total_revenue: number;
  total_profit: number;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  avg_order_value: number;
  total_products: number;
  total_customers: number;
  top_products: TopProduct[];
  monthly_sales: MonthlySales[];
  category_revenue: CategoryRevenue[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  timestamp: Date;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}
