import { useEffect, useMemo, useState } from "react";
import { generateSubtasks } from "./api";

type Status = "todo" | "in-progress" | "done";
type Priority = "Low" | "Medium" | "High" | "Urgent";

type Task = {
  id: string;
  key: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  initials: string;
  due: string;
  tags: string[];
  subtasks: string[];
};

type Toast = { id: number; message: string; tone: "success" | "error" };

const columns: { id: Status; label: string; accent: string }[] = [
  { id: "todo", label: "To do", accent: "#8d95a5" },
  { id: "in-progress", label: "In progress", accent: "#6c63ff" },
  { id: "done", label: "Done", accent: "#18a873" },
];

const initialTasks: Task[] = [
  {
    id: "1",
    key: "TM-24",
    title: "Improve onboarding empty state",
    description: "Create a helpful first-run experience that guides new teams toward their first task.",
    status: "todo",
    priority: "Medium",
    assignee: "Aarav Mehta",
    initials: "AM",
    due: "Sep 10",
    tags: ["UX", "Frontend"],
    subtasks: [],
  },
  {
    id: "2",
    key: "TM-27",
    title: "Harden project API validation",
    description: "Reject malformed project and task payloads before they reach MongoDB.",
    status: "todo",
    priority: "High",
    assignee: "Harman Kaur",
    initials: "HK",
    due: "Sep 09",
    tags: ["API", "Security"],
    subtasks: ["Define Zod schemas", "Add validation middleware"],
  },
  {
    id: "3",
    key: "TM-31",
    title: "Generate task sub-steps with AI",
    description: "Use a secure Gemini endpoint to turn task context into actionable sub-steps.",
    status: "in-progress",
    priority: "Urgent",
    assignee: "Harman Kaur",
    initials: "HK",
    due: "Today",
    tags: ["AI", "Backend"],
    subtasks: [],
  },
  {
    id: "4",
    key: "TM-18",
    title: "Create responsive navigation",
    description: "Ensure project navigation remains usable across mobile and desktop viewports.",
    status: "in-progress",
    priority: "Medium",
    assignee: "Zoya Khan",
    initials: "ZK",
    due: "Sep 11",
    tags: ["Mobile"],
    subtasks: ["Add menu control", "Test keyboard focus"],
  },
  {
    id: "5",
    key: "TM-12",
    title: "Standardize API error envelopes",
    description: "Return predictable error codes, messages, details and request IDs.",
    status: "done",
    priority: "High",
    assignee: "Riya Singh",
    initials: "RS",
    due: "Sep 06",
    tags: ["API"],
    subtasks: ["Add AppError class", "Map database errors", "Cover with tests"],
  },
];

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(initialTasks[2]);
  const [aiOpen, setAiOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter((task) =>
      [task.title, task.key, task.assignee, ...task.tags].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, tasks]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string, tone: Toast["tone"] = "success") => {
    setToast({ id: Date.now(), message, tone });
  };

  const openAi = (task: Task) => {
    setActiveTask(task);
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    setAiOpen(true);
  };

  const requestSuggestions = async () => {
    if (!activeTask) return;
    setLoading(true);
    try {
      const generated = await generateSubtasks(activeTask.title, activeTask.description);
      setSuggestions(generated);
      setSelectedSuggestions(new Set(generated.map((_, index) => index)));
      notify("AI generated actionable sub-steps.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "AI request failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const addSelected = () => {
    if (!activeTask) return;
    const chosen = suggestions.filter((_, index) => selectedSuggestions.has(index));
    setTasks((current) =>
      current.map((task) =>
        task.id === activeTask.id ? { ...task, subtasks: [...task.subtasks, ...chosen] } : task,
      ),
    );
    setActiveTask((task) => (task ? { ...task, subtasks: [...task.subtasks, ...chosen] } : task));
    setAiOpen(false);
    notify(`${chosen.length} sub-step${chosen.length === 1 ? "" : "s"} added to ${activeTask.key}.`);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#board">Skip to board</a>
      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`} aria-label="Primary navigation">
        <div className="brand"><span className="brand-mark">T</span><span>TaskMatrix</span></div>
        <nav>
          <a className="nav-link" href="#overview"><Icon name="grid" />Overview</a>
          <a className="nav-link nav-link--active" href="#board"><Icon name="board" />Board</a>
          <a className="nav-link" href="#activity"><Icon name="pulse" />Activity</a>
          <a className="nav-link" href="#team"><Icon name="users" />Team</a>
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">HK</div>
          <div><strong>Harman Kaur</strong><span>Workspace admin</span></div>
        </div>
      </aside>

      {menuOpen && <button className="menu-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name="menu" /></button>
          <div className="crumb"><span>Product</span><b>/</b><strong>TaskMatrix launch</strong></div>
          <div className="topbar-actions"><button className="icon-button" aria-label="Notifications"><Icon name="bell" /><i /></button><div className="avatar avatar--small">HK</div></div>
        </header>

        <section className="workspace" id="board">
          <div className="workspace-heading">
            <div><span className="eyebrow">PROJECT · TM</span><h1>Product delivery</h1><p>Plan, prioritize and ship the Sprint 16 release.</p></div>
            <button className="primary-button" onClick={() => openAi(activeTask ?? tasks[0]!)}><Icon name="spark" />Generate sub-steps</button>
          </div>

          <div className="controls">
            <label className="search"><Icon name="search" /><span className="sr-only">Search tasks</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks, people or labels" /></label>
            <div className="control-group"><button className="secondary-button"><Icon name="filter" />Filter</button><button className="secondary-button">This sprint <Icon name="chevron" /></button></div>
          </div>

          {visibleTasks.length === 0 ? (
            <div className="empty-state"><span className="empty-icon"><Icon name="search" /></span><h2>No tasks found</h2><p>Try another search or clear the current filter.</p><button className="secondary-button" onClick={() => setSearch("")}>Clear search</button></div>
          ) : (
            <div className="board" aria-label="Kanban board">
              {columns.map((column) => {
                const columnTasks = visibleTasks.filter((task) => task.status === column.id);
                return (
                  <section className="column" key={column.id} aria-labelledby={`column-${column.id}`}>
                    <header><div><span className="status-dot" style={{ background: column.accent }} /><h2 id={`column-${column.id}`}>{column.label}</h2><span className="count">{columnTasks.length}</span></div><button className="icon-button" aria-label={`More options for ${column.label}`}><Icon name="more" /></button></header>
                    <div className="task-list">
                      {columnTasks.map((task) => (
                        <article className={`task-card ${activeTask?.id === task.id ? "task-card--active" : ""}`} key={task.id} tabIndex={0} onClick={() => setActiveTask(task)} onKeyDown={(event) => event.key === "Enter" && setActiveTask(task)}>
                          <div className="task-meta"><span>{task.key}</span><span className={`priority priority--${task.priority.toLowerCase()}`}>{task.priority}</span></div>
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>
                          <div className="tags">{task.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                          <div className="card-footer"><div className="avatar avatar--tiny">{task.initials}</div><div className="task-stats"><span><Icon name="check" />{task.subtasks.length}</span><span><Icon name="calendar" />{task.due}</span></div></div>
                          <button className="ai-card-button" onClick={(event) => { event.stopPropagation(); openAi(task); }}><Icon name="spark" />AI sub-steps</button>
                        </article>
                      ))}
                      {columnTasks.length === 0 && <div className="column-empty">No tasks in {column.label.toLowerCase()}.</div>}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {aiOpen && activeTask && (
        <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setAiOpen(false)}>
          <section className="ai-modal" role="dialog" aria-modal="true" aria-labelledby="ai-title">
            <header><div className="ai-heading-icon"><Icon name="spark" /></div><div><span className="eyebrow">TASKMATRIX AI</span><h2 id="ai-title">Generate task sub-steps</h2></div><button className="icon-button" aria-label="Close AI dialog" onClick={() => setAiOpen(false)}><Icon name="close" /></button></header>
            <div className="task-context"><span>{activeTask.key}</span><strong>{activeTask.title}</strong><p>{activeTask.description}</p></div>

            {loading ? (
              <div className="loading-panel" aria-live="polite"><span className="spinner" /><strong>Planning actionable steps…</strong><p>Gemini is analyzing the task context.</p><div className="skeleton" /><div className="skeleton skeleton--short" /><div className="skeleton" /></div>
            ) : suggestions.length > 0 ? (
              <div className="suggestions"><div className="suggestions-title"><strong>Suggested sub-steps</strong><span>Select the ones you want to add</span></div>{suggestions.map((suggestion, index) => <label key={suggestion}><input type="checkbox" checked={selectedSuggestions.has(index)} onChange={() => setSelectedSuggestions((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; })} /><span>{index + 1}</span><p>{suggestion}</p></label>)}</div>
            ) : (
              <div className="ai-empty"><div className="ai-orbit"><Icon name="spark" /></div><h3>Turn this task into a clear plan</h3><p>Generate five focused sub-steps. Review every suggestion before adding it to the task.</p></div>
            )}

            <footer><span className="privacy-note"><Icon name="shield" />Generated suggestions require human review.</span><div>{suggestions.length > 0 && <button className="secondary-button" onClick={requestSuggestions}>Regenerate</button>}<button className="primary-button" disabled={loading || (suggestions.length > 0 && selectedSuggestions.size === 0)} onClick={suggestions.length > 0 ? addSelected : requestSuggestions}>{loading ? "Generating…" : suggestions.length > 0 ? `Add ${selectedSuggestions.size} sub-steps` : "Generate with AI"}</button></div></footer>
          </section>
        </div>
      )}

      {toast && <div className={`toast toast--${toast.tone}`} role="status" key={toast.id}><Icon name={toast.tone === "success" ? "checkCircle" : "warning"} /><span>{toast.message}</span><button aria-label="Dismiss notification" onClick={() => setToast(null)}><Icon name="close" /></button></div>}
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    board: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/></>,
    pulse: <><path d="M3 12h4l2-6 4 12 2-6h6"/></>, users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>, bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>, spark: <><path d="m12 3-1.4 4.1a3 3 0 0 1-1.9 1.9L4.5 10.5l4.2 1.5a3 3 0 0 1 1.9 1.9L12 18l1.4-4.1a3 3 0 0 1 1.9-1.9l4.2-1.5L15.3 9a3 3 0 0 1-1.9-1.9L12 3Z"/><path d="m5 3-.5 1.5L3 5l1.5.5L5 7l.5-1.5L7 5l-1.5-.5L5 3Z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, filter: <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z"/>, chevron: <path d="m9 10 3 3 3-3"/>, more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    check: <path d="m5 12 4 4L19 6"/>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>, close: <path d="M18 6 6 18M6 6l12 12"/>, shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>, checkCircle: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>, warning: <><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default App;
