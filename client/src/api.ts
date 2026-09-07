const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

type ErrorEnvelope = {
  success: false;
  error?: {
    message?: string;
  };
};

type AiEnvelope = {
  success: true;
  data: {
    subtasks: string[];
  };
};

export async function generateSubtasks(
  taskTitle: string,
  taskDescription: string,
  signal?: AbortSignal,
): Promise<string[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/ai/tasks/substeps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskTitle, taskDescription, count: 5 }),
      signal,
    });
  } catch {
    throw new Error("The AI service is unreachable. Check that the API server is running.");
  }

  const payload = (await response.json()) as AiEnvelope | ErrorEnvelope;

  if (!response.ok || !payload.success) {
    throw new Error(
      "error" in payload && payload.error?.message
        ? payload.error.message
        : "AI suggestions could not be generated.",
    );
  }

  return payload.data.subtasks;
}
