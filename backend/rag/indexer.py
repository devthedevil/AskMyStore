import numpy as np
import faiss
from collections import defaultdict
from sentence_transformers import SentenceTransformer
from backend.services.data_loader import (
    get_products, get_categories, get_orders, get_customers, get_sales_summary,
    get_reviews, get_category_name, get_customer_name, get_product_name
)
from backend.config.settings import settings


def _build_product_chunks(products: list[dict]) -> list[dict]:
    chunks = []
    for p in products:
        cat_name = get_category_name(p["category_id"])
        margin = round(((p["price"] - p["cost"]) / p["price"]) * 100, 1)
        profit_per_unit = round(p["price"] - p["cost"], 2)
        text = (
            f"Product: {p['name']}. "
            f"Category: {cat_name}. "
            f"Price: ${p['price']:.2f}. "
            f"Cost: ${p['cost']:.2f}. "
            f"Profit per unit: ${profit_per_unit}. "
            f"Profit margin: {margin}%. "
            f"Rating: {p['rating']}/5 with {p['reviews_count']} reviews. "
            f"Stock: {p['stock_quantity']} units available. "
            f"Description: {p['description']}."
        )
        chunks.append({
            "text": text,
            "source_type": "product",
            "source_id": f"product-{p['id']}",
            "source_name": p["name"]
        })
    return chunks


def _build_category_chunks(categories: list[dict], products: list[dict]) -> list[dict]:
    chunks = []
    for cat in categories:
        cat_products = [p for p in products if p["category_id"] == cat["id"]]
        avg_price = sum(p["price"] for p in cat_products) / len(cat_products) if cat_products else 0
        avg_margin = sum(((p["price"] - p["cost"]) / p["price"]) * 100 for p in cat_products) / len(cat_products) if cat_products else 0
        total_stock = sum(p["stock_quantity"] for p in cat_products)
        product_names = ", ".join(p["name"] for p in cat_products)
        text = (
            f"Category: {cat['name']}. "
            f"Description: {cat['description']}. "
            f"Contains {len(cat_products)} products: {product_names}. "
            f"Average price: ${avg_price:.2f}. "
            f"Average profit margin: {avg_margin:.1f}%. "
            f"Total stock across category: {total_stock} units."
        )
        chunks.append({
            "text": text,
            "source_type": "category",
            "source_id": f"category-{cat['id']}",
            "source_name": cat["name"]
        })
    return chunks


def _build_order_chunks(orders: list[dict]) -> list[dict]:
    chunks = []
    for o in orders:
        customer_name = get_customer_name(o["customer_id"])
        item_descriptions = []
        for item in o["items"]:
            pname = get_product_name(item["product_id"])
            item_descriptions.append(f"{pname} x{item['quantity']} at ${item['unit_price']:.2f}")
        items_text = "; ".join(item_descriptions)
        text = (
            f"Order #{o['id']} placed on {o['order_date']} by {customer_name}. "
            f"Status: {o['status']}. "
            f"Items: {items_text}. "
            f"Order total: ${o['total']:.2f}. "
            f"Shipping cost: ${o['shipping_cost']:.2f}."
        )
        chunks.append({
            "text": text,
            "source_type": "order",
            "source_id": f"order-{o['id']}",
            "source_name": f"Order #{o['id']}"
        })
    return chunks


