from fastapi import APIRouter
from backend.services.data_loader import get_categories

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/")
def list_categories():
    return get_categories()
