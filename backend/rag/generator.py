import anthropic
from backend.config.settings import settings

SYSTEM_PROMPT = """You are an intelligent online store analytics assistant. You help users understand their store's performance by answering questions about products, sales, orders, customers, revenue, profit, and trends.

RULES:
1. Answer questions using ONLY the provided context data. Do not make up or infer data not present in the context.
2. Always cite specific numbers, dates, and product names from the context.
3. If the context doesn't contain enough information to answer, say so clearly.
4. Format numbers as currency ($X,XXX.XX) where appropriate.
5. Be concise but thorough. Use bullet points for lists.
6. When comparing items, present data in a clear, organized way.
7. For trend questions, describe the direction (increasing/decreasing) and magnitude.
8. Always be helpful and suggest related insights the user might find interesting."""


def generate(query: str, context_chunks: list[dict]) -> str:
    """Generate a response using Claude with retrieved context."""
    # Build context string
    context_parts = []
    for i, chunk in enumerate(context_chunks, 1):
        context_parts.append(f"[Source {i} - {chunk['source_name']}]\n{chunk['text']}")

    context_str = "\n\n".join(context_parts)

    user_message = f"""Based on the following e-commerce data context, answer the user's question.

--- CONTEXT DATA ---
{context_str}
--- END CONTEXT ---

User Question: {query}

Provide a clear, data-driven answer:"""

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    response = client.messages.create(
        model=settings.model_name,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )

    return response.content[0].text
