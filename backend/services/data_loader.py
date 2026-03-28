import json
from pathlib import Path
from backend.config.settings import settings

_cache: dict = {}


def load_json(filename: str) -> list[dict]:
    if filename in _cache:
        return _cache[filename]
    filepath = Path(settings.data_dir) / filename
    with open(filepath, "r") as f:
        data = json.load(f)
    _cache[filename] = data
    return data


def get_products() -> list[dict]:
    return load_json("products.json")


def get_categories() -> list[dict]:
    return load_json("categories.json")


def get_orders() -> list[dict]:
    return load_json("orders.json")


def get_customers() -> list[dict]:
    return load_json("customers.json")


def get_sales_summary() -> list[dict]:
    return load_json("sales_summary.json")


def get_category_name(category_id: int) -> str:
    categories = get_categories()
    for cat in categories:
        if cat["id"] == category_id:
            return cat["name"]
    return "Unknown"


def get_customer_name(customer_id: int) -> str:
    customers = get_customers()
    for cust in customers:
        if cust["id"] == customer_id:
            return cust["name"]
    return "Unknown"


def get_product_name(product_id: int) -> str:
    products = get_products()
    for prod in products:
        if prod["id"] == product_id:
            return prod["name"]
    return "Unknown"
