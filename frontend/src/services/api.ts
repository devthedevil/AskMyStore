import axios from "axios";
import type { Product, Order, DashboardSummary, ChatResponse, Category } from "../types";

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
