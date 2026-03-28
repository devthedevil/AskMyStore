from pydantic import BaseModel
from typing import Optional


class ReviewCreate(BaseModel):
    order_id: int
    customer_id: int
    product_id: int
    rating: int                        # 1–5
    title: str
    review_text: str
    has_return_request: bool = False
    return_reason: Optional[str] = None
    return_reason_details: Optional[str] = None


class Review(BaseModel):
    id: int
    order_id: int
    customer_id: int
    product_id: int
    rating: int
    title: str
    review_text: str
    review_date: str
    has_return_request: bool
    return_reason: Optional[str]
    return_reason_details: Optional[str]
    return_status: Optional[str]


class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]


class OrderItem(BaseModel):
    product_id: int
    quantity: int
    unit_price: float


class Product(BaseModel):
    id: int
    name: str
    category_id: int
    description: str
    price: float
    cost: float
    stock_quantity: int
    rating: float
    reviews_count: int


class Order(BaseModel):
    id: int
    customer_id: int
    order_date: str
    status: str
    items: list[OrderItem]
    total: float
    shipping_cost: float


class Category(BaseModel):
    id: int
    name: str
    description: str


class Customer(BaseModel):
    id: int
    name: str
    email: str
    city: str
    state: str
    join_date: str


class MonthlySales(BaseModel):
    month: str
    month_name: str
    total_revenue: float
    total_cost: float
    profit: float
    order_count: int
    cancelled_orders: int
    top_category: str
    avg_order_value: float


class DashboardSummary(BaseModel):
    total_revenue: float
    total_profit: float
    total_orders: int
    completed_orders: int
    cancelled_orders: int
    avg_order_value: float
    total_products: int
    total_customers: int
    top_products: list[dict]
    monthly_sales: list[dict]
    category_revenue: list[dict]
