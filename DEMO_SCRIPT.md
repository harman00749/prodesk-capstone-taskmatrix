# TaskMatrix — Three-Minute QA Demo Script

Use this as a speaking guide. Do not read every line mechanically; keep the final recording below three minutes and show the relevant README or Figma section while speaking.

## 0:00–0:25 — Introduction

“Hello, my capstone project is **TaskMatrix**, a commercial-grade agile project management platform inspired by Jira and Asana. I selected the **Fullstack track**. TaskMatrix gives software teams one place to plan projects, assign work, track deadlines, and maintain a reliable activity history.”

## 0:25–0:55 — Problem and Scope

“The problem is fragmented delivery information: ownership, deadlines, status, and discussion often live in different tools. My P0 scope is secure authentication, role-based access control, workspaces and projects, a persistent drag-and-drop Kanban board, task management, comments, activity history, and responsive accessibility. Real-time updates, reminders, filters, notifications, and attachments are prioritized as P1 to keep the five-week plan realistic.”

## 0:55–1:20 — Technology Stack

“TypeScript is the primary language across the application. I plan to use Next.js, React, Tailwind CSS, Zustand, and TanStack Query on the frontend; Node.js and Express for the versioned REST API; MongoDB Atlas with Mongoose for persistence; JWT-based sessions and RBAC middleware for access control; Socket.IO for authorized real-time events; and node-cron for deadline jobs. Deployment is planned across Vercel, Render, and MongoDB Atlas.”

## 1:20–2:00 — Figma Walkthrough

“The Figma blueprint contains three core viewports. The authentication screen keeps sign-in focused and clearly exposes recovery. The Kanban dashboard separates workspace navigation, project context, delivery metrics, filters, and the five-column workflow. Cards display priority through both text and color. The task-details view brings description, acceptance notes, checklist, comments, editable metadata, and activity history together. The planned implementation also includes keyboard alternatives to drag-and-drop and explicit loading, empty, error, and permission states.”

## 2:00–2:40 — Database and System Architecture

“The ERD uses separate collections for Users, Workspaces, Memberships, Projects, Boards, Columns, Tasks, Comments, Activities, Notifications, and Sessions. Unbounded data such as comments and activities is referenced instead of embedded. Every tenant-owned record contains a workspace ID, and membership validation occurs before resource access to prevent cross-workspace data leaks. Tasks store a column, numeric position, and version for ordered drag-and-drop. Activities are append-only, while deadline notifications use a unique deduplication key.”

## 2:40–2:58 — Delivery Plan and Close

“REST remains the source of truth, and Socket.IO events are published only after persistence. My next milestones are the authenticated vertical slice, Kanban workflow, collaboration features, testing, hardening, and deployment. The README contains the complete PRD, API plan, security strategy, roadmap, and AI prompt log. Thank you.”

## Recording Checklist

- Open the repository README at the project overview before recording.
- Keep the Figma file open in a second tab and zoom each viewport to fit.
- Scroll to the embedded ERD before the architecture section.
- Keep the cursor still while speaking and avoid reading file paths aloud.
- Confirm that the final video is no longer than 3:00.
- Test the video link in a signed-out browser before submission.

