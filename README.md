# TaskMatrix

> A commercial-grade agile project management platform for software teams to plan work, collaborate in real time, and deliver projects predictably.

![Release status](https://img.shields.io/badge/status-Sprint%2016%20AI%20%26%20Polish-635BFF)
![Track](https://img.shields.io/badge/track-Fullstack-0F766E)
![Primary language](https://img.shields.io/badge/language-TypeScript-3178C6)

## Project Overview

TaskMatrix is a Jira/Asana-inspired workspace for engineering teams. It centralizes projects, drag-and-drop Kanban boards, task ownership, deadlines, comments, and activity history in one role-aware product. The capstone focuses on the workflow from creating a project to moving an assigned task through delivery while preserving a reliable audit trail.

The repository now contains the original Sprint 13 blueprint plus the Sprint 16 application slice: a responsive React board, Project/Task REST endpoints, strict Zod payload validation, standardized error handling, API throttling, and a secure server-side Gemini sub-step generator.

## Sprint 16 — AI Injection & Backend Hardening

The architectural scope remains locked. Sprint 16 adds one bounded micro-feature—AI-generated task sub-steps—and hardens the existing Project and Task API boundaries without introducing a new database collection or macro-feature.

| Requirement | Implementation |
| --- | --- |
| Standard errors | Consistent `{ success: false, error: { code, message, details?, requestId } }` envelopes |
| Async safety | Every asynchronous controller catches errors and forwards them to centralized middleware |
| Payload validation | Strict Zod schemas run before Project, Task, and AI request bodies can reach a service or MongoDB |
| Status codes | `400` validation, `404` missing resource/route, `409` duplicate, `429` rate limit, `500` unexpected, and `502/503` AI dependency failures |
| AI microservice | `POST /api/v1/ai/tasks/substeps` calls Gemini from the Express server and validates the model output |
| Secret handling | `GEMINI_API_KEY` is server-only, excluded by Git, and documented only as a placeholder |
| Rate throttling | General API limit plus a stricter five-requests-per-minute AI policy |
| UX polish | Responsive board, functional mobile hamburger, accessible AI dialog, loading skeleton, empty state, and toast feedback |
| Verification | Typecheck, production build, and seven Supertest/Vitest API hardening tests |

### Run Locally

Requirements: Node.js 20+, npm, and a MongoDB connection string.

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env
```

Then replace the placeholder values in `.env`. The client runs at `http://localhost:5173` and the API at `http://localhost:5000/api/v1`.

```bash
npm run typecheck
npm test
npm run build
```

For the Sprint 16 demo, import [`docs/postman/TaskMatrix-Sprint16.postman_collection.json`](docs/postman/TaskMatrix-Sprint16.postman_collection.json) into Postman. It includes successful AI, malformed payload, and not-found requests.

### AI Endpoint

```http
POST /api/v1/ai/tasks/substeps
Content-Type: application/json
```

```json
{
  "taskTitle": "Build user authentication",
  "taskDescription": "Add a secure sign-in flow for workspace members.",
  "count": 5
}
```

Successful response:

```json
{
  "success": true,
  "message": "Sub-steps generated successfully.",
  "data": {
    "subtasks": [
      "Define the authentication contract",
      "Build the sign-in form",
      "Validate credentials on the server",
      "Issue a secure session",
      "Test success and failure paths"
    ]
  }
}
```

Validation failure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      { "field": "taskTitle", "message": "Task title must contain at least 3 characters." }
    ],
    "requestId": "generated-request-id"
  }
}
```

AI suggestions are drafts. A user must review and select suggestions before they are added to the task UI.

## Designated Track

**Fullstack Engineering**

The project will demonstrate responsive product design, typed frontend development, API design, authentication and authorization, MongoDB data modeling, background jobs, real-time events, automated testing, and cloud deployment.

## Problem Statement

Small and growing software teams often split planning, ownership, deadline tracking, and status communication across several tools. This creates unclear accountability, stale progress reports, and lost context. TaskMatrix provides a single source of truth where every task has an owner, priority, due date, workflow state, and traceable history.

## Product Goals

- Make current project status understandable in under 30 seconds.
- Allow an authorized user to create, assign, prioritize, and move a task without leaving the board.
- Preserve a searchable activity history for important task changes.
- Enforce workspace and project permissions on both the UI and API.
- Deliver a responsive, accessible experience for desktop and mobile users.

## Non-Goals for the Initial Release

- Replacing source-control or CI/CD platforms.
- Complex portfolio budgeting and resource forecasting.
- Native mobile applications.
- Marketplace integrations or custom workflow automation builders.
- Multi-region enterprise data residency.

## Target Users and Roles

| Role | Primary needs | Key permissions |
| --- | --- | --- |
| Workspace Admin | Configure the workspace and team access | Manage members, roles, projects, and workspace settings |
| Project Manager | Plan and monitor delivery | Create projects, manage boards, assign tasks, and view reports |
| Team Member | Execute assigned work | Create and update tasks, comment, attach files, and move permitted cards |
| Viewer | Follow progress safely | Read projects, boards, tasks, and activity only |

## Proposed Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Language | TypeScript | Shared type safety across frontend and backend |
| Web application | React 19 + Vite | Responsive frontend UI and production bundling |
| Styling | Modern CSS | Responsive layouts, accessible states, and reusable design tokens |
| Client state | React state | Board interaction and AI suggestion review |
| Server data | Fetch API | Typed AI endpoint requests and error handling |
| API | Node.js + Express.js | Versioned REST API and middleware pipeline |
| Database | MongoDB Atlas + Mongoose | Document storage, validation, indexes, and references |
| Authentication | JWT access/refresh tokens + bcrypt (planned) | Secure sessions and password hashing |
| Authorization | RBAC middleware (planned) | Workspace- and project-level permission enforcement |
| Validation | Zod | Runtime validation and shared request contracts |
| AI | Google GenAI SDK + Gemini | Server-side task sub-step generation |
| API security | Helmet + express-rate-limit | Security headers and request throttling |
| Testing | Vitest + Supertest | API validation, error, AI, and throttling tests |
| Deployment | Vercel, Render, MongoDB Atlas | Frontend, API, and managed database hosting |
| Monitoring | Sentry | Client and API error tracking |

## Prioritized Core Features

### P0 — Mandatory MVP

1. **Secure authentication:** Register, sign in, sign out, refresh sessions, and reset password.
2. **Role-based access control:** Admin, Project Manager, Member, and Viewer permissions enforced server-side.
3. **Workspace and project management:** Create a workspace, invite members, and create/update/archive projects.
4. **Kanban board:** Configurable columns with drag-and-drop task movement and persisted ordering.
5. **Task lifecycle:** Create, view, edit, assign, prioritize, label, set due date, and archive tasks.
6. **Comments and activity history:** Team discussion plus an append-only record of important changes.
7. **Responsive UX:** Accessible desktop, tablet, and mobile layouts with loading, empty, and error states.

### P1 — Priority Enhancements

1. Real-time board updates and activity notifications with Socket.IO.
2. Search and filtering by assignee, priority, label, status, and due date.
3. Deadline reminder and overdue-task jobs.
4. Task attachments through Cloudinary.
5. In-app notification center with read/unread state.
6. Dashboard metrics for workload, overdue tasks, and completion trend.

### P2 — Advanced Enhancements

1. Reusable project templates.
2. Task dependencies and blockers.
3. Saved filters and custom views.
4. CSV export and project summary reports.
5. Audit-log export for administrators.
6. GitHub integration for linking pull requests and commits.

## Core User Stories and Acceptance Criteria

### Authentication and access

- As a user, I can sign in and remain authenticated after a page refresh.
- As an administrator, I can change a member's role.
- A Viewer receives `403 Forbidden` when attempting a protected write through either the UI or direct API request.

### Kanban workflow

- As a Project Manager, I can create a task with title, description, priority, assignees, labels, and due date.
- As a permitted member, I can move a card between columns and the new column and order persist after refresh.
- Two clients viewing the same board receive the authorized task-move event without a manual refresh.

### Collaboration and accountability

- As a team member, I can comment on a task and mention its collaborators.
- Assignment, status, priority, and deadline changes create activity records containing actor, action, target, and timestamp.
- A deadline job marks overdue open tasks and generates one deduplicated notification per reminder window.

## Primary User Flow

1. A user registers or signs in.
2. The user creates or joins a workspace.
3. An authorized member creates a project and opens its default board.
4. The manager creates tasks and assigns team members.
5. Members move work across `Backlog`, `To do`, `In progress`, `Review`, and `Done`.
6. Comments, task changes, and board movements appear in the activity feed.
7. Deadline jobs create reminders while dashboards surface delivery risk.

## UI/UX Wireframes

The Figma design includes three core desktop viewports and reusable foundations:

1. **Authentication:** focused sign-in experience with validation and recovery path.
2. **Project Kanban Board:** global navigation, project context, filters, five workflow columns, and realistic task cards.
3. **Task Details:** editable task content, ownership metadata, comments, and activity history.

**Figma file:** [TaskMatrix — Sprint 13 UI/UX Blueprint](https://www.figma.com/design/phWFanBE1OOM569cesUesa)

Local review exports:

- [Authentication screen](docs/wireframes/auth-screen.svg)
- [Kanban dashboard](docs/wireframes/kanban-dashboard.svg)
- [Task details](docs/wireframes/task-details.svg)

## System Architecture

The client communicates with a versioned REST API for commands and queries. Socket.IO distributes authorized project events after the API commits changes. Background jobs operate on indexed due dates and create deduplicated notifications. Cloudinary stores file binaries; MongoDB stores only attachment metadata and references.

![TaskMatrix MongoDB entity relationship diagram](docs/architecture/taskmatrix-erd.svg)

### Collection Strategy

- References are used where documents have independent lifecycles or unbounded growth, such as tasks, comments, activities, and notifications.
- Small bounded values, including labels and attachment metadata, are embedded in the owning document.
- Activity records are append-only and indexed by workspace, project, and creation time.
- Tasks use a numeric `position` within a column to support ordered drag-and-drop updates.
- Every tenant-owned document includes `workspaceId`; API queries never trust a workspace ID without membership validation.

### Critical Indexes

| Collection | Index | Reason |
| --- | --- | --- |
| users | `{ email: 1 }` unique | Login and account uniqueness |
| workspaces | `{ slug: 1 }` unique | Stable workspace routing |
| memberships | `{ workspaceId: 1, userId: 1 }` unique | Prevent duplicate membership and authorize requests |
| projects | `{ workspaceId: 1, key: 1 }` unique | Human-readable task keys scoped to a workspace |
| tasks | `{ projectId: 1, columnId: 1, position: 1 }` | Ordered board reads |
| tasks | `{ workspaceId: 1, assigneeIds: 1, dueDate: 1 }` | Workload and deadline queries |
| activities | `{ projectId: 1, createdAt: -1 }` | Recent project activity feed |
| notifications | `{ userId: 1, readAt: 1, createdAt: -1 }` | Notification center |

## Planned REST API

All routes are prefixed with `/api/v1`. Protected routes require an access token and membership authorization.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Start session |
| POST | `/auth/refresh` | Rotate access token |
| POST | `/auth/logout` | Revoke refresh session |
| GET | `/workspaces` | List the current user's workspaces |
| POST | `/workspaces` | Create workspace |
| POST | `/workspaces/:workspaceId/invitations` | Invite a member |
| PATCH | `/workspaces/:workspaceId/members/:userId` | Change role |
| GET | `/workspaces/:workspaceId/projects` | List projects |
| POST | `/workspaces/:workspaceId/projects` | Create project |
| GET | `/projects/:projectId/board` | Load board, columns, and task summaries |
| POST | `/projects/:projectId/tasks` | Create task |
| GET | `/tasks/:taskId` | Load full task details |
| PATCH | `/tasks/:taskId` | Update task fields |
| PATCH | `/tasks/:taskId/move` | Move and reorder a task |
| POST | `/tasks/:taskId/comments` | Add comment |
| GET | `/projects/:projectId/activities` | Read project activity feed |
| GET | `/notifications` | Read current user's notifications |
| PATCH | `/notifications/:notificationId/read` | Mark notification as read |

### Implemented Sprint 16 API Surface

| Method | Endpoint | Validation and behavior |
| --- | --- | --- |
| GET | `/api/v1/health` | API and database readiness envelope |
| GET/POST | `/api/v1/projects` | List/create projects; POST uses strict Zod validation |
| GET/PATCH/DELETE | `/api/v1/projects/:id` | Read, update, or archive with validated ObjectId and body |
| GET/POST | `/api/v1/projects/:projectId/tasks` | Filter/list or create tasks with strict validation |
| GET/PATCH/DELETE | `/api/v1/tasks/:taskId` | Read, validate/update, or delete a task |
| POST | `/api/v1/ai/tasks/substeps` | Validate input, throttle, call Gemini server-side, and validate output |

## Real-Time Event Contract

| Event | Payload summary | Audience |
| --- | --- | --- |
| `task.created` | Project, column, and task summary | Authorized project members |
| `task.updated` | Task ID, changed fields, actor, version | Authorized project members |
| `task.moved` | Task ID, source/target column, position, version | Authorized project members |
| `comment.created` | Task ID and comment summary | Authorized project members |
| `notification.created` | Notification summary | Target user only |

The REST API remains the source of truth. Events are emitted only after successful persistence. Each mutable record carries a version so clients can invalidate stale optimistic state.

## Security and Privacy Plan

- Hash passwords with bcrypt and never return password hashes.
- Store refresh tokens as revocable hashed session records; keep access tokens short-lived.
- Validate all request bodies, route parameters, and environment variables with Zod.
- Enforce RBAC and workspace membership in API middleware, not only in the UI.
- Apply rate limits to authentication, invitation, upload, and comment endpoints.
- Restrict file types and sizes and use signed Cloudinary upload rules.
- Use HTTP-only, secure, same-site cookies where the deployment architecture permits.
- Sanitize rich text and render user-generated content safely.
- Keep secrets in deployment environment variables and exclude them from Git.
- Record security-sensitive changes in append-only activity data.

## Accessibility and UX Standards

- Target WCAG 2.1 AA color contrast.
- Provide keyboard-accessible board alternatives in addition to pointer drag-and-drop.
- Use visible focus indicators, semantic landmarks, and correctly associated labels.
- Never communicate priority or status through color alone.
- Announce task movement and validation results to assistive technology.
- Design explicit loading, empty, error, permission-denied, and offline states.

## Testing Strategy

- **Unit tests:** permissions, validators, position calculations, deadline rules, and utility functions.
- **Component tests:** forms, filters, task cards, dialogs, and keyboard interactions.
- **API integration tests:** authentication, tenant isolation, RBAC, task movement, comments, and pagination.
- **End-to-end tests:** sign-in, create project, create/assign/move task, comment, and logout.
- **Non-functional checks:** accessibility audit, responsive review, API rate-limit behavior, and basic performance profiling.

## Five-Week Delivery Roadmap

| Week | Outcome |
| --- | --- |
| Sprint 13 | Approved PRD, Figma wireframes, MongoDB ERD, API plan, and AI prompt log |
| Week 2 | Repository foundation, design system, authentication, RBAC, and workspace/project APIs |
| Week 3 | Kanban board, task CRUD, drag-and-drop persistence, comments, and activity records |
| Week 4 | Real-time events, deadline jobs, filters, notifications, attachments, and test coverage |
| Week 5 | Accessibility and performance hardening, deployment, monitoring, QA, and final demo |

## Definition of Done

- [x] Project and Fullstack track selected.
- [x] Product scope and prioritized feature list documented.
- [x] Complete proposed technology stack documented.
- [x] Three core high-fidelity viewport designs prepared.
- [x] MongoDB collections and relationships mapped in an ERD.
- [x] Architecture image embedded in this README.
- [x] Planned API and real-time contracts documented.
- [x] AI architecture queries recorded in `Prompts.md`.
- [x] Public Figma sharing link verified in a signed-out browser.
- [x] Public GitHub repository URL verified in a signed-out browser.
- [x] Strict request schemas and standardized errors implemented.
- [x] Secure Gemini microservice and AI rate limiting implemented.
- [x] Responsive interaction, loading, empty, and toast states implemented.
- [x] Typecheck, production build, and API test suite passing locally.
- [ ] Deployment environment variables configured by the repository owner.
- [ ] Live frontend/API deployment verified.
- [ ] Three-minute Sprint 16 walkthrough video recorded and uploaded.

## Repository Structure

```text
prodesk-capstone-taskmatrix/
├── client/                 # Responsive React board and AI review UI
├── server/                 # Express, MongoDB, Zod, Gemini, rate limits, tests
├── README.md
├── Prompts.md
├── .env.example
├── render.yaml
├── vercel.json
├── DEMO_SCRIPT.md
├── LICENSE
└── docs/
    ├── architecture/
    │   └── taskmatrix-erd.svg
    └── wireframes/
        ├── auth-screen.svg
        ├── kanban-dashboard.svg
        └── task-details.svg
```

## AI Usage Documentation

Architectural queries, reasoning goals, adopted decisions, and human validation checks are documented in [Prompts.md](Prompts.md). AI output is treated as a draft: product scope, access rules, data model, and security decisions require human review before implementation.

## License

This planning repository is available under the [MIT License](LICENSE).