def _build_sales_chunks(sales: list[dict]) -> list[dict]:
    chunks = []
    for s in sales:
        margin = round((s["profit"] / s["total_revenue"]) * 100, 1) if s["total_revenue"] > 0 else 0
        text = (
            f"Monthly Sales for {s['month_name']}: "
            f"Total revenue was ${s['total_revenue']:.2f}. "
            f"Total cost was ${s['total_cost']:.2f}. "
            f"Profit was ${s['profit']:.2f} (margin: {margin}%). "
            f"Number of orders: {s['order_count']}. "
            f"Cancelled orders: {s['cancelled_orders']}. "
            f"Average order value: ${s['avg_order_value']:.2f}. "
            f"Top performing category: {s['top_category']}."
        )
        chunks.append({
            "text": text,
            "source_type": "sales_summary",
            "source_id": f"sales-{s['month']}",
            "source_name": s["month_name"]
        })

    # Overall summary
    total_rev = sum(s["total_revenue"] for s in sales)
    total_profit = sum(s["profit"] for s in sales)
    total_orders = sum(s["order_count"] for s in sales)
    total_cancelled = sum(s["cancelled_orders"] for s in sales)
    best_month = max(sales, key=lambda x: x["total_revenue"])
    worst_month = min(sales, key=lambda x: x["total_revenue"])

    overall_text = (
        f"Overall Business Summary (April 2025 - March 2026): "
        f"Total revenue across all months: ${total_rev:.2f}. "
        f"Total profit: ${total_profit:.2f}. "
        f"Overall profit margin: {(total_profit / total_rev * 100):.1f}%. "
        f"Total orders placed: {total_orders}. "
        f"Total cancelled orders: {total_cancelled}. "
        f"Best performing month by revenue: {best_month['month_name']} with ${best_month['total_revenue']:.2f}. "
        f"Lowest performing month: {worst_month['month_name']} with ${worst_month['total_revenue']:.2f}. "
        f"Average monthly revenue: ${total_rev / len(sales):.2f}."
    )
    chunks.append({
        "text": overall_text,
        "source_type": "overall_summary",
        "source_id": "overall-summary",
        "source_name": "Overall Business Summary"
    })
    return chunks


def _build_customer_chunks(customers: list[dict], orders: list[dict]) -> list[dict]:
    chunks = []
    for c in customers:
        cust_orders = [o for o in orders if o["customer_id"] == c["id"]]
        completed = [o for o in cust_orders if o["status"] == "completed"]
        total_spent = sum(o["total"] for o in completed)
        text = (
            f"Customer: {c['name']} from {c['city']}, {c['state']}. "
            f"Joined on {c['join_date']}. "
            f"Total orders placed: {len(cust_orders)}. "
            f"Completed orders: {len(completed)}. "
            f"Total amount spent: ${total_spent:.2f}."
        )
        chunks.append({
            "text": text,
            "source_type": "customer",
            "source_id": f"customer-{c['id']}",
            "source_name": c["name"]
        })
    return chunks


