from sentence_transformers import SentenceTransformer
from backend.rag.retriever import retrieve
from backend.rag.generator import generate
from backend.models.schemas import ChatResponse


def answer_query(
    query: str,
    index,
    metadata: list[dict],
    model: SentenceTransformer
) -> ChatResponse:
    """Full RAG pipeline: retrieve relevant chunks, then generate an answer."""

    # Step 1: Retrieve relevant context
    retrieved_chunks = retrieve(query, index, metadata, model)

    # Step 2: Generate answer using LLM with context
    answer = generate(query, retrieved_chunks)

    # Step 3: Extract source references
    sources = list(set(
        f"{chunk['source_type']}: {chunk['source_name']}"
        for chunk in retrieved_chunks
    ))

    return ChatResponse(answer=answer, sources=sources)
