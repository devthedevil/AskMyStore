# AskMyStore — Full-Stack RAG analytics assistant App | YouTube Video Script

**Title:** I Built a Full-Stack RAG Application That Answers Business Questions About an online Store
**Estimated Runtime:** 13–15 minutes
**Format:** Technical walkthrough / code tour

---

## CHAPTERS & TIMESTAMPS

- **[00:00]** — Hook & Project Demo
- **[01:15]** — Architecture Overview
- **[02:30]** — Backend Foundation: `main.py`, `settings.py`, `schemas.py`
- **04:30]** — Data Layer: `data_loader.py` + JSON Files
- **[05:30]** — API Routers: Products, Orders, Dashboard
- **[07:00]** — The RAG Pipeline: `indexer.py` — Building 213 Text Chunks
- **[09:30]** — The RAG Pipeline: `retriever.py` → `generator.py` → `engine.py`
- **[11:00]** — Frontend: `App.tsx`, `api.ts`, Hooks
- **[12:15]** — Frontend: Pages — Home, Shop, Dashboard
- **[13:30]** — The Chatbot Component
- **[14:30]** — Wrap-Up & CTA

---

## SCRIPT

---

### [00:00] — HOOK & PROJECT DEMO

Imagine you're running an online store and you want to know: *"Which product made me the most profit last quarter?"* or *"How many orders got cancelled and how much revenue did I lose?"* Normally you'd open a spreadsheet, filter some columns, write a formula — it takes time, and it doesn't scale.

What if instead, you just... asked?

[SHOW: chatbot floating button on the storefront, user clicks it, types "Which product has the highest profit margin?", AI responds with a formatted breakdown]

That's exactly what this project does. AskMyStore is a full-stack RAG application — Retrieval-Augmented Generation — that sits on top of a real online store dataset and lets you query your business data in plain English, powered by Anthropic's LLM Claude.

But this isn't a toy wrapper around ChatGPT. There's a carefully engineered pipeline underneath. Today I'm walking you through every file in this codebase, explaining what it does, why it was built that way, and the clever design decisions that make it work well.

Let me pull up the project structure.

[SHOW: top-level folder tree — `backend/`, `frontend/`, `data/`, `start.sh`]

There are two worlds here. The `backend` is a Python FastAPI server. The `frontend` is a React 19 TypeScript app. They talk to each other through a clean REST API. And running through the backend like a spine is the RAG pipeline.

Let's start at the very beginning.

---

### [01:15] — ARCHITECTURE OVERVIEW

[SHOW: hand-drawn or simple diagram — User → React Frontend → FastAPI Backend → RAG Pipeline → Claude API]

Here's the high-level flow. A user opens the app, either browsing the storefront or the admin dashboard. In either view, there's a floating AI chatbot. They type a question. The frontend sends it to the backend's `/api/chat/` endpoint. The backend runs a three-step RAG pipeline:

Step one — **Retrieve**: embed the question as a vector, search a FAISS index to find the most semantically relevant text chunks from our data.

Step two — **Generate**: pass those chunks as context to Claude AI, with a strict system prompt that says "answer only from this data, no hallucinating."

Step three — **Respond**: send the answer back to the frontend, which displays it in the chat panel.

The other API endpoints — products, orders, dashboard — feed the visual parts of the UI. But the RAG pipeline is the star of the show. Let's build up to it from the foundation.

---

### [02:30] — BACKEND FOUNDATION

**`main.py` — The Entry Point**

[SHOW: `backend/main.py`]

This is where everything starts. FastAPI is initialized with a `lifespan` context manager — and the reason that matters is what happens inside it.

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    index, metadata, model = build_index()
    app.state.faiss_index = index
    app.state.metadata = metadata
    app.state.embedding_model = model
    yield
```

On startup, before FastAPI accepts a single request, it calls `build_index()` — which we'll dig into shortly. That function loads all 40 products, 115 orders, 25 customers, and 12 months of sales data, converts them to text, embeds them as vectors, and loads them into a FAISS index.

The clever part here: the result gets stored on `app.state`. This is FastAPI's built-in mechanism for sharing objects across requests without global variables. Every chat request can then pull the FAISS index, the metadata list, and the embedding model directly from `app.state`. It's initialized once, shared everywhere, and lives for the entire lifetime of the server.

Below that, CORS is configured to allow only `localhost:5173` — which is Vite's default dev server port — and all five routers are mounted under `/api`.

---

**`config/settings.py` — Configuration**

[SHOW: `backend/config/settings.py`]

```python
class Settings(BaseSettings):
    anthropic_api_key: str = ""
    model_name: str = "claude-sonnet-4-20250514"
    embedding_model: str = "all-MiniLM-L6-v2"
    top_k: int = 10
