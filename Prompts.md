# TaskMatrix AI Prompt Log

This document records the AI-assisted architectural queries used during Sprint 13. It captures the purpose of each prompt, the resulting decision, and the human validation still required. Prompts were used for planning—not as a substitute for engineering review.

## Prompt 1 — Product Scope and MVP Prioritization

**Prompt**

> Act as a senior product manager. Scope a five-week commercial-grade Jira/Asana-inspired capstone for one Fullstack engineer. Separate features into P0, P1, and P2. Preserve an end-to-end workflow that demonstrates authentication, RBAC, Kanban interaction, backend APIs, MongoDB, real-time updates, background jobs, testing, and deployment. Identify features that should explicitly be excluded to prevent scope creep.

**Purpose:** Establish a realistic delivery boundary.

**Decision adopted:** Authentication, RBAC, workspaces/projects, Kanban task lifecycle, comments, activity history, and responsive UX form P0. Real-time updates and reminder jobs remain P1. Portfolio planning, workflow automation builders, and native mobile applications are out of scope.

**Human validation:** Confirm that P0 is achievable within the engineer's weekly availability.

## Prompt 2 — MongoDB Collection Design

**Prompt**

> Design a tenant-safe MongoDB model for TaskMatrix with Users, Workspaces, Memberships, Projects, Boards, Columns, Tasks, Comments, Activities, Notifications, and Sessions. Explain which values should be embedded versus referenced, identify every tenant boundary, and propose indexes for board ordering, assignments, due dates, activity feeds, and unread notifications. Avoid unbounded embedded arrays.

**Purpose:** Define collection boundaries and query paths.

**Decision adopted:** Independent or unbounded entities are referenced. Bounded task labels and attachment metadata are embedded. Every tenant-owned document carries `workspaceId`; authorization is performed through Membership before data access.

**Human validation:** Review expected collection sizes and MongoDB Atlas index limits before implementation.

## Prompt 3 — RBAC and Authorization Matrix

**Prompt**

> Create a least-privilege authorization matrix for Workspace Admin, Project Manager, Team Member, and Viewer in a multi-tenant task management product. Cover workspace settings, invitations, roles, projects, boards, tasks, comments, attachments, and activity logs. Explain where authorization must be enforced in an Express API and how to prevent cross-workspace IDOR attacks.

**Purpose:** Prevent UI-only authorization and tenant data leaks.

**Decision adopted:** Authentication, membership lookup, role/permission evaluation, and resource-to-workspace validation form separate API middleware stages. Client-side permissions improve UX but never grant authority.

**Human validation:** Convert the matrix into automated deny-path integration tests.

## Prompt 4 — Kanban Ordering and Concurrency

**Prompt**

> Compare integer ordering, fractional indexing, and linked-list ordering for drag-and-drop cards in MongoDB. Recommend an approach suitable for a five-week capstone, including the move API contract, atomic update strategy, conflict handling, and when positions should be rebalanced.

**Purpose:** Make task movement persistent and concurrency-aware.

**Decision adopted:** Use numeric positions with gaps and a dedicated `PATCH /tasks/:taskId/move` command. Each task has a version field. Rebalance a column transactionally when gaps become too small; stale client versions trigger refetch and retry.

**Human validation:** Load-test moving cards in a large synthetic column and confirm transaction support on the selected Atlas tier.

## Prompt 5 — REST API Contract

**Prompt**

> Propose a versioned REST API for TaskMatrix covering authentication, workspaces, invitations, memberships, projects, board reads, task CRUD, task movement, comments, activities, and notifications. Include status codes, validation boundaries, pagination, idempotency considerations, and a consistent error envelope. Keep endpoints resource-oriented except for explicit domain commands.

**Purpose:** Establish predictable frontend/backend boundaries.

**Decision adopted:** Use `/api/v1`, cursor pagination for feeds, Zod request validation, a consistent error structure, and a domain command endpoint for task movement. Invitation acceptance and task movement require idempotency protection.

**Human validation:** Produce an OpenAPI document before endpoint implementation.

