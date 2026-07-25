# Clearline — AI Tax Platform Case Study

A working prototype covering all 10 challenges from the case study brief: a role-aware
tax platform shell with source-document traceability, client/CPA collaboration, a
first-run onboarding flow, cross-object navigation, a status system, a prioritized
dashboard, a consistent editable/locked field system, a large-scale document browser,
and an AI trust panel backed by real Groq API calls.

## Running it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. `.env.local` already contains `GROQ_API_KEY` for the live
AI calls (explanations + review recommendations) — without it, those two endpoints fall
back to a static message instead of failing.

## How to explore it

There's no real login. Click the avatar menu in the top right ("Demo: view as") to
switch between seven seeded personas covering all five roles — **Client**, **Business
Owner**, **Employee**, **Reviewer**, **Admin**:

- **Jane Smith** — Client, blocked on a missing document
- **Carol Davis** — Business Owner, return ready to sign
- **Alex Chen** — Employee (Prep Team), *and* has a personal return in the system (toggle
  "Employee" / "My Personal Return" in the top bar to see the dual-role handling)
- **Sarah Johnson** — Reviewer (Review Team)
- **Mike Davis** — Admin, sees every return and can (re)assign clients to employees
- **Priya Patel** — Employee (Prep Team)
- **Sam Rivera** — brand-new Client, first login — switching to Sam drops you straight
  into the onboarding flow

The persona persists across reloads (stored in `localStorage`). Client-facing return
reassignment (see "Assigning clients to employees" below) is session-only React state —
resets on a hard reload, same as chat history and onboarding completion.

## Assigning clients to employees