```

This uses Pydantic's `BaseSettings`, which automatically reads from a `.env` file. No manual `os.getenv()` calls scattered everywhere. You add your Anthropic API key to `.env`, and every part of the codebase can import `settings` and access `settings.anthropic_api_key` cleanly.

The model choices here are deliberate. `all-MiniLM-L6-v2` is a compact, fast SentenceTransformer that produces 384-dimensional embeddings — good enough for semantic search over a dataset this size without needing a paid embedding API. `claude-sonnet-4` is the generation model, balancing quality and cost for conversational responses.

`top_k=10` means every search retrieves the 10 most relevant chunks. That's a tunable parameter — more context means better answers but longer prompts.

---

**`models/schemas.py` — Pydantic Models**

[SHOW: brief overview of schema file]

This file defines the data contracts for the API. `ChatRequest` is just a string `query`. `ChatResponse` has an `answer` string and a `sources` list. There are also models for `Product`, `Order`, `Customer`, `Category`, and `DashboardSummary`. These act as both validation and documentation — FastAPI auto-generates an OpenAPI spec from them.

---

### [04:30] — DATA LAYER

**`services/data_loader.py` — The Data Cache**

[SHOW: `backend/services/data_loader.py`]

```python
_cache: dict = {}

def load_json(filename: str) -> list[dict]:
    if filename in _cache:
        return _cache[filename]
    filepath = Path(settings.data_dir) / filename
    with open(filepath, "r") as f:
        data = json.load(f)
    _cache[filename] = data
    return data