def _build_analytics_chunks(products: list[dict], orders: list[dict], customers: list[dict]) -> list[dict]:
    """Pre-compute common analytics queries as dedicated chunks."""
    chunks = []
    completed_orders = [o for o in orders if o["status"] == "completed"]
    product_map = {p["id"]: p for p in products}

    # ── Top selling products by quantity ──
    qty_sold = defaultdict(int)
    revenue_by_product = defaultdict(float)
    profit_by_product = defaultdict(float)
    for order in completed_orders:
        for item in order["items"]:
            pid = item["product_id"]
            qty = item["quantity"]
            rev = item["unit_price"] * qty
            qty_sold[pid] += qty
            revenue_by_product[pid] += rev
            if pid in product_map:
                profit_by_product[pid] += (item["unit_price"] - product_map[pid]["cost"]) * qty

    top_by_qty = sorted(qty_sold.items(), key=lambda x: x[1], reverse=True)
    top_by_rev = sorted(revenue_by_product.items(), key=lambda x: x[1], reverse=True)
    top_by_profit = sorted(profit_by_product.items(), key=lambda x: x[1], reverse=True)

    # Top sellers by quantity
    lines = []
    for rank, (pid, qty) in enumerate(top_by_qty[:10], 1):
        name = get_product_name(pid)
        rev = revenue_by_product[pid]
        lines.append(f"#{rank}. {name}: {qty} units sold, ${rev:.2f} revenue")
    text = (
        "Top 10 Best-Selling Products by Quantity Sold (across all completed orders, April 2025 - March 2026): "
        + ". ".join(lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "top-products-by-quantity",
        "source_name": "Top Selling Products (by Quantity)"
    })

    # Top sellers by revenue
    lines = []
    for rank, (pid, rev) in enumerate(top_by_rev[:10], 1):
        name = get_product_name(pid)
        qty = qty_sold[pid]
        lines.append(f"#{rank}. {name}: ${rev:.2f} revenue, {qty} units sold")
    text = (
        "Top 10 Products by Revenue (across all completed orders, April 2025 - March 2026): "
        + ". ".join(lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "top-products-by-revenue",
        "source_name": "Top Products (by Revenue)"
    })

    # Top sellers by profit
    lines = []
    for rank, (pid, prof) in enumerate(top_by_profit[:10], 1):
        name = get_product_name(pid)
        rev = revenue_by_product[pid]
        margin = (prof / rev * 100) if rev > 0 else 0
        lines.append(f"#{rank}. {name}: ${prof:.2f} profit, {margin:.1f}% margin")
    text = (
        "Top 10 Most Profitable Products (across all completed orders, April 2025 - March 2026): "
        + ". ".join(lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "top-products-by-profit",
        "source_name": "Most Profitable Products"
    })

    # ── Category performance ranking ──
    cat_revenue = defaultdict(float)
    cat_profit = defaultdict(float)
    cat_qty = defaultdict(int)
    for order in completed_orders:
        for item in order["items"]:
            pid = item["product_id"]
            if pid in product_map:
                cat_name = get_category_name(product_map[pid]["category_id"])
                rev = item["unit_price"] * item["quantity"]
                prof = (item["unit_price"] - product_map[pid]["cost"]) * item["quantity"]
                cat_revenue[cat_name] += rev
                cat_profit[cat_name] += prof
                cat_qty[cat_name] += item["quantity"]

    cat_ranked = sorted(cat_revenue.items(), key=lambda x: x[1], reverse=True)
    lines = []
    for rank, (cat, rev) in enumerate(cat_ranked, 1):
        prof = cat_profit[cat]
        qty = cat_qty[cat]
        lines.append(f"#{rank}. {cat}: ${rev:.2f} revenue, ${prof:.2f} profit, {qty} units sold")
    text = (
        "Category Performance Ranking by Revenue (all completed orders, April 2025 - March 2026): "
        + ". ".join(lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "category-ranking",
        "source_name": "Category Performance Ranking"
    })

    # ── Order status breakdown ──
    status_counts = defaultdict(int)
    status_revenue = defaultdict(float)
    for o in orders:
        status_counts[o["status"]] += 1
        status_revenue[o["status"]] += o["total"]

    status_lines = []
    for status in ["completed", "processing", "shipped", "cancelled"]:
        count = status_counts.get(status, 0)
        rev = status_revenue.get(status, 0)
        status_lines.append(f"{status.capitalize()}: {count} orders (${rev:.2f} total value)")

    pending_orders = [o for o in orders if o["status"] in ("processing", "shipped")]
    pending_details = []
    for o in pending_orders:
        cname = get_customer_name(o["customer_id"])
        items_desc = ", ".join(
            f"{get_product_name(i['product_id'])} x{i['quantity']}" for i in o["items"]
        )
        pending_details.append(
            f"Order #{o['id']} ({o['status']}) - {cname} - {items_desc} - ${o['total']:.2f}"
        )

    text = (
        f"Order Status Breakdown — How many orders are pending, shipped, processing, completed, delayed, or cancelled? "
        f"Total orders: {len(orders)}. "
        + ". ".join(status_lines)
        + f". Currently pending orders awaiting fulfillment (processing + shipped): {len(pending_orders)} orders. "
        + "Pending order details: " + ". ".join(pending_details) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "order-status-breakdown",
        "source_name": "Order Status Breakdown"
    })

    # ── Stock / Inventory status ──
    out_of_stock = [p for p in products if p["stock_quantity"] == 0]
    low_stock = [p for p in products if 0 < p["stock_quantity"] <= 80]
    healthy_stock = [p for p in products if p["stock_quantity"] > 80]

    low_stock_sorted = sorted(low_stock, key=lambda x: x["stock_quantity"])
    low_lines = []
    for p in low_stock_sorted:
        cat = get_category_name(p["category_id"])
        low_lines.append(f"{p['name']} ({cat}): {p['stock_quantity']} units left")

    text = (
        f"Inventory & Stock Status Summary: "
        f"Total products: {len(products)}. "
        f"Out of stock: {len(out_of_stock)} products. "
        f"Low stock (80 units or fewer): {len(low_stock)} products. "
        f"Healthy stock (more than 80 units): {len(healthy_stock)} products. "
    )
    if out_of_stock:
        text += "Out of stock products: " + ", ".join(p["name"] for p in out_of_stock) + ". "
    if low_lines:
        text += "Low stock products (sorted by urgency): " + ". ".join(low_lines) + "."
    else:
        text += "No critically low stock products."
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "stock-status",
        "source_name": "Inventory & Stock Status"
    })

    # ── Top customers ──
    cust_spent = defaultdict(float)
    cust_orders_count = defaultdict(int)
    for o in completed_orders:
        cust_spent[o["customer_id"]] += o["total"]
        cust_orders_count[o["customer_id"]] += 1

    top_customers = sorted(cust_spent.items(), key=lambda x: x[1], reverse=True)[:10]
    cust_lines = []
    for rank, (cid, spent) in enumerate(top_customers, 1):
        cname = get_customer_name(cid)
        num_orders = cust_orders_count[cid]
        cust_lines.append(f"#{rank}. {cname}: ${spent:.2f} spent across {num_orders} orders")
    text = (
        "Top 10 Customers by Total Spending (completed orders only): "
        + ". ".join(cust_lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "top-customers",
        "source_name": "Top Customers by Spending"
    })

    # ── Recent orders (most recent 15) ──
    recent = sorted(orders, key=lambda x: x["order_date"], reverse=True)[:15]
    recent_lines = []
    for o in recent:
        cname = get_customer_name(o["customer_id"])
        items_desc = ", ".join(
            f"{get_product_name(i['product_id'])} x{i['quantity']}" for i in o["items"]
        )
        recent_lines.append(
            f"Order #{o['id']} on {o['order_date']} by {cname} ({o['status']}): {items_desc} — ${o['total']:.2f}"
        )
    text = (
        "Most Recent 15 Orders (latest activity): " + ". ".join(recent_lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "recent-orders",
        "source_name": "Recent Orders"
    })

    # ── Weekly sales breakdown (last 4 weeks by order date) ──
    from datetime import datetime, timedelta
    all_dates = [datetime.strptime(o["order_date"], "%Y-%m-%d") for o in orders]
    latest_date = max(all_dates)

    weekly_chunks_list = []
    for week_num in range(4):
        week_end = latest_date - timedelta(days=7 * week_num)
        week_start = week_end - timedelta(days=6)
        week_orders = [
            o for o in completed_orders
            if week_start <= datetime.strptime(o["order_date"], "%Y-%m-%d") <= week_end
        ]
        week_rev = sum(o["total"] for o in week_orders)
        week_items = defaultdict(int)
        for o in week_orders:
            for item in o["items"]:
                week_items[item["product_id"]] += item["quantity"]

        top_week_products = sorted(week_items.items(), key=lambda x: x[1], reverse=True)[:5]
        top_lines = [f"{get_product_name(pid)} ({qty} units)" for pid, qty in top_week_products]

        label = f"Week of {week_start.strftime('%b %d')} - {week_end.strftime('%b %d, %Y')}"
        weekly_chunks_list.append(
            f"{label}: {len(week_orders)} orders, ${week_rev:.2f} revenue. "
            f"Top products: {', '.join(top_lines) if top_lines else 'no sales'}."
        )

    text = "Weekly Sales Breakdown (last 4 weeks): " + " ".join(weekly_chunks_list)
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "weekly-sales",
        "source_name": "Weekly Sales Breakdown"
    })

    # ── Daily sales for most recent week ──
    daily_lines = []
    for day_offset in range(7):
        day = latest_date - timedelta(days=day_offset)
        day_str = day.strftime("%Y-%m-%d")
        day_orders = [o for o in completed_orders if o["order_date"] == day_str]
        day_rev = sum(o["total"] for o in day_orders)
        day_label = day.strftime("%A, %b %d, %Y")
        if day_orders:
            items_desc = []
            for o in day_orders:
                for item in o["items"]:
                    items_desc.append(f"{get_product_name(item['product_id'])} x{item['quantity']}")
            daily_lines.append(
                f"{day_label}: {len(day_orders)} orders, ${day_rev:.2f} revenue. Products sold: {', '.join(items_desc)}"
            )
        else:
            daily_lines.append(f"{day_label}: No orders.")

    text = (
        "Daily Sales and Revenue — What were total sales today compared to yesterday? "
        "Day-by-day sales breakdown for the most recent week: " + ". ".join(daily_lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "daily-sales",
        "source_name": "Daily Sales (Recent Week)"
    })

    # ── Cancelled orders summary ──
    cancelled = [o for o in orders if o["status"] == "cancelled"]
    cancel_lines = []
    for o in cancelled:
        cname = get_customer_name(o["customer_id"])
        items_desc = ", ".join(
            f"{get_product_name(i['product_id'])} x{i['quantity']}" for i in o["items"]
        )
        cancel_lines.append(
            f"Order #{o['id']} on {o['order_date']} by {cname}: {items_desc} — ${o['total']:.2f}"
        )
    cancel_rev = sum(o["total"] for o in cancelled)
    text = (
        f"Cancelled Orders Summary: {len(cancelled)} orders were cancelled out of {len(orders)} total "
        f"({len(cancelled)/len(orders)*100:.1f}% cancellation rate). "
        f"Total lost revenue from cancellations: ${cancel_rev:.2f}. "
        f"Cancelled order details: " + ". ".join(cancel_lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "cancelled-orders",
        "source_name": "Cancelled Orders Summary"
    })

    # ── Product sales frequency (all products ranked) ──
    all_products_sales = []
    for p in products:
        pid = p["id"]
        qty = qty_sold.get(pid, 0)
        rev = revenue_by_product.get(pid, 0)
        prof = profit_by_product.get(pid, 0)
        cat = get_category_name(p["category_id"])
        all_products_sales.append((p["name"], cat, qty, rev, prof))

    all_products_sales.sort(key=lambda x: x[2], reverse=True)
    lines = []
    for name, cat, qty, rev, prof in all_products_sales:
        lines.append(f"{name} ({cat}): {qty} units, ${rev:.2f} revenue, ${prof:.2f} profit")
    text = (
        "Complete Product Sales Ranking (all 40 products, sorted by units sold, from completed orders): "
        + ". ".join(lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "analytics",
        "source_id": "all-product-sales",
        "source_name": "Complete Product Sales Ranking"
    })

    return chunks


