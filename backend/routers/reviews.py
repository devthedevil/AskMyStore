from fastapi import APIRouter, HTTPException
from datetime import date
from backend.services.data_loader import get_reviews, get_product_name, get_customer_name, save_review
from backend.models.schemas import Review, ReviewCreate

router = APIRouter()


@router.get("/reviews/", response_model=list[Review])
def list_reviews(product_id: int | None = None, order_id: int | None = None):
    """Return reviews, optionally filtered by product or order."""
    reviews = get_reviews()
    if product_id is not None:
        reviews = [r for r in reviews if r["product_id"] == product_id]
    if order_id is not None:
        reviews = [r for r in reviews if r["order_id"] == order_id]
    return sorted(reviews, key=lambda r: r["review_date"], reverse=True)


@router.get("/reviews/{review_id}", response_model=Review)
def get_review(review_id: int):
    reviews = get_reviews()
    for r in reviews:
        if r["id"] == review_id:
            return r
    raise HTTPException(status_code=404, detail="Review not found")


@router.post("/reviews/", response_model=Review, status_code=201)
def create_review(payload: ReviewCreate):
    """Submit a new review / order feedback."""
    review = payload.model_dump()
    review["review_date"] = str(date.today())
    review["return_status"] = "pending" if review["has_return_request"] else None
    saved = save_review(review)
    return saved


@router.get("/reviews/analytics/summary")
def reviews_analytics():
    """Return aggregated review and return-reason statistics."""
    from collections import defaultdict
    from datetime import datetime

    reviews = get_reviews()

    # All-time stats
    total = len(reviews)
    avg_rating = round(sum(r["rating"] for r in reviews) / total, 2) if total else 0
    returns = [r for r in reviews if r["has_return_request"]]

    reason_counts: dict[str, int] = defaultdict(int)
    for r in returns:
        if r.get("return_reason"):
            reason_counts[r["return_reason"]] += 1

    # Q1 2026 (Jan 1 – Mar 31, 2026)
    q1_start = datetime(2026, 1, 1)
    q1_end   = datetime(2026, 3, 31)
    q1_returns = [
        r for r in returns
        if r.get("return_reason") and
        q1_start <= datetime.strptime(r["review_date"], "%Y-%m-%d") <= q1_end
    ]
    q1_reason_counts: dict[str, int] = defaultdict(int)
    for r in q1_returns:
        q1_reason_counts[r["return_reason"]] += 1

    # Return rate by category
    products = {p["id"]: p for p in __import__(
        "backend.services.data_loader", fromlist=["get_products"]
    ).get_products()}
    from backend.services.data_loader import get_category_name
    cat_returns: dict[str, int] = defaultdict(int)
    cat_reviews: dict[str, int] = defaultdict(int)
    for r in reviews:
        pid = r["product_id"]
        cat = get_category_name(products[pid]["category_id"]) if pid in products else "Unknown"
        cat_reviews[cat] += 1
        if r["has_return_request"]:
            cat_returns[cat] += 1

    return {
        "total_reviews": total,
        "avg_rating": avg_rating,
        "total_return_requests": len(returns),
        "return_rate_pct": round(len(returns) / total * 100, 1) if total else 0,
        "all_time_return_reasons": sorted(reason_counts.items(), key=lambda x: x[1], reverse=True),
        "q1_2026_return_reasons": sorted(q1_reason_counts.items(), key=lambda x: x[1], reverse=True),
        "return_rate_by_category": {
            cat: {
                "reviews": cat_reviews[cat],
                "returns": cat_returns[cat],
                "rate_pct": round(cat_returns[cat] / cat_reviews[cat] * 100, 1)
            }
            for cat in cat_reviews
        },
    }
