import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.rag.indexer import build_index
from backend.routers import products, orders, dashboard, chat, categories


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: build the RAG index
    import time
    start = time.time()
    index, metadata, model = build_index()
    app.state.faiss_index = index
    app.state.metadata = metadata
    app.state.embedding_model = model
    elapsed = time.time() - start
    print(f"RAG index ready! Indexed {len(metadata)} chunks in {elapsed:.2f}s")
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title="E-Commerce RAG Assistant",
    description="Single-agent RAG model for e-commerce analytics",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(categories.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "E-Commerce RAG API is running"}