def _build_review_chunks(reviews: list[dict], products: list[dict]) -> list[dict]:
    """One chunk per review — captures sentiment, rating, and return context."""
    chunks = []
    product_map = {p["id"]: p for p in products}
    for r in reviews:
        pid = r["product_id"]
        product_name = get_product_name(pid)
        cat_name = get_category_name(product_map[pid]["category_id"]) if pid in product_map else "Unknown"
        customer_name = get_customer_name(r["customer_id"])
        stars = "★" * r["rating"] + "☆" * (5 - r["rating"])

        text = (
            f"Customer Review by {customer_name} on {r['review_date']}: "
            f"Product reviewed: {product_name} (Category: {cat_name}). "
            f"Order #{r['order_id']}. "
            f"Rating: {r['rating']}/5 {stars}. "
            f"Title: \"{r['title']}\". "
            f"Review: {r['review_text']} "
        )
        if r.get("has_return_request"):
            text += (
                f"RETURN REQUEST: Yes. "
                f"Return reason: {r['return_reason']}. "
                f"Details: {r.get('return_reason_details', '')}. "
                f"Return status: {r.get('return_status', 'pending')}."
            )
        else:
            text += "Return request: None."

        chunks.append({
            "text": text,
            "source_type": "review",
            "source_id": f"review-{r['id']}",
            "source_name": f"Review of {product_name} by {customer_name}"
        })
    return chunks


