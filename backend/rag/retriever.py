import numpy as np
from sentence_transformers import SentenceTransformer
from backend.config.settings import settings


def retrieve(
    query: str,
    index,
    metadata: list[dict],
    model: SentenceTransformer,
    top_k: int = None
) -> list[dict]:
    """Retrieve the top-k most relevant chunks for a given query."""
    if top_k is None:
        top_k = settings.top_k

    # Encode the query
    query_embedding = model.encode([query], normalize_embeddings=True)
    query_embedding = np.array(query_embedding, dtype="float32")

    # Search FAISS index
    scores, indices = index.search(query_embedding, top_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(metadata):
            continue
        chunk = metadata[idx]
        results.append({
            "text": chunk["text"],
            "source_type": chunk["source_type"],
            "source_id": chunk["source_id"],
            "source_name": chunk["source_name"],
            "similarity_score": float(score)
        })

    return results