```

Simple but important. `_cache` is a module-level dictionary. The first time `get_products()` is called, it reads `products.json` off disk and stores the result in cache. Every subsequent call returns the cached version in memory. Since the data doesn't change at runtime, this avoids hitting the filesystem on every request.

The lookup helpers — `get_category_name`, `get_customer_name`, `get_product_name` — iterate their respective lists and return the name for a given ID. They rely on the same cache, so they're fast even when called thousands of times during index building.

**The JSON Data Files**

[SHOW: `data/` folder listing]

The raw data lives in four JSON files. 40 products across 8 categories, each with a price, cost, stock quantity, rating, and review count. 115 orders across a 12-month period with customer IDs, item lists, statuses (completed, processing, shipped, cancelled), and totals. 25 customers with location data. And a `sales_summary.json` with pre-aggregated monthly KPIs.

This is intentionally realistic data — margins vary, some products outsell others, there are cancelled orders, seasonal trends in monthly revenue. That richness is what makes the AI answers interesting.

---

### [05:30] — API ROUTERS

**`routers/products.py` and `routers/orders.py`**

[SHOW: products router, then orders router]

These are straightforward REST endpoints. Products has a `GET /products/` with an optional `category_id` query parameter, and `GET /products/{id}` that raises a 404 if the product doesn't exist. Orders has `GET /orders/` with a status filter and a limit, plus `GET /orders/stats` for a quick status breakdown.

Nothing exotic, but they're important for the frontend's catalog and order management pages.

**`routers/dashboard.py` — The KPI Engine**

[SHOW: `backend/routers/dashboard.py`]

This one is meatier. The `/dashboard/summary` endpoint loads all four data sources and does real business intelligence work in Python.

```python
completed_orders = [o for o in orders if o["status"] == "completed"]
cancelled_orders = [o for o in orders if o["status"] == "cancelled"]
total_revenue = sum(o["total"] for o in completed_orders)
```

Notice it deliberately separates completed from cancelled orders before computing revenue. You don't want cancelled orders inflating your numbers. It then iterates every line item in every completed order to compute revenue and profit per product — using a `product_cost_map` dictionary for O(1) cost lookups — and aggregates category revenue in the same pass.

The result is a rich summary object: total revenue, total profit, profit margin, average order value, top 10 products by revenue, and category breakdowns. This is what powers the admin dashboard charts.

---

### [07:00] — THE RAG PIPELINE: INDEXER

Now we get to the heart of the project.

**`rag/indexer.py` — Building 213 Text Chunks**

[SHOW: `backend/rag/indexer.py`, scroll through the file]

The core insight of RAG is this: language models can't search a database, but they can reason over text. So the indexer's job is to convert all structured JSON data into rich natural language text chunks that will be semantically searchable.

Let me walk through each builder function.

**`_build_product_chunks`**

```python
text = (
    f"Product: {p['name']}. "
    f"Category: {cat_name}. "
    f"Price: ${p['price']:.2f}. "
    f"Cost: ${p['cost']:.2f}. "
    f"Profit per unit: ${profit_per_unit}. "
    f"Profit margin: {margin}%. "
    ...
)
```

[SHOW: this code block]

For each of the 40 products, this generates a natural language card. The key detail: it computes `profit_per_unit` and `margin` right here, at index time. Claude doesn't have to do the math. When someone asks "which product has the highest margin?", the answer is already baked into the text.

**`_build_category_chunks`** aggregates products by category — average price, average margin, total stock, product names. One chunk per category, giving Claude a bird's-eye view of each department.

**`_build_order_chunks`** converts each of the 115 orders into a text description with the customer name, date, status, every item, and the total. That's 115 individual order chunks.

**`_build_sales_chunks`** converts each monthly KPI row into text — revenue, cost, profit, margin, order count, cancellations, best category. And it adds one master "Overall Business Summary" chunk that summarizes the entire April 2025 to March 2026 period at a glance.

**`_build_customer_chunks`** gives each of the 25 customers a profile card with their location, join date, how many orders they placed, and total spend.

Now here's the cleverest part of the whole project.

**`_build_analytics_chunks` — Pre-Computed Aggregates**

[SHOW: `_build_analytics_chunks` function, highlight the comment "Pre-compute common analytics queries"]

This function pre-computes the answers to the most common business questions that users will ask. Think about it: if a user asks "who are the top-selling products by quantity?", and we only have 115 individual order chunks, the retriever has to find and correctly aggregate 115 chunks to compute that answer. That's asking Claude to do complex arithmetic from scattered raw data in the middle of a conversation.

Instead, this function runs those aggregations once at startup and creates dedicated chunks for them:

- Top 10 products by units sold
- Top 10 products by revenue
- Top 10 most profitable products
- Category performance ranking
- Order status breakdown with details of pending orders
- Inventory and stock status — out of stock, low stock, healthy
- Top 10 customers by spending
- Most recent 15 orders
- Weekly sales for the last 4 weeks
- Daily sales for the last 7 days
- Cancelled orders summary with lost revenue
- Complete product sales ranking for all 40 products

[SHOW: the cancelled orders chunk text being built]

Each of these is a single chunk. When a user asks "how many orders were cancelled?", FAISS retrieves this pre-built chunk and Claude gets the answer on a silver platter. This is the difference between a RAG system that works in theory and one that actually gives good answers in practice.

In total, `build_index()` assembles all these chunks — somewhere around 213 of them — loads the `all-MiniLM-L6-v2` SentenceTransformer, encodes every chunk to a 384-dimensional vector, and builds a `faiss.IndexFlatIP` — an exact inner product search index.

```python
embeddings = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)
index = faiss.IndexFlatIP(dimension)
index.add(embeddings)
```

[SHOW: build_index function bottom section]

Inner product on normalized vectors is equivalent to cosine similarity. That's what `normalize_embeddings=True` sets up. FAISS is blazing fast at this — searching 213 vectors takes microseconds.

---

### [09:30] — RAG PIPELINE: RETRIEVER, GENERATOR, ENGINE

**`rag/retriever.py`**

[SHOW: `backend/rag/retriever.py`]

```python
def retrieve(query, index, metadata, model, top_k=None):
    query_embedding = model.encode([query], normalize_embeddings=True)
    scores, indices = index.search(query_embedding, top_k)