def _build_review_analytics_chunks(reviews: list[dict], products: list[dict]) -> list[dict]:
    """Pre-computed review analytics — return reasons, ratings, product feedback summaries."""
    from collections import defaultdict
    from datetime import datetime

    chunks = []
    product_map = {p["id"]: p for p in products}
    returns = [r for r in reviews if r.get("has_return_request")]

    # ── All-time return reasons ──
    all_reason_counts: dict[str, int] = defaultdict(int)
    for r in returns:
        if r.get("return_reason"):
            all_reason_counts[r["return_reason"]] += 1

    reason_lines = [
        f"#{i+1}. {reason}: {count} return request(s)"
        for i, (reason, count) in enumerate(
            sorted(all_reason_counts.items(), key=lambda x: x[1], reverse=True)
        )
    ]
    text = (
        f"All-Time Return Reasons Summary (based on customer reviews): "
        f"Total reviews: {len(reviews)}. "
        f"Total return requests: {len(returns)} "
        f"({round(len(returns)/len(reviews)*100, 1) if reviews else 0}% return rate). "
        f"Return reasons ranked: " + ". ".join(reason_lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "review_analytics",
        "source_id": "all-time-return-reasons",
        "source_name": "All-Time Return Reasons"
    })

    # ── Q1 2026 (last quarter) return reasons ──
    q1_start = datetime(2026, 1, 1)
    q1_end   = datetime(2026, 3, 31)
    q1_reviews = [
        r for r in reviews
        if q1_start <= datetime.strptime(r["review_date"], "%Y-%m-%d") <= q1_end
    ]
    q1_returns = [r for r in q1_reviews if r.get("has_return_request")]

    q1_reason_counts: dict[str, int] = defaultdict(int)
    q1_reason_products: dict[str, list[str]] = defaultdict(list)
    for r in q1_returns:
        reason = r.get("return_reason", "Unknown")
        q1_reason_counts[reason] += 1
        q1_reason_products[reason].append(get_product_name(r["product_id"]))

    q1_lines = []
    for i, (reason, count) in enumerate(
        sorted(q1_reason_counts.items(), key=lambda x: x[1], reverse=True)
    ):
        products_list = ", ".join(q1_reason_products[reason])
        q1_lines.append(
            f"#{i+1}. {reason}: {count} return request(s). "
            f"Affected products: {products_list}"
        )

    q1_avg_rating = round(
        sum(r["rating"] for r in q1_reviews) / len(q1_reviews), 2
    ) if q1_reviews else 0

    text = (
        f"Q1 2026 (January–March 2026) Return Reasons Analysis based on customer reviews: "
        f"Total reviews submitted in Q1 2026: {len(q1_reviews)}. "
        f"Total return requests in Q1 2026: {len(q1_returns)} "
        f"({round(len(q1_returns)/len(q1_reviews)*100, 1) if q1_reviews else 0}% return rate). "
        f"Average rating in Q1 2026: {q1_avg_rating}/5. "
        f"Top return reasons in Q1 2026 ranked by frequency: " + ". ".join(q1_lines) + ". "
        f"Summary: The top 3 reasons customers returned products in Q1 2026 were: "
        f"(1) {list(sorted(q1_reason_counts, key=lambda x: q1_reason_counts[x], reverse=True))[0] if q1_reason_counts else 'N/A'}, "
        f"(2) {list(sorted(q1_reason_counts, key=lambda x: q1_reason_counts[x], reverse=True))[1] if len(q1_reason_counts) > 1 else 'N/A'}, "
        f"(3) {list(sorted(q1_reason_counts, key=lambda x: q1_reason_counts[x], reverse=True))[2] if len(q1_reason_counts) > 2 else 'N/A'}."
    )
    chunks.append({
        "text": text,
        "source_type": "review_analytics",
        "source_id": "q1-2026-return-reasons",
        "source_name": "Q1 2026 Return Reasons (Last Quarter)"
    })

    # ── Return rate by product category ──
    cat_review_counts: dict[str, int] = defaultdict(int)
    cat_return_counts: dict[str, int] = defaultdict(int)
    cat_return_reasons: dict[str, list[str]] = defaultdict(list)
    for r in reviews:
        pid = r["product_id"]
        cat = get_category_name(product_map[pid]["category_id"]) if pid in product_map else "Unknown"
        cat_review_counts[cat] += 1
        if r.get("has_return_request") and r.get("return_reason"):
            cat_return_counts[cat] += 1
            cat_return_reasons[cat].append(r["return_reason"])

    cat_lines = []
    for cat in sorted(cat_return_counts, key=lambda x: cat_return_counts[x], reverse=True):
        rate = round(cat_return_counts[cat] / cat_review_counts[cat] * 100, 1)
        top_reason = max(set(cat_return_reasons[cat]), key=cat_return_reasons[cat].count)
        cat_lines.append(
            f"{cat}: {cat_return_counts[cat]} returns from {cat_review_counts[cat]} reviews "
            f"({rate}% return rate). Top reason: {top_reason}"
        )

    text = (
        "Return Rate by Product Category (based on customer reviews): "
        + ". ".join(cat_lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "review_analytics",
        "source_id": "return-rate-by-category",
        "source_name": "Return Rate by Category"
    })

    # ── Average ratings by product ──
    product_ratings: dict[int, list[int]] = defaultdict(list)
    product_return_counts: dict[int, int] = defaultdict(int)
    for r in reviews:
        product_ratings[r["product_id"]].append(r["rating"])
        if r.get("has_return_request"):
            product_return_counts[r["product_id"]] += 1

    rated_products = sorted(
        product_ratings.items(),
        key=lambda x: sum(x[1]) / len(x[1]),
        reverse=True
    )
    prod_lines = []
    for pid, ratings in rated_products:
        avg = round(sum(ratings) / len(ratings), 2)
        returns_count = product_return_counts[pid]
        prod_lines.append(
            f"{get_product_name(pid)}: avg {avg}/5 from {len(ratings)} review(s), "
            f"{returns_count} return request(s)"
        )

    text = (
        "Product Ratings and Return Counts from Customer Reviews "
        "(sorted by average rating, highest first): "
        + ". ".join(prod_lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "review_analytics",
        "source_id": "product-ratings-summary",
        "source_name": "Product Ratings & Return Counts"
    })

    # ── Detailed return requests list (all) ──
    return_detail_lines = []
    for r in sorted(returns, key=lambda x: x["review_date"], reverse=True):
        customer_name = get_customer_name(r["customer_id"])
        product_name  = get_product_name(r["product_id"])
        return_detail_lines.append(
            f"Order #{r['order_id']} ({r['review_date']}) — {customer_name} returned "
            f"{product_name}: reason={r['return_reason']}, status={r.get('return_status','pending')}"
        )

    text = (
        f"All Return Requests Detail (from customer reviews, {len(returns)} total): "
        + ". ".join(return_detail_lines) + "."
    )
    chunks.append({
        "text": text,
        "source_type": "review_analytics",
        "source_id": "all-return-requests",
        "source_name": "All Return Requests"
    })

    return chunks


