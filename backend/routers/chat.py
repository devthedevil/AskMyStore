from fastapi import APIRouter, Request
from backend.models.schemas import ChatRequest, ChatResponse
from backend.rag.engine import answer_query

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    index = req.app.state.faiss_index
    metadata = req.app.state.metadata
    model = req.app.state.embedding_model
    response = answer_query(request.query, index, metadata, model)
    return response