```

When a question comes in, this function embeds it with the same model used to build the index — that consistency is critical — then calls `index.search()`. FAISS returns the indices and similarity scores of the top 10 closest chunks. Those get packaged up with their metadata and similarity scores and returned.

Notice the retriever takes the index, metadata, and model as parameters — they're injected in, not imported as globals. That's what makes it testable and composable.

**`rag/generator.py`**

[SHOW: `backend/rag/generator.py`, focus on SYSTEM_PROMPT]

```python
SYSTEM_PROMPT = """You are an intelligent online store analytics assistant...
RULES:
1. Answer questions using ONLY the provided context data. Do not make up or infer data not present.
2. Always cite specific numbers, dates, and product names from the context.
3. If the context doesn't contain enough information to answer, say so clearly.
...
```

[SHOW: SYSTEM_PROMPT block]

This system prompt is doing a lot of heavy lifting. Rule 1 is the anti-hallucination guardrail: Claude must stay grounded to the retrieved context. It can't invent sales figures or fabricate product data. Rule 2 forces citations — numbers must come from the source text. Rule 3 gives Claude permission to say "I don't know" rather than guessing.

The generate function formats the retrieved chunks as numbered source blocks — `[Source 1 - Product Name]`, `[Source 2 - Order #42]` — and passes them to the Claude API with `max_tokens=1024`. That's generous enough for detailed answers while keeping costs reasonable.

**`rag/engine.py` — Tying It Together**

[SHOW: `backend/rag/engine.py`]

```python
def answer_query(query, index, metadata, model) -> ChatResponse:
    retrieved_chunks = retrieve(query, index, metadata, model)
    answer = generate(query, retrieved_chunks)
    sources = list(set(
        f"{chunk['source_type']}: {chunk['source_name']}"
        for chunk in retrieved_chunks
    ))
    return ChatResponse(answer=answer, sources=sources)
```

[SHOW: engine.py]

This is the conductor. Retrieve, generate, deduplicate sources, return. The sources list tells the frontend which data types informed the answer — "analytics: Top Selling Products", "sales_summary: December 2025" — which gets displayed to the user so they know where the answer came from.

The chat router just pulls the FAISS index, metadata, and model from `request.app.state` and calls `answer_query()`. Clean separation of concerns.

---

### [11:00] — FRONTEND FOUNDATION

**`App.tsx` — The Router**

[SHOW: `frontend/src/App.tsx`]

```jsx
<CartProvider>
  <BrowserRouter>
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
      </Route>
    </Routes>
  </BrowserRouter>
</CartProvider>
```

The app has two distinct surfaces: the consumer storefront and the admin dashboard. They use different layouts — `StoreLayout` has a storefront navbar with cart icon and search bar, `AdminLayout` has a sidebar with navigation links.

`CartProvider` wraps everything at the top level, so cart state is accessible everywhere in the app regardless of which layout you're in.

**`services/api.ts` — The HTTP Layer**

[SHOW: `frontend/src/services/api.ts`]

```typescript
const api = axios.create({
  baseURL: "/api",
});
```

One axios instance, configured with `/api` as the base URL. In development, Vite's proxy forwards `/api` requests to `http://localhost:8000`. In production you'd configure your server to do the same. Every function — `getProducts`, `getDashboard`, `sendChatMessage` — is a thin typed wrapper around this instance.

**`hooks/useCart.tsx` — Cart State**

[SHOW: `frontend/src/hooks/useCart.tsx`, addToCart function]

The cart hook uses React Context — `CartProvider` wraps the app, and `useCart()` gives any component access to cart state without prop drilling.

The `addToCart` function handles the merge logic:

```typescript
const addToCart = useCallback((product: Product, quantity = 1) => {
  setItems((prev) => {
    const existing = prev.find((item) => item.product.id === product.id);
    if (existing) {
      return prev.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    }
    return [...prev, { product, quantity }];
  });
}, []);
```

If the product already exists in the cart, it increments the quantity. Otherwise it appends a new entry. `totalItems` and `totalPrice` are computed values derived from the `items` array — they're always consistent with the state, no separate tracking needed.

**`hooks/useChat.ts` — Optimistic Chat UI**

[SHOW: `frontend/src/hooks/useChat.ts`, sendMessage function]

This is where the chat UX lives. Look at the `sendMessage` function:

```typescript
// 1. Immediately add user message to state
setMessages((prev) => [...prev, userMsg]);
setIsLoading(true);

// 2. Fire off API call
const response = await sendChatMessage(text.trim());

// 3. Append assistant response when it arrives
setMessages((prev) => [...prev, assistantMsg]);
```

[SHOW: this sequence in the code]

This is optimistic UI. The user's message appears in the chat panel instantly — before the API call even goes out. The typing indicator shows while the request is in flight. When Claude responds, the answer is appended. If the request fails, an error message goes in instead. The user always sees immediate feedback rather than a blank delay after hitting send.

The hook also manages a `messagesEndRef` — a React ref attached to a div at the bottom of the message list. After every state update, it scrolls to that ref, so the chat panel always shows the latest message.

---

### [12:15] — THE FRONTEND PAGES

**`pages/Home.tsx` — Storefront Homepage**

[SHOW: Home.tsx, highlight the featured and bestDeals derivation]

```typescript
const featured = products.filter((p) => p.rating >= 4.7).slice(0, 8);
const bestDeals = [...products]
  .sort((a, b) => (b.price - b.cost) / b.price - (a.price - a.cost) / a.price)
  .slice(0, 4);
```

The homepage derives two curated product lists purely from the data, no hardcoding. Featured products are anything with a rating of 4.7 or higher — the top-rated items. Best deals are sorted by profit margin, highest first. This is an interesting inversion: the products with the highest margin are the ones the store makes the most money on, so surfacing them as "best value" nudges customers toward them.

The page structure flows naturally: Hero banner with a gradient, a perks strip floating over it with cards for free shipping, secure checkout, easy returns, and "24/7 AI Support" — which points to the chatbot. Then category cards, featured products, best value picks, and a CTA banner at the bottom reminding users about the AI assistant.

**`pages/Shop.tsx` — The Full Catalog**

[SHOW: Shop.tsx, highlight URL params and useMemo]

The shop page is where the filtering lives. All filtering is done client-side — one `GET /products/` call on mount, then everything else is computed in the browser. This is a deliberate choice: with only 40 products, server-side filtering would add network round-trips for no performance benefit.

```typescript
const selectedCat = searchParams.get("cat") || "";
const searchQuery = searchParams.get("search") || "";
```

[SHOW: the useSearchParams lines]

The active filters live in the URL query parameters, not React state. This is the right pattern because it means the filtered view is bookmarkable and shareable. If you link someone to `/shop?cat=Electronics&search=wireless`, they land directly on that filtered view. The category cards on the homepage use this too — each links to `/shop?cat=Electronics`.

All filtering and sorting is wrapped in `useMemo` with the right dependency array, so it only recomputes when the data or filter values actually change.

**`pages/Dashboard.tsx` — Admin Analytics**

[SHOW: Dashboard.tsx]

The dashboard page calls `getDashboard()` once and renders the response into four visual sections.

Four KPI cards at the top: Total Revenue, Total Profit (with the margin percentage as a subtitle), Total Orders (with cancelled orders as context), and Average Order Value. Each card gets a color and an icon.

Below that, two charts side by side — a `RevenueChart` showing monthly revenue as a line or bar chart, and a `CategoryChart` showing category revenue breakdown. These use Recharts under the hood.

Finally, a top products table — ranked by revenue, showing units sold and profit for each. The profit column is highlighted in emerald green to draw the eye.

The whole page is a single data fetch, single render. Clean and fast.

---

### [13:30] — THE CHATBOT COMPONENT

**`components/Chatbot.tsx`**

[SHOW: Chatbot.tsx, floating button and panel]

The chatbot component is the visual container. It manages one piece of state: `isOpen`. Everything else — messages, loading state, sending — is delegated to the `useChat` hook.

When `isOpen` is false, you see the floating button in the bottom-right corner with a pulsing animation:

```tsx
style={
  !isOpen
    ? { animation: "pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite" }
    : {}
}
```

[SHOW: floating button section]

The pulse is applied via an inline style only when the chat is closed — it's a visual cue that says "this button does something, click me." When the chat is open, the pulse stops and the button turns dark gray with an X icon.

The chat panel itself has a gradient header with the assistant's name and subtitle "RAG-Powered Analytics", a scrollable message area, and a typing indicator that shows three animated dots while `isLoading` is true.

The suggested question pills are smart about when they show:

```tsx
{messages.length <= 1 && !isLoading && (
  <div className="flex flex-wrap gap-2">
    {SUGGESTED_QUESTIONS.map((q, i) => (
      <button onClick={() => sendMessage(q)}>...</button>
    ))}
  </div>
)}
```

[SHOW: this conditional render]

They only appear when there's just the welcome message — so they guide new users, but disappear once the conversation starts. Each pill calls `sendMessage` directly, so clicking one fires the full RAG pipeline.

---

### [14:30] — WRAP-UP

So let's zoom out and look at what this project demonstrates.

[SHOW: architecture diagram again]

You have a production-grade FastAPI backend with proper separation of concerns — config, models, services, routers, and the RAG pipeline as its own module hierarchy.

The RAG pipeline has a sophisticated indexer that converts structured business data into semantically rich text, with pre-computed analytics chunks that are the secret weapon for getting accurate answers to aggregate questions.

The frontend is a complete dual-surface application — consumer storefront and admin dashboard — built with React 19 and TypeScript. State management is clean: Context for cart, custom hooks for chat and data fetching, URL params for filter state.

And connecting them is a floating AI chatbot that gives instant feedback with optimistic UI and keeps answers grounded to real business data through Claude's strict system prompt.

If you want to learn more about how the RAG pipeline handles edge cases, how the FAISS index is dimensioned, or how to extend this with real-time data, the full source code is on GitHub — link in the description.

If you found this walkthrough useful, hit that like button and subscribe — I walk through full-stack projects like this regularly. And if you're building something similar or have questions about any of the design decisions, drop them in the comments. I read every one.

See you in the next one.

---

## END CARD

**[SHOW: End screen with:**
- **Subscribe button**
- **Link card: "GitHub Repository — AskMyStore"**
- **Link card: Previous video suggestion]**

---

*Total estimated word count: ~2,100 words | Estimated read time at normal pace: 13–14 minutes*