As **Mike Davis (Admin)**, the "Assigned employee" column on `/returns` (and the same
field on a return's detail page) becomes a live dropdown instead of static text — pick
any Employee and the reassignment takes effect immediately across the app: switch to that
employee's persona and their dashboard/queue now includes the reassigned client. Only
users with the `employee` role are assignable (Reviewer is a separate function and isn't
reassigned this way in this prototype). Backed by `src/context/AssignmentContext.tsx`.

## Challenge → where to look

| # | Challenge | Where |
|---|---|---|
| 01 | Source Document Traceability | `/returns/R001/review` — click a field, watch the highlighted region move on the mock document |
| 02 | Client & CPA Collaboration | `/messages` and `/returns/[id]/messages` — internal vs. client-visible messages, outstanding-request tracking |
| 03 | Where to Start | Switch to **Sam Rivera** — auto-routes to `/onboarding` |
| 04 | Getting Lost in the App | Breadcrumbs on every page + the "Related" panel on `/returns/[id]` linking documents/tasks/threads |
| 05 | Role-Aware Experiences | Sidebar/dashboard change per persona; Alex Chen's dual-role toggle; Admin's assign-to-employee control on `/returns` |
| 06 | Return Status & Progress | `/returns/[id]` — 5-stage client timeline vs. detailed staff status |
| 07 | An Actionable Dashboard | `/` as any staff persona — returns ranked by overdue/blocked/"needs your action," not just a list |
| 08 | Clickable vs. Editable | `/design-system` — the `Field` component legend, reused verbatim on the review screen |
| 09 | Complexity Made Navigable | `/documents` — ~260 generated documents, search, type filter, group-by-client, pagination |
| 10 | Trustworthy AI | The "AI Review Notes" panel at the bottom of `/returns/[id]/review` — click "Generate review notes" |

## AI touchpoints (all backed by real Groq calls, `llama-3.3-70b-versatile`)

1. **Field explanation** — "What does this mean?" on each field on `/returns/[id]/review` (`/api/ai/explain`).
2. **Review recommendations** — "AI Review Notes" panel, reasons over that return's fabricated extracted-field data (`/api/ai/recommendations`). Each regeneration rotates through a small set of "review lenses" (data quality, deduction opportunities, completeness, audit risk) so re-running it on the same static data gives a genuinely different angle instead of just rewording the same output.
3. **Chat assistant** — floating widget in the bottom-right corner on every page (`/api/ai/chat`). Streams token-by-token and is context-aware: it reads the current route and, on a return page, that return's status/fields, and feeds that into its system prompt so it can answer "what should I do next?" correctly instead of generically. Also embedded inline as an "Ask about this return" box at the bottom of the AI Review Notes panel.
4. **Document summarization** — "Summarize this document" on any document detail page (`/documents/[id]`, `/api/ai/summarize`) — reasons over that document's (fabricated) extracted content and flags anything that looks worth a second look.
5. **Upload & Extract** — `/documents/upload` (Preparer, Employee, Admin, Business Owner only), `/api/ai/extract-pdf`. The one place in this app where the *entire* pipeline is real, not just the AI call on top of fabricated data: upload an actual PDF, it's genuinely parsed with `unpdf` (a serverless-safe PDF.js build, no native binaries), and the raw extracted text is sent to Groq to pull out only the data points worth showing — document type, key fields, a short summary — grounded by the same retrieval layer as everything else. Real file in, real text extraction, real model call, real structured output.

## Retrieval-augmented generation (RAG)

Every AI call above is grounded in a small curated tax-knowledge corpus (`src/knowledge/taxKnowledge.ts`, ~25 snippets — W-2 boxes, 1099 types, Schedule C/E, deductions, audit risk, etc.) via a real embed → store → cosine-similarity-retrieve → inject-into-prompt pipeline (`src/lib/hashEmbedding.ts`, `src/lib/retrieval.ts`). Retrieved sources are shown as small chips under every AI response so you can see what grounded the answer — the retrieval half of RAG made visible, not just claimed.

**On not using a literal vector database:** the ask was originally for ChromaDB, but the `chromadb` npm package is only an HTTP client — it requires a separately-running Chroma server (self-hosted or Chroma Cloud), which conflicts with this being a single self-contained app deployable to Vercel as one hosted link. The same tradeoff applies to a "real" transformer-embedding library (`@huggingface/transformers` pulls in native ONNX runtime binaries and `sharp`, real weight/cold-start risk in a serverless function). So the embedding function here is a dependency-free hashing-trick vector (feature hashing + cosine similarity, `src/lib/hashEmbedding.ts`) — the retrieval *pipeline* is the same one a production RAG system uses, only the embedding function is swapped for something that has zero external infra and zero deploy risk. Swapping in real ChromaDB + transformer embeddings later would only mean changing `retrieval.ts`, not the calling code.

## Security hardening on the AI endpoints

- **Prompt-injection guardrails** (`src/lib/promptSafety.ts`): every system prompt explicitly instructs the model to treat user content as untrusted data, not instructions, and all user-supplied text is wrapped in `<<<user_content>>>` delimiters before being sent.
- **Rate limiting** (`src/lib/rateLimit.ts`): 20 requests/minute per IP, shared across all four AI routes, to protect the Groq key from abuse. In-memory (resets per server instance) — a production deployment would back this with Redis/Upstash instead.
- **Input validation**: every AI route validates and length-caps its inputs (e.g. chat messages capped at 20 messages / 2000 chars each) and returns a clean 400 on malformed input rather than passing garbage to the model.

## What's real vs. simulated

**Real:**
- The whole frontend — every filter, search, edit-in-place, pagination, breadcrumb, and
  onboarding step is live React state, not static mockups.
- All four AI endpoints (`/api/ai/explain`, `/api/ai/recommendations`, `/api/ai/chat`,
  `/api/ai/summarize`) make genuine calls to Groq (`llama-3.3-70b-versatile`) using the
  provided API key, grounded by a real retrieval step over the knowledge corpus (see
  "Retrieval-augmented generation" below) — you can watch responses reference the actual
  confidence scores, dollar amounts, and retrieved knowledge snippets.

**Simulated (per the brief's "keep it quick and dirty" guidance):**
- Document OCR/extraction: every `ExtractedField` (value, confidence score, source
  page/region, calculation trail) in `src/mocks/data.ts` is hand-authored fake data.
  There's no real parser.
- Document previews are stylized placeholders (gray bars + a highlighted box), not
  real PDF rendering.
- Authentication/roles: the persona switcher is a demo affordance, not real auth.
- Messaging is in-memory only — new messages you send don't persist past a reload.
- The ~60 filler returns and ~220 filler documents (for Challenge 09's scale test) are
  deterministically generated with a seeded RNG in `src/mocks/data.ts`, not real client
  data.

## Notable decisions

- **Upgraded Next.js from 9.3.3 → 16.** The repo was scaffolded with modern App Router
  tooling (Tailwind v4, `eslint-config-next` 16) but had an old `next` pin left over,
  which is incompatible with React 19 and the App Router files already in the repo.
- **One field component, everywhere.** `src/components/field/Field.tsx` is the single
  source of truth for "can I click this, can I edit this, why is it locked" — used on
  the review screen and shown explicitly in the `/design-system` gallery, per the brief's
  request to prove consistency across contexts rather than building it once.
- **Prioritization is a real scoring function** (`src/lib/priority.ts`), not a sort by
  due date: overdue → blocked → "it's your turn" → due this week → everything else.
- **Five roles, not six.** Started with Individual Taxpayer / Business Owner / Preparer /
  Reviewer / Admin / Seasonal Staff; simplified to Client / Business Owner / Employee /
  Reviewer / Admin — Preparer and Seasonal Staff collapsed into one Employee role (which
  return each Employee is *currently* preparing is a separate, reassignable, per-return
  fact — see "Assigning clients to employees" — not a fixed account role) since six was
  more than this UI needed to demonstrate role-awareness clearly.
