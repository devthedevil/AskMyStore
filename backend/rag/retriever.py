import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize
from backend.config.settings import settings


def retrieve(
    query: str,
    index: np.ndarray,
    metadata: list[dict],
    model: TfidfVectorizer,
    top_k: int = None
) -> list[dict]:
    if top_k is None:
        top_k = settings.top_k

    query_vec = model.transform([query])
    query_vec = normalize(query_vec, norm="l2").toarray().astype("float32")

    scores = np.dot(index, query_vec.T).flatten()
    top_indices = np.argsort(scores)[::-1][:top_k]

    results = []
    for idx in top_indices:
        if scores[idx] <= 0:
            continue
        chunk = metadata[idx]
        results.append({
            "text": chunk["text"],
            "source_type": chunk["source_type"],
            "source_id": chunk["source_id"],
            "source_name": chunk["source_name"],
            "similarity_score": float(scores[idx])
        })

    return results