## Prompt 6 — Real-Time Architecture

**Prompt**

> Design a Socket.IO event strategy for a multi-workspace Kanban application. REST must remain the source of truth. Define authenticated room membership, authorized event audiences, event names and payloads, optimistic UI reconciliation, reconnect behavior, and protections against clients emitting privileged state changes.

**Purpose:** Add collaboration without bypassing the API security model.

**Decision adopted:** Clients join authorized project rooms after token and membership checks. Writes flow through REST; the server emits events only after persistence. Payloads include entity version and actor summary so clients can reconcile or invalidate stale state.

**Human validation:** Test revoked membership, reconnect, duplicate delivery, and out-of-order events.

## Prompt 7 — Deadline Job Reliability

**Prompt**

> Design a node-cron deadline reminder job for tasks with due dates. Explain indexes, time-zone handling, overdue transitions, notification deduplication, retry safety, observability, and the limitations of running cron on horizontally scaled stateless API instances.

**Purpose:** Prevent duplicate reminders and unreliable scheduling.

**Decision adopted:** Store timestamps in UTC, query indexed due-date windows, create notifications with a unique deduplication key, and keep the job idempotent. For the capstone, run a single designated worker process; document a queue-based migration for production scale.

**Human validation:** Confirm deployment platform worker behavior and daylight-saving test cases.

## Prompt 8 — Authentication and Session Security

**Prompt**

> Threat-model email/password authentication for a Next.js and Express application using short-lived JWT access tokens and rotating refresh tokens. Cover token storage, cookie flags, password hashing, session revocation, CSRF, XSS, rate limiting, account enumeration, and secret rotation. Recommend a capstone-appropriate design.

**Purpose:** Convert a generic JWT choice into a defensible session design.

**Decision adopted:** Short-lived access tokens and rotating, hashed refresh-session records; HTTP-only secure same-site cookies where supported; generic auth error messages; endpoint rate limits; explicit logout/revocation; and no tokens in local storage.

**Human validation:** Review final cross-origin deployment domains before selecting exact cookie and CSRF settings.

## Prompt 9 — UI/UX and Accessibility Review

**Prompt**

> Review three planned TaskMatrix screens—authentication, Kanban dashboard, and task details—against modern SaaS UX and WCAG 2.1 AA. Specify information hierarchy, responsive behavior, keyboard alternatives to drag-and-drop, focus management, validation feedback, empty/loading/error states, and color-independent status cues.

**Purpose:** Make the wireframes implementation-ready and auditable.

**Decision adopted:** Keep global and project navigation distinct, expose filters beside board controls, use a detail panel with clear metadata and tabs, provide explicit move controls for keyboard users, and pair every colored state with visible text or icons.

**Human validation:** Conduct keyboard-only and screen-reader checks on implemented components.

## Prompt 10 — Testing and Release Plan

**Prompt**

> Create a risk-based testing and release plan for a five-week TaskMatrix capstone. Prioritize tenant isolation, RBAC deny paths, board ordering, optimistic updates, job idempotency, and responsive accessibility. Separate unit, component, API integration, and end-to-end coverage. Define a small release checklist for Vercel, Render, MongoDB Atlas, Cloudinary, and Sentry.

**Purpose:** Align testing effort with product risk.

**Decision adopted:** Put most API integration effort into authorization and tenant isolation; unit-test ordering and reminder logic; component-test accessible controls; cover the happy-path workflow with E2E tests; and require environment, CORS, indexes, error tracking, health checks, and rollback confirmation before launch.

**Human validation:** Establish measurable coverage thresholds after the first vertical slice.

## Prompt Engineering Approach

Each query deliberately includes:

1. A clear expert role and product context.
2. The delivery constraint of one engineer and five weeks.
3. Concrete entities, risks, and expected output.
4. Trade-offs or failure modes to evaluate.
5. A request for actionable decisions rather than generic advice.

No generated recommendation is automatically accepted. Decisions are checked against scope, security, accessibility, deployment constraints, and reviewer feedback.

---

