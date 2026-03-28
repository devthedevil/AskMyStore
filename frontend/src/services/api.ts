import axios from "axios";
import type {
  Product,
  Order,
  DashboardSummary,
  ChatResponse,
  Category,
  Review,
  ReviewCreate,
} from "../types";

const api = axios.create({
  baseURL: "/api",
});

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get("/products/");
  return data;
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get("/categories/");
  return data;
}

export async function getOrders(limit = 50): Promise<Order[]> {
  const { data } = await api.get(`/orders/?limit=${limit}`);
  return data;
}

export async function getDashboard(): Promise<DashboardSummary> {
  const { data } = await api.get("/dashboard/summary");
  return data;
}

export async function sendChatMessage(query: string): Promise<ChatResponse> {
  const { data } = await api.post("/chat/", { query });
  return data;
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export async function getProductReviews(productId: number): Promise<Review[]> {
  const { data } = await api.get(`/reviews/?product_id=${productId}`);
  return data;
}

export async function getOrderReviews(orderId: number): Promise<Review[]> {
  const { data } = await api.get(`/reviews/?order_id=${orderId}`);
  return data;
}

export async function submitReview(payload: ReviewCreate): Promise<Review> {
  const { data } = await api.post("/reviews/", payload);
  return data;
}
