from fastapi import APIRouter
from backend.services.data_loader import get_orders, get_customer_name, get_product_name

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/")
def list_orders(status: str = None, limit: int = 50):
    orders = get_orders()
    result = []
    for o in orders:
        if status and o["status"] != status:
            continue
        enriched_items = []
        for item in o["items"]:
            enriched_items.append({
                **item,
                "product_name": get_product_name(item["product_id"])
            })
        result.append({
            **o,
            "customer_name": get_customer_name(o["customer_id"]),
            "items": enriched_items
        })
    # Sort by date descending
    result.sort(key=lambda x: x["order_date"], reverse=True)
    return result[:limit]


@router.get("/stats")
def order_stats():
    orders = get_orders()
    total = len(orders)
    completed = sum(1 for o in orders if o["status"] == "completed")
    cancelled = sum(1 for o in orders if o["status"] == "cancelled")
    processing = sum(1 for o in orders if o["status"] == "processing")
    shipped = sum(1 for o in orders if o["status"] == "shipped")
    return {
        "total_orders": total,
        "completed": completed,
        "cancelled": cancelled,
        "processing": processing,
        "shipped": shipped,
    }
