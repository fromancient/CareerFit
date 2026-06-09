# CareerFit AI

CareerFit AI is a fullstack conversational AI assistant that analyzes a resume against multiple job descriptions and answers grounded questions about fit, gaps, alignment, and interview preparation.

## Demo

Quick path:

1. Open `/upload` → **Load demo documents**
2. Auto-redirects to `/dashboard` with fit analysis
3. Use tabs on mobile: **Career Assistant** | Fit Dashboard | Documents
4. On desktop: 3-column workspace with chat on the right

Screenshots (add after running locally):

- Upload screen — `/upload`
- Fit dashboard — center panel on `/dashboard`
- Career Assistant — right panel (desktop) or **Career Assistant** tab (mobile)
- Skill gap analysis — Fit Dashboard tab

## Quick Start

1. **Clone repo**

   ```bash
   git clone <repo-url>
   cd careerfit-ai
   ```

2. **Copy environment file**

   ```bash
   cp .env.example .env
   ```

3. **Add OpenAI API key** to `.env`:

   ```
   OPENAI_API_KEY=sk-...
   ```

4. **Start Postgres with Docker**

   ```bash
   docker compose up -d
   ```

5. **Run migrations**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. **Start dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Architecture

```text
User uploads resume + JDs
        |
        v
Parser extracts clean text (PDF, DOCX, TXT)
        |
        v
Chunker creates resume chunks + JD chunks
        |
        v
Embedding service (OpenAI text-embedding-3-small)
        |
        v
Postgres + pgvector stores:
  - documents, chunks, embeddings, metadata
        |
        v
Retriever:
  - metadata filter by session + document type
  - vector search (cosine distance)
  - keyword boost for exact tech terms
  - light reranking in code
        |
        v
LLM answer generation (GPT-4o-mini):
  - grounded answer
  - citations
  - confidence signal
  - missing evidence warning
        |
        v
Chat UI + Fit Dashboard
```

## RAG Approach

| Stage | Strategy |
|-------|----------|
| **Document parsing** | `pdf-parse`, `mammoth`, plain text; sanitize prompt-injection patterns |
| **Chunking** | Resume: section-based (Summary, Experience, Skills…), 300–600 token budget. JD: semantic sections (Responsibilities, Required Skills…), 500–800 token budget |
| **Embedding model** | OpenAI `text-embedding-3-small` (1536 dimensions) |
| **Vector storage** | Postgres + pgvector, vectors stored alongside relational metadata |
| **Retrieval** | Session-scoped metadata filter → pgvector cosine search → keyword boost → light rerank |
| **Prompting** | Strict system prompt: answer only from context, separate Direct answer / Evidence / Caveats / Next step |
| **Citation handling** | Chunk IDs and source labels passed in context; evidence panel shows retrieved chunks |
| **Guardrails** | No invented experience, low-confidence warnings, file size limits, session isolation, injection pattern stripping |

## Technical Decisions

- **Next.js** — Single-repo fullstack with App Router, API routes, and streaming chat UI
- **Postgres + pgvector** — Keeps vectors beside relational data; simpler ops than adding a separate vector DB early
- **OpenAI embeddings** — Cost-effective `text-embedding-3-small` with strong semantic matching for resume/JD text
- **Simple retrieval before agentic complexity** — I intentionally avoided building a complex autonomous agent. The assignment is about grounded question answering, so I optimized for a reliable RAG loop: parse, chunk, retrieve, cite, answer, evaluate. I'd rather have a boring pipeline that gives trustworthy answers than an impressive agent that guesses.

## Productionization

To productionize this, I would separate ingestion from chat serving. File uploads would go to object storage such as S3 or GCS. A background worker would parse, chunk, embed, and index documents asynchronously. Postgres with pgvector can remain the first production vector store because it gives strong consistency and simpler operations, but at larger scale I would evaluate dedicated vector search systems or managed Postgres read replicas. The API layer would run behind a load balancer with rate limiting, auth, tenant isolation, request tracing, and structured logs. I would add golden-set evaluations, user feedback capture, model/version tracking, and alerting for latency, retrieval failures, hallucination risk, and LLM cost.

## Engineering Standards

**Included:**

- TypeScript
- ESLint
- Prettier
- Zod validation
- Docker Compose
- Unit tests for chunking, retrieval keywords, prompts (`npm test`)
- Structured errors
- Golden eval set in `lib/evals/golden-set.ts`

**Skipped:**

- Full auth
- Enterprise RBAC
- Human feedback loop
- Advanced reranker (e.g. Cohere)
- Multi-modal resume parsing

## AI Tool Usage

AI coding tools assisted with boilerplate scaffolding (Next.js setup, component structure, test stubs) and documentation drafting. Final architecture, retrieval trade-offs, prompt design, guardrails, and eval case design were reviewed and shaped manually.

## What I'd Do Differently With More Time

- Add hybrid BM25 + vector retrieval
- Add a dedicated reranker model
- Add feedback-based eval loop (RAGAS-style automation)
- Add resume rewrite suggestions with diff view
- Add recruiter-style score calibration across roles
- Deploy to AWS/GCP with OpenTelemetry traces

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run lint` | ESLint |

## Project Structure

```text
app/
  page.tsx              Landing
  upload/page.tsx       Document upload
  dashboard/page.tsx    Decision workspace
  api/                  upload, chat, analyze, session
components/             UI panels
lib/
  ai/                   prompts, embeddings, retrieval, generation
  documents/            parse, chunk, normalize
  db/                   Prisma client and queries
  evals/                golden test set
prisma/                 schema and migrations
tests/                  unit tests
```
