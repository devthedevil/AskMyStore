# ShopRAG — Single Agent RAG E-Commerce Analytics

A full-stack **Retrieval-Augmented Generation (RAG)** application that consumes e-commerce data and answers natural language queries about sales, products, prices, profits, customers, trends, and **customer reviews & return reasons** through an AI-powered chatbot.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude_AI-Anthropic-D97706)

---

## Overview

ShopRAG is a single-agent RAG system that:

1. **Indexes** all e-commerce data (products, orders, customers, sales, and customer reviews) into a FAISS vector store
2. **Retrieves** the most relevant data chunks using semantic similarity search
3. **Generates** accurate, data-driven answers using Claude AI with the retrieved context

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + TypeScript)         │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │  Consumer Store  │  │  Admin Dashboard │  │  AI Chatbot │  │
│  │  - Home          │  │  - KPI Cards     │  │  (floating) │  │
│  │  - Shop/Catalog  │  │  - Sales Charts  │  │             │  │
│  │  - Product Detail│  │  - Orders Table  │  │  Ask about: │  │
│  │  - Cart/Checkout │  │  - Products Mgmt │  │  sales,     │  │
│  └──────────────────┘  └──────────────────┘  │  inventory, │  │
│                                               │  customers  │  │
│                                               └─────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │  Axios HTTP
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI + Python)                 │
│                                                                 │
│  GET /api/products     GET /api/orders     GET /api/dashboard   │
│  GET /api/categories   GET/POST /api/reviews                   │
│                                   POST /api/chat ←── RAG here  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    RAG PIPELINE                         │   │
│  │                                                         │   │
│  │  User Query                                             │   │
│  │      │                                                  │   │
│  │      ▼                                                  │   │
│  │  [SentenceTransformer]  ──embed──▶  [FAISS Index]       │   │
│  │  (all-MiniLM-L6-v2)                 top-10 chunks       │   │
│  │                                          │              │   │
│  │                                          ▼              │   │
│  │                              [Claude AI (Anthropic)]    │   │
│  │                              prompt = query + context   │   │
│  │                                          │              │   │
│  │                                          ▼              │   │
│  │                              answer + source citations  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER (JSON)                        │
│                                                                 │
│  products.json (40)  orders.json (115)  customers.json (25)     │
│  categories.json (8)                   sales_summary.json (12mo)│
└─────────────────────────────────────────────────────────────────┘
```

### RAG Pipeline

```
         "What are the top 3 return reasons in the last quarter?"
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │  Embed with          │
                         │  SentenceTransformer │  ──▶  384-dim vector
                         └─────────────────────┘
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │  FAISS Similarity   │
                         │  Search             │  ──▶  Top 10 relevant chunks
                         └─────────────────────┘          from 301 total
                                     │
                ┌──────────────┬─────┴─────┬──────────────┐
                ▼              ▼           ▼              ▼
          order chunks   sales chunks  review chunks  review analytics
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │  Claude API         │
                         │  (context-grounded) │  ──▶  "#1 Wrong Size..."
                         └─────────────────────┘       + [source] citations
```

### FAISS Index Composition (301 chunks at startup)

```
  Orders           ███████████████████████  115 chunks  (individual order records)
  Reviews          █████████████████  83 chunks   (individual customer reviews)
  Products         ████████  40 chunks   (product details with margin/stock)
  Customers        █████  25 chunks      (customer profiles and spend)
  Sales Summary    ████  13 chunks       (12 monthly + 1 overall business summary)
  Pre-computed     ████  12 chunks       (top sellers, weekly/daily breakdowns)
  Review Analytics █  5 chunks           (return reasons, ratings, category returns)
  Categories       ██  8 chunks          (category-level aggregations)
