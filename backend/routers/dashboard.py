from fastapi import APIRouter
from collections import defaultdict
from backend.services.data_loader import (
    get_products, get_orders, get_customers,
    get_sales_summary, get_category_name, get_product_name
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary():
    products = get_products()
    orders = get_orders()
    customers = get_customers()
    sales_summary = get_sales_summary()

    # Calculate totals from completed orders only
    completed_orders = [o for o in orders if o["status"] == "completed"]
    cancelled_orders = [o for o in orders if o["status"] == "cancelled"]

    total_revenue = sum(o["total"] for o in completed_orders)
    avg_order_value = total_revenue / len(completed_orders) if completed_orders else 0

    # Calculate profit using product costs
    product_cost_map = {p["id"]: p["cost"] for p in products}
    total_cost = 0
    product_revenue = defaultdict(float)
    product_quantity = defaultdict(int)
    category_revenue = defaultdict(float)

    for order in completed_orders:
        for item in order["items"]:
            pid = item["product_id"]
            qty = item["quantity"]
            revenue = item["unit_price"] * qty
            cost = product_cost_map.get(pid, 0) * qty
            total_cost += cost
            product_revenue[pid] += revenue
            product_quantity[pid] += qty

            # Find category
            for p in products:
                if p["id"] == pid:
                    cat_name = get_category_name(p["category_id"])
                    category_revenue[cat_name] += revenue
                    break

    total_profit = total_revenue - total_cost

    # Top products by revenue
    top_products = sorted(product_revenue.items(), key=lambda x: x[1], reverse=True)[:10]
    top_products_list = []
    for pid, rev in top_products:
        pname = get_product_name(pid)
        qty = product_quantity[pid]
        cost = product_cost_map.get(pid, 0) * qty
        profit = rev - cost
        top_products_list.append({
            "product_id": pid,
            "name": pname,
            "revenue": round(rev, 2),
            "quantity_sold": qty,
            "profit": round(profit, 2),
        })

    # Category revenue
    cat_rev_list = [
        {"category": cat, "revenue": round(rev, 2)}
        for cat, rev in sorted(category_revenue.items(), key=lambda x: x[1], reverse=True)
    ]

    return {
        "total_revenue": round(total_revenue, 2),
        "total_profit": round(total_profit, 2),
        "total_orders": len(orders),
        "completed_orders": len(completed_orders),
        "cancelled_orders": len(cancelled_orders),
        "avg_order_value": round(avg_order_value, 2),
        "total_products": len(products),
        "total_customers": len(customers),
        "top_products": top_products_list,
        "monthly_sales": sales_summary,
        "category_revenue": cat_rev_list,
    }