def build_index() -> tuple:
    """Build FAISS index from all e-commerce data. Returns (index, metadata, model)."""
    print("Loading data and building RAG index...")

    products   = get_products()
    categories = get_categories()
    orders     = get_orders()
    customers  = get_customers()
    sales      = get_sales_summary()
    reviews    = get_reviews()

    # Build all text chunks
    all_chunks = []
    all_chunks.extend(_build_product_chunks(products))
    all_chunks.extend(_build_category_chunks(categories, products))
    all_chunks.extend(_build_order_chunks(orders))
    all_chunks.extend(_build_sales_chunks(sales))
    all_chunks.extend(_build_customer_chunks(customers, orders))
    all_chunks.extend(_build_analytics_chunks(products, orders, customers))
    all_chunks.extend(_build_review_chunks(reviews, products))
    all_chunks.extend(_build_review_analytics_chunks(reviews, products))

    print(f"Created {len(all_chunks)} text chunks")

    # Load embedding model
    print(f"Loading embedding model: {settings.embedding_model}")
    model = SentenceTransformer(settings.embedding_model)

    # Embed all chunks
    texts = [chunk["text"] for chunk in all_chunks]
    print("Encoding chunks...")
    embeddings = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)
    embeddings = np.array(embeddings, dtype="float32")

    # Build FAISS index (Inner Product for normalized vectors)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    print(f"FAISS index built with {index.ntotal} vectors of dimension {dimension}")
    return index, all_chunks, model