## Sprint 16 — AI Injection Prompt Log

### Prompt 11 — Select a Bounded AI Micro-feature

**Prompt**

> Act as a senior fullstack engineer reviewing TaskMatrix under a code freeze. Select one AI micro-feature that improves an existing task workflow without adding a new macro-feature, routing pipeline, or MongoDB collection. Compare task summarization, priority prediction, and task sub-step generation. Recommend the smallest useful server-side interaction and define its human-review boundary.

**Reasoning goal:** Add measurable AI value without expanding the locked architecture.

**Decision adopted:** Generate three to eight actionable task sub-steps from the existing task title and description. Suggestions remain transient until the user reviews and selects them; accepted items are embedded in the existing Task document instead of creating a collection.

**Human validation:** Confirm generated steps are relevant, non-duplicative, and safe before adding them to a task.

### Prompt 12 — Secure Gemini Endpoint Contract

**Prompt**

> Design a secure Express endpoint for AI-generated TaskMatrix sub-steps using the Google GenAI SDK. The API key must remain server-side. Define a strict Zod input schema, constrained output shape, HTTP failure mapping, rate limit, request-size limit, prompt-injection resistance, and a response envelope suitable for a React client. Do not persist raw prompts or model responses.

**Reasoning goal:** Prevent key exposure, unbounded cost, malformed output, and accidental trust in model text.

**Decision adopted:** Use `POST /api/v1/ai/tasks/substeps`, validate title/description/count before the service call, request JSON, validate the returned array, limit calls to five per minute, cap JSON bodies at 100 KB, and return `502/503` dependency errors without provider internals.

**Human validation:** Configure the deployment key, review the provider's active model and quota, and test the endpoint with normal, malformed, adversarial, and rate-limit requests.

### Prompt 13 — API Validation and Error Standardization

**Prompt**

> Audit an Express and MongoDB Project/Task API for production failure modes. Create strict Zod schemas for request bodies, ObjectId route parameters, and task filters. Propose one JSON error envelope for validation errors, missing records, duplicate keys, invalid identifiers, unexpected exceptions, AI dependency failures, and throttled requests. Ensure async controllers cannot terminate the process.

**Reasoning goal:** Make every client-visible failure predictable and keep invalid payloads away from MongoDB.

**Decision adopted:** Validate requests in middleware, use explicit `try/catch` in every asynchronous controller, forward failures to a centralized handler, attach a request ID, hide unexpected internals, and use status codes `400`, `404`, `409`, `429`, `500`, `502`, and `503` according to failure type.

**Human validation:** Review logs for accidental sensitive values and run the Supertest suite before deployment.

### Prompt 14 — Responsive and Asynchronous UX Audit

**Prompt**

> Review the existing TaskMatrix Kanban and AI dialog at desktop and 390-pixel mobile widths. Identify navigation, overflow, loading, empty, error, keyboard, reduced-motion, and notification requirements. Keep the feature set unchanged and recommend only interaction-state improvements.

**Reasoning goal:** Make the existing workflow feel reliable without violating the feature freeze.

**Decision adopted:** Use a functional mobile drawer, horizontal snap-scrolling board columns, visible focus states, an accessible modal, skeleton and spinner feedback, a branded empty search state, reduced-motion support, and non-blocking toast notifications instead of `alert()`.

**Human validation:** Test on a physical phone and complete a keyboard-only pass in the deployed build.

## Sprint 16 Human Review Checklist

- [x] AI input and output are validated at runtime.
- [x] Model credentials remain in server environment variables.
- [x] The AI endpoint has an application-level rate limit.
- [x] Unexpected errors do not reveal stack traces or provider details.
- [x] Users review suggestions before adopting them.
- [x] No new MongoDB collection was introduced for the AI feature.
- [ ] Repository owner adds `GEMINI_API_KEY`, `MONGODB_URI`, and deployment origins.
- [ ] Repository owner verifies current Gemini quota/cost settings in Google AI Studio.
- [ ] Reviewer checks deployed mobile behavior and AI output quality.