```

### Data Flow by Request Type

| Request | Frontend → Backend → Response |
|---|---|
| Browse products | `GET /api/products` → products.json → `StoreProductCard` grid |
| Admin KPIs | `GET /api/dashboard/summary` → computed from all JSON → charts |
| Ask chatbot | `POST /api/chat` → FAISS search → Claude → answer + sources |
| Filter orders | `GET /api/orders?status=shipped` → filtered JSON → table |
| View product reviews | `GET /api/reviews/?product_id=1` → reviews.json → reviews section |
| Submit review | `POST /api/reviews/` → save to reviews.json → confirmation |
| Return request | `POST /api/reviews/` with `has_return_request=true` → pending return |

---

## Features

### Consumer Storefront (`/`)
- **Homepage** — Hero banner, shop-by-category grid with real images, featured products, best value picks, and CTA banner
- **Shop Page** (`/shop`) — Full product catalog with sidebar category filters, price range slider, sort options (featured, price, rating, name), and search
- **Product Detail** (`/product/:id`) — Large product image, ratings, description, quantity selector, add-to-cart, customer reviews section, and "Write a Review" button
- **Shopping Cart** (`/cart`) — Cart items with quantity controls, order summary with subtotal/shipping/tax calculation
- **Product Images** — All 40 products have real photographs from Unsplash
- **Responsive Navigation** — Sticky navbar with category links, search bar, and cart badge

### Customer Reviews & Feedback
- **Review Submission Modal** — Star rating (1–5 with hover labels), review title and free-text, accessible from every product detail page
- **Return Request Flow** — Toggle inside the review modal to file a return; customer selects from 7 standardized return reasons and adds optional details
- **Return Reasons** — Wrong Size / Poor Fit · Product Quality Issue · Item Not as Described · Arrived Damaged · Changed My Mind · Better Price Found Elsewhere · Missing Parts / Accessories
- **Return Status Tracking** — Each return request has a `pending / approved / rejected` status badge displayed inline with the review
- **Reviews Persist** — New reviews are written to `data/reviews.json` and immediately served by the API

### Admin Dashboard (`/admin`)
- **Dashboard** — KPI cards (revenue, profit, orders, avg order value), revenue/profit trend charts, category breakdown, top products table
- **Products Management** — 40 products across 8 categories with search and category filtering, showing price, cost, margin, rating, and stock
- **Orders Management** — 115 orders with status filtering (completed, processing, shipped, cancelled); each row shows a **Feedback column** with avg star rating and return request count

### RAG Chatbot (available on all pages)
- **Floating chat widget** accessible from any page (store or admin)
- **Semantic search** over all e-commerce data using FAISS vector similarity
- **Natural language answers** powered by Claude AI with source citations
- **Clickable source suggestions** — source tags below responses are clickable, sending them as new queries
- **Suggested questions** for quick start
- **Typing indicators** and smooth animations
- **Real-time weekly/daily analytics** — pre-computed chunks ensure accurate answers for "sales this week" and "sales today"
- **Review & return analytics** — answers questions about customer sentiment, return reasons, and product feedback trends

### Sample Questions You Can Ask
- "What was the total revenue last quarter?"
- "Which product has the highest profit margin?"
- "Show me monthly sales trends"
- "Who are the top customers by spending?"
- "Which category generates the most revenue?"
- "How many orders were cancelled?"
- "What were sales this week?"
- "Compare today's sales vs yesterday"
- "Compare Electronics vs Clothing performance"
- "What is the average order value?"
- "What are the top 3 reasons customers are returning products in the last quarter?"
- "Which product category has the highest return rate?"
- "What do customers say about the Athletic Running Shoes?"
- "How many return requests were filed in Q1 2026?"
- "Which products have the most negative reviews?"

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | UI framework |
| **Styling** | Tailwind CSS 4 | Utility-first styling |
| **Charts** | Recharts | Revenue/profit visualizations |
| **Icons** | Lucide React | UI icons |
| **Build Tool** | Vite | Fast dev server & bundler |
| **Backend** | FastAPI | REST API server |
| **Embeddings** | SentenceTransformers (all-MiniLM-L6-v2) | Text → vector embeddings |
| **Vector Store** | FAISS (faiss-cpu) | Similarity search index |
| **LLM** | Claude AI (Anthropic API) | Answer generation |
| **Data** | JSON files | E-commerce sample data |

---

## Project Structure

```
single-agent-rag-application/
│
├── backend/                          # Python FastAPI Backend
│   ├── main.py                       # App entry point, CORS, lifespan
│   ├── config/
│   │   └── settings.py               # App configuration
│   ├── models/
│   │   └── schemas.py                # Pydantic request/response models
│   ├── services/
│   │   └── data_loader.py            # JSON data loading & caching
│   ├── routers/
│   │   ├── products.py               # GET /api/products
│   │   ├── categories.py             # GET /api/categories
│   │   ├── orders.py                 # GET /api/orders
│   │   ├── dashboard.py              # GET /api/dashboard/summary
│   │   ├── chat.py                   # POST /api/chat
│   │   └── reviews.py                # GET/POST /api/reviews, GET analytics
│   ├── rag/
│   │   ├── indexer.py                # Data → text chunks → FAISS index (incl. reviews)
│   │   ├── retriever.py              # Query embedding → similarity search
│   │   ├── generator.py              # Prompt construction → Claude API
│   │   └── engine.py                 # RAG orchestrator
│   └── requirements.txt
│
├── frontend/                         # React + TypeScript Frontend
│   ├── src/
│   │   ├── layouts/
│   │   │   ├── StoreLayout.tsx       # Consumer store layout (navbar + footer)
│   │   │   └── AdminLayout.tsx       # Admin layout (sidebar)
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Consumer homepage (hero, categories, featured)
│   │   │   ├── Shop.tsx              # Product listing with filters & search
│   │   │   ├── ProductDetail.tsx     # Single product page with add-to-cart
│   │   │   ├── Cart.tsx              # Shopping cart with order summary
│   │   │   ├── Dashboard.tsx         # Admin KPI cards + charts + top products
│   │   │   ├── Products.tsx          # Admin product catalog with filters
│   │   │   └── Orders.tsx            # Admin orders table with status filters
│   │   ├── components/
│   │   │   ├── StoreNavbar.tsx       # Consumer navbar (search, cart, categories)
│   │   │   ├── StoreProductCard.tsx  # Consumer product card with add-to-cart
│   │   │   ├── Footer.tsx            # Store footer
│   │   │   ├── Chatbot.tsx           # Floating RAG chat widget
│   │   │   ├── ChatMessage.tsx       # Message bubbles with citations
│   │   │   ├── ChatInput.tsx         # Chat input with send button
│   │   │   ├── ReviewModal.tsx       # Review submission modal (rating + return request)
│   │   │   ├── Sidebar.tsx           # Admin navigation sidebar
│   │   │   ├── KPICard.tsx           # Dashboard stat cards
│   │   │   ├── ProductCard.tsx       # Admin product display cards
│   │   │   └── SalesChart.tsx        # Revenue & category charts
│   │   ├── hooks/
│   │   │   ├── useChat.ts            # Chat state management
│   │   │   └── useCart.tsx           # Cart context (add, remove, update)
│   │   ├── services/
│   │   │   └── api.ts                # API client (axios)
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   └── styles/
│   │       └── globals.css           # Tailwind + custom animations
│   └── vite.config.ts
│
├── data/                             # E-Commerce Sample Data
│   ├── products.json                 # 40 products, 8 categories
│   ├── categories.json               # 8 categories
│   ├── orders.json                   # 115 orders
│   ├── customers.json                # 25 customers
│   ├── sales_summary.json           # 12 months of aggregated sales
│   └── reviews.json                  # 83 customer reviews with return requests
│
├── .env                              # API keys (not committed)
├── .gitignore
├── start.sh                          # One-command startup script
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Anthropic API Key** — Get one at [console.anthropic.com](https://console.anthropic.com/)

### 1. Clone & Setup

```bash
cd "AskMyStore"
```

### 2. Configure API Key

```bash
# Edit the .env file and add your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env
```

### 3. Install Dependencies

```bash
# Backend
pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install && cd ..
```

### 4. Run the Application

**Option A: Using the startup script**
```bash
./start.sh
```

**Option B: Run manually (two terminals)**

Terminal 1 — Backend:
```bash
python -m uvicorn backend.main:app --port 8000 --reload
```

Terminal 2 — Frontend:
```bash
cd frontend && npm run dev
```

### 5. Open the App

| Service | URL |
|---------|-----|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:8000](http://localhost:8000) |
| API Docs (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/products/` | List all products (optional `?category_id=N`) |
| `GET` | `/api/products/{id}` | Get single product with image URL |
| `GET` | `/api/categories/` | List all categories |
| `GET` | `/api/orders/` | List orders (optional `?status=completed&limit=50`) |
| `GET` | `/api/orders/stats` | Order statistics |
| `GET` | `/api/dashboard/summary` | Full dashboard KPIs, charts, top products |
| `POST` | `/api/chat/` | RAG chat — send `{"query": "..."}`, get AI answer |
| `GET` | `/api/reviews/` | List reviews (optional `?product_id=N` or `?order_id=N`) |
| `GET` | `/api/reviews/{id}` | Get single review by ID |
| `POST` | `/api/reviews/` | Submit a new review (with optional return request) |
| `GET` | `/api/reviews/analytics/summary` | Return reason stats, Q1 breakdown, category return rates |

### Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Hero, categories, featured products, best value |
| `/shop` | Shop | Full catalog with filters, search, sort |
| `/shop?cat=Electronics` | Shop (filtered) | Category-filtered product listing |
| `/product/:id` | Product Detail | Full product page with add-to-cart |
| `/cart` | Shopping Cart | Cart items, quantity controls, order summary |
| `/admin` | Admin Dashboard | KPIs, revenue charts, top products |
| `/admin/products` | Admin Products | Product management with margins |
| `/admin/orders` | Admin Orders | Order management with status filters |

---

## How the RAG Works

### Data Indexing (on startup)

The indexer converts all structured JSON data into **301 natural language text chunks**:

| Data Source | Chunks | Example |
|-------------|--------|---------|
| Products (40) | 40 | *"Product: iPhone 15 Pro. Category: Electronics. Price: $999.99. Cost: $649.99. Profit margin: 35.0%..."* |
| Categories (8) | 8 | *"Category: Electronics. Contains 5 products. Average price: $849.59. Average profit margin: 42.3%..."* |
| Orders (115) | 115 | *"Order #1001 placed on 2025-04-05 by Alice Johnson. Status: completed. Items: iPhone 15 Pro x1..."* |
| Customers (25) | 25 | *"Customer: Alice Johnson from New York, NY. Total orders: 4. Total spent: $3,485.92."* |
| Sales Summaries (12) | 12 | *"Monthly Sales for April 2025: Revenue $4,540.83. Profit $2,055.36. Order count: 8."* |
| Overall Summary | 1 | *"Overall Business Summary (Apr 2025 - Mar 2026): Total revenue $60,987.73..."* |
| Pre-computed Analytics | 12 | *"Top 10 Best-Selling Products by Quantity...", "Weekly Sales Breakdown...", "Daily Sales..."* |
| Customer Reviews (83) | 83 | *"Review by Alice Johnson on 2026-01-22: Product: Classic Denim Jacket. Rating: 2/5. RETURN REQUEST: Wrong Size / Poor Fit..."* |
| Review Analytics | 5 | *"Q1 2026 Return Reasons: #1 Wrong Size/Poor Fit (6), #2 Product Quality Issue (3), #3 Item Not as Described (3)..."* |

All chunks are embedded using **SentenceTransformer (all-MiniLM-L6-v2)** into 384-dimensional vectors and stored in a **FAISS IndexFlatIP** (inner product) index.

### Query Flow

1. User types a question in the chatbot
2. The query is embedded using the same SentenceTransformer model
3. FAISS performs cosine similarity search and returns the **top-10 most relevant chunks**
4. The retrieved chunks are formatted as context in a prompt sent to **Claude AI**
5. Claude generates a data-driven answer citing specific numbers from the context
6. The response is returned with source references

---

## Sample Data Summary

| Metric | Value |
|--------|-------|
| Total Products | 40 |
| Product Categories | 8 |
| Total Orders | 115 |
| Completed Orders | 101 |
| Cancelled Orders | 8 |
| Total Customers | 25 |
| Time Period | April 2025 — March 2026 |
| Total Revenue | ~$46,700 |
| Total Profit | ~$21,700 |
| Avg Order Value | ~$497 |
| Total Reviews | 83 |
| Total Return Requests | 18 |
| Overall Return Rate | ~21.7% |
| Q1 2026 Return Requests | 13 |
| Top Return Reason (Q1) | Wrong Size / Poor Fit (6 cases) |

---

## Configuration

Settings are managed via environment variables and `backend/config/settings.py`:

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | Your Anthropic API key (required) |
| `MODEL_NAME` | `claude-sonnet-4-20250514` | Claude model for generation |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | SentenceTransformer model |
| `TOP_K` | `10` | Number of chunks to retrieve per query |

---

## How It Works — In Simple Terms

> **Store data → converted to text cards → turned into number patterns → when you ask a question, find the most relevant cards → give them to Claude AI → get a smart, data-backed answer.**

Imagine you have a **library of 213 index cards**, each describing one fact about the store:

```
Card 1: "iPhone 15 Pro costs $999.99, profit margin 35%..."
Card 2: "Order #1001 placed by Alice on April 5..."
Card 3: "Top 10 best-selling products: #1 Running Shoes..."
...and so on (213 cards total)
```

When you ask **"What were sales this week?"**, here's what happens:

1. **TRANSLATE** your question into a number pattern (a "vector") — 384 numbers like `[0.23, -0.41, 0.87, ...]`
2. **COMPARE** that pattern against all 213 cards to find the 10 most similar ones
3. **GIVE** those 10 cards to Claude AI with the instruction: *"Answer the user's question using ONLY this data."*
4. **Claude AI** reads the cards and writes a nice, accurate answer with real numbers

### Why RAG Instead of Just Asking AI Directly?

Without RAG, if you ask Claude "What are my top products?", it would say *"I don't know your store data."*
With RAG, you **feed it your actual data** as context, so it gives answers based on **your real numbers** — not guesses.

### The Key Trick: Pre-Computed Analytics

A question like "top 5 selling products" needs data from **all 115 orders**. But the system only retrieves 10 cards. So at startup, the system **pre-calculates** summaries like:

- *"Top sellers: #1 Running Shoes (12 units), #2 iPhone (8 units)..."*
- *"This week's orders: 7 orders, $3,916.87 revenue..."*
- *"Today's sales: 2 orders, $1,373.96..."*

The same applies to **review analytics**. A question like "top 3 return reasons last quarter" would need to scan all 83 reviews and aggregate by time period and reason. Instead, a dedicated chunk pre-computes this at startup:

- *"Q1 2026 Return Reasons: #1 Wrong Size/Poor Fit (6 returns), #2 Product Quality Issue (3), #3 Item Not as Described (3). Affected products: Classic Denim Jacket, Athletic Running Shoes, Slim Fit Chinos..."*

These summaries become their own cards, so **one card = one complete answer**.

### Tech Stack in Plain English

| What | Tool | Why |
|------|------|-----|
| Frontend website | React + Tailwind | Makes things look nice |
| Backend server | FastAPI (Python) | Handles requests |
| Turning text → numbers | SentenceTransformers | So we can compare text mathematically |
| Finding similar cards | FAISS | Super fast similarity search by Facebook |
| Writing answers | Claude AI | Understands context and writes human-like responses |
| Data | JSON files | Simple files storing products, orders, customers, reviews |

---

## License

This project is for educational and portfolio purposes.
