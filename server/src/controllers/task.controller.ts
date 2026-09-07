import type { NextFunction, Request, Response } from "express";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/responses.js";

export async function listTasks(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, unknown> = { projectId: request.params.projectId };
    if (request.query.status) filter.status = request.query.status;
    if (request.query.priority) filter.priority = request.query.priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
    sendSuccess(response, 200, tasks);
  } catch (error) {
    next(error);
  }
}

export async function createTask(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.exists({ _id: request.params.projectId, archivedAt: null });
    if (!project) throw new AppError(404, "PROJECT_NOT_FOUND", "Project was not found.");

    const task = await Task.create({ ...request.body, projectId: request.params.projectId });
    sendSuccess(response, 201, task, "Task created successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getTask(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const task = await Task.findById(request.params.taskId).lean();
    if (!task) throw new AppError(404, "TASK_NOT_FOUND", "Task was not found.");
    sendSuccess(response, 200, task);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const task = await Task.findByIdAndUpdate(
      request.params.taskId,
      { $set: request.body },
      { new: true, runValidators: true },
    );
    if (!task) throw new AppError(404, "TASK_NOT_FOUND", "Task was not found.");
    sendSuccess(response, 200, task, "Task updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const task = await Task.findByIdAndDelete(request.params.taskId);
    if (!task) throw new AppError(404, "TASK_NOT_FOUND", "Task was not found.");
    sendSuccess(response, 200, { id: task._id }, "Task deleted successfully.");
  } catch (error) {
    next(error);
  }
}
