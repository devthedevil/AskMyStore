from fastapi import APIRouter, HTTPException
from backend.services.data_loader import get_products, get_category_name

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/")
def list_products(category_id: int = None):
    products = get_products()
    result = []
    for p in products:
        product = {**p, "category_name": get_category_name(p["category_id"])}
        if category_id and p["category_id"] != category_id:
            continue
        result.append(product)
    return result


@router.get("/{product_id}")
def get_product(product_id: int):
    products = get_products()
    for p in products:
        if p["id"] == product_id:
            return {**p, "category_name": get_category_name(p["category_id"])}
    raise HTTPException(status_code=404, detail="Product not found")
